import { useState, useEffect } from 'react'
import type { BliepPalette } from '../lib/palettes'

interface Props {
  text: string
  isSpeaking: boolean
  isConfused: boolean
  c: BliepPalette
  onReplay: () => void
}

function TypedText({ text, speedMs = 30 }: { text: string; speedMs?: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    if (!text) return
    let i = 0
    const id = setInterval(() => { i++; setN(i); if (i >= text.length) clearInterval(id) }, speedMs)
    return () => clearInterval(id)
  }, [text, speedMs])
  return <>{text.slice(0, n)}{n < text.length && <span style={{ opacity: 0.5 }}>▍</span>}</>
}

export function AnswerBubble({ text, isSpeaking, isConfused, c, onReplay }: Props) {
  return (
    <div style={{
      maxWidth: '88%',
      background: isConfused ? '#fff' : c.blue,
      color: isConfused ? c.deepBlue : '#fff',
      padding: '10px 14px',
      borderRadius: '18px 18px 4px 18px',
      border: `1.5px solid ${isConfused ? c.deepBlue + '33' : c.deepBlue}`,
      fontFamily: '"Nunito", system-ui', fontSize: 15.5, fontWeight: 600,
      lineHeight: 1.4,
      boxShadow: '0 4px 12px rgba(122,40,168,0.22)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div>{isSpeaking ? <TypedText text={text} speedMs={30} /> : text}</div>
      {!isSpeaking && (
        <button onClick={onReplay} style={{
          alignSelf: 'flex-start',
          background: isConfused ? c.deepBlue + '11' : 'rgba(255,255,255,0.18)',
          border: 'none', borderRadius: 999,
          padding: '4px 10px', cursor: 'pointer',
          fontFamily: '"Nunito", system-ui', fontSize: 12, fontWeight: 800,
          color: 'inherit', opacity: 0.85,
          display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3 10v4h4l5 4V6L7 10H3z" />
            <path d="M16 8a5 5 0 0 1 0 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
          luister opnieuw
        </button>
      )}
    </div>
  )
}
