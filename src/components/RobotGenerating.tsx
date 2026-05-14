import { useState, useEffect } from 'react'
import type { BliepPalette, BgPalette } from '../lib/palettes'

interface Props {
  c: BliepPalette
  bg: BgPalette
}

export function RobotGenerating({ c, bg }: Props) {
  const [dots, setDots] = useState(1)

  useEffect(() => {
    const id = setInterval(() => setDots(d => d >= 3 ? 1 : d + 1), 600)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <style>{`
        @keyframes robot-spin {
          0%   { transform: scale(1) rotate(-4deg); }
          25%  { transform: scale(1.08) rotate(0deg); }
          50%  { transform: scale(1) rotate(4deg); }
          75%  { transform: scale(1.08) rotate(0deg); }
          100% { transform: scale(1) rotate(-4deg); }
        }
      `}</style>
      <div style={{
        width: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 16, paddingTop: 24,
      }}>
        <div style={{
          fontSize: 80, lineHeight: 1, userSelect: 'none',
          animation: 'robot-spin 1.8s ease-in-out infinite',
        }}>
          🤖
        </div>
        <div style={{
          fontFamily: '"Patrick Hand", cursive', fontSize: 26,
          color: c.deepBlue, textAlign: 'center',
        }}>
          Bliep bouwt je robot{'.'.repeat(dots)}
        </div>
        <div style={{
          fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 600,
          color: bg.ink, opacity: 0.55, textAlign: 'center',
        }}>
          Dit duurt even, maar het wordt geweldig!
        </div>
      </div>
    </>
  )
}
