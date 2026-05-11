import { useState, useEffect } from 'react'
import type { BliepPalette, BgPalette } from '../lib/palettes'
import type { TafelsSession } from '../lib/tafels'

interface Props {
  session: TafelsSession
  phase: string
  onAnswer: (n: number) => void
  c: BliepPalette
  bg: BgPalette
}

export function TafelsGame({ session, phase, onAnswer, c, bg }: Props) {
  const [input, setInput] = useState('')
  const active = phase === 'tafels-vraag'
  const q = session.questions[Math.min(session.currentIndex, session.questions.length - 1)]
  const total = session.questions.length
  const progress = session.currentIndex / total

  // Reset input when a new question starts
  useEffect(() => {
    if (active) setInput('')
  }, [session.currentIndex, active])

  function pressDigit(d: string) {
    if (!active) return
    setInput(prev => (prev + d).slice(0, 3))
  }

  function pressBack() {
    if (!active) return
    setInput(prev => prev.slice(0, -1))
  }

  function pressOK() {
    if (!active || input === '') return
    onAnswer(parseInt(input, 10))
  }

  const KEYS = ['7','8','9','4','5','6','1','2','3']

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

      {/* Question */}
      <div style={{
        fontFamily: '"Patrick Hand", cursive', fontSize: 40, color: c.deepBlue,
        letterSpacing: 1, lineHeight: 1, textAlign: 'center',
      }}>
        {q.a} × {q.b} = ?
      </div>

      {/* Answer display */}
      <div style={{
        width: 120, height: 52, borderRadius: 14,
        background: bg.soft,
        border: `2px solid ${active ? c.blue : bg.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Nunito", system-ui', fontSize: 30, fontWeight: 800,
        color: input ? c.deepBlue : bg.ink,
        letterSpacing: 2,
        transition: 'border-color 0.15s',
      }}>
        {input || '—'}
      </div>

      {/* Numpad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: '100%', maxWidth: 260 }}>
        {KEYS.map(k => (
          <button key={k} onClick={() => pressDigit(k)} disabled={!active}
            style={numKey(c, bg, active)}>
            {k}
          </button>
        ))}
        {/* bottom row: backspace, 0, OK */}
        <button onClick={pressBack} disabled={!active} style={numKey(c, bg, active, true)}>
          ⌫
        </button>
        <button onClick={() => pressDigit('0')} disabled={!active} style={numKey(c, bg, active)}>
          0
        </button>
        <button
          onClick={pressOK} disabled={!active || input === ''}
          style={{
            ...numKey(c, bg, active && input !== ''),
            background: active && input !== ''
              ? `linear-gradient(135deg, ${c.blue}, ${c.deepBlue})`
              : bg.soft,
            color: active && input !== '' ? '#fff' : bg.ink,
            fontFamily: '"Patrick Hand", cursive', fontSize: 22,
          }}
        >
          OK
        </button>
      </div>
    </div>
  )
}

function numKey(c: BliepPalette, bg: BgPalette, active: boolean, muted = false): React.CSSProperties {
  return {
    height: 56, borderRadius: 14, border: 'none',
    cursor: active ? 'pointer' : 'default',
    fontFamily: '"Nunito", system-ui', fontSize: 22, fontWeight: 800,
    background: muted ? bg.soft : bg.soft,
    color: muted ? bg.ink : c.deepBlue,
    opacity: active ? 1 : 0.45,
    boxShadow: `0 2px 0 ${bg.line}`,
    transition: 'opacity 0.15s',
  }
}
