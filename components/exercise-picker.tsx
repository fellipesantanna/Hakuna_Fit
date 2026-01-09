"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import type { Exercise } from "@/lib/types"

/* ============================================================
   TYPES
============================================================ */
export type ExercisePickerProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    exercises: Exercise[]
    disabledIds?: string[]
    onSelect: (exercise: Exercise) => void
    title?: string
}

/* ============================================================
   COMPONENT
============================================================ */
export function ExercisePicker({
    open,
    onOpenChange,
    exercises,
    disabledIds = [],
    onSelect,
    title = "Adicionar exercício",
}: ExercisePickerProps) {
    const [search, setSearch] = useState("")

    const disabledSet = useMemo(
        () => new Set(disabledIds),
        [disabledIds]
    )

    const filteredExercises = useMemo(() => {
        return exercises
            .filter((ex) =>
                ex.name.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) =>
                a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
            )
    }, [exercises, search])


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="
          p-0
          h-[85vh]
          max-h-[85vh]
          flex
          flex-col
        "
            >
                {/* HEADER FIXO */}
                <DialogHeader className="px-4 py-3 border-b shrink-0 space-y-2">
                    <DialogTitle>{title}</DialogTitle>

                    <Input
                        placeholder="Buscar exercício..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </DialogHeader>

                {/* LISTA SCROLLÁVEL */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                    {filteredExercises.map((ex) => {
                        const disabled = disabledSet.has(ex.id)

                        return (
                            <Button
                                key={ex.id}
                                variant="outline"
                                className="w-full justify-between"
                                disabled={disabled}
                                onClick={() => {
                                    onSelect(ex)
                                    setSearch("")
                                }}
                            >
                                <span>{ex.name}</span>

                            </Button>
                        )
                    })}

                    {filteredExercises.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center pt-4">
                            Nenhum exercício encontrado
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
