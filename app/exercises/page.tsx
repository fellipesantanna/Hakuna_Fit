"use client"

import { useEffect, useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Trash2 } from "lucide-react"

import type { Exercise } from "@/lib/types"
import { BottomNav } from "@/components/bottom-nav"
import { AuthGuard } from "@/components/auth-guard"

import {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
} from "@/lib/api/exercises"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)

  useEffect(() => {
    loadExercises()
  }, [])

  async function loadExercises() {
    const data = await getExercises()
    setExercises(data)
  }

  const filteredExercises = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  )

  const strength = filteredExercises.filter((e) => e.category === "strength")
  const cardio = filteredExercises.filter((e) => e.category === "cardio")
  const duration = filteredExercises.filter((e) => e.category === "duration")
  const freeWeight = filteredExercises.filter((e) => e.category === "free_weight")

  // =========================
  // CREATE
  // =========================
  async function handleAddExercise(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    await createExercise({
      name: formData.get("name") as string,
      category: formData.get("category") as Exercise["category"],
      equipment: formData.get("equipment") as string,
      notes: formData.get("notes") as string,
    })


    await loadExercises()
    setIsDialogOpen(false)
  }

  // =========================
  // UPDATE
  // =========================
  async function handleEditExercise(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()
    if (!editingExercise) return

    const formData = new FormData(e.currentTarget)

    await updateExercise({
      ...editingExercise,
      name: formData.get("name") as string,
      category: formData.get("category") as Exercise["category"],
      equipment: formData.get("equipment") as string,
      notes: formData.get("notes") as string,
    })

    await loadExercises()
    setEditingExercise(null)
    setIsDialogOpen(false)
  }

  // =========================
  // DELETE
  // =========================
  async function handleDelete(id: string) {
    const confirmed = confirm(
      "Tem certeza que deseja excluir este exercício?"
    )
    if (!confirmed) return

    await deleteExercise(id)
    await loadExercises()
  }

  function handleEditClick(exercise: Exercise) {
    setEditingExercise(exercise)
    setIsDialogOpen(true)
  }

  function handleDialogChange(open: boolean) {
    setIsDialogOpen(open)
    if (!open) setEditingExercise(null)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20">
        <div className="px-4 py-6 space-y-4">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Exercícios</h1>

            <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingExercise
                      ? "Editar Exercício"
                      : "Novo Exercício"}
                  </DialogTitle>
                </DialogHeader>

                <form
                  onSubmit={
                    editingExercise
                      ? handleEditExercise
                      : handleAddExercise
                  }
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingExercise?.name}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      name="category"
                      defaultValue={editingExercise?.category}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strength">Força</SelectItem>
                        <SelectItem value="cardio">Cardio</SelectItem>
                        <SelectItem value="duration">Duração</SelectItem>
                        <SelectItem value="free_weight">
                          Peso Livre
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="equipment">
                      Equipamento (opcional)
                    </Label>
                    <Input
                      id="equipment"
                      name="equipment"
                      defaultValue={editingExercise?.equipment || ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas (opcional)</Label>
                    <Input
                      id="notes"
                      name="notes"
                      defaultValue={editingExercise?.notes || ""}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Salvar
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* SEARCH */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar exercícios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* LIST */}
          <div className="space-y-4">
            {filteredExercises.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  {search
                    ? "Nenhum exercício encontrado"
                    : "Nenhum exercício cadastrado"}
                </p>
              </Card>
            )}

            {["strength", "cardio", "duration", "free_weight"].map((cat) => {
              const list = filteredExercises.filter(e => e.category === cat)
              if (list.length === 0) return null

              return (
                <div key={cat} className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                    {cat === "strength" && "Força"}
                    {cat === "cardio" && "Cardio"}
                    {cat === "duration" && "Duração"}
                    {cat === "free_weight" && "Peso Livre"}
                  </h3>

                  {list.map((exercise) => (
                    <Card key={exercise.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => handleEditClick(exercise)}
                        >
                          <h3 className="font-semibold">{exercise.name}</h3>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {cat === "strength" && "Força"}
                              {cat === "cardio" && "Cardio"}
                              {cat === "duration" && "Duração"}
                              {cat === "free_weight" && "Peso Livre"}
                            </span>

                            {exercise.equipment && (
                              <span className="text-xs text-muted-foreground">
                                {exercise.equipment}
                              </span>
                            )}
                          </div>

                          {exercise.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {exercise.notes}
                            </p>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(exercise.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
        <BottomNav />
      </div>
    </AuthGuard>
  )
}
