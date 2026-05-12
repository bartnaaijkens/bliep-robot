import type { BliepPalette, BgPalette } from '../lib/palettes'
import type { GeoSession } from '../lib/geo'

interface Props {
  session: GeoSession
  phase: string
  onAnswer: (chosenIndex: number) => void
  c: BliepPalette
  bg: BgPalette
}

export function GeoGame({ session, phase, onAnswer, c, bg }: Props) {
  const active = phase === 'geo-question'
  const showResult = phase === 'geo-correct' || phase === 'geo-wrong'

  const q = session.questions[Math.min(session.currentIndex, session.questions.length - 1)]
  const total = session.questions.length
  const answeredCount = session.answers.length
  const progress = answeredCount / total

  const lastAnswer = session.answers[session.answers.length - 1]
  const chosenIndex = showResult ? (lastAnswer?.chosenIndex ?? -1) : -1

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      {/* Progress bar */}
      <div style={{ width: '100%', height: 6, borderRadius: 99, background: bg.soft, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${progress * 100}%`,
          background: `linear-gradient(90deg, ${c.cyan}, ${c.blue})`,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Score chips */}
      <div style={{ display: 'flex', gap: 10, alignSelf: 'flex-end' }}>
        <span style={{
          fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 800,
          background: '#d4f5dc', color: '#1a7c38', padding: '2px 10px', borderRadius: 99,
        }}>✓ {session.correct}</span>
        <span style={{
          fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 800,
          background: '#fde8d0', color: '#b85c00', padding: '2px 10px', borderRadius: 99,
        }}>✗ {session.wrong}</span>
      </div>

      {/* Question prompt */}
      <div style={{
        fontFamily: '"Patrick Hand", cursive',
        fontSize: 20,
        color: c.deepBlue, lineHeight: 1.35, textAlign: 'center',
        maxWidth: 320,
      }}>
        {q.prompt}
      </div>

      {/* Answer buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8, width: '100%', maxWidth: 320,
      }}>
        {q.options.map((option, i) => {
          const isCorrectOption = showResult && i === q.correctIndex
          const isWrongChoice = showResult && i === chosenIndex && i !== q.correctIndex
          return (
            <button
              key={i}
              onClick={() => { if (active) onAnswer(i) }}
              disabled={!active}
              style={optionButtonStyle(c, bg, active, isCorrectOption, isWrongChoice)}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function optionButtonStyle(
  c: BliepPalette,
  bg: BgPalette,
  active: boolean,
  isCorrect: boolean,
  isWrong: boolean,
): React.CSSProperties {
  let background: string = bg.soft
  let color: string = c.deepBlue
  let boxShadow = `0 2px 0 ${bg.line}`

  if (isCorrect) {
    background = 'linear-gradient(135deg, #2BA37A, #1B7A5A)'
    color = '#fff'
    boxShadow = '0 2px 8px #2BA37A55'
  } else if (isWrong) {
    background = '#fde8d0'
    color = '#b85c00'
    boxShadow = 'none'
  }

  return {
    minHeight: 56,
    padding: '10px 8px',
    borderRadius: 14,
    border: 'none',
    cursor: active ? 'pointer' : 'default',
    fontFamily: '"Nunito", system-ui',
    fontSize: 15,
    fontWeight: 800,
    background,
    color,
    opacity: active || isCorrect || isWrong ? 1 : 0.45,
    boxShadow,
    transition: 'background 0.2s, color 0.2s, opacity 0.15s',
    lineHeight: 1.2,
  }
}
