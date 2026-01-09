import { supabase } from "@/lib/supabase"
import type { Workout, WorkoutExercise } from "@/lib/types"

export async function startWorkout(input: {
  routineId?: string
  routineName?: string
}) {

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Não autenticado")

  // 1️⃣ verifica treino ativo
  const { data: active } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", user.id)
    .is("end_time", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (active) {
    return {
      id: active.id,
      userId: active.user_id,
      routineId: active.routine_id,
      routineName: active.routine_name,
      startTime: active.start_time,
      endTime: active.end_time,
      createdAt: active.created_at,
      isNew: false, // 🔴 CHAVE
    }
  }

  // 2️⃣ cria treino novo
  const payload = {
    user_id: user.id,
    routine_id: input.routineId ?? null,
    routine_name: input.routineName ?? null,
    start_time: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("workouts")
    .insert(payload)
    .select("*")
    .single()

  if (error) throw error

  return {
    id: data.id,
    userId: data.user_id,
    routineId: data.routine_id,
    routineName: data.routine_name,
    startTime: data.start_time,
    endTime: data.end_time,
    createdAt: data.created_at,
    isNew: true, // 🔴 CHAVE
  }
}

export async function finishWorkout(workoutId: string) {
  const { error } = await supabase
    .from("workouts")
    .update({ end_time: new Date().toISOString() })
    .eq("id", workoutId)

  if (error) throw error
}

export async function cancelWorkout(workoutId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Não autenticado")

  await supabase
    .from("workout_exercises")
    .delete()
    .eq("workout_id", workoutId)
    .eq("user_id", user.id)

  await supabase
    .from("workouts")
    .delete()
    .eq("id", workoutId)
    .eq("user_id", user.id)
}