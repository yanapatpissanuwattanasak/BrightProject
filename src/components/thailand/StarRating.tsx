interface Props {
  rating: number  // 1.0 – 5.0
  size?: number
}

export function StarRating({ rating, size = 14 }: Props) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5 ? 1 : 0
  const empty = 5 - full - half

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Rating ${rating} out of 5`}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} type="full" size={size} />
      ))}
      {half === 1 && <Star type="half" size={size} />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} type="empty" size={size} />
      ))}
      <span className="ml-1 text-xs font-semibold text-text-primary">{rating.toFixed(1)}</span>
    </span>
  )
}

function Star({ type, size }: { type: 'full' | 'half' | 'empty'; size: number }) {
  if (type === 'full') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#F59E0B">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )
  }
  if (type === 'half') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <defs>
          <clipPath id="half-clip">
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
        </defs>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#1E1E2E" />
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#F59E0B" clipPath="url(#half-clip)" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1E1E2E">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}
