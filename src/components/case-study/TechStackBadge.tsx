import { Badge } from '@/components/ui/Badge'

const TECH_COLORS: Record<string, string> = {
  React: '#61DAFB',
  NestJS: '#E0234E',
  TypeScript: '#3178C6',
  PostgreSQL: '#336791',
  'Claude AI': '#6366F1',
  'Tailwind CSS': '#38BDF8',
  'TanStack Query': '#FF4154',
  'Framer Motion': '#FF0055',
  'React Router': '#CA4245',
  TypeORM: '#FE0D3D',
}

interface TechStackBadgeProps {
  tech: string
}

export function TechStackBadge({ tech }: TechStackBadgeProps) {
  return <Badge color={TECH_COLORS[tech]}>{tech}</Badge>
}
