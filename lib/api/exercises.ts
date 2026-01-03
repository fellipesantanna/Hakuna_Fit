import { supabase } from "@/lib/supabase"
import type { Exercise, CreateExerciseInput } from "@/lib/types"

// =========================
// GET
// =========================
export async function getExercises() {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .order("id", { ascending: false })
    .eq("archived", false)
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data ?? []).map((e) => ({
    id: e.id,
    user_id: e.user_id,
    name: e.name,
    category: e.category,
    equipment: e.equipment,
    notes: e.notes,
    createdAt: e.created_at,
  })) as Exercise[]
}

// =========================
// CREATE
// =========================
export async function createExercise(
  input: CreateExerciseInput
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Usuário não autenticado")
  }

  const payload = {
    name: input.name,
    category: input.category,
    equipment: input.equipment ?? null,
    notes: input.notes ?? null,
    user_id: user.id,
  }

  const { data, error } = await supabase
    .from("exercises")
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error("Erro ao criar exercício:", error)
    throw error
  }

  return data as Exercise
}

// =========================
// UPDATE
// =========================
export async function updateExercise(exercise: Exercise) {
  const payload = {
    name: exercise.name,
    category: exercise.category,
    equipment: exercise.equipment ?? null,
    notes: exercise.notes ?? null,
  }

  const { data, error } = await supabase
    .from("exercises")
    .update(payload)
    .eq("id", exercise.id)
    .select()
    .single()

  if (error) throw error
  return data as Exercise
}

// =========================
// DELETE
// =========================
export async function deleteExercise(id: string) {
  const { error } = await supabase
    .from("exercises")
    .update({ archived: true })
    .eq("id", id)
    

  if (error) throw error
}
