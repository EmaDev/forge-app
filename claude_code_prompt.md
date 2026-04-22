# FORGE — AI-Powered Training App
## Prompt para Claude Code

---

## Contexto del proyecto

Estás desarrollando FORGE, una PWA de entrenamiento personal para un único usuario experimentado (10 años de gym) que busca recomposición corporal y rendimiento físico mediante una combinación de fuerza, CrossFit y movimientos olímpicos.

El diferencial central de la app es una IA (Claude API) que analiza el progreso semanal del usuario y genera automáticamente la rutina de la semana siguiente, ajustando cargas, volumen y metcons en base a datos reales de entrenamiento.

---

## Stack técnico

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Animaciones:** Motion (framer-motion v11+)
- **Base de datos:** Firebase Firestore (JSON documents, sin auth)
- **IA:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Deploy:** Vercel
- **PWA:** next-pwa o manifest.json manual

---

## Identidad visual — FORGE

La app se llama **FORGE**. La estética es industrial, oscura y precisa. Como una forja de metal.

- **Fondo:** #0A0A0A (casi negro)
- **Superficie:** #111111 y #1A1A1A para cards
- **Acento primario:** #E24B4A (rojo forja)
- **Acento secundario:** #F5A623 (ámbar/fuego) para PRs y logros
- **Texto primario:** #F5F5F5
- **Texto secundario:** #888888
- **Bordes:** #2A2A2A
- **Éxito/completado:** #1D9E75 (verde)
- **Fuente:** Geist Mono para números y métricas, Geist Sans para texto

Cada pantalla debe sentirse como un panel de control de alto rendimiento, no como una app de fitness genérica. Sin pasteles, sin emojis decorativos, sin gradientes llamativos.

---

## Estructura de archivos esperada

```
src/
  app/
    page.tsx                    → Dashboard / Hoy
    session/[dayId]/page.tsx    → Sesión activa
    weekly/page.tsx             → Vista semanal
    progress/page.tsx           → Gráficos de progreso
    history/page.tsx            → Historial de sesiones
    api/
      analyze-week/route.ts     → Llama a Claude API, genera semana siguiente
      complete-set/route.ts     → Guarda un set completado
  components/
    ui/
      Button.tsx
      Card.tsx
      Badge.tsx
      Timer.tsx                 → Temporizador de descanso
      RPESelector.tsx           → Selector 1-10 con feedback visual
      ProgressRing.tsx          → Anillo de progreso circular
    session/
      ExerciseCard.tsx          → Card de ejercicio con sets
      SetRow.tsx                → Fila individual de set (reps + peso + RPE)
      MetconCard.tsx            → Card de metcon con resultado
      RestTimer.tsx             → Timer de descanso con animación
    weekly/
      WeekGrid.tsx              → Grid de 5 días
      DayCard.tsx               → Card de día en vista semanal
    progress/
      LiftChart.tsx             → Gráfico de progresión de carga
      MetconChart.tsx           → Gráfico de mejora en metcons
      PRBadge.tsx               → Badge de récord personal
  lib/
    firebase.ts                 → Inicialización y helpers de Firestore
    anthropic.ts                → Cliente y función de análisis semanal
    progressionEngine.ts        → Lógica local de decisiones de progresión
    utils.ts                    → cn(), formatTime(), calcularRPE(), etc.
  hooks/
    useSession.ts               → Estado de sesión activa
    useProgram.ts               → Lee programa desde Firestore
    useStreak.ts                → Racha actual
    useTimer.ts                 → Lógica del temporizador
  types/
    program.ts                  → Tipos TypeScript del JSON de programa
    session.ts                  → Tipos de sesión y sets
    feedback.ts                 → Tipos de feedback semanal y análisis IA
  data/
    week1.json                  → Semana 1 hardcodeada (seed inicial)
```

---

## Tipos TypeScript base

Crear en `src/types/program.ts`:

```typescript
export type ExerciseType = 'olympic' | 'strength' | 'hypertrophy' | 'accessory' | 'grip' | 'explosive'
export type MetconFormat = 'AMRAP' | 'EMOM' | 'FOR_TIME' | 'DEATH_BY'
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'

export interface Set {
  id: string
  exerciseId: string
  setNumber: number
  targetReps: number | string
  completedReps: number | null
  weightKg: number | null
  rpe: number | null
  isPR: boolean
  notes?: string
  completedAt?: string
}

export interface Exercise {
  id: string
  name: string
  type: ExerciseType
  isAnchor: boolean
  targetSets: number
  targetReps: string
  targetWeightKg: number
  targetRPE: number
  restSeconds: number
  loadPercent1RM: number | null
  notes: string | null
  progressionKey: string
  sets: Set[]
}

export interface Block {
  id: string
  type: ExerciseType
  order: number
  label: string
  exercises: Exercise[]
}

export interface MetconMovement {
  name: string
  reps: number | string
  load: string | null
  notes: string | null
}

export interface MetconResult {
  rounds?: number | null
  partialReps?: number | null
  timeSeconds?: number | null
  lastMinuteCompleted?: number | null
  completedMinutes?: number | null
  totalMinutes?: number | null
  notes?: string | null
}

export interface Metcon {
  id: string
  format: MetconFormat
  durationMinutes: number
  label: string
  focusArea: string
  movements: MetconMovement[]
  result: MetconResult
  progressionKey: string
  scoringNote?: string
  isBenchmarkWOD?: boolean
}

export interface Day {
  id: string
  dayOfWeek: DayOfWeek
  order: number
  name: string
  focus: string[]
  estimatedMinutes: number
  blocks: Block[]
  metcon: Metcon
  completedAt?: string
  isCompleted?: boolean
}

export interface Week {
  number: number
  phase: string
  generatedAt: string
  generatedBy: string
  aiNotes: string
  days: Day[]
}

export interface ProgressionSignal {
  allSetsCompleted: boolean | null
  failedLastSet: boolean | null
  repsCompleted: number[] | null
  avgRPE: number | null
  sameWeightStreak: number
  prHit: boolean
  prWeightKg?: number
  decision?: string
}

export interface MetconSignal {
  score: number | null
  previousScore: number | null
  improved: boolean | null
  decision?: string
}

export interface WeeklyFeedback {
  weekNumber: number
  submittedAt: string | null
  energyAvg: number | null
  sleepAvg: number | null
  sorenessAvg: number | null
  motivation: number | null
  missedSessions: number | null
  userComment: string | null
  progressionSignals: Record<string, ProgressionSignal | MetconSignal>
}

export interface AIDecision {
  progressionKey: string
  action: 'INCREASE' | 'MAINTAIN' | 'DECREASE' | 'CHANGE_VARIANT' | 'DELOAD' | 'MAINTAIN_WITH_TEST'
  weeklyTargetKg?: number
  deltaKg?: number
  testWeightKg?: number
  reason: string
}

export interface AIAnalysis {
  weekNumber: number
  generatedAt: string
  model: string
  overallAssessment: string
  decisions: AIDecision[]
  metconTargets: Record<string, { target: number | null; note: string }>
  gripProgression: Record<string, { target: number; note: string }>
  alerts: Array<{ type: string; severity: 'high' | 'medium' | 'info'; message: string }>
  motivationalMessage: string
}

export interface PR {
  id: string
  progressionKey: string
  exerciseName: string
  weightKg: number
  reps: number
  achievedAt: string
  week: number
}

export interface Streak {
  current: number
  record: number
  lastSessionAt: string | null
  weeklyCompletionRate: number | null
}

export interface Program {
  id: string
  userId: string
  createdAt: string
  currentWeek: number
  totalWeeks: number
  phase: string
  goal: string
  benchmarks: {
    fran_time_seconds: number | null
    estimated_1rm: Record<string, number>
    body: Record<string, number | string>
  }
}
```

---

## Firebase — src/lib/firebase.ts

```typescript
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, updateDoc } from 'firebase/firestore'

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

// Helpers
export const getProgram = async () => {
  const snap = await getDoc(doc(db, 'program', 'main'))
  return snap.exists() ? snap.data() : null
}

export const getWeek = async (weekNumber: number) => {
  const snap = await getDoc(doc(db, 'weeks', `week-${weekNumber}`))
  return snap.exists() ? snap.data() : null
}

export const saveWeek = async (weekNumber: number, data: any) => {
  await setDoc(doc(db, 'weeks', `week-${weekNumber}`), data)
}

export const saveSession = async (sessionData: any) => {
  await addDoc(collection(db, 'sessions'), sessionData)
}

export const getStreak = async () => {
  const snap = await getDoc(doc(db, 'streak', 'main'))
  return snap.exists() ? snap.data() : { current: 0, record: 0, lastSessionAt: null }
}

export const updateStreak = async (data: any) => {
  await setDoc(doc(db, 'streak', 'main'), data)
}

export const savePR = async (pr: any) => {
  await addDoc(collection(db, 'prs'), pr)
}

export const getPRs = async () => {
  const snap = await getDocs(query(collection(db, 'prs'), orderBy('achievedAt', 'desc')))
  return snap.docs.map(d => d.data())
}
```

---

## Progression Engine — src/lib/progressionEngine.ts

```typescript
import { ProgressionSignal, AIDecision } from '@/types/program'

export function analyzeSet(signals: Record<string, ProgressionSignal>): Partial<AIDecision>[] {
  const decisions: Partial<AIDecision>[] = []

  for (const [key, signal] of Object.entries(signals)) {
    if (!signal.repsCompleted) continue

    const allCompleted = signal.allSetsCompleted
    const avgRPE = signal.avgRPE ?? 0
    const streak = signal.sameWeightStreak ?? 0

    if (allCompleted && avgRPE <= 8 && !signal.failedLastSet) {
      decisions.push({ progressionKey: key, action: 'INCREASE', deltaKg: 2.5 })
    } else if (!allCompleted && avgRPE >= 9) {
      decisions.push({ progressionKey: key, action: 'DECREASE', deltaKg: -2.5 })
    } else if (streak >= 3) {
      decisions.push({ progressionKey: key, action: 'CHANGE_VARIANT' })
    } else {
      decisions.push({ progressionKey: key, action: 'MAINTAIN' })
    }
  }

  return decisions
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function calcular1RM(weight: number, reps: number): number {
  return Math.round(weight * (1 + reps / 30))
}
```

---

## Claude API — src/app/api/analyze-week/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  const { currentWeek, weeklyFeedback, program } = await req.json()

  const prompt = `Sos un entrenador de élite especializado en fuerza, CrossFit y recomposición corporal. 
Analizá los datos de entrenamiento de la semana ${currentWeek} y generá el plan para la semana ${currentWeek + 1}.

PERFIL DEL ATLETA:
- 10 años de experiencia, experimentado
- Objetivo: recomposición corporal + rendimiento físico
- Debilidades identificadas: zona media (obliques 93cm), grip/antebrazo débil vs bícep
- 1RMs: ${JSON.stringify(program.benchmarks.estimated_1rm)}

DATOS DE LA SEMANA ${currentWeek}:
${JSON.stringify(weeklyFeedback, null, 2)}

REGLAS DE PROGRESIÓN:
1. Si todos los sets completos con RPE promedio ≤ 8: aumentar carga 2.5kg
2. Si fallaron reps en el último set con RPE ≤ 8: mantener peso
3. Si RPE promedio ≥ 9 o degradación progresiva de reps: bajar 2.5kg
4. Si mismo peso 3 semanas seguidas: cambiar variante del ejercicio
5. Si se saltó más de 1 sesión: aplicar deload del 10%
6. Metcons: si el score mejoró, aumentar exigencia. Si no, mantener objetivo.
7. Grip: siempre progresar +5s en tiempo de hang por semana

RESPONDÉ ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "overallAssessment": "string — análisis honesto y directo de la semana",
  "decisions": [
    {
      "progressionKey": "string",
      "action": "INCREASE | MAINTAIN | DECREASE | CHANGE_VARIANT | DELOAD",
      "weeklyTargetKg": number,
      "deltaKg": number | null,
      "reason": "string"
    }
  ],
  "metconTargets": {
    "progressionKey": { "target": number | null, "note": "string" }
  },
  "gripProgression": {
    "progressionKey": { "target": number, "note": "string" }
  },
  "alerts": [
    { "type": "string", "severity": "high | medium | info", "message": "string" }
  ],
  "motivationalMessage": "string — directo, honesto, sin frases de autoayuda. Como un entrenador que te conoce."
}`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const analysis = JSON.parse(text)

    return NextResponse.json({ success: true, analysis })
  } catch (error) {
    console.error('Error analyzing week:', error)
    return NextResponse.json({ success: false, error: 'Error al analizar la semana' }, { status: 500 })
  }
}
```

---

## PWA — public/manifest.json

```json
{
  "name": "FORGE Training",
  "short_name": "FORGE",
  "description": "Tu entrenamiento. Tu progresión. Sin excusas.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0A0A0A",
  "theme_color": "#E24B4A",
  "orientation": "portrait",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## tailwind.config.ts — colores de FORGE

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        forge: {
          bg: '#0A0A0A',
          surface: '#111111',
          surface2: '#1A1A1A',
          border: '#2A2A2A',
          red: '#E24B4A',
          amber: '#F5A623',
          green: '#1D9E75',
          text: '#F5F5F5',
          muted: '#888888',
        }
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      animation: {
        'pulse-red': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}

export default config
```

---

## Orden de desarrollo — seguir este orden exacto

### Fase 1 — Base y datos (sin UI)
1. Configurar `src/lib/firebase.ts` con los helpers
2. Crear todos los tipos en `src/types/`
3. Crear `src/lib/progressionEngine.ts`
4. Cargar `week1.json` a Firestore desde un script de seed:
   - Crear `scripts/seed.ts` que lea el JSON y lo suba a Firestore
   - Ejecutar con `npx ts-node scripts/seed.ts`
5. Verificar que los datos están en Firebase Console

### Fase 2 — Dashboard (pantalla principal)
6. `src/app/page.tsx` — muestra:
   - Día de hoy con nombre de sesión
   - Racha actual (streak)
   - Botón "Empezar sesión" que navega a `/session/[dayId]`
   - Resumen de la semana (días completados)
   - Si hay análisis de IA disponible, mostrar el `motivationalMessage`
   - Animaciones de entrada con Motion (stagger de cards)

### Fase 3 — Sesión activa
7. `src/app/session/[dayId]/page.tsx` — la pantalla más importante:
   - Lista de bloques y ejercicios en orden
   - Por cada ejercicio: `ExerciseCard` con sus sets
   - `SetRow`: campos para ingresar reps completadas, peso y RPE
   - RPE selector visual (1-10 con colores: verde 1-6, amarillo 7-8, rojo 9-10)
   - Al completar un set: animación de check + calcular si es PR automáticamente
   - `RestTimer`: cuando se completa un set, inicia countdown del descanso configurado
   - Al completar todos los sets de un ejercicio: collapse animado
   - `MetconCard` al final: ingresar resultado según formato (rondas/tiempo/minutos)
   - Botón "Completar sesión": guarda todo en Firestore, actualiza streak

### Fase 4 — Vista semanal
8. `src/app/weekly/page.tsx`:
   - Grid de 5 días con `DayCard`
   - Cada card muestra: nombre, foco, tiempo estimado, estado (pendiente/completado)
   - Click en día: expandir con lista de ejercicios y metcon
   - Indicador visual de progreso semanal

### Fase 5 — Progreso e historial
9. `src/app/progress/page.tsx`:
   - Selector de ejercicio ancla
   - Gráfico de progresión de carga por semana (usar recharts o chart.js)
   - Gráfico de mejora en metcons (Fran time, AMRAP rounds, etc.)
   - PRs recientes con badge animado

10. `src/app/history/page.tsx`:
    - Lista de sesiones completadas ordenadas por fecha
    - Click en sesión: ver detalle de sets y pesos usados

### Fase 6 — IA semanal
11. `src/app/api/analyze-week/route.ts` — ya definido arriba
12. Crear formulario de feedback semanal (pantalla o modal):
    - Sliders para energía, sueño, dolor, motivación (1-10)
    - Campo de texto para comentario libre
    - Número de sesiones salteadas
    - Botón "Generar semana siguiente" → llama al API → guarda análisis → genera week JSON nuevo
13. Mostrar análisis de IA en dashboard: assessment, alertas, mensaje motivacional

### Fase 7 — PWA y deploy
14. Agregar meta tags de PWA en `src/app/layout.tsx`
15. Generar íconos (192x192 y 512x512) con el logo de FORGE
16. Configurar `next.config.ts` para PWA
17. Deploy en Vercel: conectar repo de GitHub, agregar variables de entorno
18. Verificar PWA en móvil: agregar a pantalla de inicio

---

## Componentes críticos con Motion

### RestTimer — animación de cuenta regresiva
```tsx
// El círculo SVG se vacía mientras pasa el tiempo
// Cuando llega a 0: vibración + sonido corto + animación de "listo"
import { motion, animate } from 'motion/react'

// Usar motion para animar el stroke-dashoffset del círculo SVG
// Al completar: scale bounce en el ícono de check
```

### SetRow — registro de set
```tsx
// Al marcar completado: 
// - el row hace slide hacia la derecha con verde
// - si es PR: badge dorado aparece con spring animation
// - el siguiente set se ilumina automáticamente
```

### ExerciseCard — colapso al completar
```tsx
// Al completar todos los sets:
// - card colapsa con AnimatePresence
// - aparece checkmark con stroke animation SVG
// - el ejercicio siguiente entra con slide-up
```

---

## Notas importantes para Claude Code

1. **No usar autenticación.** La app es para un único usuario. Firebase en modo abierto.

2. **El JSON de week1.json ya existe** en `src/data/week1.json`. Usarlo como seed y como referencia de estructura.

3. **La sesión activa es el estado más crítico.** Si el usuario cierra la app a mitad de sesión, los datos NO deben perderse. Usar localStorage como buffer temporal + sync a Firestore al completar sets.

4. **El RPE es obligatorio** para que la IA funcione. El SetRow no debe permitir marcar un set como completado sin seleccionar RPE.

5. **Los metcons tienen formatos distintos** (AMRAP, EMOM, FOR_TIME, DEATH_BY). El MetconCard debe renderizar el campo de resultado correcto según el formato.

6. **Los ejercicios de grip** (dead_hang, bar_hang, plate_pinch) registran tiempo en segundos como "reps completadas", no cantidad de reps. El SetRow debe detectar el progressionKey y mostrar un cronómetro en lugar de un input numérico.

7. **Los PRs se calculan automáticamente.** Al guardar un set, comparar `weightKg` con el PR histórico del mismo `progressionKey`. Si supera → isPR = true → guardar en colección `prs` → mostrar badge.

8. **Mobile first.** La app se usa en el gimnasio, con el teléfono en la mano. Botones grandes, inputs fáciles de tocar, timer visible sin scroll.

9. **Colores semánticos:**
   - Verde `#1D9E75` → completado, éxito, PR
   - Rojo `#E24B4A` → acción principal, timer activo, RPE 9-10
   - Ámbar `#F5A623` → PR badge, alertas, logros
   - Gris `#888888` → pendiente, inactivo

10. **El análisis de IA se corre una vez por semana** (domingo a la noche). No es un chat. Es un proceso batch que lee toda la semana y genera la siguiente.
