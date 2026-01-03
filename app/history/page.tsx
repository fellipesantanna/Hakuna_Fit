"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { AuthGuard } from "@/components/auth-guard"

import { supabase } from "@/lib/supabase"

type HistoryWorkout = {
  id: string
  routineName: string | null
  startTime: string
  endTime: string | null
  executions: number
}

export default function HistoryPage() {
  const [workouts, setWorkouts] = useState<HistoryWorkout[]>([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase
      .from("workouts")
      .select(`
        id,
        routine_name,
        start_time,
        end_time,
        workout_exercises ( id )
      `)
      .not("end_time", "is", null) // ✅ evita duplicados
      .order("start_time", { ascending: false })

    setWorkouts(
      (data ?? []).map((w) => ({
        id: w.id,
        routineName: w.routine_name,
        startTime: w.start_time,
        endTime: w.end_time,
        executions: w.workout_exercises?.length ?? 0,
      }))
    )
  }

  const getDuration = (w: HistoryWorkout) => {
    if (!w.endTime) return "—"

    const start = new Date(w.startTime)
    const end = new Date(w.endTime)

    const diffMs = end.getTime() - start.getTime()
    const minutes = Math.max(1, Math.floor(diffMs / 60000))

    return `${minutes} min`
  }

  const handleClearHistory = async () => {
    const confirmed = confirm(
      "Tem certeza que deseja apagar todo o histórico de treinos?\n\nEssa ação não pode ser desfeita."
    )
    if (!confirmed) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("workout_exercises").delete().eq("workout_id", user.id)
    await supabase.from("workouts").delete().eq("user_id", user.id)

    load()
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20">
        <div className="px-4 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Histórico</h1>

            {workouts.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearHistory}
              >
                Limpar histórico
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {workouts.length === 0 ? (
              <Card className="p-8 text-center">
                Nenhum treino registrado
              </Card>
            ) : (
              workouts.map((w) => (
                <Link key={w.id} href={`/history/${w.id}`}>
                  <Card className="p-4 cursor-pointer hover:bg-muted/50">
                    <h3 className="font-semibold">
                      {w.routineName || "Treino Livre"}
                    </h3>

                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(w.startTime).toLocaleDateString("pt-BR")}
                    </p>

                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{w.executions} execuções</span>
                      <span>•</span>
                      <span>{getDuration(w)}</span>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>

        <BottomNav />
      </div>
    </AuthGuard>
  )
}
