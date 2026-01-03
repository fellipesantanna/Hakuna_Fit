import { supabase } from "@/lib/supabase"
import type { Routine, Workout } from "@/lib/types"

/* =========================
   ROTINAS (count / lista simples)
========================= */
export async function getHomeRoutines(): Promise<Routine[]> {
  const { data, error } = await supabase
    .from("routines")
    .select("id, name, created_at")
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    createdAt: r.created_at,
  }))
}

/* =========================
   TREINOS RECENTES (finalizados)
========================= */
export async function getRecentWorkouts(
  limit = 3
): Promise<Workout[]> {
  const { data, error } = await supabase
    .from("workouts")
    .select(`
      id,
      routine_id,
      routine_name,
      start_time,
      end_time,
      created_at,
      user_id
    `)
    .not("end_time", "is", null)
    .order("start_time", { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((w) => ({
    id: w.id,
    userId: w.user_id,
    routineId: w.routine_id,
    routineName: w.routine_name,
    startTime: w.start_time,
    endTime: w.end_time,
    createdAt: w.created_at,
  }))
}

/* =========================
   TREINO ATIVO (1 por usuário)
========================= */
export async function getActiveWorkout(): Promise<Workout | null> {
  const { data, error } = await supabase
    .from("workouts")
    .select(`
      id,
      routine_id,
      routine_name,
      start_time,
      created_at,
      user_id
    `)
    .is("end_time", null)
    .order("start_time", { ascending: false })
    .limit(1)

  if (error) throw error

  const w = data?.[0]
  if (!w) return null

  return {
    id: w.id,
    userId: w.user_id,
    routineId: w.routine_id,
    routineName: w.routine_name,
    startTime: w.start_time,
    createdAt: w.created_at,
  }
}
