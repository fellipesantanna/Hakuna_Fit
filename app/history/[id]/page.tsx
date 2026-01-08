"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"

import { supabase } from "@/lib/supabase"

/* ============================================================
   TYPES
============================================================ */

type WorkoutDetail = {
  id: string
  routineName: string | null
  startTime: string
  endTime: string | null
}

type WorkoutEntryWithExercise = {
  id: string
  category: "strength" | "free_weight" | "cardio" | "duration"

  reps: number | null
  weight: number | null

  timeHours: number | null
  timeMinutes: number | null
  distance: number | null

  durationMinutes: number | null
  durationSeconds: number | null

  exercise: {
    name: string
  } | null
}

/* ============================================================
   PAGE
============================================================ */

export default function WorkoutDetailPage() {
  const params = useParams<{ id: string }>()
  const workoutId = params.id

  const [workout, setWorkout] = useState<WorkoutDetail | null>(null)
  const [entries, setEntries] = useState<WorkoutEntryWithExercise[]>([])

  useEffect(() => {
    loadWorkout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadWorkout() {
    /* ---------------- WORKOUT ---------------- */

    const { data: workoutRow, error: workoutErr } = await supabase
      .from("workouts")
      .select("id, routine_name, start_time, end_time")
      .eq("id", workoutId)
      .single()

    if (workoutErr) throw workoutErr
    if (!workoutRow) return

    setWorkout({
      id: workoutRow.id,
      routineName: workoutRow.routine_name,
      startTime: workoutRow.start_time,
      endTime: workoutRow.end_time,
    })

    /* ---------------- ENTRIES + JOIN ---------------- */

    const { data: entriesData, error: entriesErr } = await supabase
      .from("workout_exercises")
      .select(`
        id,
        category,
        reps,
        weight,
        time_hours,
        time_minutes,
        distance,
        duration_minutes,
        duration_seconds,
        exercise:exercises ( name )
      `)
      .eq("workout_id", workoutId)
      .order("id", { ascending: true })

    if (entriesErr) throw entriesErr

    setEntries(
      (entriesData ?? []).map((e: any) => ({
        id: e.id,
        category: e.category,

        reps: e.reps,
        weight: e.weight,

        timeHours: e.time_hours,
        timeMinutes: e.time_minutes,
        distance: e.distance,

        durationMinutes: e.duration_minutes,
        durationSeconds: e.duration_seconds,

        exercise: e.exercise,
      }))
    )
  }

  /* ============================================================
     HELPERS
  ============================================================ */

  if (!workout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Treino não encontrado
      </div>
    )
  }

  const getDuration = () => {
    if (!workout.startTime || !workout.endTime) return "—"

    const start = new Date(workout.startTime)
    const end = new Date(workout.endTime)

    const diffMs = end.getTime() - start.getTime()
    if (!Number.isFinite(diffMs) || diffMs < 0) return "—"

    const minutes = Math.floor(diffMs / 60000)
    return `${minutes} min`
  }

  const getTotalVolume = () =>
    entries.reduce((acc, e) => {
      if (e.reps != null && e.weight != null) {
        return acc + e.reps * e.weight
      }
      return acc
    }, 0)

  const byCategory = (category: WorkoutEntryWithExercise["category"]) =>
    entries.filter((e) => e.category === category)

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20 px-4 py-6 space-y-4">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/history">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-bold">
              {workout.routineName || "Treino Livre"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date(workout.startTime).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        {/* MÉTRICAS */}
        <Card className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{getDuration()}</p>
              <p className="text-xs text-muted-foreground">Duração</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{entries.length}</p>
              <p className="text-xs text-muted-foreground">Execuções</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {getTotalVolume().toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">Volume (kg)</p>
            </div>
          </div>
        </Card>

        {/* LISTA */}
        <div className="space-y-4">
          <h2 className="font-semibold">Exercícios</h2>

          {/* FORÇA */}
          {byCategory("strength").length > 0 && (
            <Section title="Força">
              {byCategory("strength").map((e) => (
                <CardItem key={e.id} name={e.exercise?.name}>
                  {e.reps != null && (
                    <p className="text-sm">
                      {e.reps} reps × {e.weight ?? 0} kg
                    </p>
                  )}
                </CardItem>
              ))}
            </Section>
          )}

          {/* PESO LIVRE */}
          {byCategory("free_weight").length > 0 && (
            <Section title="Peso Livre">
              {byCategory("free_weight").map((e) => (
                <CardItem key={e.id} name={e.exercise?.name}>
                  {e.reps != null && (
                    <p className="text-sm">
                      {e.reps} reps × {e.weight ?? 0} kg
                    </p>
                  )}
                </CardItem>
              ))}
            </Section>
          )}

          {/* CARDIO */}
          {byCategory("cardio").length > 0 && (
            <Section title="Cardio">
              {byCategory("cardio").map((e) => (
                <CardItem key={e.id} name={e.exercise?.name}>
                  {e.timeMinutes != null && (
                    <p className="text-sm">
                      ⏱ {e.timeHours || 0}h {e.timeMinutes}m
                      {e.distance != null ? ` • 📏 ${e.distance} m` : ""}
                    </p>
                  )}
                </CardItem>
              ))}
            </Section>
          )}

          {/* DURAÇÃO */}
          {byCategory("duration").length > 0 && (
            <Section title="Duração">
              {byCategory("duration").map((e) => (
                <CardItem key={e.id} name={e.exercise?.name}>
                  {e.durationMinutes != null && (
                    <p className="text-sm">
                      ⏱ {e.durationMinutes}m {e.durationSeconds || 0}s
                    </p>
                  )}
                </CardItem>
              ))}
            </Section>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}

/* ============================================================
   UI HELPERS
============================================================ */

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </div>
  )
}

function CardItem({
  name,
  children,
}: {
  name?: string
  children?: React.ReactNode
}) {
  return (
    <Card className="p-4 space-y-1">
      <h3 className="font-semibold">{name ?? "—"}</h3>
      {children}
    </Card>
  )
}
