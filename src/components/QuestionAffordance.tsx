import type { BliepPalette, BgPalette } from '../lib/palettes'

interface Props {
  question: string
  duration: number
  open: boolean
  onToggle: () => void
  c: BliepPalette
  bg: BgPalette
}

function MiniWave({ c }: { c: BliepPalette }) {
  const bars = [6, 12, 18, 9, 14, 8, 16, 11, 7, 13]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, height: 20 }}>
      {bars.map((h, i) => (
        <span key={i} style={{ width: 2, height: h, borderRadius: 1, background: c.blue, opacity: 0.7 }} />
      ))}
    </span>
  )
}

export function QuestionAffordance({ question, duration, open, onToggle, c, bg }: Props) {
  const dStr = `0:${String(duration).padStart(2, '0')}`

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, paddingTop: 4 }}>
      <button onClick={onToggle} style={{
        appearance: 'none', border: `1.5px solid ${bg.line}`, background: '#fff',
        borderRadius: 999, padding: '6px 12px 6px 6px',
        display: 'inline-flex', alignItems: 'center', gap: 10, maxWidth: '92%',
        cursor: 'pointer', boxShadow: '0 2px 6px rgba(20,40,90,0.06)',
        fontFamily: '"Nunito", system-ui', color: c.deepBlue,
      }}>
        <span style={{
          width: 26, height: 26, borderRadius: '50%',
          background: bg.bg, border: `1px solid ${bg.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: c.deepBlue, flexShrink: 0,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <MiniWave c={c} />
        <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, fontVariantNumeric: 'tabular-nums' }}>{dStr}</span>
        <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.45, flexShrink: 0 }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div style={{
          alignSelf: 'flex-start', maxWidth: '88%',
          background: '#fff', border: `1.5px solid ${bg.line}`, borderRadius: 14,
          padding: '8px 12px', color: c.deepBlue,
          fontFamily: '"Nunito", system-ui', fontSize: 14, fontWeight: 700,
          lineHeight: 1.35, boxShadow: '0 6px 14px rgba(20,40,90,0.08)',
          animation: 'reveal 0.22s ease-out',
        }}>
          <style>{`@keyframes reveal { from{opacity:0;transform:translateY(-4px);} to{opacity:1;transform:translateY(0);} }`}</style>
          {question}
        </div>
      )}
    </div>
  )
}
