import { supabase } from "@/lib/supabase"
import type { RoutineExercise, CreateRoutineExerciseInput, ExerciseCategory } from "@/lib/types"

/** Linha crua (DB) com join de exercises */
type DbRoutineExercise = {
  id: string
  routine_id: string
  exercise_id: string
  position: number

  sets: number | null

  target_reps: number | null
  target_weight: number | null

  target_minutes: number | null
  target_seconds: number | null

  target_hours: number | null
  target_distance: number | null

  exercises?: {
    name: string
    category: ExerciseCategory
    equipment: string | null
    notes: string | null
  } | { name: string; category: ExerciseCategory; equipment: string | null; notes: string | null }[] | null
}

export type RoutineExerciseWithMeta = RoutineExercise & {
  exerciseName: string
  exerciseCategory: ExerciseCategory
  exerciseEquipment?: string | null
  exerciseNotes?: string | null
}

function mapRoutineExercise(row: DbRoutineExercise): RoutineExerciseWithMeta {
  const ex = row.exercises
    ? (Array.isArray(row.exercises) ? row.exercises[0] : row.exercises)
    : null

  return {
    id: row.id,
    routineId: row.routine_id,
    exerciseId: row.exercise_id,
    position: row.position,

    sets: row.sets,

    targetReps: row.target_reps,
    targetWeight: row.target_weight,

    targetMinutes: row.target_minutes,
    targetSeconds: row.target_seconds,

    targetHours: row.target_hours,
    targetDistance: row.target_distance,

    // meta do exercício (join)
    exerciseName: ex?.name ?? "",
    exerciseCategory: ex?.category ?? "strength",
    exerciseEquipment: ex?.equipment ?? null,
    exerciseNotes: ex?.notes ?? null,
  }
}

export async function getRoutineExercises(routineId: string) {
  const { data, error } = await supabase
    .from("routine_exercises")
    .select(`
      id,
      routine_id,
      exercise_id,
      position,
      sets,
      target_reps,
      target_weight,
      target_minutes,
      target_seconds,
      target_hours,
      target_distance,
      exercises (
        name,
        category,
        equipment,
        notes
      )
    `)
    .eq("routine_id", routineId)
    .order("position", { ascending: true })

  if (error) throw error

  return (data ?? []).map(mapRoutineExercise)
}

export async function addRoutineExercise(input: CreateRoutineExerciseInput) {
  const payload = {
    routine_id: input.routineId,
    exercise_id: input.exerciseId,
    position: input.position,
    sets: input.sets ?? null,
    target_reps: input.targetReps ?? null,
    target_weight: input.targetWeight ?? null,
    target_minutes: input.targetMinutes ?? null,
    target_seconds: input.targetSeconds ?? null,
    target_hours: input.targetHours ?? null,
    target_distance: input.targetDistance ?? null,
  }

  const { error } = await supabase.from("routine_exercises").insert(payload)

  if (error) {
    console.error("Erro ao adicionar exercício na rotina:", error)
    throw error
  }
}

export async function updateRoutineExercise(id: string, patch: Partial<RoutineExercise>) {
  const payload: any = {}

  if ("sets" in patch) payload.sets = patch.sets ?? null
  if ("targetReps" in patch) payload.target_reps = patch.targetReps ?? null
  if ("targetWeight" in patch) payload.target_weight = patch.targetWeight ?? null

  if ("targetMinutes" in patch) payload.target_minutes = patch.targetMinutes ?? null
  if ("targetSeconds" in patch) payload.target_seconds = patch.targetSeconds ?? null

  if ("targetHours" in patch) payload.target_hours = patch.targetHours ?? null
  if ("targetDistance" in patch) payload.target_distance = patch.targetDistance ?? null

  const { error } = await supabase.from("routine_exercises").update(payload).eq("id", id)
  if (error) throw error
}

export async function deleteRoutineExercise(id: string) {
  const { error } = await supabase.from("routine_exercises").delete().eq("id", id)
  if (error) throw error
}

export async function swapRoutineExercisePosition(
  a: { id: string; position: number },
  b: { id: string; position: number }
) {
  // atualiza A → posição de B
  const r1 = await supabase
    .from("routine_exercises")
    .update({ position: b.position })
    .eq("id", a.id)

  if (r1.error) throw r1.error

  // atualiza B → posição de A
  const r2 = await supabase
    .from("routine_exercises")
    .update({ position: a.position })
    .eq("id", b.id)

  if (r2.error) throw r2.error
}
