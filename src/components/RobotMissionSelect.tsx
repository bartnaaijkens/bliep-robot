import { MISSIONS } from '../lib/robot'
import type { MissionId } from '../lib/robot'
import type { BliepPalette, BgPalette } from '../lib/palettes'

interface Props {
  onSelect: (mission: MissionId) => void
  c: BliepPalette
  bg: BgPalette
}

export function RobotMissionSelect({ onSelect, c, bg }: Props) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{
        fontFamily: '"Patrick Hand", cursive', fontSize: 22,
        color: c.deepBlue, opacity: 0.75, textAlign: 'center', marginBottom: 4,
      }}>
        Kies een missie voor je robot!
      </div>
      {MISSIONS.map(mission => (
        <button
          key={mission.id}
          onClick={() => onSelect(mission.id)}
          style={{
            width: '100%', border: 'none', cursor: 'pointer',
            background: bg.soft,
            borderRadius: 16,
            boxShadow: `0 2px 0 ${bg.line}`,
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 14,
            textAlign: 'left',
            transition: 'transform 0.12s',
          }}
          onPointerDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)' }}
          onPointerUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
          onPointerLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
        >
          <div style={{ fontSize: 48, lineHeight: 1, flexShrink: 0 }}>
            {mission.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: '"Patrick Hand", cursive', fontSize: 22,
              color: c.deepBlue, lineHeight: 1.1,
            }}>{mission.name}</div>
            <div style={{
              fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 600,
              color: bg.ink, opacity: 0.65, marginTop: 3, lineHeight: 1.3,
            }}>{mission.description}</div>
          </div>
          <div style={{
            fontFamily: '"Patrick Hand", cursive', fontSize: 18,
            color: c.blue, flexShrink: 0,
          }}>Kies!</div>
        </button>
      ))}
    </div>
  )
}
