import type { BliepPalette, BgPalette } from '../lib/palettes'
import { TOPIC_ICONS } from '../lib/palettes'
import type { HistoryItem } from '../lib/history'
import { relativeTime } from '../lib/history'

interface Props {
  history: HistoryItem[]
  onClose: () => void
  c: BliepPalette
  bg: BgPalette
}

export function HistorySheet({ history, onClose, c, bg }: Props) {
  const grouped = history.reduce<Record<string, HistoryItem[]>>((acc, h) => {
    const k = h.topic || 'Algemeen'
    ;(acc[k] ??= []).push(h)
    return acc
  }, {})

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30 }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(15,25,55,0.35)',
        backdropFilter: 'blur(4px)',
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: bg.soft, borderRadius: '24px 24px 0 0',
        padding: '14px 22px 40px', maxHeight: '80%',
        boxShadow: '0 -10px 30px rgba(15,30,80,0.18)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ width: 44, height: 5, background: bg.line, borderRadius: 3, margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: '"Patrick Hand", cursive', fontSize: 28, color: c.deepBlue }}>Eerdere gesprekken</div>
          <div style={{ fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 700, color: c.deepBlue, opacity: 0.5 }}>
            {history.length} {history.length === 1 ? 'vraag' : 'vragen'}
          </div>
        </div>
        <div style={{ overflowY: 'auto', marginTop: 12, paddingRight: 4, WebkitOverflowScrolling: 'touch' }}>
          {history.length === 0 && (
            <div style={{
              fontFamily: '"Nunito", system-ui', fontSize: 15, color: c.deepBlue,
              opacity: 0.5, textAlign: 'center', padding: 24,
            }}>Nog geen vragen. Tik op de knop om te beginnen!</div>
          )}
          {Object.entries(grouped).map(([topic, items]) => (
            <div key={topic} style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: '"Patrick Hand", cursive', fontSize: 18,
                color: c.deepBlue, opacity: 0.75, marginBottom: 4,
              }}>
                <span style={{ fontSize: 16 }}>{TOPIC_ICONS[topic] ?? '💬'}</span>
                {topic}
                {items.length > 1 && (
                  <span style={{
                    fontSize: 11, fontWeight: 800, fontFamily: '"Nunito", system-ui',
                    background: c.glow + '66', borderRadius: 999, padding: '1px 7px', marginLeft: 2,
                  }}>{items.length} vragen</span>
                )}
              </div>
              {items.map((h, i) => (
                <div key={i} style={{
                  padding: '10px 12px', marginBottom: 6,
                  background: '#fff', borderRadius: 12, border: `1px solid ${bg.line}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <div style={{ fontFamily: '"Nunito", system-ui', fontSize: 14.5, fontWeight: 800, color: c.deepBlue, lineHeight: 1.3 }}>{h.q}</div>
                    <div style={{ fontFamily: '"Nunito", system-ui', fontSize: 11, fontWeight: 700, color: c.deepBlue, opacity: 0.45, whiteSpace: 'nowrap' }}>{relativeTime(h.ts)}</div>
                  </div>
                  <div style={{ marginTop: 3, fontFamily: '"Nunito", system-ui', fontSize: 13.5, fontWeight: 500, color: c.deepBlue, opacity: 0.72, lineHeight: 1.35 }}>↳ {h.a}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
