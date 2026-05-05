import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Badge } from '@/components/ui/Badge'

const SKILL_GROUPS = [
  {
    label: 'Frontend',
    skills: ['React 19', 'TypeScript', 'TanStack Query', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    label: 'Backend',
    skills: ['NestJS', 'Node.js', 'TypeORM', 'REST APIs', 'JWT Auth'],
  },
  {
    label: 'Data',
    skills: ['PostgreSQL', 'JSONB', 'Full-text Search', 'Migrations', 'Redis'],
  },
  {
    label: 'DevOps',
    skills: ['Vercel', 'Railway', 'Docker', 'GitHub Actions', 'Cloudinary'],
  },
]

export function SkillsSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-section">
      <ScrollReveal>
        <h2 className="text-2xl font-bold text-text-primary mb-10">Skills</h2>
      </ScrollReveal>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {SKILL_GROUPS.map(({ label, skills }, i) => (
          <ScrollReveal key={label} delay={i * 0.08}>
            <div>
              <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
                {label}
              </h3>
              <ul className="flex flex-wrap gap-2" role="list">
                {skills.map((skill) => (
                  <li key={skill}>
                    <Badge>{skill}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
