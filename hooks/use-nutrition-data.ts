"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Food, Nutrient } from "@/lib/supabase"

type UseNutritionDataResult = {
  foods: Food[]
  nutrients: Nutrient[]
  loading: boolean
  error: string | null
}

export function useNutritionData(): UseNutritionDataResult {
  const [foods, setFoods] = useState<Food[]>([])
  const [nutrients, setNutrients] = useState<Nutrient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // First, fetch all nutrients from rda_values
        const { data: nutrientsData, error: nutrientsError } = await supabase
          .from("rda_values")
          .select("code, nutrient_name, value_type, rda_value, unit")
          .order("nutrient_name")

        if (nutrientsError) throw nutrientsError

        // Build column list: code, name, plus all nutrient codes
        const nutrientColumns = nutrientsData?.map((n) => n.code).join(", ") || ""
        const selectColumns = `code, name${nutrientColumns ? ", " + nutrientColumns : ""}`

        // Fetch foods with only the columns we need
        const { data: foodsData, error: foodsError } = await supabase
          .from("foods")
          .select(selectColumns)

        if (foodsError) throw foodsError

        setFoods((foodsData as unknown as Food[]) || [])
        setNutrients(nutrientsData || [])
      } catch (err: unknown) {
        const supabaseError = err as { message?: string; code?: string; details?: string }
        const errorMessage = supabaseError.message || supabaseError.code || JSON.stringify(err)
        console.error("Error fetching data:", errorMessage)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { foods, nutrients, loading, error }
}
