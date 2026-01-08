"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import type { Workout, ExerciseCategory, Exercise } from "@/lib/types"
import { startWorkout, finishWorkout, cancelWorkout } from "@/lib/api/workout"
import { getExercises } from "@/lib/api/exercises"
import { getRoutineExercises } from "@/lib/api/routine-exercises"
import { supabase } from "@/lib/supabase"

import { WorkoutEntry } from "@/components/workout-entry"
import {
  addWorkoutExerciseSet,
  addWorkoutExerciseSetsBulk,
  deleteWorkoutExercise,
  deleteWorkoutExerciseGroup,
  getWorkoutExercises,
  type WorkoutExerciseWithName,
} from "@/lib/api/workout-exercises"

/* =========================
   Helpers
========================= */
function labelCategory(cat: ExerciseCategory) {
  if (cat === "strength") return "Força"
  if (cat === "cardio") return "Cardio"
  if (cat === "duration") return "Duração"
  return "Peso Livre"
}

/* =========================
   Component
========================= */
export function WorkoutContent() {
  const params = useSearchParams()
  const router = useRouter()

  const routineId = params.get("routineId")

  const [workout, setWorkout] = useState<Workout | null>(null)
  const [entries, setEntries] = useState<WorkoutExerciseWithName[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initWorkout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* =========================
     INIT
  ========================= */
  async function initWorkout() {
    try {
      setLoading(true)

      /* 1) Exercícios base */
      const allExercises = await getExercises()
      setExercises(allExercises)

      /* 2) Nome da rotina */
      let routineName: string | undefined

      if (routineId) {
        const { data } = await supabase
          .from("routines")
          .select("name")
          .eq("id", routineId)
          .single()

        routineName = data?.name
      }

      /* 3) Cria workout */
      const w = await startWorkout({
        routineId: routineId ?? undefined,
        routineName,
      })

      if (!w?.id) throw new Error("Workout não criado")

      setWorkout(w)

      /* 4) Herdar exercícios da rotina (ORDENADOS) */
      if (routineId) {
        const routineExercises = (await getRoutineExercises(routineId))
          .sort((a, b) => a.position - b.position)

        const bulk: Parameters<typeof addWorkoutExerciseSetsBulk>[0] = []

        for (const re of routineExercises) {
          const setsCount = re.sets && re.sets > 0 ? re.sets : 1

          for (let i = 0; i < setsCount; i++) {
            if (re.exerciseCategory === "strength" || re.exerciseCategory === "free_weight") {
              bulk.push({
                workoutId: w.id,
                exerciseId: re.exerciseId,
                category: re.exerciseCategory,
                reps: re.targetReps ?? null,
                weight: re.targetWeight ?? null,
                position: re.position,
              })
            }

            if (re.exerciseCategory === "cardio") {
              bulk.push({
                workoutId: w.id,
                exerciseId: re.exerciseId,
                category: "cardio",
                timeHours: re.targetHours ?? null,
                timeMinutes: re.targetMinutes ?? null,
                distance: re.targetDistance ?? null,
                position: re.position,
              })
            }

            if (re.exerciseCategory === "duration") {
              bulk.push({
                workoutId: w.id,
                exerciseId: re.exerciseId,
                category: "duration",
                durationMinutes: re.targetMinutes ?? null,
                durationSeconds: re.targetSeconds ?? null,
                position: re.position,
              })
            }
          }
        }

        if (bulk.length > 0) {
          await addWorkoutExerciseSetsBulk(bulk)
        }
      }

      /* 5) Carrega workout_exercises ORDENADOS */
      const loaded = await getWorkoutExercises(w.id)
      setEntries(loaded)
    } catch (err) {
      console.error("Erro ao iniciar treino", err)
      alert("Erro ao iniciar treino")
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  /* =========================
     Derived (ORDENADO)
  ========================= */
  const grouped = useMemo(() => {
    const map = new Map<string, WorkoutExerciseWithName[]>()

    for (const e of entries) {
      const key = e.exerciseId
      const list = map.get(key) ?? []
      list.push(e)
      map.set(key, list)
    }

    return Array.from(map.entries())
      .map(([exerciseId, sets]) => {
        const first = sets[0]

        return {
          exerciseId,
          position: first.position ?? 0,
          sets,
          name: first.exerciseName ?? "",
          category: first.category as ExerciseCategory,
          equipment: first.exerciseEquipment ?? null,
          notes: first.exerciseNotes ?? null,
        }
      })
      .sort((a, b) => a.position - b.position)
  }, [entries])

  /* =========================
     Actions
  ========================= */
  async function refresh() {
    if (!workout) return
    const loaded = await getWorkoutExercises(workout.id)
    setEntries(loaded)
  }

  async function handleAddExercise(ex: Exercise) {
    if (!workout) return

    await addWorkoutExerciseSet({
      workoutId: workout.id,
      exerciseId: ex.id,
      category: ex.category,
      position: grouped.length,
    })

    await refresh()
  }

  async function handleAddSet(exerciseId: string, category: ExerciseCategory) {
    if (!workout) return

    const group = grouped.find((g) => g.exerciseId === exerciseId)

    await addWorkoutExerciseSet({
      workoutId: workout.id,
      exerciseId,
      category,
      position: group?.position ?? 0,
    })

    await refresh()
  }

  async function handleRemoveSet(entryId: string) {
    await deleteWorkoutExercise(entryId)
    await refresh()
  }

  async function handleRemoveExercise(exerciseId: string) {
    if (!workout) return
    const confirmed = confirm("Remover este exercício do treino?")
    if (!confirmed) return

    await deleteWorkoutExerciseGroup({
      workoutId: workout.id,
      exerciseId,
    })

    await refresh()
  }

  async function handleCancel() {
    if (!workout) return
    const confirmed = confirm("Cancelar treino?")
    if (!confirmed) return

    await cancelWorkout(workout.id)
    router.push("/")
  }

  async function handleFinish() {
    if (!workout) return

    await finishWorkout(workout.id)
    router.push("/history")
  }

  /* =========================
     Render
  ========================= */
  if (loading || !workout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-muted-foreground">Iniciando treino…</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">
        {workout.routineName ?? "Treino Livre"}
      </h1>

      {grouped.map((g) => (
        <Card key={g.exerciseId} className="p-4 space-y-3">
          <div className="flex justify-between gap-3">
            <div>
              <h3 className="font-semibold">{g.name}</h3>
              <p className="text-xs text-muted-foreground">
                {labelCategory(g.category)} • {g.sets.length} série(s)
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddSet(g.exerciseId, g.category)}
              >
                + Série
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveExercise(g.exerciseId)}
              >
                Remover
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {g.sets.map((setEntry, idx) => (
              <div key={setEntry.id} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">
                    Série {idx + 1}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveSet(setEntry.id)}
                  >
                    Apagar série
                  </Button>
                </div>

                <WorkoutEntry entry={setEntry} />
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Card className="p-4 space-y-2">
        <h2 className="font-semibold">Adicionar exercício</h2>
        {exercises.map((ex) => (
          <Button
            key={ex.id}
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleAddExercise(ex)}
          >
            {ex.name}
          </Button>
        ))}
      </Card>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="w-1/2" onClick={handleCancel}>
          Cancelar
        </Button>

        <Button className="w-1/2" onClick={handleFinish}>
          Finalizar treino
        </Button>
      </div>
    </div>
  )
}
