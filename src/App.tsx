import { useState, useCallback, useRef } from 'react'
import { BliepCharacter } from './components/BliepCharacter'
import { MicButton } from './components/MicButton'
import { AnswerBubble } from './components/AnswerBubble'
import { TopicChip } from './components/TopicChip'
import { ExamplePrompts } from './components/ExamplePrompts'
import { HistorySheet } from './components/HistorySheet'
import { LiveWaveform } from './components/LiveWaveform'
import { QuestionAffordance } from './components/QuestionAffordance'
import { useTTS } from './hooks/useTTS'
import { loadHistory, saveItem } from './lib/history'
import type { HistoryItem } from './lib/history'
import { BLIEP_PALETTES, PALETTE_BG } from './lib/palettes'
import type { BliepState } from './components/BliepCharacter'

type Phase = BliepState | 'result'

interface Message { role: 'user' | 'assistant'; content: string }
interface AskResponse { answer: string | null; topic: string | null; question?: string | null }

const PALETTE = 'classic'
const CONFUSED_ANSWER = 'Dat weet ik even niet — vraag het nog eens met andere woorden?'
const RECORDING_ERROR = 'Oeps, Bliep kon even niet luisteren. Probeer het zo nog eens!'

export default function App() {
  const c = BLIEP_PALETTES[PALETTE]
  const bg = PALETTE_BG[PALETTE]

  const [phase, setPhase] = useState<Phase>('idle')
  const [hasInteracted, setHasInteracted] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [duration, setDuration] = useState(3)
  const [pillOpen, setPillOpen] = useState(false)

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
    tts.speak(responseText, () => setPhase('result'))

    if (!isConfused) {
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
      setPhase('confused')
    }
  }, [threadMessages, tts])

  const processRecordedAudio = useCallback((audioBlob: Blob) => {
    const elapsed = Math.round((Date.now() - listenStartRef.current) / 1000)
    setDuration(Math.max(1, elapsed))
    setPhase('thinking')
    tts.stop()

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
        processRecordedAudio(blob)
      }

      listenStartRef.current = Date.now()
      recorder.start()
      setPhase('listening')
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
    setPhase('thinking')
    tts.stop()

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
        tts.speak(responseText, () => setPhase('result'))
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


  const bliepState: BliepState = phase === 'result' ? 'idle' : phase as BliepState
  const showQuestionAffordance = phase !== 'idle' && phase !== 'listening' && question
  const showSubtitle = !hasInteracted && !threadTopic
  const showExamples = phase === 'idle' && !threadTopic && !hasInteracted

  const statusText = {
    idle:      hasInteracted || threadTopic ? 'Ik wacht op je vraag…' : 'Hoi! Wat wil je weten?',
    listening: 'Ik luister naar je…',
    thinking:  'Even nadenken…',
    speaking:  'Hier is je antwoord!',
    confused:  'Oeps… dat weet ik even niet',
    result:    'Ik ben er nog!',
  }[phase]

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
        <button onClick={() => setShowSheet(true)} style={{
          border: 'none', background: bg.soft, borderRadius: 18,
          width: 44, height: 44, cursor: 'pointer',
          boxShadow: `0 1px 0 ${bg.line}, 0 2px 6px rgba(20,30,60,0.05)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: c.deepBlue, flexShrink: 0,
        }} aria-label="Eerdere vragen">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Topic chip */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: '4px 22px 0', minHeight: 38,
        display: 'flex', justifyContent: 'flex-start',
      }}>
        {threadTopic && (
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
          <BliepCharacter state={bliepState} palette={PALETTE} size={222} />
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

        {/* Answer / examples */}
        <div style={{ width: '100%', minHeight: 76, marginTop: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, padding: '0 4px' }}>
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
      </div>

      {/* Mic button area */}
      <div style={{
        position: 'relative', zIndex: 2, padding: '0 24px 8px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <MicButton phase={phase} c={c} onClick={handleMicClick} />

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
