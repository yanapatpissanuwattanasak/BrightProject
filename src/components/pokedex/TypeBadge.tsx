const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  normal:   { bg: '#A8A878', text: '#fff' },
  fire:     { bg: '#F08030', text: '#fff' },
  water:    { bg: '#6890F0', text: '#fff' },
  electric: { bg: '#F8D030', text: '#333' },
  grass:    { bg: '#78C850', text: '#fff' },
  ice:      { bg: '#98D8D8', text: '#333' },
  fighting: { bg: '#C03028', text: '#fff' },
  poison:   { bg: '#A040A0', text: '#fff' },
  ground:   { bg: '#E0C068', text: '#333' },
  flying:   { bg: '#A890F0', text: '#fff' },
  psychic:  { bg: '#F85888', text: '#fff' },
  bug:      { bg: '#A8B820', text: '#fff' },
  rock:     { bg: '#B8A038', text: '#fff' },
  ghost:    { bg: '#705898', text: '#fff' },
  dragon:   { bg: '#7038F8', text: '#fff' },
  dark:     { bg: '#705848', text: '#fff' },
  steel:    { bg: '#B8B8D0', text: '#333' },
  fairy:    { bg: '#EE99AC', text: '#fff' },
}

export const TYPE_BG: Record<string, string> = Object.fromEntries(
  Object.entries(TYPE_COLORS).map(([k, v]) => [k, v.bg]),
)

interface TypeBadgeProps {
  type: string
  size?: 'sm' | 'md'
}

export function TypeBadge({ type, size = 'sm' }: TypeBadgeProps) {
  const colors = TYPE_COLORS[type] ?? { bg: '#888', text: '#fff' }
  const padding = size === 'md' ? '0.3rem 0.875rem' : '0.15rem 0.55rem'
  const fontSize = size === 'md' ? '0.8125rem' : '0.6875rem'

  return (
    <span
      style={{
        background: colors.bg,
        color: colors.text,
        padding,
        borderRadius: '999px',
        fontSize,
        fontWeight: 600,
        textTransform: 'capitalize',
        letterSpacing: '0.03em',
        display: 'inline-block',
      }}
    >
      {type}
    </span>
  )
}
