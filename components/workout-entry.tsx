"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { WorkoutExercise } from "@/lib/types"
import { updateWorkoutExercise } from "@/lib/api/workout-exercises"

type Props = {
  entry: WorkoutExercise
}

function toNumberOrNull(v: string) {
  if (v.trim() === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const DEFAULT_REST_SECONDS = 60

export function WorkoutEntry({ entry }: Props) {
  const [completed, setCompleted] = useState<boolean>(false)
  const [restEndAt, setRestEndAt] = useState<number | null>(null)
  const [restRemaining, setRestRemaining] = useState<number>(0)

  // 🔑 estado local começa sempre falso
  useEffect(() => {
    setCompleted(false)
  }, [entry.id])

  async function save(payload: Partial<WorkoutExercise>) {
    await updateWorkoutExercise(entry.id, payload)
  }

  async function finishSet() {
    setCompleted(true) // ✅ UI responde na hora
    await save({ completed: true })
    setRestEndAt(Date.now() + DEFAULT_REST_SECONDS * 1000)
  }

  /* =========================
     REST TIMER
  ========================= */
  useEffect(() => {
    if (!restEndAt) return

    const timer = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((restEndAt - Date.now()) / 1000)
      )

      setRestRemaining(remaining)

      if (remaining === 0) {
        setRestEndAt(null)
      }
    }, 250)

    return () => clearInterval(timer)
  }, [restEndAt])

  const FinishButton = (
    <Button
      onClick={finishSet}
      variant={completed ? "default" : "outline"}
      className={
        completed
          ? "bg-green-600 hover:bg-green-600 text-white"
          : "text-muted-foreground"
      }
    >
      ✓
    </Button>
  )

  return (
    <div className="space-y-2">
      {/* FORÇA / PESO LIVRE */}
      {(entry.category === "strength" ||
        entry.category === "free_weight") && (
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="Reps"
            defaultValue={entry.reps ?? ""}
            onBlur={(e) =>
              save({ reps: toNumberOrNull(e.target.value) })
            }
          />
          <Input
            type="number"
            placeholder="Kg"
            defaultValue={entry.weight ?? ""}
            onBlur={(e) =>
              save({ weight: toNumberOrNull(e.target.value) })
            }
          />
          {FinishButton}
        </div>
      )}

      {/* CARDIO */}
      {entry.category === "cardio" && (
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="Horas"
            defaultValue={entry.timeHours ?? ""}
            onBlur={(e) =>
              save({ timeHours: toNumberOrNull(e.target.value) })
            }
          />
          <Input
            type="number"
            placeholder="Min"
            defaultValue={entry.timeMinutes ?? ""}
            onBlur={(e) =>
              save({ timeMinutes: toNumberOrNull(e.target.value) })
            }
          />
          <Input
            type="number"
            placeholder="Distância (m)"
            defaultValue={entry.distance ?? ""}
            onBlur={(e) =>
              save({ distance: toNumberOrNull(e.target.value) })
            }
          />
          {FinishButton}
        </div>
      )}

      {/* DURAÇÃO */}
      {entry.category === "duration" && (
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="Min"
            defaultValue={entry.durationMinutes ?? ""}
            onBlur={(e) =>
              save({
                durationMinutes: toNumberOrNull(e.target.value),
              })
            }
          />
          <Input
            type="number"
            placeholder="Seg"
            defaultValue={entry.durationSeconds ?? ""}
            onBlur={(e) =>
              save({
                durationSeconds: toNumberOrNull(e.target.value),
              })
            }
          />
          {FinishButton}
        </div>
      )}

      {/* REST TIMER */}
      {restEndAt && (
        <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
          <span className="text-xs text-muted-foreground">
            Descanso: {restRemaining}s
          </span>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setRestEndAt(null)}
          >
            Pular
          </Button>
        </div>
      )}
    </div>
  )
}
