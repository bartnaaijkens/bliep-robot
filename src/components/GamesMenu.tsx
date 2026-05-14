import type { BliepPalette, BgPalette } from '../lib/palettes'

type GameId = 'garden' | 'robot'

interface GameCard {
  id: GameId
  emoji: string
  title: string
  subtitle: string
  color: string
}

const GAME_CARDS: GameCard[] = [
  {
    id: 'garden',
    emoji: '🌱',
    title: 'Plantentuin',
    subtitle: 'Help Bliep om een plant groot te maken!',
    color: '#2BA37A',
  },
  {
    id: 'robot',
    emoji: '🤖',
    title: 'Robot Bouwen',
    subtitle: 'Bouw de perfecte robot voor een missie!',
    color: '#2E6FD8',
  },
]

interface Props {
  onSelectGame: (game: GameId) => void
  c: BliepPalette
  bg: BgPalette
}

export function GamesMenu({ onSelectGame, c, bg }: Props) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {GAME_CARDS.map(card => (
        <button
          key={card.id}
          onClick={() => onSelectGame(card.id)}
          style={{
            width: '100%', border: 'none', cursor: 'pointer',
            background: bg.soft,
            borderRadius: 18,
            boxShadow: `0 2px 0 ${bg.line}, 0 4px 12px rgba(20,30,60,0.06)`,
            padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: 16,
            textAlign: 'left',
            transition: 'transform 0.12s, box-shadow 0.12s',
          }}
          onPointerDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)' }}
          onPointerUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
          onPointerLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
        >
          <div style={{ fontSize: 48, lineHeight: 1, flexShrink: 0 }}>{card.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: '"Patrick Hand", cursive', fontSize: 24,
              color: c.deepBlue, lineHeight: 1.1,
            }}>{card.title}</div>
            <div style={{
              fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 600,
              color: bg.ink, opacity: 0.65, marginTop: 4, lineHeight: 1.3,
            }}>{card.subtitle}</div>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: 99, flexShrink: 0,
            background: card.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 18, fontWeight: 900,
          }}>▶</div>
        </button>
      ))}
    </div>
  )
}
