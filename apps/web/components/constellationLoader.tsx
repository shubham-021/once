"use client"

import { useCreateStore } from "@/stores/create-store"
import { ConstellationLoader as Loader } from "./ui/loader"

export function ConstellationLoader() {
    const isCreating = useCreateStore((s) => s.isCreating)

    if (!isCreating) return null

    return <Loader />
}