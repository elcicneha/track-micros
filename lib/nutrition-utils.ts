import type { Nutrient } from "./supabase"

type FoodWithQuantity = {
  quantity: number
  [key: string]: number | string | null | undefined
}

/**
 * Calculate total nutrient values from selected foods
 */
export function calculateNutrientTotals(
  selectedFoods: FoodWithQuantity[],
  nutrients: Nutrient[]
): Record<string, number> {
  const totals: Record<string, number> = {}

  // Initialize all nutrients to 0
  nutrients.forEach((nutrient) => {
    totals[nutrient.code] = 0
  })

  // Sum up contributions from each food
  selectedFoods.forEach((food) => {
    nutrients.forEach((nutrient) => {
      const code = nutrient.code
      const value = food[code]
      if (value !== undefined && value !== null && typeof value === "number") {
        const proportionalValue = (value * food.quantity) / 100
        totals[code] = (totals[code] || 0) + proportionalValue
      }
    })
  })

  return totals
}

/**
 * Calculate effective RDA target based on value_type
 * For per_kg nutrients, multiplies by user weight
 */
export function getEffectiveRda(nutrient: Nutrient, userWeightKg: number): number {
  if (nutrient.value_type === "per_kg") {
    return (nutrient.rda_value || 0) * userWeightKg
  }
  return nutrient.rda_value || 0
}
