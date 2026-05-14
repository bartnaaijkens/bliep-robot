import { useState, useCallback, useRef, useEffect } from 'react'
import { BliepCharacter } from './components/BliepCharacter'
import { MicButton } from './components/MicButton'
import { AnswerBubble } from './components/AnswerBubble'
import { TopicChip } from './components/TopicChip'
import { ExamplePrompts } from './components/ExamplePrompts'
import { HistorySheet } from './components/HistorySheet'
import { LiveWaveform } from './components/LiveWaveform'
import { QuestionAffordance } from './components/QuestionAffordance'
import { TablesSetup } from './components/TablesSetup'
import { TablesGame } from './components/TablesGame'
import { TablesScore } from './components/TablesScore'
import { ThinkingGame } from './components/ThinkingGame'
import { ThinkingScore } from './components/ThinkingScore'
import { GeoGame } from './components/GeoGame'
import { GeoScore } from './components/GeoScore'
import { GamesMenu } from './components/GamesMenu'
import { GardenSelect } from './components/GardenSelect'
import { GardenGrowing } from './components/GardenGrowing'
import { GardenScore } from './components/GardenScore'
import { useTTS } from './hooks/useTTS'
import { loadHistory, saveItem } from './lib/history'
import type { HistoryItem } from './lib/history'
import { BLIEP_PALETTES, PALETTE_BG } from './lib/palettes'
import type { PaletteName } from './lib/palettes'
import type { BliepState } from './components/BliepCharacter'
import {
  loadTablesConfig, saveTablesConfig, buildSession, recordAnswer,
  formatQuestion, encouragementText, scoreText, TABLES_STATUS,
} from './lib/tables'
import type { TablesConfig, TablesSession } from './lib/tables'
import {
  loadThinkingLevel, buildThinkingSession, recordThinkingAnswer,
  thinkingEncouragementText, thinkingScoreText, formatThinkingQuestion,
  advanceThinkingLevel, THINKING_STATUS,
} from './lib/thinking'
import type { ThinkingSession } from './lib/thinking'
import {
  loadGeoLevel, buildGeoSession, recordGeoAnswer,
  geoEncouragementText, geoScoreText, formatGeoQuestion,
  advanceGeoLevel, GEO_STATUS,
} from './lib/geo'
import type { GeoSession } from './lib/geo'
import {
  buildGardenSession, applyGardenAction, generateHintText,
  gardenScoreText, GARDEN_STATUS, STAGE_CONGRATULATIONS,
  WILT_FEEDBACK, WARNING_FEEDBACK,
} from './lib/garden'
import type { PlantSession, PlantId, CareAction } from './lib/garden'
import { RobotMissionSelect } from './components/RobotMissionSelect'
import { RobotBuilding } from './components/RobotBuilding'
import { RobotScore } from './components/RobotScore'
import { RobotCustomize } from './components/RobotCustomize'
import { RobotGenerating } from './components/RobotGenerating'
import { RobotGallery } from './components/RobotGallery'
import {
  buildRobotSession, applyRobotPick, robotScoreText, robotScoreStars, ROBOT_STATUS, CATEGORIES,
} from './lib/robot'
import type { RobotSession, MissionId, CategoryId, PartKey } from './lib/robot'
import { loadRobotHistory, saveRobotImage } from './lib/robotHistory'
import type { RobotHistoryItem } from './lib/robotHistory'
import { getRemainingQuestions, consumeQuestion, hoursUntilResetLabel, setVip, WARNING_QUESTIONS } from './lib/rateLimit'

async function compressImageB64(b64: string, size = 400): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size; canvas.height = size
      canvas.getContext('2d')!.drawImage(img, 0, 0, size, size)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.src = `data:image/png;base64,${b64}`
  })
}

type AppMode = 'questions' | 'tables' | 'thinking' | 'geo' | 'games'
type Phase = BliepState | 'result'
           | 'tables-setup' | 'tables-question' | 'tables-correct' | 'tables-wrong' | 'tables-done'
           | 'thinking-question' | 'thinking-correct' | 'thinking-wrong' | 'thinking-done'
           | 'geo-question' | 'geo-correct' | 'geo-wrong' | 'geo-done'
           | 'games-menu'
           | 'garden-select' | 'garden-growing' | 'garden-action' | 'garden-done'
           | 'robot-select' | 'robot-building' | 'robot-fact' | 'robot-done'
           | 'robot-customize' | 'robot-listening' | 'robot-generating'

interface Message { role: 'user' | 'assistant'; content: string }
interface AskResponse { answer: string | null; topic: string | null; question?: string | null }

const CONFUSED_ANSWER = 'Dat weet ik even niet — vraag het nog eens met andere woorden?'
const RECORDING_ERROR = 'Oeps, Bliep kon even niet luisteren. Probeer het zo nog eens!'

const THEME_SWATCHES: { name: PaletteName; color: string; label: string }[] = [
  { name: 'classic', color: '#A044C8', label: 'Roze thema' },
  { name: 'blue',    color: '#2E6FD8', label: 'Blauw thema' },
]
const THEME_META_COLORS: Record<string, string> = { classic: '#7A28A8', blue: '#1B4FB8' }

export default function App() {
  const [paletteName, setPaletteName] = useState<PaletteName>(() => {
    const stored = localStorage.getItem('bliep-theme')
    return (stored === 'classic' || stored === 'blue') ? stored : 'classic'
  })

  const c = BLIEP_PALETTES[paletteName]
  const bg = PALETTE_BG[paletteName]

  useEffect(() => {
    const color = THEME_META_COLORS[paletteName] ?? '#7A28A8'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
  }, [paletteName])

  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('vip') === 'zoeismijnuitvinder') {
      setVip()
      url.searchParams.delete('vip')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  const handleThemeChange = useCallback((name: PaletteName) => {
    setPaletteName(name)
    localStorage.setItem('bliep-theme', name)
  }, [])

  const [appMode, setAppMode] = useState<AppMode>('questions')
  const [tablesConfig, setTablesConfig] = useState<TablesConfig>(() => loadTablesConfig())
  const [tablesSession, setTablesSession] = useState<TablesSession | null>(null)
  const [thinkingSession, setThinkingSession] = useState<ThinkingSession | null>(null)
  const [geoSession, setGeoSession] = useState<GeoSession | null>(null)
  const [gardenSession, setGardenSession] = useState<PlantSession | null>(null)
  const [robotSession, setRobotSession] = useState<RobotSession | null>(null)
  const [robotImageDataUrl, setRobotImageDataUrl] = useState<string | null>(null)
  const [showRobotGallery, setShowRobotGallery] = useState(false)
  const [robotHistory, setRobotHistory] = useState<RobotHistoryItem[]>(() => loadRobotHistory())

  const [phase, setPhase] = useState<Phase>('idle')
  const [hasInteracted, setHasInteracted] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [duration, setDuration] = useState(3)
  const [pillOpen, setPillOpen] = useState(false)
  const [remaining, setRemaining] = useState(() => getRemainingQuestions())

  const [threadTopic, setThreadTopic] = useState<string | null>(null)
  const [threadTurns, setThreadTurns] = useState(0)
  const [threadMessages, setThreadMessages] = useState<Message[]>([])

  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory())
  const [showSheet, setShowSheet] = useState(false)

  const tts = useTTS()
  const listenStartRef = useRef<number>(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const shouldProcessStopRef = useRef(false)
  const recordingCallbackRef = useRef<((blob: Blob) => void) | null>(null)
  const listeningPhaseOverrideRef = useRef<Phase | null>(null)

  const recordingSupported = typeof window !== 'undefined'
    && typeof MediaRecorder !== 'undefined'
    && !!navigator.mediaDevices?.getUserMedia

  const handleRecordingError = useCallback((error: string) => {
    console.log('[app] recording error', error)
    let message: string
    if (error === 'not-allowed' || error === 'service-not-allowed') {
      message = 'Bliep mag de microfoon niet gebruiken. Sta het toe in je browser.'
    } else if (error === 'audio-capture') {
      message = 'Bliep kon de microfoon niet vinden.'
    } else {
      message = RECORDING_ERROR
    }
    setQuestion('')
    setAnswer(message)
    setPhase('confused')
    tts.speak(message, () => setPhase('result'))
  }, [tts])

  const cleanupRecorderResources = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    recorderRef.current = null
    chunksRef.current = []
  }, [])

  const handleAskResponse = useCallback((spokenQuestion: string, data: AskResponse) => {
    const responseText = data.answer ?? CONFUSED_ANSWER
    const topic = data.topic ?? null
    const isConfused = !data.answer || data.answer === CONFUSED_ANSWER

    setQuestion(spokenQuestion)
    setAnswer(responseText)
    setPhase('speaking')

    if (!isConfused) {
      const rem = consumeQuestion()
      setRemaining(rem)
      const onEnd = rem === WARNING_QUESTIONS
        ? () => tts.speak(`Nog maar ${rem} vragen over!`, () => setPhase('result'))
        : rem === 0
        ? () => tts.speak(`Dat was je laatste vraag. Kom ${hoursUntilResetLabel()} terug!`, () => setPhase('result'))
        : () => setPhase('result')
      tts.speak(responseText, onEnd)
      setThreadTopic(prev => prev ?? topic)
      setThreadTurns(n => n + 1)
      const newMessages: Message[] = [
        ...threadMessages,
        { role: 'user', content: spokenQuestion },
        { role: 'assistant', content: responseText },
      ]
      setThreadMessages(newMessages)
      saveItem({ q: spokenQuestion, a: responseText, topic: topic ?? 'Algemeen', ts: Date.now() })
      setHistory(loadHistory())
    } else {
      tts.speak(responseText, () => setPhase('result'))
      setPhase('confused')
    }
  }, [threadMessages, tts])

  const processRecordedAudio = useCallback((audioBlob: Blob) => {
    const elapsed = Math.round((Date.now() - listenStartRef.current) / 1000)
    setDuration(Math.max(1, elapsed))
    tts.stop()

    if (getRemainingQuestions() === 0) {
      setPhase('speaking')
      tts.speak(
        `Je hebt alle vragen voor nu gebruikt. Kom ${hoursUntilResetLabel()} terug!`,
        () => setPhase('result')
      )
      return
    }

    setPhase('thinking')
    const contextMessages = threadMessages.slice(-6)
    const formData = new FormData()
    formData.append('audio', audioBlob, 'question.webm')
    formData.append('history', JSON.stringify(contextMessages))

    fetch('/api/ask', {
      method: 'POST',
      body: formData,
    })
      .then(r => { console.log('[app] /api/ask status', r.status); return r.json() })
      .then((data: AskResponse) => {
        const spokenQuestion = String(data.question ?? '').trim()
        if (!spokenQuestion) throw new Error('no-transcript')
        handleAskResponse(spokenQuestion, data)
      })
      .catch(err => {
        console.log('[app] /api/ask failed', err)
        setQuestion('')
        setAnswer(CONFUSED_ANSWER)
        setPhase('confused')
        tts.speak(CONFUSED_ANSWER, () => setPhase('result'))
      })
  }, [handleAskResponse, threadMessages, tts])

  const startRecording = useCallback(async () => {
    if (!recordingSupported) {
      handleRecordingError('audio-capture')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeCandidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
      const mimeType = mimeCandidates.find(type => MediaRecorder.isTypeSupported(type))
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)

      streamRef.current = stream
      recorderRef.current = recorder
      chunksRef.current = []
      shouldProcessStopRef.current = true

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onerror = () => {
        cleanupRecorderResources()
        handleRecordingError('audio-capture')
      }

      recorder.onstop = () => {
        const processResult = shouldProcessStopRef.current
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        cleanupRecorderResources()
        if (!processResult) return
        if (blob.size < 1024) {
          setPhase('idle')
          return
        }
        if (recordingCallbackRef.current) {
          const cb = recordingCallbackRef.current
          recordingCallbackRef.current = null
          cb(blob)
        } else {
          processRecordedAudio(blob)
        }
      }

      listenStartRef.current = Date.now()
      recorder.start()
      setPhase(listeningPhaseOverrideRef.current ?? 'listening')
      listeningPhaseOverrideRef.current = null
    } catch {
      handleRecordingError('not-allowed')
    }
  }, [cleanupRecorderResources, handleRecordingError, processRecordedAudio, recordingSupported])

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current
    if (!recorder) return
    shouldProcessStopRef.current = true
    if (recorder.state !== 'inactive') recorder.stop()
  }, [])

  const abortRecording = useCallback(() => {
    const recorder = recorderRef.current
    shouldProcessStopRef.current = false
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
      return
    }
    cleanupRecorderResources()
  }, [cleanupRecorderResources])

  const handleMicClick = useCallback(() => {
    console.log('[app] mic click, phase=', phase)
    if (phase === 'idle' || phase === 'result' || phase === 'confused') {
      tts.stop()
      setHasInteracted(true)
      setQuestion('')
      setAnswer('')
      setPillOpen(false)
      void startRecording()
    } else if (phase === 'listening') {
      stopRecording()
    }
  }, [phase, startRecording, stopRecording, tts])

  const handleExamplePick = useCallback((label: string) => {
    setHasInteracted(true)
    setQuestion(label)
    setAnswer('')
    setPillOpen(false)
    tts.stop()

    if (getRemainingQuestions() === 0) {
      setPhase('speaking')
      tts.speak(
        `Je hebt alle vragen voor nu gebruikt. Kom ${hoursUntilResetLabel()} terug!`,
        () => setPhase('result')
      )
      return
    }

    setPhase('thinking')

    fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: label, history: [] }),
    })
      .then(r => r.json())
      .then((data: AskResponse) => {
        setDuration(Math.ceil(label.length / 12))
        const responseText = data.answer ?? CONFUSED_ANSWER
        const topic = data.topic ?? null
        setQuestion(label)
        setAnswer(responseText)
        setPhase('speaking')
        const rem = consumeQuestion()
        setRemaining(rem)
        const onEnd = rem === WARNING_QUESTIONS
          ? () => tts.speak(`Nog maar ${rem} vragen over!`, () => setPhase('result'))
          : rem === 0
          ? () => tts.speak(`Dat was je laatste vraag. Kom ${hoursUntilResetLabel()} terug!`, () => setPhase('result'))
          : () => setPhase('result')
        tts.speak(responseText, onEnd)
        setThreadTopic(topic)
        setThreadTurns(1)
        setThreadMessages([
          { role: 'user', content: label },
          { role: 'assistant', content: responseText },
        ])
        saveItem({ q: label, a: responseText, topic: topic ?? 'Algemeen', ts: Date.now() })
        setHistory(loadHistory())
      })
      .catch(() => {
        setAnswer(CONFUSED_ANSWER)
        setPhase('confused')
        tts.speak(CONFUSED_ANSWER, () => setPhase('result'))
      })
  }, [tts])

  const goIdle = useCallback(() => {
    tts.stop()
    abortRecording()
    setPhase('idle')
    setQuestion('')
    setAnswer('')
    setPillOpen(false)
  }, [tts, abortRecording])

  const clearThread = useCallback(() => {
    setThreadTopic(null)
    setThreadTurns(0)
    setThreadMessages([])
    goIdle()
  }, [goIdle])

  const handleReplay = useCallback(() => {
    setPhase('speaking')
    tts.speak(answer, () => setPhase('result'))
  }, [answer, tts])

  const handleGardenSelect = useCallback((plant: PlantId) => {
    const session = buildGardenSession(plant)
    setGardenSession(session)
    setPhase('garden-growing')
    const name = session.plant === 'sunflower' ? 'Zonnebloem' : session.plant === 'tomato' ? 'Tomaat' : 'Cactus'
    tts.speak(`Laten we beginnen! Jij hebt een ${name} gekozen. Vertel Bliep wat hij moet doen om de plant groot te maken!`)
  }, [tts])

  const handleGardenAction = useCallback((action: CareAction) => {
    if (!gardenSession) return
    const result = applyGardenAction(gardenSession, action)
    setGardenSession(result.nextSession)
    setPhase('garden-action')
    tts.speak(result.feedback, () => {
      if (result.stageFailed) {
        setPhase('garden-done')
        tts.speak(WILT_FEEDBACK[result.nextSession.plant])
      } else if (result.stageComplete && result.nextSession.stage >= 5) {
        setPhase('garden-done')
        tts.speak(gardenScoreText(result.nextSession))
      } else if (result.stageComplete) {
        setPhase('garden-growing')
        tts.speak(STAGE_CONGRATULATIONS[result.nextSession.stagesCompleted - 1])
      } else if (result.stageStalled) {
        setPhase('garden-growing')
        tts.speak(`Nog niet genoeg zorg! De plant heeft meer aandacht nodig. Probeer het nog een keer!`)
      } else if (result.healthWarning) {
        setPhase('garden-growing')
        tts.speak(WARNING_FEEDBACK[result.nextSession.plant])
      } else {
        setPhase('garden-growing')
      }
    })
  }, [gardenSession, tts])

  const handleGardenHint = useCallback(() => {
    if (!gardenSession) return
    tts.speak(generateHintText(gardenSession))
  }, [gardenSession, tts])

  const handleGardenRestart = useCallback((plant?: PlantId) => {
    const p = plant ?? (gardenSession?.plant ?? 'tomato')
    const session = buildGardenSession(p)
    setGardenSession(session)
    setPhase('garden-growing')
    const name = p === 'sunflower' ? 'Zonnebloem' : p === 'tomato' ? 'Tomaat' : 'Cactus'
    tts.speak(`Opnieuw beginnen! Zorg goed voor je ${name}!`)
  }, [gardenSession, tts])

  const handleRobotMissionSelect = useCallback((mission: MissionId) => {
    setRobotSession(buildRobotSession(mission))
    setPhase('robot-building')
    const names: Record<MissionId, string> = { hospital: 'Ziekenhuis', space: 'Ruimteverkenner', fire: 'Brandweer' }
    tts.speak(`Jij bouwt een robot voor de ${names[mission]}! Kies de beste onderdelen!`)
  }, [tts])

  const handleRobotPick = useCallback((category: CategoryId, partKey: PartKey) => {
    if (!robotSession) return
    const partDef = CATEGORIES.find(c => c.id === category)!.options.find(o => o.key === partKey)!
    const nextSession = applyRobotPick(robotSession, category, partKey)
    setRobotSession(nextSession)
    setPhase('robot-fact')
    tts.speak(partDef.fact, () => {
      if (nextSession.done) {
        handleRobotDoneBuilding()
      } else {
        setPhase('robot-building')
      }
    })
  }, [robotSession, tts]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRobotDoneBuilding = useCallback(() => {
    setRobotImageDataUrl(null)
    setPhase('robot-customize')
    tts.speak('Super! Je robot is bijna klaar! Wil je Bliep nog iets vertellen over hoe hij er uit moet zien?')
  }, [tts])

  const handleRobotGenerate = useCallback(async (audioBlob: Blob | null, text: string) => {
    if (!robotSession) return
    setPhase('robot-generating')
    tts.speak('Geweldig! Bliep gaat nu je robot bouwen. Even geduld!')

    const formData = new FormData()
    formData.append('mission', robotSession.mission)
    formData.append('picks', JSON.stringify(robotSession.picks))
    if (audioBlob) formData.append('audio', audioBlob, 'customization.webm')
    if (text) formData.append('customization', text)

    try {
      const res = await fetch('/api/robot-image', { method: 'POST', body: formData })
      const data = await res.json() as { b64?: string; customization?: string; error?: string }
      if (!data.b64) throw new Error(data.error ?? 'no image')

      const imageDataUrl = await compressImageB64(data.b64)
      const customizationText = data.customization ?? text

      setRobotImageDataUrl(imageDataUrl)

      const item: RobotHistoryItem = {
        id: crypto.randomUUID(),
        ts: Date.now(),
        mission: robotSession.mission,
        picks: robotSession.picks,
        customization: customizationText,
        imageDataUrl,
        totalScore: robotSession.totalScore,
        stars: robotScoreStars(robotSession.totalScore),
      }
      saveRobotImage(item)
      setRobotHistory(loadRobotHistory())

      setPhase('robot-done')
      tts.speak(robotScoreText(robotSession))
    } catch {
      setPhase('robot-done')
      tts.speak('Oeps, de robot kon niet gebouwd worden. Probeer het nog een keer!')
    }
  }, [robotSession, tts])

  const handleRobotCustomizeMic = useCallback(() => {
    if (phase === 'robot-customize') {
      listeningPhaseOverrideRef.current = 'robot-listening'
      recordingCallbackRef.current = (blob: Blob) => {
        void handleRobotGenerate(blob, '')
      }
      void startRecording()
    } else if (phase === 'robot-listening') {
      stopRecording()
    }
  }, [phase, handleRobotGenerate, startRecording, stopRecording])

  const handleRobotSkipCustomize = useCallback(() => {
    void handleRobotGenerate(null, '')
  }, [handleRobotGenerate])

  const handleRobotRestart = useCallback((mission?: MissionId) => {
    const m = mission ?? robotSession?.mission ?? 'hospital'
    setRobotSession(buildRobotSession(m))
    setRobotImageDataUrl(null)
    setPhase('robot-building')
    const names: Record<MissionId, string> = { hospital: 'Ziekenhuis', space: 'Ruimteverkenner', fire: 'Brandweer' }
    tts.speak(`Opnieuw bouwen! Een robot voor de ${names[m]}!`)
  }, [robotSession, tts])

  const handleModeSwitch = useCallback((mode: AppMode) => {
    tts.stop()
    abortRecording()
    setAppMode(mode)
    if (mode === 'tables') {
      setPhase('tables-setup')
    } else if (mode === 'thinking') {
      const level = loadThinkingLevel()
      const session = buildThinkingSession(level)
      setThinkingSession(session)
      setPhase('thinking-question')
      tts.speak(formatThinkingQuestion(session.questions[0]))
    } else if (mode === 'geo') {
      const level = loadGeoLevel()
      const session = buildGeoSession(level)
      setGeoSession(session)
      setPhase('geo-question')
      tts.speak(formatGeoQuestion(session.questions[0]))
    } else if (mode === 'games') {
      setPhase('games-menu')
    } else {
      setPhase('idle')
      setQuestion('')
      setAnswer('')
      setPillOpen(false)
    }
  }, [tts, abortRecording])

  const handleTablesToggle = useCallback((table: number) => {
    setTablesConfig(prev => {
      const next: TablesConfig = prev.selectedTables.includes(table)
        ? { selectedTables: prev.selectedTables.filter(t => t !== table) }
        : { selectedTables: [...prev.selectedTables, table] }
      saveTablesConfig(next)
      return next
    })
  }, [])

  const advanceTables = useCallback((session: TablesSession) => {
    if (session.currentIndex >= session.questions.length) {
      setPhase('tables-done')
      tts.speak(scoreText(session))
    } else {
      setPhase('tables-question')
      tts.speak(formatQuestion(session.questions[session.currentIndex]))
    }
  }, [tts])

  const handleTablesStart = useCallback(() => {
    const session = buildSession(tablesConfig.selectedTables)
    setTablesSession(session)
    setPhase('tables-question')
    tts.speak(formatQuestion(session.questions[0]))
  }, [tablesConfig, tts])

  const handleTablesAnswer = useCallback((givenAnswer: number) => {
    if (!tablesSession) return
    const q = tablesSession.questions[tablesSession.currentIndex]
    const { isCorrect, nextSession } = recordAnswer(tablesSession, givenAnswer)
    setTablesSession(nextSession)
    setPhase(isCorrect ? 'tables-correct' : 'tables-wrong')
    tts.speak(encouragementText(isCorrect, q), () => advanceTables(nextSession))
  }, [tablesSession, tts, advanceTables])

  // Increments currentIndex and either advances to the next question or ends the session.
  // Called after TTS finishes speaking the feedback for an answered question.
  const advanceThinking = useCallback((session: ThinkingSession) => {
    const nextIndex = session.currentIndex + 1
    const advanced: ThinkingSession = { ...session, currentIndex: nextIndex }
    if (nextIndex >= session.questions.length) {
      advanceThinkingLevel(advanced)
      setThinkingSession(advanced)
      setPhase('thinking-done')
      tts.speak(thinkingScoreText(advanced))
    } else {
      setThinkingSession(advanced)
      setPhase('thinking-question')
      tts.speak(formatThinkingQuestion(advanced.questions[nextIndex]))
    }
  }, [tts])

  const handleThinkingAnswer = useCallback((chosenIndex: number) => {
    if (!thinkingSession) return
    const q = thinkingSession.questions[thinkingSession.currentIndex]
    const { isCorrect, nextSession } = recordThinkingAnswer(thinkingSession, chosenIndex)
    setThinkingSession(nextSession)
    setPhase(isCorrect ? 'thinking-correct' : 'thinking-wrong')
    tts.speak(thinkingEncouragementText(isCorrect, q), () => advanceThinking(nextSession))
  }, [thinkingSession, tts, advanceThinking])

  const advanceGeo = useCallback((session: GeoSession) => {
    const nextIndex = session.currentIndex + 1
    const advanced: GeoSession = { ...session, currentIndex: nextIndex }
    if (nextIndex >= session.questions.length) {
      advanceGeoLevel(advanced)
      setGeoSession(advanced)
      setPhase('geo-done')
      tts.speak(geoScoreText(advanced))
    } else {
      setGeoSession(advanced)
      setPhase('geo-question')
      tts.speak(formatGeoQuestion(advanced.questions[nextIndex]))
    }
  }, [tts])

  const handleGeoAnswer = useCallback((chosenIndex: number) => {
    if (!geoSession) return
    const q = geoSession.questions[geoSession.currentIndex]
    const { isCorrect, nextSession } = recordGeoAnswer(geoSession, chosenIndex)
    setGeoSession(nextSession)
    setPhase(isCorrect ? 'geo-correct' : 'geo-wrong')
    tts.speak(geoEncouragementText(isCorrect, q), () => advanceGeo(nextSession))
  }, [geoSession, tts, advanceGeo])

  const bliepState: BliepState =
    phase === 'result' ? 'idle' :
    phase === 'tables-question' ? 'idle' :
    phase === 'tables-correct' ? 'speaking' :
    phase === 'tables-wrong' ? 'confused' :
    phase === 'tables-setup' || phase === 'tables-done' ? 'idle' :
    phase === 'thinking-question' || phase === 'thinking-done' ? 'idle' :
    phase === 'thinking-correct' ? 'speaking' :
    phase === 'thinking-wrong' ? 'confused' :
    phase === 'geo-question' || phase === 'geo-done' ? 'idle' :
    phase === 'geo-correct' ? 'speaking' :
    phase === 'geo-wrong' ? 'confused' :
    phase === 'games-menu' || phase === 'garden-select' ? 'idle' :
    phase === 'garden-growing' ? 'idle' :
    phase === 'garden-action' ? 'speaking' :
    phase === 'garden-done' ? (gardenSession && gardenSession.health < 20 && gardenSession.stagesCompleted < 1 ? 'confused' : 'idle') :
    phase === 'robot-select' || phase === 'robot-building' || phase === 'robot-done' ? 'idle' :
    phase === 'robot-customize' ? 'idle' :
    phase === 'robot-listening' ? 'listening' :
    phase === 'robot-generating' ? 'thinking' :
    phase === 'robot-fact' ? 'speaking' :
    phase as BliepState
  const isTablesMode = appMode === 'tables'
  const isThinkingMode = appMode === 'thinking'
  const isGeoMode = appMode === 'geo'
  const isGamesMode = appMode === 'games'
  const showQuestionAffordance = !isTablesMode && !isThinkingMode && !isGeoMode && !isGamesMode && phase !== 'idle' && phase !== 'listening' && question
  const showSubtitle = !hasInteracted && !threadTopic && !isTablesMode && !isThinkingMode && !isGeoMode && !isGamesMode
  const showExamples = phase === 'idle' && !threadTopic && !isTablesMode && !isThinkingMode && !isGeoMode && !isGamesMode

  const questionsStatusText: Record<string, string> = {
    idle:      hasInteracted || threadTopic ? 'Ik wacht op je vraag…' : 'Hoi! Wat wil je weten?',
    listening: 'Ik luister naar je…',
    thinking:  'Even nadenken…',
    speaking:  'Hier is je antwoord!',
    confused:  'Oeps… dat weet ik even niet',
    result:    'Ik ben er nog!',
  }
  const statusText = ROBOT_STATUS[phase] ?? GARDEN_STATUS[phase] ?? GEO_STATUS[phase] ?? THINKING_STATUS[phase] ?? TABLES_STATUS[phase] ?? questionsStatusText[phase]

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      paddingTop: 'env(safe-area-inset-top, 16px)',
      paddingBottom: 'env(safe-area-inset-bottom, 24px)',
      background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${bg.bgGlow} 0%, ${bg.bg} 55%, ${bg.bg} 100%)`,
      overflow: 'hidden', boxSizing: 'border-box',
      position: 'relative',
    }}>
      {/* Background dots */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.5,
          backgroundImage: `radial-gradient(circle at 20% 80%, ${c.glow}22 0%, transparent 35%), radial-gradient(circle at 90% 90%, ${c.glow}18 0%, transparent 30%)`,
        }} />
        {[[14, 110, 4], [380, 90, 3], [40, 240, 5], [360, 320, 4], [22, 580, 4], [370, 620, 3]].map(([x, y, sz], i) => (
          <div key={i} style={{
            position: 'absolute', left: x, top: y, width: sz, height: sz,
            borderRadius: '50%', background: c.blue, opacity: 0.3,
          }} />
        ))}
      </div>

      {/* Header */}
      <div style={{
        position: 'relative', zIndex: 2, padding: '4px 22px 0',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontFamily: '"Patrick Hand", cursive', fontSize: 38, lineHeight: 1,
            color: c.deepBlue, letterSpacing: 0.5,
          }}>De Bliep</div>
          {showSubtitle && (
            <div style={{
              fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 600,
              color: bg.ink, opacity: 0.62, marginTop: 4, maxWidth: 230, lineHeight: 1.25,
            }}>De robot die op álle vragen een antwoord kan geven</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {THEME_SWATCHES.map(({ name, color, label }) => (
              <button
                key={name}
                onClick={() => handleThemeChange(name)}
                aria-label={label}
                style={{
                  width: 20, height: 20, borderRadius: '50%', border: 'none', padding: 0,
                  background: color, cursor: 'pointer',
                  outline: paletteName === name ? `2.5px solid ${color}` : '2.5px solid transparent',
                  outlineOffset: 2.5,
                  boxShadow: `0 1px 4px ${color}66`,
                  transition: 'outline-color 0.15s, transform 0.15s',
                  transform: paletteName === name ? 'scale(1.18)' : 'scale(1)',
                }}
              />
            ))}
          </div>
          <button onClick={() => setShowSheet(true)} style={{
            border: 'none', background: bg.soft, borderRadius: 18,
            width: 44, height: 44, cursor: 'pointer',
            boxShadow: `0 1px 0 ${bg.line}, 0 2px 6px rgba(20,30,60,0.05)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: c.deepBlue,
          }} aria-label="Eerdere vragen">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mode tabs */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: '8px 22px 0',
        display: 'flex', gap: 8,
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {(['questions', 'tables', 'thinking', 'geo', 'games'] as AppMode[]).map(mode => {
          const active = appMode === mode
          const LABELS: Record<AppMode, string> = { questions: '🎤 Vragen', tables: '✖ Tafels', thinking: '🧠 Denken', geo: '🗺 Kaart', games: '🎮 Spellen' }
          const label = LABELS[mode]
          return (
            <button key={mode} onClick={() => handleModeSwitch(mode)} style={{
              padding: '6px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontFamily: '"Nunito", system-ui', fontSize: 13.5, fontWeight: 800,
              background: active ? c.blue : 'transparent',
              color: active ? '#fff' : c.deepBlue,
              opacity: active ? 1 : 0.55,
              boxShadow: active ? `0 2px 8px ${c.blue}44` : 'none',
              transition: 'background 0.15s, color 0.15s, opacity 0.15s',
            }} aria-pressed={active}>
              {label}
            </button>
          )
        })}
      </div>

      {/* Topic chip */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: '4px 22px 0', minHeight: 38,
        display: 'flex', justifyContent: 'flex-start',
      }}>
        {threadTopic && !isTablesMode && !isThinkingMode && !isGeoMode && !isGamesMode && (
          <TopicChip topic={threadTopic} turns={threadTurns} c={c} bg={bg} onClear={clearThread} />
        )}
      </div>

      {/* Stage */}
      <div style={{
        position: 'relative', zIndex: 2, flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-start',
        padding: '0 18px 0',
      }}>
        {/* Question area */}
        <div style={{ width: '100%', minHeight: 64, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          {phase === 'listening' && (
            <div><LiveWaveform c={c} /></div>
          )}
          {showQuestionAffordance && (
            <QuestionAffordance
              question={question} duration={duration}
              open={pillOpen} onToggle={() => setPillOpen(o => !o)}
              c={c} bg={bg}
            />
          )}
        </div>

        {/* Bliep character */}
        <div style={{ position: 'relative', marginTop: 4 }}>
          <BliepCharacter state={bliepState} palette={paletteName} size={222} />
          <div style={{
            position: 'absolute', left: '50%', bottom: -8,
            width: 160, height: 14, marginLeft: -80, borderRadius: '50%',
            background: `radial-gradient(ellipse, ${c.deepBlue}44, transparent 70%)`,
            filter: 'blur(2px)',
          }} />
        </div>

        {/* Status */}
        <div style={{
          marginTop: 12, minHeight: 22,
          fontFamily: '"Patrick Hand", cursive',
          fontSize: 22, color: c.deepBlue, opacity: 0.85,
          letterSpacing: 0.3, textAlign: 'center', lineHeight: 1.1,
        }}>{statusText}</div>

        {/* Recording not supported warning */}
        {!recordingSupported && phase === 'idle' && (
          <div style={{
            marginTop: 6, padding: '6px 14px',
            background: '#fff3cd', borderRadius: 10,
            fontFamily: '"Nunito", system-ui', fontSize: 12.5, fontWeight: 700,
            color: '#856404', textAlign: 'center',
          }}>
            Opnemen werkt niet in deze browser. Probeer Chrome, Edge of Safari.
          </div>
        )}

        {/* Answer / examples (vragen mode only) */}
        {!isTablesMode && !isThinkingMode && !isGamesMode && (
          <div style={{ width: '100%', minHeight: 76, marginTop: 10, paddingBottom: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, padding: '0 4px 20px' }}>
            {(phase === 'speaking' || phase === 'result' || phase === 'confused') && answer && (
              <AnswerBubble
                text={answer}
                isSpeaking={phase === 'speaking'}
                isConfused={phase === 'confused'}
                c={c}
                onReplay={handleReplay}
              />
            )}
            {showExamples && (
              <ExamplePrompts c={c} bg={bg} onPick={handleExamplePick} />
            )}
          </div>
        )}

        {/* Tables mode */}
        {isTablesMode && (
          <div style={{ width: '100%', marginTop: 10, padding: '0 4px' }}>
            {phase === 'tables-setup' && (
              <TablesSetup
                selectedTables={tablesConfig.selectedTables}
                onToggle={handleTablesToggle}
                onStart={handleTablesStart}
                c={c} bg={bg}
              />
            )}
            {(phase === 'tables-question' || phase === 'tables-correct' || phase === 'tables-wrong') && tablesSession && (
              <TablesGame
                session={tablesSession}
                phase={phase}
                onAnswer={handleTablesAnswer}
                c={c} bg={bg}
              />
            )}
            {phase === 'tables-done' && tablesSession && (
              <TablesScore
                session={tablesSession}
                onReplay={handleTablesStart}
                onChangeSetup={() => setPhase('tables-setup')}
                c={c} bg={bg}
              />
            )}
          </div>
        )}
      </div>

      {/* Thinking mode */}
      {isThinkingMode && (
        <div style={{ position: 'relative', zIndex: 2, padding: '0 18px', width: '100%', boxSizing: 'border-box' }}>
          {(phase === 'thinking-question' || phase === 'thinking-correct' || phase === 'thinking-wrong') && thinkingSession && (
            <ThinkingGame session={thinkingSession} phase={phase} onAnswer={handleThinkingAnswer} c={c} bg={bg} />
          )}
          {phase === 'thinking-done' && thinkingSession && (
            <ThinkingScore
              session={thinkingSession}
              onReplay={() => {
                const level = loadThinkingLevel()
                const session = buildThinkingSession(level)
                setThinkingSession(session)
                setPhase('thinking-question')
                tts.speak(formatThinkingQuestion(session.questions[0]))
              }}
              c={c} bg={bg}
            />
          )}
        </div>
      )}

      {/* Geo mode */}
      {isGeoMode && (
        <div style={{ position: 'relative', zIndex: 2, padding: '0 18px', width: '100%', boxSizing: 'border-box' }}>
          {(phase === 'geo-question' || phase === 'geo-correct' || phase === 'geo-wrong') && geoSession && (
            <GeoGame session={geoSession} phase={phase} onAnswer={handleGeoAnswer} c={c} bg={bg} />
          )}
          {phase === 'geo-done' && geoSession && (
            <GeoScore
              session={geoSession}
              onReplay={() => {
                const level = loadGeoLevel()
                const session = buildGeoSession(level)
                setGeoSession(session)
                setPhase('geo-question')
                tts.speak(formatGeoQuestion(session.questions[0]))
              }}
              c={c} bg={bg}
            />
          )}
        </div>
      )}

      {/* Games mode */}
      {isGamesMode && (
        <div style={{ position: 'relative', zIndex: 2, padding: '0 18px', width: '100%', boxSizing: 'border-box' }}>
          {phase === 'games-menu' && (
            <GamesMenu
              onSelectGame={(game) => {
                if (game === 'garden') setPhase('garden-select')
                if (game === 'robot')  setPhase('robot-select')
              }}
              onShowGallery={() => setShowRobotGallery(true)}
              hasRobotHistory={robotHistory.length > 0}
              c={c} bg={bg}
            />
          )}
          {phase === 'garden-select' && (
            <GardenSelect onSelect={handleGardenSelect} c={c} bg={bg} />
          )}
          {(phase === 'garden-growing' || phase === 'garden-action') && gardenSession && (
            <GardenGrowing
              session={gardenSession}
              phase={phase}
              onAction={handleGardenAction}
              onHint={handleGardenHint}
              c={c} bg={bg}
            />
          )}
          {phase === 'garden-done' && gardenSession && (
            <GardenScore
              session={gardenSession}
              onReplay={() => handleGardenRestart()}
              onChangeSetup={() => setPhase('garden-select')}
              c={c} bg={bg}
            />
          )}
          {phase === 'robot-select' && (
            <RobotMissionSelect onSelect={handleRobotMissionSelect} c={c} bg={bg} />
          )}
          {(phase === 'robot-building' || phase === 'robot-fact') && robotSession && (
            <RobotBuilding session={robotSession} phase={phase} onPick={handleRobotPick} c={c} bg={bg} />
          )}
          {(phase === 'robot-customize' || phase === 'robot-listening') && (
            <RobotCustomize phase={phase} onRecord={handleRobotCustomizeMic} onSkip={handleRobotSkipCustomize} c={c} bg={bg} />
          )}
          {phase === 'robot-generating' && (
            <RobotGenerating c={c} bg={bg} />
          )}
          {phase === 'robot-done' && robotSession && (
            <RobotScore
              session={robotSession}
              imageDataUrl={robotImageDataUrl}
              onReplay={() => handleRobotRestart()}
              onChangeMission={() => setPhase('robot-select')}
              onShowGallery={() => setShowRobotGallery(true)}
              c={c} bg={bg}
            />
          )}
          {showRobotGallery && (
            <RobotGallery history={robotHistory} onClose={() => setShowRobotGallery(false)} c={c} bg={bg} />
          )}
        </div>
      )}

      {/* Mic button area (vragen mode only) */}
      {!isTablesMode && !isThinkingMode && !isGeoMode && !isGamesMode && (
      <div style={{
        position: 'relative', zIndex: 2, padding: '0 24px 8px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <MicButton phase={phase as BliepState | 'result'} c={c} onClick={handleMicClick} remaining={remaining} />

        {(phase === 'result' || phase === 'confused') && threadTopic && (
          <button onClick={clearThread} style={{
            marginTop: 10, padding: '8px 16px', border: 'none',
            background: 'transparent', cursor: 'pointer',
            fontFamily: '"Nunito", system-ui', fontSize: 13.5, fontWeight: 800,
            color: c.deepBlue, opacity: 0.6,
            display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2l2 5 5 1-3.5 3.5 1 5L12 14l-4.5 2.5 1-5L5 8l5-1z" fill="currentColor" />
            </svg>
            Nieuw onderwerp
          </button>
        )}
      </div>
      )}

      {/* Footer */}
      <div style={{
        position: 'relative', zIndex: 2,
        marginTop: 20, paddingBottom: 14,
        fontFamily: '"Patrick Hand", cursive', fontSize: 16,
        color: c.deepBlue, opacity: 0.6,
        textAlign: 'center',
      }}>Uitgevonden door Zoë ♥</div>

      {showSheet && (
        <HistorySheet history={history} onClose={() => setShowSheet(false)} c={c} bg={bg} />
      )}
    </div>
  )
}
