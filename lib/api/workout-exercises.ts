import { supabase } from "@/lib/supabase"
import type { ExerciseCategory, WorkoutExercise } from "@/lib/types"

/* ============================================================
   DB RAW TYPE (Supabase é inconsistente no join)
============================================================ */
type DbWorkoutExercise = {
  id: string
  workout_id: string
  exercise_id: string
  category: ExerciseCategory
  position: number

  reps: number | null
  weight: number | null

  time_hours: number | null
  time_minutes: number | null
  distance: number | null

  duration_minutes: number | null
  duration_seconds: number | null

  completed: boolean | null
  created_at?: string | null

  // ⚠️ pode vir como objeto OU array
  exercises?:
    | {
        name: string
        equipment: string | null
        notes: string | null
      }
    | {
        name: string
        equipment: string | null
        notes: string | null
      }[]
    | null
}

/* ============================================================
   FRONT TYPE
============================================================ */
export type WorkoutExerciseWithName = WorkoutExercise & {
  exerciseName: string
  exerciseEquipment?: string | null
  exerciseNotes?: string | null
}

/* ============================================================
   MAPPER (normaliza join)
============================================================ */
function mapWorkoutExercise(row: DbWorkoutExercise): WorkoutExerciseWithName {
  const ex =
    Array.isArray(row.exercises)
      ? row.exercises[0]
      : row.exercises ?? null

  return {
    id: row.id,
    workoutId: row.workout_id,
    exerciseId: row.exercise_id,

    category: row.category,
    position: row.position,

    reps: row.reps,
    weight: row.weight,

    timeHours: row.time_hours,
    timeMinutes: row.time_minutes,
    distance: row.distance,

    durationMinutes: row.duration_minutes,
    durationSeconds: row.duration_seconds,

    completed: row.completed ?? false,

    exerciseName: ex?.name ?? "",
    exerciseEquipment: ex?.equipment ?? null,
    exerciseNotes: ex?.notes ?? null,
  }
}

/* ============================================================
   GET (sempre ordenado)
============================================================ */
export async function getWorkoutExercises(workoutId: string) {
  const { data, error } = await supabase
    .from("workout_exercises")
    .select(`
      id,
      workout_id,
      exercise_id,
      category,
      position,
      reps,
      weight,
      time_hours,
      time_minutes,
      distance,
      duration_minutes,
      duration_seconds,
      completed,
      exercises ( name, equipment, notes )
    `)
    .eq("workout_id", workoutId)
    .order("position", { ascending: true })
    .order("id", { ascending: true })

  if (error) throw error

  return (data ?? []).map(mapWorkoutExercise)
}

/* ============================================================
   ADD (1 série)
============================================================ */
export async function addWorkoutExerciseSet(input: {
  workoutId: string
  exerciseId: string
  category: ExerciseCategory
  position: number

  reps?: number | null
  weight?: number | null

  timeHours?: number | null
  timeMinutes?: number | null
  distance?: number | null

  durationMinutes?: number | null
  durationSeconds?: number | null
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Não autenticado")

  const payload = {
    workout_id: input.workoutId,
    exercise_id: input.exerciseId,
    category: input.category,
    position: input.position,
    user_id: user.id,

    reps: input.reps ?? null,
    weight: input.weight ?? null,

    time_hours: input.timeHours ?? null,
    time_minutes: input.timeMinutes ?? null,
    distance: input.distance ?? null,

    duration_minutes: input.durationMinutes ?? null,
    duration_seconds: input.durationSeconds ?? null,

    completed: false,
  }

  const { error } = await supabase
    .from("workout_exercises")
    .insert(payload)

  if (error) throw error
}

/* ============================================================
   ADD MANY
============================================================ */
export async function addWorkoutExerciseSetsBulk(
  items: Array<{
    workoutId: string
    exerciseId: string
    category: ExerciseCategory
    position: number

    reps?: number | null
    weight?: number | null

    timeHours?: number | null
    timeMinutes?: number | null
    distance?: number | null

    durationMinutes?: number | null
    durationSeconds?: number | null
  }>
) {
  if (items.length === 0) return

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Não autenticado")

  const payload = items.map((i) => ({
    workout_id: i.workoutId,
    exercise_id: i.exerciseId,
    category: i.category,
    position: i.position,
    user_id: user.id,

    reps: i.reps ?? null,
    weight: i.weight ?? null,

    time_hours: i.timeHours ?? null,
    time_minutes: i.timeMinutes ?? null,
    distance: i.distance ?? null,

    duration_minutes: i.durationMinutes ?? null,
    duration_seconds: i.durationSeconds ?? null,

    completed: false,
  }))

  const { error } = await supabase
    .from("workout_exercises")
    .insert(payload)

  if (error) throw error
}

/* ============================================================
   UPDATE / DELETE
============================================================ */
export async function updateWorkoutExercise(
  id: string,
  payload: Partial<WorkoutExercise>
) {
  const updatePayload: any = {}

  if ("reps" in payload) updatePayload.reps = payload.reps ?? null
  if ("weight" in payload) updatePayload.weight = payload.weight ?? null

  if ("timeHours" in payload)
    updatePayload.time_hours = payload.timeHours ?? null
  if ("timeMinutes" in payload)
    updatePayload.time_minutes = payload.timeMinutes ?? null
  if ("distance" in payload)
    updatePayload.distance = payload.distance ?? null

  if ("durationMinutes" in payload)
    updatePayload.duration_minutes = payload.durationMinutes ?? null
  if ("durationSeconds" in payload)
    updatePayload.duration_seconds = payload.durationSeconds ?? null

  if ("completed" in payload)
    updatePayload.completed = payload.completed ?? false

  const { error } = await supabase
    .from("workout_exercises")
    .update(updatePayload)
    .eq("id", id)

  if (error) throw error
}

export async function deleteWorkoutExercise(id: string) {
  const { error } = await supabase
    .from("workout_exercises")
    .delete()
    .eq("id", id)

  if (error) throw error
}

export async function deleteWorkoutExerciseGroup(input: {
  workoutId: string
  exerciseId: string
}) {
  const { error } = await supabase
    .from("workout_exercises")
    .delete()
    .eq("workout_id", input.workoutId)
    .eq("exercise_id", input.exerciseId)

  if (error) throw error
}
