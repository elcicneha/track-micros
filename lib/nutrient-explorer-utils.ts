import type { NutrientMetadata, Nutrient } from "./types"

/**
 * Format a nutrient value for display with appropriate precision.
 */
export function formatNutrientValue(value: number): string {
  if (value === 0) return "0"
  if (value >= 100) return Math.round(value).toString()
  if (value >= 1) return value.toFixed(1)
  return value.toFixed(2)
}

export type NutrientDisplayInfo = {
  code: string
  name: string
  unit: string
}

/**
 * Build a lookup map from nutrient code to display info.
 * Prefers names from nutrientMetadata, falls back to rda-values nutrients.
 */
export function buildNutrientDisplayMap(
  nutrientMetadata: NutrientMetadata[],
  nutrients: Nutrient[]
): Record<string, NutrientDisplayInfo> {
  const map: Record<string, NutrientDisplayInfo> = {}

  for (const meta of nutrientMetadata) {
    map[meta.code] = {
      code: meta.code,
      name: meta.name || meta.code,
      unit: meta.unit || "",
    }
  }

  // Overlay RDA nutrient names (they tend to be more user-friendly)
  for (const n of nutrients) {
    if (map[n.code] && n.nutrient_name) {
      map[n.code].name = n.nutrient_name
    } else if (!map[n.code]) {
      map[n.code] = {
        code: n.code,
        name: n.nutrient_name || n.code,
        unit: n.unit || "",
      }
    }
  }

  return map
}
