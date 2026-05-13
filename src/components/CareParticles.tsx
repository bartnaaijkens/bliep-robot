import { useEffect, useRef } from 'react'
import type { CareAction } from '../lib/garden'

const ACTION_EMOJI: Record<CareAction, string> = {
  'water-little': '💧',
  'water-much':   '💧',
  'sunlight':     '☀️',
  'nutrients':    '🌿',
}

const PARTICLE_COUNT = 4
const ANIMATION_MS = 700
const DONE_MS = 850

interface Props {
  action: CareAction | null
  onDone: () => void
}

export function CareParticles({ action, onDone }: Props) {
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    if (!action) return
    const id = setTimeout(() => doneRef.current(), DONE_MS)
    return () => clearTimeout(id)
  }, [action])

  if (!action) return null

  const emoji = ACTION_EMOJI[action]

  // Pre-generate stable offsets per particle
  const particles = [
    { rot: -15, dx: -14, delay: 0 },
    { rot: 8,   dx: -4,  delay: 80 },
    { rot: -5,  dx: 10,  delay: 160 },
    { rot: 18,  dx: 16,  delay: 240 },
  ].slice(0, PARTICLE_COUNT)

  return (
    <>
      <style>{`
        @keyframes care-particle-fall {
          0%   { opacity: 1; transform: translateY(0px) translateX(0px) scale(1.3) rotate(var(--rot)); }
          70%  { opacity: 0.9; }
          100% { opacity: 0; transform: translateY(100px) translateX(var(--dx)) scale(0.5) rotate(calc(var(--rot) * 1.5)); }
        }
      `}</style>
      <div style={{ position: 'relative', height: 0, overflow: 'visible', pointerEvents: 'none' }}>
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: -10,
              left: '50%',
              marginLeft: -12,
              fontSize: 24,
              lineHeight: 1,
              // @ts-ignore — CSS custom properties
              '--rot': `${p.rot}deg`,
              '--dx': `${p.dx}px`,
              animation: `care-particle-fall ${ANIMATION_MS}ms ease-in ${p.delay}ms both`,
              willChange: 'transform, opacity',
            } as React.CSSProperties}
          >
            {emoji}
          </div>
        ))}
      </div>
    </>
  )
}
