import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const db = getFirestore(app)

export const getProgram = async () => {
  const snap = await getDoc(doc(db, 'program', 'main'))
  return snap.exists() ? snap.data() : null
}

export const getWeek = async (weekNumber: number) => {
  const snap = await getDoc(doc(db, 'weeks', `week-${weekNumber}`))
  return snap.exists() ? snap.data() : null
}

export const saveWeek = async (weekNumber: number, data: unknown) => {
  await setDoc(doc(db, 'weeks', `week-${weekNumber}`), data)
}

export const saveSession = async (sessionData: unknown) => {
  await addDoc(collection(db, 'sessions'), sessionData)
}

export const getSessions = async () => {
  const snap = await getDocs(query(collection(db, 'sessions'), orderBy('completedAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getStreak = async () => {
  const snap = await getDoc(doc(db, 'streak', 'main'))
  return snap.exists() ? snap.data() : { current: 0, record: 0, lastSessionAt: null }
}

export const updateStreak = async (data: unknown) => {
  await setDoc(doc(db, 'streak', 'main'), data)
}

export const savePR = async (pr: unknown) => {
  await addDoc(collection(db, 'prs'), pr)
}

export const getPRs = async () => {
  const snap = await getDocs(query(collection(db, 'prs'), orderBy('achievedAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const saveAIAnalysis = async (weekNumber: number, analysis: unknown) => {
  await setDoc(doc(db, 'ai_analysis', `week-${weekNumber}`), analysis)
}

export const getAIAnalysis = async (weekNumber: number) => {
  const snap = await getDoc(doc(db, 'ai_analysis', `week-${weekNumber}`))
  return snap.exists() ? snap.data() : null
}
