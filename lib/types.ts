// Domain types for nutrition data — independent of data source

export type Food = {
  code: string        // Primary key
  name: string
  [key: string]: any  // Allow dynamic nutrient code columns (retol, thia, etc.)
}

export type Nutrient = {
  code: string                    // Primary key
  nutrient_name: string | null    // Display name
  value_type: string | null       // Type classification
  rda_value: number | null        // Target RDA
  unit: string | null             // Measurement unit
  category: string | null         // Grouping category (macros, vitamins, minerals, amino acids)
}

export type NutrientMetadata = {
  id: number
  category: string | null
  code: string
  name: string | null
  unit: string | null
}
