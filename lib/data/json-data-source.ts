// How to swap backends later
// Create a new file like lib/data/api-data-source.ts implementing the DataSource interface, 
// then change one line in lib/data/index.ts:
// export { apiDataSource as dataSource } from "./api-data-source"

import type { Food, Nutrient, NutrientMetadata } from "@/lib/types"
import type { DataSource, NutritionData } from "./data-source"

class JsonDataSource implements DataSource {
  async fetchNutritionData(): Promise<NutritionData> {
    const [foods, nutrients, nutrientMetadata] = await Promise.all([
      fetch("/data/foods.json").then((r) => r.json()) as Promise<Food[]>,
      fetch("/data/rda-values.json").then((r) => r.json()) as Promise<Nutrient[]>,
      fetch("/data/nutrient-metadata.json").then((r) => r.json()) as Promise<NutrientMetadata[]>,
    ])

    return { foods, nutrients, nutrientMetadata }
  }
}

export const jsonDataSource = new JsonDataSource()
