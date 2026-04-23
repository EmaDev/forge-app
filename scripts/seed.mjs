import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'
import { readFileSync } from 'fs'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local
const envPath = join(__dirname, '..', '.env.local')
const env = {}
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const idx = trimmed.indexOf('=')
  if (idx === -1) continue
  env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
}

const require = createRequire(import.meta.url)
const week1 = require('../src/data/week1.json')

const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
})

const db = getFirestore(app)

async function seed() {
  console.log(`Seeding project: ${env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`)

  await setDoc(doc(db, 'weeks', 'week-1'), week1)
  console.log('✓ weeks/week-1')

  await setDoc(doc(db, 'streak', 'main'), {
    current: 0,
    record: 0,
    lastSessionAt: null,
    weeklyCompletionRate: null,
  })
  console.log('✓ streak/main')

  console.log('\nFirestore seeded. Collections created: weeks, streak')
  console.log('Sessions and prs will be created automatically on first use.')
  process.exit(0)
}

seed().catch(err => {
  console.error('\nSeed failed:', err.message)
  if (err.code === 'permission-denied') {
    console.error('\nFirestore rules are blocking writes.')
    console.error('Fix: go to Firebase Console > Firestore > Rules and set:')
    console.error('  allow read, write: if true;')
    console.error('Or run: npx firebase-tools deploy --only firestore:rules')
  }
  process.exit(1)
})
