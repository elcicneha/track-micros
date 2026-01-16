"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import type { Food, Nutrient, NutrientMetadata } from "@/lib/supabase"
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
        // Fetch rda_values and nutrient_metadata in parallel
        const [nutrientsResult, metadataResult] = await Promise.all([
          supabase
            .from("rda_values")
            .select("code, nutrient_name, value_type, rda_value, unit")
            .order("nutrient_name"),
          supabase
            .from("nutrient_metadata")
            .select("id, category, code, name, unit"),
        ])

        if (nutrientsResult.error) throw nutrientsResult.error
        if (metadataResult.error) throw metadataResult.error

        const nutrientsData = nutrientsResult.data
        const metadataData = metadataResult.data

        // Build column list: code, name, plus all nutrient codes
        const nutrientColumns =
          nutrientsData?.map((n) => n.code).join(", ") || ""
        const selectColumns = `code, name${nutrientColumns ? ", " + nutrientColumns : ""}`

        // Fetch foods with only the columns we need
        const { data: foodsData, error: foodsError } = await supabase
          .from("foods")
          .select(selectColumns)

        if (foodsError) throw foodsError

        setFoods((foodsData as unknown as Food[]) || [])
        setNutrients(nutrientsData || [])
        setNutrientMetadata((metadataData as NutrientMetadata[]) || [])
      } catch (err: unknown) {
        const supabaseError = err as {
          message?: string
          code?: string
          details?: string
        }
        const errorMessage =
          supabaseError.message || supabaseError.code || JSON.stringify(err)
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
