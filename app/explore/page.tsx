"use client"

import { useState, useEffect } from "react"
import { NutrientExplorer } from "@/components/nutrient-explorer"
import type { Food, Nutrient, NutrientMetadata } from "@/lib/types"

export default function ExplorePage() {
  const [initialNutrient, setInitialNutrient] = useState<string | null>(null)
  const [foods, setFoods] = useState<Food[]>([])
  const [nutrients, setNutrients] = useState<Nutrient[]>([])
  const [nutrientMetadata, setNutrientMetadata] = useState<NutrientMetadata[]>([])
  const [loading, setLoading] = useState(true)

  // Read hash fragment once on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      setInitialNutrient(hash)
    }
  }, [])

  // Load full foods.json (all columns) for the explore page
  useEffect(() => {
    Promise.all([
      fetch("/data/foods.json").then((r) => r.json()),
      fetch("/data/rda-values.json").then((r) => r.json()),
      fetch("/data/nutrient-metadata.json").then((r) => r.json()),
    ])
      .then(([f, n, m]) => {
        setFoods(f)
        setNutrients(n)
        setNutrientMetadata(m)
      })
      .catch((err) => console.error("Failed to load data:", err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading nutrition data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <NutrientExplorer
        initialNutrientCode={initialNutrient}
        foods={foods}
        nutrients={nutrients}
        nutrientMetadata={nutrientMetadata}
      />
    </div>
  )
}
