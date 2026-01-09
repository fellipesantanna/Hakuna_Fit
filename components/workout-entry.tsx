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
  const [completed, setCompleted] = useState<boolean>(!!entry.completed)
  const [restEndAt, setRestEndAt] = useState<number | null>(null)
  const [restRemaining, setRestRemaining] = useState(0)

  /* =========================
     SYNC COM BACKEND
  ========================= */
  useEffect(() => {
    setCompleted(!!entry.completed)
  }, [entry.completed])

  async function save(payload: Partial<WorkoutExercise>) {
    await updateWorkoutExercise(entry.id, payload)
  }

  async function finishSet() {
  if (completed) return

  // 1️⃣ UI otimista
  setCompleted(true)

  // 2️⃣ calcula descanso (rotina OU padrão)
  const restSeconds =
    entry.durationSeconds && entry.durationSeconds > 0
      ? entry.durationSeconds
      : DEFAULT_REST_SECONDS

  // 3️⃣ inicia descanso
  setRestEndAt(Date.now() + restSeconds * 1000)

  // 4️⃣ persiste no backend
  try {
    await save({ completed: true })
  } catch (err) {
    console.error(err)
    // rollback se falhar
    setCompleted(false)
    setRestEndAt(null)
    alert("Erro ao salvar série")
  }
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

  /* =========================
     INPUT COM SUFIXO
  ========================= */
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

  /* =========================
     BOTÃO CHECK (FINAL)
  ========================= */
  function CheckButton() {
    return (
      <Button
        type="button"
        onClick={finishSet}
        variant="outline"
        className={`
    h-10 w-10 min-w-10 p-0
    flex items-center justify-center
    ${completed
            ? "bg-green-600 text-white cursor-default pointer-events-none"
            : "text-muted-foreground"
          }
  `}
      >
        ✓
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      {/* FORÇA / PESO LIVRE */}
      {(entry.category === "strength" ||
        entry.category === "free_weight") && (
          <div className="flex gap-2 items-center">
            <InputWithSuffix
              placeholder="Reps"
              suffix="reps"
              defaultValue={entry.reps}
              onBlur={(v) => save({ reps: toNumberOrNull(v) })}
            />

            <InputWithSuffix
              placeholder="Peso"
              suffix="kg"
              defaultValue={entry.weight}
              onBlur={(v) => save({ weight: toNumberOrNull(v) })}
            />

            <CheckButton />
          </div>
        )}

      {/* CARDIO */}
      {entry.category === "cardio" && (
        <div className="flex gap-2 items-center">
          <InputWithSuffix
            placeholder="Horas"
            suffix="h"
            defaultValue={entry.timeHours}
            onBlur={(v) => save({ timeHours: toNumberOrNull(v) })}
          />

          <InputWithSuffix
            placeholder="Min"
            suffix="min"
            defaultValue={entry.timeMinutes}
            onBlur={(v) => save({ timeMinutes: toNumberOrNull(v) })}
          />

          <InputWithSuffix
            placeholder="Distância"
            suffix="m"
            defaultValue={entry.distance}
            onBlur={(v) => save({ distance: toNumberOrNull(v) })}
          />

          <CheckButton />
        </div>
      )}

      {/* DURAÇÃO */}
      {entry.category === "duration" && (
        <div className="flex gap-2 items-center">
          <InputWithSuffix
            placeholder="Min"
            suffix="min"
            defaultValue={entry.durationMinutes}
            onBlur={(v) =>
              save({ durationMinutes: toNumberOrNull(v) })
            }
          />

          <InputWithSuffix
            placeholder="Seg"
            suffix="s"
            defaultValue={entry.durationSeconds}
            onBlur={(v) =>
              save({ durationSeconds: toNumberOrNull(v) })
            }
          />

          <CheckButton />
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
