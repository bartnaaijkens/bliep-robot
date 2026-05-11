import type { BliepPalette, BgPalette } from '../lib/palettes'
import { ALL_TABLES } from '../lib/tables'

interface Props {
  selectedTables: number[]
  onToggle: (table: number) => void
  onStart: () => void
  c: BliepPalette
  bg: BgPalette
}

export function TablesSetup({ selectedTables, onToggle, onStart, c, bg }: Props) {
  const canStart = selectedTables.length > 0

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, paddingTop: 8 }}>
      <div style={{
        fontFamily: '"Patrick Hand", cursive', fontSize: 22,
        color: c.deepBlue, textAlign: 'center', lineHeight: 1.2,
      }}>
        Welke tafels wil je oefenen?
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10, width: '100%', maxWidth: 280,
      }}>
        {ALL_TABLES.map(t => {
          const selected = selectedTables.includes(t)
          return (
            <button
              key={t}
              onClick={() => onToggle(t)}
              style={{
                height: 60, borderRadius: 14, border: 'none', cursor: 'pointer',
                fontFamily: '"Nunito", system-ui', fontSize: 20, fontWeight: 800,
                background: selected ? c.blue : bg.soft,
                color: selected ? '#fff' : c.deepBlue,
                boxShadow: selected
                  ? `0 3px 10px ${c.blue}55`
                  : `0 1px 0 ${bg.line}`,
                transition: 'background 0.15s, box-shadow 0.15s, color 0.15s',
              }}
              aria-pressed={selected}
              aria-label={`Tafel van ${t}`}
            >
              ×{t}
            </button>
          )
        })}
      </div>

      <button
        onClick={onStart}
        disabled={!canStart}
        style={{
          marginTop: 8, width: '100%', maxWidth: 280, height: 58,
          borderRadius: 18, border: 'none', cursor: canStart ? 'pointer' : 'default',
          fontFamily: '"Patrick Hand", cursive', fontSize: 26, letterSpacing: 0.5,
          background: canStart
            ? `linear-gradient(135deg, ${c.blue} 0%, ${c.deepBlue} 100%)`
            : bg.soft,
          color: canStart ? '#fff' : bg.ink,
          opacity: canStart ? 1 : 0.45,
          boxShadow: canStart ? `0 4px 16px ${c.blue}55` : 'none',
          transition: 'opacity 0.2s, box-shadow 0.2s',
        }}
        aria-disabled={!canStart}
      >
        Start!
      </button>
    </div>
  )
}
