interface Env {
  OPENAI_API_KEY: string
}

const MAX_AUDIO_BYTES = 10 * 1024 * 1024

const MISSION_NAMES: Record<string, string> = {
  hospital: 'hospital',
  space:    'space exploration',
  fire:     'firefighting',
}

const MISSION_STYLE: Record<string, string> = {
  hospital: 'clean white and sky-blue color scheme, friendly and approachable, medical cross emblems, soft warm lighting',
  space:    'sleek metallic silver and deep navy, stars and cosmos motifs, space-age glowing accents, zero-gravity feel',
  fire:     'bold red and orange color scheme, rugged heat-resistant look, emergency warning stripes, dramatic lighting',
}

const CATEGORY_LABELS: Record<string, string> = {
  sensors: 'HEAD & SENSORS',
  arms:    'ARMS',
  drive:   'LOCOMOTION',
  power:   'CHEST / POWER',
  extra:   'SPECIAL MODULE',
}

const PART_VISUALS: Record<string, string> = {
  'sensors-camera':  'a round smooth head with one large prominent camera lens eye and two small LED indicator lights on the forehead',
  'sensors-thermal': 'a head with bright glowing orange infrared goggle lenses and a heat-sensing antenna spike protruding from the top',
  'sensors-medical': 'a head with a large blue glowing medical cross display screen as the face and a heart-rate monitor visor across the eyes',
  'arms-strong':     'two massive thick hydraulic claw arms extending from the shoulders, with heavy steel plating and powerful clamping grippers',
  'arms-precise':    'two slim elegant articulated arms on both sides with five delicate finger joints each and blue glowing fingertips',
  'arms-hose':       'two stocky arms on both sides ending in bright yellow fire hose nozzles with visible water droplet details',
  'drive-wheels':    'a wide flat base supported by three large smooth rubber wheels with chrome hubcaps visible from the front',
  'drive-legs':      'two articulated mechanical walking legs on the lower body with visible knee joints and rubber-tipped feet planted on the ground',
  'drive-fly':       'two rocket booster jets mounted at the bottom, with glowing blue exhaust flame trails pointing downward',
  'power-solar':     'a torso and chest completely covered in shiny iridescent blue photovoltaic solar panels with sunlight glinting off each panel',
  'power-battery':   'a neon-green glowing battery power core embedded in an open chest cavity with a visible charge level bar display',
  'power-hydrogen':  'a silver compact fuel cell unit mounted prominently on the chest with a small visible wisp of clean white water vapor as exhaust',
  'extra-antenna':   'a tall silver communication dish-antenna mounted on the back, with concentric signal wave rings visibly radiating from its tip',
  'extra-shield':    'thick heat-resistant armored plating covering the chest and both shoulders in layered orange and dark grey segments',
  'extra-lab':       'a bulky analytical scanner module mounted on one shoulder with an active scanning laser beam and a lit diagnostic screen',
}

function buildPrompt(mission: string, picks: Record<string, string>, customization: string): string {
  const missionName = MISSION_NAMES[mission] ?? mission
  const missionStyle = MISSION_STYLE[mission] ?? ''

  const partLines = Object.entries(picks)
    .map(([category, key]) => {
      const label = CATEGORY_LABELS[category] ?? category.toUpperCase()
      const visual = PART_VISUALS[key]
      return visual ? `  - ${label}: ${visual}` : null
    })
    .filter(Boolean)
    .join('\n')

  let prompt = `Illustrate a cute friendly cartoon robot for a child. The robot is designed for a ${missionName} mission.\n`
  prompt += `Overall visual style: ${missionStyle}.\n\n`
  prompt += `IMPORTANT: The robot MUST clearly and visibly show ALL FIVE of the following specific features — do not omit or merge any of them:\n`
  prompt += `${partLines}\n\n`
  if (customization.trim()) {
    prompt += `Special request from the child: "${customization.trim()}" — incorporate this prominently.\n\n`
  }
  prompt += `Composition rules: full body robot centered in frame, white or very light plain background, all five features clearly recognizable and distinct. Art style: vibrant child-friendly digital illustration, bold clean outlines, fun appealing character design, high detail.`

  return prompt
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') ?? ''
  const host = context.request.headers.get('Host') ?? ''
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
  const isSameOrigin = origin !== '' && (origin === `https://${host}` || isLocalhost)

  if (!isSameOrigin) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const formData = await context.request.formData()
    const mission = String(formData.get('mission') ?? '')
    const picksRaw = String(formData.get('picks') ?? '{}')
    const audio = formData.get('audio') as unknown as File | null
    const customizationText = String(formData.get('customization') ?? '')

    let picks: Record<string, string> = {}
    try { picks = JSON.parse(picksRaw) } catch { picks = {} }

    if (!mission) {
      return Response.json({ error: 'Missing mission' }, { status: 400 })
    }

    // Transcribe voice customization if provided
    let finalCustomization = customizationText
    if (audio && audio.size > 0 && audio.size <= MAX_AUDIO_BYTES) {
      const transcriptionForm = new FormData()
      const fileType = audio.type || 'audio/webm'
      transcriptionForm.append('file', new File([audio], 'customization.webm', { type: fileType }))
      transcriptionForm.append('model', 'gpt-4o-mini-transcribe')
      transcriptionForm.append('language', 'nl')

      const transcriptionRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${context.env.OPENAI_API_KEY}` },
        body: transcriptionForm,
      })

      if (transcriptionRes.ok) {
        const data = await transcriptionRes.json<{ text?: string }>()
        finalCustomization = String(data.text ?? '').trim()
      }
    }

    const prompt = buildPrompt(mission, picks, finalCustomization)

    const imageRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1-mini',
        prompt,
        n: 1,
        size: '1024x1024',
        output_format: 'png',
      }),
    })

    if (!imageRes.ok) {
      const err = await imageRes.text()
      console.error('OpenAI image error:', imageRes.status, err)
      return Response.json({ error: 'Image generation failed' }, { status: 502 })
    }

    const imageData = await imageRes.json<{ data: Array<{ b64_json?: string; url?: string }> }>()
    const b64 = imageData.data?.[0]?.b64_json

    if (!b64) {
      return Response.json({ error: 'No image data returned' }, { status: 502 })
    }

    return Response.json({ b64, customization: finalCustomization })
  } catch (err) {
    console.error('robot-image function error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
