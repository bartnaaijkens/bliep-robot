interface Env {
  OPENAI_API_KEY: string
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface RequestBody {
  question: string
  history: Message[]
}

const SYSTEM_PROMPT = `Je bent Bliep, een vrolijke robot die vragen van kinderen beantwoordt.
Geef duidelijke, begrijpelijke antwoorden van 3-4 zinnen.
Gebruik eenvoudige woorden en wees enthousiast.
Antwoord ALTIJD in het Nederlands.
Geef je antwoord als JSON met exact deze twee velden: {"answer": "...", "topic": "1-2 woorden in het Nederlands"}
Als je het antwoord niet weet, geef dan: {"answer": "Hmm, dat weet ik even niet — vraag het nog eens met andere woorden?", "topic": null}`

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // Only accept requests from the app's own origin
  const origin = context.request.headers.get('Origin') ?? ''
  const host = context.request.headers.get('Host') ?? ''
  const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1')
  const isSameOrigin = origin.includes(host) || isLocalhost

  if (!isSameOrigin && origin !== '') {
    return new Response('Forbidden', { status: 403 })
  }

  let body: RequestBody
  try {
    body = await context.request.json<RequestBody>()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { question, history = [] } = body

  if (!question || typeof question !== 'string' || question.length > 500) {
    return Response.json({ error: 'Invalid question' }, { status: 400 })
  }

  const safeHistory = history
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .slice(-6)
    .map(m => ({ role: m.role, content: String(m.content).slice(0, 1000) }))

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...safeHistory,
          { role: 'user', content: question },
        ],
        max_tokens: 250,
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.text()
      console.error('OpenAI error:', openaiRes.status, err)
      return Response.json({ answer: null, topic: null }, { status: 502 })
    }

    const data = await openaiRes.json<{
      choices: Array<{ message: { content: string } }>
    }>()

    const parsed = JSON.parse(data.choices[0].message.content) as {
      answer: string
      topic: string | null
    }

    return Response.json({ answer: parsed.answer ?? null, topic: parsed.topic ?? null })
  } catch (err) {
    console.error('ask function error:', err)
    return Response.json({ answer: null, topic: null }, { status: 500 })
  }
}
