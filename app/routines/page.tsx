"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, Play, Pencil } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"

import type { Routine } from "@/lib/types"
import { getRoutines, deleteRoutine } from "@/lib/api/routines"

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const data = await getRoutines()
    setRoutines(data)
  }

  async function handleDelete(id: string) {
    const confirmed = confirm("Tem certeza que deseja excluir esta rotina?")
    if (!confirmed) return

    await deleteRoutine(id)
    await load()
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20">
        <div className="px-4 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Rotinas</h1>
            <Button asChild size="sm">
              <Link href="/routines/new">
                <Plus className="h-4 w-4 mr-2" />
                Criar
              </Link>
            </Button>
          </div>

          <div className="space-y-2">
            {routines.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Nenhuma rotina criada</p>
                <Button asChild className="mt-4" variant="outline">
                  <Link href="/routines/new">Criar primeira rotina</Link>
                </Button>
              </Card>
            ) : (
              routines.map((routine) => (
                <Card key={routine.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold">{routine.name}</h3>

                      {routine.lastUsed && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Último uso:{" "}
                          {new Date(routine.lastUsed).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/routines/edit/${routine.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>

                      <Button asChild size="sm">
                        <Link href={`/workout?routineId=${routine.id}`}>
                          <Play className="h-4 w-4" />
                        </Link>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(routine.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <BottomNav />
      </div>
    </AuthGuard>
  )
}
