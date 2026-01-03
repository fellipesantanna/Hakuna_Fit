import type { Exercise, Routine, Workout } from "./types"

const STORAGE_KEYS = {
  EXERCISES: "hakuna_exercises",
  ROUTINES: "hakuna_routines",
  WORKOUTS: "hakuna_workouts",
  ACTIVE_WORKOUT: "hakuna_active_workout",
}

// Exercises
export function getExercises(): Exercise[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.EXERCISES)
  return data ? JSON.parse(data) : []
}

export function saveExercise(exercise: Exercise): void {
  const exercises = getExercises()
  const index = exercises.findIndex((e) => e.id === exercise.id)
  if (index >= 0) {
    exercises[index] = exercise
  } else {
    exercises.push(exercise)
  }
  localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises))
}

export function deleteExercise(id: string): void {
  const exercises = getExercises().filter((e) => e.id !== id)
  localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises))
}

// Routines
export function getRoutines(): Routine[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.ROUTINES)
  return data ? JSON.parse(data) : []
}

export function saveRoutine(routine: Routine): void {
  const routines = getRoutines()
  const index = routines.findIndex((r) => r.id === routine.id)
  if (index >= 0) {
    routines[index] = routine
  } else {
    routines.push(routine)
  }
  localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines))
}

export function deleteRoutine(id: string): void {
  const routines = getRoutines().filter((r) => r.id !== id)
  localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines))
}

// Workouts
export function getWorkouts(): Workout[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.WORKOUTS)
  return data ? JSON.parse(data) : []
}

export function clearWorkouts() {
  localStorage.removeItem(STORAGE_KEYS.WORKOUTS)
}

export function saveWorkout(workout: Workout): void {
  const workouts = getWorkouts()
  const index = workouts.findIndex((w) => w.id === workout.id)
  if (index >= 0) {
    workouts[index] = workout
  } else {
    workouts.push(workout)
  }
  localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts))
}

// Active Workout
export function getActiveWorkout(): Workout | null {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT)
  return data ? JSON.parse(data) : null
}

export function saveActiveWorkout(workout: Workout | null): void {
  if (workout) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(workout))
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT)
  }
}
