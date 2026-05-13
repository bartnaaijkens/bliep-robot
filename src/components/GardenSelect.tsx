import { PLANT_TYPES } from '../lib/garden'
import type { PlantId } from '../lib/garden'
import type { BliepPalette, BgPalette } from '../lib/palettes'

interface Props {
  onSelect: (plant: PlantId) => void
  c: BliepPalette
  bg: BgPalette
}

const PLANT_ORDER: PlantId[] = ['tomato', 'sunflower', 'cactus']

export function GardenSelect({ onSelect, c, bg }: Props) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{
        fontFamily: '"Patrick Hand", cursive', fontSize: 22,
        color: c.deepBlue, opacity: 0.75, textAlign: 'center', marginBottom: 4,
      }}>
        Welke plant wil je kweken?
      </div>
      {PLANT_ORDER.map(id => {
        const plant = PLANT_TYPES[id]
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
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
              {plant.stageEmojis[4]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: '"Patrick Hand", cursive', fontSize: 22,
                color: c.deepBlue, lineHeight: 1.1,
              }}>{plant.name}</div>
              <div style={{
                fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 600,
                color: bg.ink, opacity: 0.65, marginTop: 3, lineHeight: 1.3,
              }}>{plant.description}</div>
            </div>
            <div style={{
              fontFamily: '"Patrick Hand", cursive', fontSize: 18,
              color: c.blue, flexShrink: 0,
            }}>Kies!</div>
          </button>
        )
      })}
    </div>
  )
}
