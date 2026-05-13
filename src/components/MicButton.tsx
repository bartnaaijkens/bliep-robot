import type { BliepState } from './BliepCharacter'
import type { BliepPalette } from '../lib/palettes'
import { WARNING_QUESTIONS } from '../lib/rateLimit'

interface Props {
  phase: BliepState | 'result'
  c: BliepPalette
  onClick: () => void
  remaining: number
}

export function MicButton({ phase, c, onClick, remaining }: Props) {
  const isListening = phase === 'listening'
  const disabled = phase === 'thinking' || phase === 'speaking'
  const isBlocked = remaining === 0
  const isWarning = remaining > 0 && remaining <= WARNING_QUESTIONS

  const bg = isBlocked
    ? 'radial-gradient(circle at 35% 30%, #9CA3AF 0%, #6B7280 70%, #374151 100%)'
    : isWarning
    ? 'radial-gradient(circle at 35% 30%, #FCD34D 0%, #F59E0B 70%, #B45309 100%)'
    : `radial-gradient(circle at 35% 30%, ${c.blue} 0%, ${c.deepBlue} 70%, #3A0A60 100%)`

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={isListening ? 'Stop met luisteren' : 'Stel een vraag'}
      style={{
        position: 'relative', width: 104, height: 104, borderRadius: '50%',
        border: 'none', cursor: disabled ? 'default' : 'pointer',
        background: bg,
        boxShadow: isListening
          ? `0 0 0 10px ${c.glow}55, 0 0 0 22px ${c.glow}22, 0 10px 26px ${c.deepBlue}55`
          : `0 10px 22px ${c.deepBlue}55, inset 0 -6px 14px rgba(0,0,0,0.25), inset 0 4px 8px rgba(255,255,255,0.2)`,
        transition: 'box-shadow 0.3s, background 0.4s',
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
            <rect x="9" y="3" width="6" height="12" rx="3" fill={isBlocked ? '#D1D5DB' : c.glow} />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke={isBlocked ? '#D1D5DB' : c.glow} strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        )}
      </div>
      {(isWarning || isBlocked) && (
        <span style={{
          position: 'absolute', top: 4, right: 4,
          width: 22, height: 22, borderRadius: '50%',
          background: isBlocked ? '#EF4444' : '#92400E',
          color: 'white', fontSize: 12, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
          pointerEvents: 'none',
        }}>
          {remaining}
        </span>
      )}
    </button>
  )
}
