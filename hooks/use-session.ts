"use client"

import { useEffect, useState } from "react"
import { getSession } from "@/lib/auth"
import type { Session } from "@supabase/supabase-js"

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSession().then((s) => {
      setSession(s)
      setLoading(false)
    })
  }, [])

  return { session, loading }
}
