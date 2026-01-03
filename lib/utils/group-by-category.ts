import type { ExerciseCategory } from "@/lib/types"

type ItemWithCategory = {
  category: ExerciseCategory
}

export function groupByCategory<T extends ItemWithCategory>(items: T[]) {
  return items.reduce<Record<ExerciseCategory, T[]>>(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }

      acc[item.category].push(item)
      return acc
    },
    {
      strength: [],
      cardio: [],
      duration: [],
      free_weight: [],
    }
  )
}

export const CATEGORY_LABEL: Record<ExerciseCategory, string> = {
  strength: "Força",
  cardio: "Cardio",
  duration: "Duração",
  free_weight: "Peso Livre",
}
