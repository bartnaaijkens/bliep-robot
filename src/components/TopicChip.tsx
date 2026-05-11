import type { BliepPalette, BgPalette } from '../lib/palettes'
import { TOPIC_ICONS } from '../lib/palettes'

interface Props {
  topic: string
  turns: number
  c: BliepPalette
  bg: BgPalette
  onClear: () => void
}

export function TopicChip({ topic, turns, c, bg, onClear }: Props) {
  const icon = TOPIC_ICONS[topic] ?? '💬'
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 6px 5px 10px',
      background: '#fff',
      border: `1.5px solid ${c.blue}33`,
      borderRadius: 999,
      boxShadow: '0 2px 8px rgba(20,40,90,0.06)',
      fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 800,
      color: c.deepBlue, maxWidth: '100%',
      animation: 'topic-in 0.32s cubic-bezier(.2,.9,.3,1.2) both',
    }}>
      <style>{`@keyframes topic-in { 0%{transform:scale(0.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }`}</style>
      <span style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>
      <span>{topic}</span>
      {turns > 1 && (
        <span style={{
          fontSize: 11, fontWeight: 800,
          background: c.glow + '66', color: c.deepBlue,
          borderRadius: 999, padding: '1px 6px',
        }}>{turns}×</span>
      )}
      <button onClick={onClear} aria-label="Nieuw gesprek beginnen" style={{
        width: 20, height: 20, borderRadius: '50%', border: 'none',
        background: bg.bg, color: c.deepBlue,
        marginLeft: 2, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, lineHeight: 1, fontWeight: 700,
      }}>×</button>
    </div>
  )
}
