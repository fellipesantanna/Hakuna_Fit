"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Dumbbell, Plus, TrendingUp, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { AuthGuard } from "@/components/auth-guard"

import {
  getHomeRoutines,
  getRecentWorkouts,
  getActiveWorkout,
} from "@/lib/api/home"

import type { Routine, Workout } from "@/lib/types"

import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth"


export default function HomePage() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([])
  const router = useRouter()



  useEffect(() => {
  let alive = true

  async function load() {
    const [r, w] = await Promise.all([
      getHomeRoutines(),
      getRecentWorkouts(3),
    ])

    if (!alive) return

    setRoutines(r)
    setRecentWorkouts(w)
  }

  load()

  return () => {
    alive = false
  }
}, [])


  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20">
        <div className="px-4 py-6 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Hakuna</h1>
            <p className="text-muted-foreground">
              Seu app de treinos personalizado
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await signOut()
              router.push("/login")
            }}
          >
            Sair
          </Button>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/workout">
              <Button
                size="lg"
                className="h-24 flex-col gap-2 w-full"
                variant="default"
              >
                <Plus className="h-6 w-6" />
                <span>Novo Treino</span>
              </Button>
            </Link>

            <Link href="/routines">
              <Button
                size="lg"
                className="h-24 flex-col gap-2 w-full"
                variant="outline"
              >
                <Dumbbell className="h-6 w-6" />
                <span>Rotinas</span>
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Estatísticas</h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{routines.length}</p>
                <p className="text-xs text-muted-foreground">Rotinas</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold">{recentWorkouts.length}</p>
                <p className="text-xs text-muted-foreground">Treinos</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold">
                  {recentWorkouts.length > 0 ? "🔥" : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Sequência</p>
              </div>
            </div>
          </Card>

          {/* Recent Workouts */}
          {recentWorkouts.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold">Treinos Recentes</h2>

              {recentWorkouts.map((workout) => (
                <Card key={workout.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {workout.routineName || "Treino Livre"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(workout.startTime).toLocaleDateString("pt-BR")}
                      </p>
                    </div>

                    <Link href={`/history/${workout.id}`}>
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </AuthGuard>
  )
}
