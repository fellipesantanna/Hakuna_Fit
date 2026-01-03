export type ExerciseCategory =
  | "strength"
  | "cardio"
  | "duration"
  | "free_weight"

export interface Exercise {
  id: string
  user_id: string
  name: string
  category: ExerciseCategory
  equipment?: string | null
  notes?: string | null
  createdAt: string
}

export interface ExerciseSet {
  reps?: number
  weight?: number
  duration?: number // in seconds for cardio/duration
  distance?: number // in meters for cardio
  hours?: number // for cardio
  minutes?: number // for cardio and duration
  completed: boolean
}

// =========================
// Routine Exercise (DB aligned)
// =========================
export interface RoutineExercise {
  id: string
  routineId: string
  exerciseId: string

  position: number

  sets?: number | null

  // força / peso livre
  targetReps?: number | null
  targetWeight?: number | null

  // duração
  targetMinutes?: number | null
  targetSeconds?: number | null

  // cardio
  targetHours?: number | null
  targetDistance?: number | null
}

// =========================
// Routine (DB aligned)
// =========================
export interface Routine {
  id: string
  userId?: string
  name: string
  createdAt: string
  lastUsed?: string
}


export type WorkoutExerciseCategory =
  | "strength"
  | "free_weight"
  | "cardio"
  | "duration"

export interface WorkoutExercise {
  id: string
  workoutId: string
  exerciseId: string

  category: WorkoutExerciseCategory

  // FORÇA / PESO LIVRE
  reps?: number | null
  weight?: number | null

  // CARDIO
  timeHours?: number | null
  timeMinutes?: number | null
  distance?: number | null

  // DURAÇÃO
  durationMinutes?: number | null
  durationSeconds?: number | null

  completed?: boolean | null
}

export interface Workout {
  id: string
  userId: string

  routineId?: string | null
  routineName?: string | null

  startTime: string
  endTime?: string | null
  createdAt: string
}

export type CreateExerciseInput = {
  name: string
  category: ExerciseCategory
  equipment?: string | null
  notes?: string | null
}

export interface CreateRoutineInput {
  name: string
}

export interface CreateRoutineExerciseInput {
  routineId: string
  exerciseId: string
  position: number

  sets?: number
  targetReps?: number
  targetWeight?: number
  targetMinutes?: number
  targetSeconds?: number
  targetHours?: number
  targetDistance?: number
}
