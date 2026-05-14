import { initializeApp } from 'firebase/app'
import { getDatabase, type Database } from 'firebase/database'

let db: Database | null = null

try {
  const app = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  })
  db = getDatabase(app)
} catch {
  // Firebase config missing — chat features disabled
}

export { db }
