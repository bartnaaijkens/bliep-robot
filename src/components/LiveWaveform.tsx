import type { BliepPalette } from '../lib/palettes'

interface Props {
  c: BliepPalette
}

export function LiveWaveform({ c }: Props) {
  const bars = Array.from({ length: 26 })
  return (
    <div style={{
      width: '100%', height: 60, padding: '4px 6px 0',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    }}>
      <style>{`@keyframes wf { 0%,100%{transform:scaleY(0.18);} 50%{transform:scaleY(1);} }`}</style>
      {bars.map((_, i) => {
        const baseDelay = (i % 13) * 0.06
        const dur = 0.7 + ((i * 13) % 7) * 0.07
        return (
          <span key={i} style={{
            width: 4, height: 40, borderRadius: 2,
            background: `linear-gradient(180deg, ${c.cyan}, ${c.blue})`,
            boxShadow: `0 0 6px ${c.glow}aa`,
            transformOrigin: 'center',
            animation: `wf ${dur}s ease-in-out infinite ${baseDelay}s`,
            opacity: 0.95,
          }} />
        )
      })}
    </div>
  )
}
