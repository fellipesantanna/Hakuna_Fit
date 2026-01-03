"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AuthGuard } from "@/components/auth-guard"
import { BottomNav } from "@/components/bottom-nav"

import { createRoutine } from "@/lib/api/routines"

export default function NewRoutinePage() {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSave() {
    if (!name.trim()) return

    setLoading(true)
    const routine = await createRoutine(name.trim())
    router.push(`/routines/edit/${routine.id}`)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20 p-4">
        <Card className="p-4 space-y-4">
          <h1 className="text-xl font-bold">Nova Rotina</h1>

          <Input
            placeholder="Nome da rotina"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Criando..." : "Criar rotina"}
          </Button>
        </Card>

        <BottomNav />
      </div>
    </AuthGuard>
  )
}
