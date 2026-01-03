import { Suspense } from "react"
import { WorkoutContent } from "@/components/workout-content"
import { AuthGuard } from "@/components/auth-guard"

export default function WorkoutPage() {
return (
  <AuthGuard>
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <WorkoutContent />
    </Suspense>
  </AuthGuard>
)
}
