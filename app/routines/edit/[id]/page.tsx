"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AuthGuard } from "@/components/auth-guard"

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

import { ExercisePicker } from "@/components/exercise-picker"

/* ============================================================
   HELPERS
============================================================ */

function InputWithSuffix(props: {
  placeholder: string
  defaultValue?: number | string | null
  suffix: string
  onBlur: (v: string) => void
}) {
  return (
    <div className="relative flex-1">
      <Input
        placeholder={props.placeholder}
        defaultValue={props.defaultValue ?? ""}
        onBlur={(e) => props.onBlur(e.target.value)}
        className="pr-10"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        {props.suffix}
      </span>
    </div>
  )
}

function toNumberOrNull(v: string) {
  if (v.trim() === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/* ============================================================
   PAGE
============================================================ */
export default function EditRoutinePage() {
  const { id: routineId } = useParams<{ id: string }>()
  const router = useRouter()

  const [routineExercises, setRoutineExercises] =
    useState<RoutineExerciseWithMeta[]>([])
  const [allExercises, setAllExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)

  // UI
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load() {
    setLoading(true)

    const [re, ex] = await Promise.all([
      getRoutineExercises(routineId),
      getExercises(),
    ])

    setRoutineExercises(re)
    setAllExercises(ex)
    setLoading(false)
  }

  /* ============================================================
     DERIVED
  ============================================================ */
  const disabledExerciseIds = useMemo(
    () => routineExercises.map((re) => re.exerciseId),
    [routineExercises]
  )

  /* ============================================================
     ACTIONS
  ============================================================ */
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

    setRoutineExercises((prev) =>
      prev.map((re) => (re.id === id ? { ...re, ...patch } : re))
    )
  }

  async function handleRemove(id: string) {
    const ok = confirm("Remover exercício da rotina?")
    if (!ok) return

    await deleteRoutineExercise(id)
    await load()
  }

  async function moveExercise(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= routineExercises.length) return

    const current = routineExercises[index]
    const target = routineExercises[targetIndex]

    await swapRoutineExercisePosition(
      { id: current.id, position: current.position },
      { id: target.id, position: target.position }
    )

    setRoutineExercises((prev) => {
      const copy = [...prev]
      copy[index] = target
      copy[targetIndex] = current
      return copy
    })
  }

  /* ============================================================
     RENDER
  ============================================================ */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando…
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-28 px-4 py-6 space-y-4">
        <h1 className="text-2xl font-bold">Editar Rotina</h1>

        {/* =======================
            EXERCÍCIOS DA ROTINA
        ======================= */}
        {routineExercises.map((re, index) => {
          const isOpen = expandedId === re.id
          const cat = re.exerciseCategory

          return (
            <Card key={re.id} className="p-4 space-y-3">
              {/* HEADER */}
              <button
                type="button"
                onClick={() =>
                  setExpandedId(isOpen ? null : re.id)
                }
                className="w-full text-left"
              >
                <div className="flex justify-between items-center gap-3">
                  <div>
                    <h3 className="font-semibold">
                      {re.exerciseName}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {re.sets ?? 1} série(s)
                    </p>
                  </div>

                  <span
                    className="
                      text-2xl 
                      font-semibold 
                      leading-none
                  ">
                    {isOpen ? "▾" : "▸"}
                  </span>
                </div>
              </button>

              {/* BODY */}
              {isOpen && (
                <>
                  {/* ACTIONS */}
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={index === 0}
                      onClick={() => moveExercise(index, "up")}
                    >
                      ↑
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={
                        index === routineExercises.length - 1
                      }
                      onClick={() => moveExercise(index, "down")}
                    >
                      ↓
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemove(re.id)}
                    >
                      ✕
                    </Button>
                  </div>

                  {/* SETS */}
                  <Input
                    type="number"
                    min={1}
                    placeholder="Séries"
                    defaultValue={re.sets ?? 1}
                    onBlur={(e) =>
                      handleUpdate(re.id, {
                        sets: Number(e.target.value),
                      })
                    }
                  />

                  {/* FORÇA / PESO LIVRE */}
                  {(cat === "strength" ||
                    cat === "free_weight") && (
                      <div className="flex gap-2">
                        <InputWithSuffix
                          placeholder="Reps"
                          suffix="reps"
                          defaultValue={re.targetReps}
                          onBlur={(v) =>
                            handleUpdate(re.id, {
                              targetReps: toNumberOrNull(v),
                            })
                          }
                        />
                        <InputWithSuffix
                          placeholder="Peso"
                          suffix="kg"
                          defaultValue={re.targetWeight}
                          onBlur={(v) =>
                            handleUpdate(re.id, {
                              targetWeight: toNumberOrNull(v),
                            })
                          }
                        />
                        <InputWithSuffix
                          placeholder="Descanso"
                          suffix="s"
                          defaultValue={re.targetSeconds}
                          onBlur={(v) =>
                            handleUpdate(re.id, {
                              targetSeconds: toNumberOrNull(v),
                            })
                          }
                        />
                      </div>
                    )}

                  {/* CARDIO */}
                  {cat === "cardio" && (
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Horas"
                        defaultValue={re.targetHours ?? ""}
                        onBlur={(e) =>
                          handleUpdate(re.id, {
                            targetHours: toNumberOrNull(
                              e.target.value
                            ),
                          })
                        }
                      />
                      <Input
                        placeholder="Min"
                        defaultValue={re.targetMinutes ?? ""}
                        onBlur={(e) =>
                          handleUpdate(re.id, {
                            targetMinutes: toNumberOrNull(
                              e.target.value
                            ),
                          })
                        }
                      />
                      <Input
                        placeholder="Dist"
                        defaultValue={re.targetDistance ?? ""}
                        onBlur={(e) =>
                          handleUpdate(re.id, {
                            targetDistance: toNumberOrNull(
                              e.target.value
                            ),
                          })
                        }
                      />
                    </div>
                  )}

                  {/* DURAÇÃO */}
                  {cat === "duration" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Min"
                        defaultValue={re.targetMinutes ?? ""}
                        onBlur={(e) =>
                          handleUpdate(re.id, {
                            targetMinutes: toNumberOrNull(
                              e.target.value
                            ),
                          })
                        }
                      />
                      <Input
                        placeholder="Seg"
                        defaultValue={re.targetSeconds ?? ""}
                        onBlur={(e) =>
                          handleUpdate(re.id, {
                            targetSeconds: toNumberOrNull(
                              e.target.value
                            ),
                          })
                        }
                      />
                    </div>
                  )}
                </>
              )}
            </Card>
          )
        })}

        {/* =======================
            ADD EXERCISE
        ======================= */}
        <Card className="p-4">
          <Button
            className="w-full"
            onClick={() => setPickerOpen(true)}
          >
            + Adicionar exercício
          </Button>
        </Card>

        <ExercisePicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          exercises={allExercises}
          disabledIds={disabledExerciseIds}
          title="Adicionar exercício à rotina"
          onSelect={async (exercise) => {
            await handleAddExercise(exercise)
            setPickerOpen(false)
          }}
        />

        {/* =======================
            FOOTER FIXO
        ======================= */}
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="w-1/2"
              onClick={() => router.push("/routines")}
            >
              Voltar
            </Button>

            <Button
              className="w-1/2"
              onClick={() =>
                router.push(`/workout?routineId=${routineId}`)
              }
            >
              Iniciar treino
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
