"use client"

import { useState, useEffect, useMemo } from "react"
import { dataSource } from "@/lib/data"
import type { Food, Nutrient, NutrientMetadata } from "@/lib/types"
import { buildConversionMap } from "@/lib/unit-conversion"

type UseNutritionDataResult = {
  foods: Food[]
  nutrients: Nutrient[]
  conversionMap: Record<string, number>
  categoryMap: Record<string, string>
  loading: boolean
  error: string | null
}

export function useNutritionData(): UseNutritionDataResult {
  const [foods, setFoods] = useState<Food[]>([])
  const [nutrients, setNutrients] = useState<Nutrient[]>([])
  const [nutrientMetadata, setNutrientMetadata] = useState<NutrientMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await dataSource.fetchNutritionData()
        setFoods(data.foods)
        setNutrients(data.nutrients)
        setNutrientMetadata(data.nutrientMetadata)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : JSON.stringify(err)
        console.error("Error fetching data:", errorMessage)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Compute conversion map once when data loads
  const conversionMap = useMemo(() => {
    if (nutrientMetadata.length === 0 || nutrients.length === 0) {
      return {}
    }
    // Filter to only include metadata with valid code and unit
    const validMetadata = nutrientMetadata.filter(
      (m): m is NutrientMetadata & { code: string; unit: string } =>
        m.code !== null && m.unit !== null
    )
    return buildConversionMap(validMetadata, nutrients)
  }, [nutrientMetadata, nutrients])

  // Compute category map once when data loads
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {}
    nutrientMetadata.forEach((meta) => {
      if (meta.code && meta.category) {
        map[meta.code] = meta.category
      }
    })
    return map
  }, [nutrientMetadata])

  return { foods, nutrients, conversionMap, categoryMap, loading, error }
}
