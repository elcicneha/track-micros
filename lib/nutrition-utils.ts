import type { Nutrient } from "./supabase"

type FoodWithQuantity = {
  quantity: number
  [key: string]: number | string | null | undefined
}

const AMINO_ACID_CATEGORY = "Amino acid profile"
const PROTEIN_CODE = "protcnt"

/**
 * Calculate total nutrient values from selected foods
 * Applies unit conversion if conversionMap is provided
 * For amino acids, calculates based on protein content rather than food weight
 *
 * @param selectedFoods - Array of foods with quantities
 * @param nutrients - Array of nutrient definitions from rda_values
 * @param conversionMap - Optional map of nutrient code to conversion factor
 * @param categoryMap - Optional map of nutrient code to category
 */
export function calculateNutrientTotals(
  selectedFoods: FoodWithQuantity[],
  nutrients: Nutrient[],
  conversionMap: Record<string, number> = {},
  categoryMap: Record<string, string> = {}
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
        let proportionalValue: number

        // Check if this is an amino acid nutrient
        const category = categoryMap[code]
        if (category === AMINO_ACID_CATEGORY) {
          // Amino acid values are per 100g of protein, not per 100g of food
          // First calculate protein in the food, then calculate amino acid from that
          const proteinValue = food[PROTEIN_CODE]
          if (
            proteinValue !== undefined &&
            proteinValue !== null &&
            typeof proteinValue === "number" &&
            proteinValue > 0
          ) {
            // protein_in_food = (protcnt * quantity) / 100
            // amino_acid = (amino_value * protein_in_food) / 100
            const proteinInFood = (proteinValue * food.quantity) / 100
            proportionalValue = (value * proteinInFood) / 100
          } else {
            // No protein data available, amino acid contribution is 0
            proportionalValue = 0
          }
        } else {
          // Standard calculation for non-amino-acid nutrients (per 100g basis)
          proportionalValue = (value * food.quantity) / 100
        }

        // Apply unit conversion if available
        const conversionFactor = conversionMap[code] ?? 1
        proportionalValue *= conversionFactor

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
