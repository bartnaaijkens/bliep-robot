import { useMemo } from 'react'
import type { BliepPalette, BgPalette } from '../lib/palettes'
import { EXAMPLE_PROMPTS } from '../lib/palettes'

interface Props {
  c: BliepPalette
  bg: BgPalette
  onPick: (label: string) => void
}

export function ExamplePrompts({ c, bg: _bg, onPick }: Props) {
  const picks = useMemo(() =>
    [...EXAMPLE_PROMPTS].sort(() => Math.random() - 0.5).slice(0, 5)
  , [])

  return (
    <div style={{
      width: '100%', display: 'flex', flexWrap: 'wrap', gap: 6,
      justifyContent: 'flex-end',
      animation: 'ex-in 0.4s ease-out both',
    }}>
      <style>{`@keyframes ex-in { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }`}</style>
      <div style={{
        width: '100%', textAlign: 'right',
        fontFamily: '"Patrick Hand", cursive', fontSize: 15,
        color: c.deepBlue, opacity: 0.55, marginBottom: 2,
      }}>probeer bijvoorbeeld:</div>
      {picks.map((p, i) => (
        <button key={i} onClick={() => onPick(p.label)} style={{
          border: `1.5px solid ${c.blue}55`, background: '#fff',
          borderRadius: 999, padding: '6px 12px',
          fontFamily: '"Nunito", system-ui', fontSize: 12.5, fontWeight: 700,
          color: c.deepBlue, cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(20,40,90,0.06)',
        }}>{p.label}</button>
      ))}
    </div>
  )
}
