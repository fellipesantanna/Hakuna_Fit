"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AuthGuard } from "@/components/auth-guard"
import { BottomNav } from "@/components/bottom-nav"

import type { Exercise } from "@/lib/types"
import { getExercises } from "@/lib/api/exercises"
import {
  getRoutineExercises,
  addRoutineExercise,
  updateRoutineExercise,
  deleteRoutineExercise,
  swapRoutineExercisePosition,
  type RoutineExerciseWithMeta,
} from "@/lib/api/routine-exercises"

export default function EditRoutinePage() {
  const { id: routineId } = useParams<{ id: string }>()

  const [routineExercises, setRoutineExercises] = useState<RoutineExerciseWithMeta[]>([])
  const [allExercises, setAllExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load() {
    setLoading(true)
    const [re, ex] = await Promise.all([getRoutineExercises(routineId), getExercises()])
    setRoutineExercises(re)
    setAllExercises(ex)
    setLoading(false)
  }

  async function handleAddExercise(exercise: Exercise) {
    await addRoutineExercise({
      routineId,
      exerciseId: exercise.id,
      position: routineExercises.length,
      sets: 1,
    })
    await load()
  }

  async function handleUpdate(id: string, patch: any) {
    await updateRoutineExercise(id, patch)
    setRoutineExercises((prev) => prev.map((re) => (re.id === id ? { ...re, ...patch } : re)))
  }

  async function handleRemove(id: string) {
    const ok = confirm("Remover exercício da rotina?")
    if (!ok) return
    await deleteRoutineExercise(id)
    await load()
  }

  async function moveExercise(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1

    if (
      targetIndex < 0 ||
      targetIndex >= routineExercises.length
    ) {
      return
    }

    const current = routineExercises[index]
    const target = routineExercises[targetIndex]

    await swapRoutineExercisePosition(
      { id: current.id, position: current.position },
      { id: target.id, position: target.position }
    )

    // atualiza UI localmente (sem reload)
    setRoutineExercises((prev) => {
      const copy = [...prev]
      copy[index] = { ...target }
      copy[targetIndex] = { ...current }
      return copy
    })
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando…</div>
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20 px-4 py-6 space-y-4">
        <h1 className="text-2xl font-bold">Editar Rotina</h1>

        {/* EXERCÍCIOS DA ROTINA */}
        {routineExercises.map((re, index) => {
          const cat = re.exerciseCategory

          return (
            <Card key={re.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold">{re.exerciseName}</h3>

                  {re.exerciseEquipment && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Equipamento: {re.exerciseEquipment}
                    </p>
                  )}

                  {re.exerciseNotes && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {re.exerciseNotes}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    disabled={index === 0}
                    onClick={() => moveExercise(index, "up")}
                  >
                    ↑
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    disabled={index === routineExercises.length - 1}
                    onClick={() => moveExercise(index, "down")}
                  >
                    ↓
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => handleRemove(re.id)}
                  >
                    ✕
                  </Button>
                </div>

              </div>

              {/* SETS */}
              <Input
                type="number"
                min={1}
                placeholder="Séries"
                defaultValue={re.sets ?? 1}
                onBlur={(e) => handleUpdate(re.id, { sets: Number(e.target.value) })}
              />

              {/* FORÇA / PESO LIVRE */}
              {(cat === "strength" || cat === "free_weight") && (
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Reps"
                    defaultValue={re.targetReps ?? ""}
                    onBlur={(e) => handleUpdate(re.id, { targetReps: Number(e.target.value) })}
                  />
                  <Input
                    placeholder="Peso"
                    defaultValue={re.targetWeight ?? ""}
                    onBlur={(e) => handleUpdate(re.id, { targetWeight: Number(e.target.value) })}
                  />
                  <Input
                    placeholder="Descanso (s)"
                    defaultValue={re.targetSeconds ?? ""}
                    onBlur={(e) => handleUpdate(re.id, { targetSeconds: Number(e.target.value) })}
                  />
                </div>
              )}

              {/* CARDIO */}
              {cat === "cardio" && (
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Horas"
                    defaultValue={re.targetHours ?? ""}
                    onBlur={(e) => handleUpdate(re.id, { targetHours: Number(e.target.value) })}
                  />
                  <Input
                    placeholder="Minutos"
                    defaultValue={re.targetMinutes ?? ""}
                    onBlur={(e) => handleUpdate(re.id, { targetMinutes: Number(e.target.value) })}
                  />
                  <Input
                    placeholder="Distância"
                    defaultValue={re.targetDistance ?? ""}
                    onBlur={(e) => handleUpdate(re.id, { targetDistance: Number(e.target.value) })}
                  />
                </div>
              )}

              {/* DURAÇÃO */}
              {cat === "duration" && (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Minutos"
                    defaultValue={re.targetMinutes ?? ""}
                    onBlur={(e) => handleUpdate(re.id, { targetMinutes: Number(e.target.value) })}
                  />
                  <Input
                    placeholder="Segundos"
                    defaultValue={re.targetSeconds ?? ""}
                    onBlur={(e) => handleUpdate(re.id, { targetSeconds: Number(e.target.value) })}
                  />
                </div>
              )}
            </Card>
          )
        })}

        {/* ADICIONAR EXERCÍCIO */}
        <Card className="p-4 space-y-2">
          <h2 className="font-semibold">Adicionar exercício</h2>
          {allExercises.map((ex) => (
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

        <BottomNav />
      </div>
    </AuthGuard>
  )
}
