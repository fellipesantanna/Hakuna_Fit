import { supabase } from "@/lib/supabase"
import type { Routine } from "@/lib/types"

/* ============================================================
   HELPERS
============================================================ */
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

/* ============================================================
   LIST (somente rotinas ATIVAS)
============================================================ */
export async function getRoutines() {
  const user_id = await getUserId()

  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("user_id", user_id)
    .is("deleted_at", null) // 👈 soft delete
    .order("id", { ascending: false })

  if (error) throw error
  return data as Routine[]
}

/* ============================================================
   CREATE
============================================================ */
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

/* ============================================================
   SOFT DELETE (🚫 NUNCA delete físico)
============================================================ */
export async function deleteRoutine(id: string) {
  const user_id = await getUserId()

  const { error } = await supabase
    .from("routines")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user_id)

  if (error) throw error
}

/* ============================================================
   (OPCIONAL) RESTORE
============================================================ */
// export async function restoreRoutine(id: string) {
//   const user_id = await getUserId()
//
//   const { error } = await supabase
//     .from("routines")
//     .update({ deleted_at: null })
//     .eq("id", id)
//     .eq("user_id", user_id)
//
//   if (error) throw error
// }
