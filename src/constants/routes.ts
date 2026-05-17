export const ROUTES = {
  HOME: '/',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:slug',
  ABOUT: '/about',
  CONTACT: '/contact',
  TIME_BLOCKING: '/time-blocking',
  TAROT: '/tarot',
  THAILAND: '/thailand',
  CHAT: '/chat',
  BANGKOK_AQI: '/bangkok-aqi',
  POKEDEX: '/pokedex',
  RPS: '/rps-game',
  ADMIN: {
    LOGIN: '/admin/login',
    DASHBOARD: '/admin',
    PROJECT_NEW: '/admin/projects/new',
    PROJECT_EDIT: '/admin/projects/:id',
  },
} as const

export const projectDetailPath = (slug: string) => `/projects/${slug}`
export const adminProjectEditPath = (id: string) => `/admin/projects/${id}`
