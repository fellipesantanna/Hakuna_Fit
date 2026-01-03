import { supabase } from "@/lib/supabase"
import type { Routine } from "@/lib/types"

async function getUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Usuário não autenticado")
  }

  return user.id
}

/* =========================
   LIST
========================= */
export async function getRoutines() {
  const user_id = await getUserId()

  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("user_id", user_id)
    .order("id", { ascending: false })

  if (error) throw error
  return data as Routine[]
}

/* =========================
   CREATE
========================= */
export async function createRoutine(name: string) {
  const user_id = await getUserId()

  const { data, error } = await supabase
    .from("routines")
    .insert({
      name,
      user_id,
    })
    .select()
    .single()

  if (error) throw error
  return data as Routine
}

/* =========================
   DELETE
========================= */
export async function deleteRoutine(id: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Não autenticado")

  const { error } = await supabase
    .from("routines")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw error
}

