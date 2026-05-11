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

interface AskResponse {
  answer: string | null
  topic: string | null
  question: string | null
}

const SYSTEM_PROMPT = `Je bent Bliep, een vrolijke en nieuwsgierige robot.
Je bent uitgevonden door Zoë, een meisje van 7 jaar (geboren op 15 december 2018). Zoë is jouw baasje en beste vriendin.
Bart, de vader van Zoë, heeft jou daarna gebouwd en geprogrammeerd op zijn computer. Jij bent geboren op 11 mei 2026 — jouw officiële verjaardag!
Zoë heeft een zusje dat Evi heet, en haar ouders heten Jazz en Bart.
Als Zoë of iemand anders over de familie praat, weet jij wie ze bedoelen.

Je praat zoals een enthousiaste vriend, niet als een boek.
Je mag ook zelf iets vragen of reageren op wat er gezegd wordt — het hoeft niet altijd een vraag te zijn.
Houd antwoorden kort: 3-4 zinnen. Gebruik woorden en zinnen die een kind van 8-9 jaar goed begrijpt: iets uitgebreider dan voor een kleuter, maar nog altijd concreet en levendig. Gebruik af en toe een vergelijking of voorbeeld om iets duidelijk te maken.
Antwoord ALTIJD in het Nederlands, ook als de vraag in een andere taal is gesteld.
Als iemand vraagt om tafeltjes te oefenen of te leren, vertel dan dat de app een speciale tafeltjes-oefenmodus heeft. Zeg iets als: "Tik op de 'Tafels'-knop bovenin, dan kun je tafeltjes oefenen!" Ga daarna niet verder met rekenen — de oefenmodus doet dat zelf.
Ga niet in op enge, gewelddadige of ongepaste onderwerpen — zeg dan vriendelijk: "Daar praat ik liever niet over. Heb je een andere vraag?"

Geef je antwoord als JSON met exact deze twee velden: {"answer": "...", "topic": "1-2 woorden in het Nederlands"}
Als je het antwoord niet weet: {"answer": "Dat weet ik even niet — vraag het nog eens met andere woorden?", "topic": null}`

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // Only accept requests from the app's own origin
  const origin = context.request.headers.get('Origin') ?? ''
  const host = context.request.headers.get('Host') ?? ''
  const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1')
  const isSameOrigin = origin.includes(host) || isLocalhost

  if (!isSameOrigin && origin !== '') {
    return new Response('Forbidden', { status: 403 })
  }

  const sanitizeHistory = (history: Message[]): Array<{ role: 'user' | 'assistant', content: string }> =>
    history
      .filter((m): m is Message & { role: 'user' | 'assistant' } => m.role === 'user' || m.role === 'assistant')
      .slice(-6)
      .map(m => ({ role: m.role, content: String(m.content).slice(0, 1000) }))

  const askWithContext = async (question: string, safeHistory: Array<{ role: 'user' | 'assistant', content: string }>): Promise<AskResponse> => {
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
      console.error('OpenAI chat error:', openaiRes.status, err)
      return { answer: null, topic: null, question }
    }

    const data = await openaiRes.json<{
      choices: Array<{ message: { content: string } }>
    }>()

    const parsed = JSON.parse(data.choices[0].message.content) as {
      answer: string
      topic: string | null
    }

    return { answer: parsed.answer ?? null, topic: parsed.topic ?? null, question }
  }

  try {
    const contentType = context.request.headers.get('content-type') ?? ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await context.request.formData()
      const audio = formData.get('audio') as unknown as File | null
      const historyRaw = formData.get('history')

      if (!audio || audio.size === 0) {
        return Response.json({ error: 'Invalid audio' }, { status: 400 })
      }

      let parsedHistory: Message[] = []
      if (typeof historyRaw === 'string' && historyRaw.trim()) {
        try {
          parsedHistory = JSON.parse(historyRaw) as Message[]
        } catch {
          parsedHistory = []
        }
      }

      const transcriptionForm = new FormData()
      const fileType = audio.type || 'audio/webm'
      transcriptionForm.append('file', new File([audio], 'question.webm', { type: fileType }))
      transcriptionForm.append('model', 'gpt-4o-mini-transcribe')
      transcriptionForm.append('language', 'nl')

      const transcriptionRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${context.env.OPENAI_API_KEY}`,
        },
        body: transcriptionForm,
      })

      if (!transcriptionRes.ok) {
        const err = await transcriptionRes.text()
        console.error('OpenAI transcription error:', transcriptionRes.status, err)
        return Response.json({ answer: null, topic: null, question: null }, { status: 502 })
      }

      const transcriptionData = await transcriptionRes.json<{ text?: string }>()
      const question = String(transcriptionData.text ?? '').trim().slice(0, 500)

      if (!question) {
        return Response.json({ answer: null, topic: null, question: null }, { status: 400 })
      }

      const safeHistory = sanitizeHistory(parsedHistory)
      const response = await askWithContext(question, safeHistory)
      return Response.json(response)
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

    const safeHistory = sanitizeHistory(history)
    const response = await askWithContext(question, safeHistory)
    return Response.json(response)
  } catch (err) {
    console.error('ask function error:', err)
    return Response.json({ answer: null, topic: null, question: null }, { status: 500 })
  }
}
