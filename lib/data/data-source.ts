import type { Food, Nutrient, NutrientMetadata } from "@/lib/types"

export type NutritionData = {
  foods: Food[]
  nutrients: Nutrient[]
  nutrientMetadata: NutrientMetadata[]
}

/**
 * Contract for fetching nutrition data.
 * Implement this interface to swap data sources (JSON files, Supabase, REST API, etc.)
 */
export interface DataSource {
  fetchNutritionData(): Promise<NutritionData>
}
