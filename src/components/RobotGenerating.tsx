import type { BgPalette } from '../lib/palettes'

interface Props {
  bg: BgPalette
}

export function RobotGenerating({ bg }: Props) {
  return (
    <div style={{
      width: '100%', display: 'flex', justifyContent: 'center',
      paddingTop: 8,
    }}>
      <div style={{
        fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 600,
        color: bg.ink, opacity: 0.55, textAlign: 'center',
      }}>
        Dit duurt even, maar het wordt geweldig!
      </div>
    </div>
  )
}
