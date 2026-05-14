import { useEffect, useRef } from 'react'

interface Props {
  active: boolean
  onDone: () => void
}

const ANIMATION_MS = 550
const DONE_MS = 700

const OFFSETS: [number, number][] = [
  [-28, -28], [0, -36], [28, -28],
  [-32,   8], [0,  16], [32,   8],
]

export function BuildSparkle({ active, onDone }: Props) {
  const prevActive = useRef(false)

  useEffect(() => {
    if (active && !prevActive.current) {
      const id = setTimeout(onDone, DONE_MS)
      prevActive.current = true
      return () => clearTimeout(id)
    }
    if (!active) prevActive.current = false
  }, [active, onDone])

  if (!active) return null

  return (
    <>
      <style>{`
        @keyframes build-sparkle {
          0%   { opacity: 1; transform: translate(0, 0) scale(1.2); }
          100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.4); }
        }
      `}</style>
      <div style={{ position: 'relative', height: 0, overflow: 'visible', pointerEvents: 'none' }}>
        {OFFSETS.map(([dx, dy], i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: -10,
              left: '50%',
              marginLeft: -10,
              fontSize: 20,
              lineHeight: 1,
              userSelect: 'none',
              willChange: 'transform, opacity',
              // @ts-ignore
              '--dx': `${dx}px`,
              '--dy': `${dy}px`,
              animation: `build-sparkle ${ANIMATION_MS}ms ease-out ${i * 40}ms both`,
            }}
          >
            ✨
          </div>
        ))}
      </div>
    </>
  )
}
