export interface Hero {
  id: number
  name: string
  src: string
}

const modules = import.meta.glob('./hero/*.{gif,svg,png,webp}', { eager: true })

export const HEROES: Hero[] = Object.entries(modules).map(([path, mod], i) => {
  const filename = path.split('/').pop()?.replace(/\.[^.]+$/, '') ?? `hero_${i + 1}`
  const name = filename
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
  return {
    id: i,
    name,
    src: (mod as { default: string }).default,
  }
})
