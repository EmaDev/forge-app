import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function calcularRPE(completedReps: number, targetReps: number, perceived: number): number {
  return Math.min(10, Math.max(1, perceived))
}

export function rpeColor(rpe: number): string {
  if (rpe <= 6) return '#1D9E75'
  if (rpe <= 8) return '#F5A623'
  return '#E24B4A'
}

export function rpeLabel(rpe: number): string {
  if (rpe <= 6) return 'Fácil'
  if (rpe === 7) return 'Moderado'
  if (rpe === 8) return 'Difícil'
  if (rpe === 9) return 'Muy difícil'
  return 'Máximo'
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function getDayName(dayOfWeek: string): string {
  const names: Record<string, string> = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
  }
  return names[dayOfWeek] ?? dayOfWeek
}

export function getTodayDayOfWeek(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[new Date().getDay()]
}
