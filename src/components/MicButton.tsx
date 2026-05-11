import type { BliepState } from './BliepCharacter'
import type { BliepPalette } from '../lib/palettes'

interface Props {
  phase: BliepState | 'result'
  c: BliepPalette
  onClick: () => void
}

export function MicButton({ phase, c, onClick }: Props) {
  const isListening = phase === 'listening'
  const disabled = phase === 'thinking' || phase === 'speaking'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={isListening ? 'Stop met luisteren' : 'Stel een vraag'}
      style={{
        position: 'relative', width: 104, height: 104, borderRadius: '50%',
        border: 'none', cursor: disabled ? 'default' : 'pointer',
        background: `radial-gradient(circle at 35% 30%, ${c.blue} 0%, ${c.deepBlue} 70%, #3A0A60 100%)`,
        boxShadow: isListening
          ? `0 0 0 10px ${c.glow}55, 0 0 0 22px ${c.glow}22, 0 10px 26px ${c.deepBlue}55`
          : `0 10px 22px ${c.deepBlue}55, inset 0 -6px 14px rgba(0,0,0,0.25), inset 0 4px 8px rgba(255,255,255,0.2)`,
        transition: 'box-shadow 0.3s',
        flexShrink: 0,
      }}
    >
      {isListening && (
        <>
          <span style={{ position: 'absolute', inset: -16, borderRadius: '50%', border: `3px solid ${c.cyan}`, opacity: 0.4, animation: 'mic-ripple 1.4s ease-out infinite' }} />
          <span style={{ position: 'absolute', inset: -16, borderRadius: '50%', border: `3px solid ${c.cyan}`, opacity: 0.4, animation: 'mic-ripple 1.4s ease-out 0.7s infinite' }} />
          <style>{`@keyframes mic-ripple { 0%{transform:scale(0.85);opacity:0.55;} 100%{transform:scale(1.55);opacity:0;} }`}</style>
        </>
      )}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.glow }}>
        {isListening ? (
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <span key={i} style={{
                width: 5, background: c.glow, borderRadius: 3,
                animation: `wave-mic 0.9s ease-in-out infinite ${i * 0.12}s`,
                boxShadow: `0 0 8px ${c.glow}`,
              }} />
            ))}
            <style>{`@keyframes wave-mic { 0%,100%{height:8px;} 50%{height:36px;} }`}</style>
          </div>
        ) : (
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="9" y="3" width="6" height="12" rx="3" fill={c.glow} />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke={c.glow} strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </button>
  )
}
