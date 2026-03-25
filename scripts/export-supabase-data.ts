/**
 * One-time script to export data from Supabase into local JSON files.
 *
 * Usage:
 *   npx tsx scripts/export-supabase-data.ts
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */

import { createClient } from "@supabase/supabase-js"
import { writeFileSync, mkdirSync, readFileSync } from "fs"
import { join } from "path"

// Load .env.local manually (avoids dotenv dependency)
const envPath = join(process.cwd(), ".env.local")
const envContent = readFileSync(envPath, "utf-8")
for (const line of envContent.split("\n")) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const eqIndex = trimmed.indexOf("=")
  if (eqIndex === -1) continue
  const key = trimmed.slice(0, eqIndex).trim()
  const value = trimmed.slice(eqIndex + 1).trim()
  process.env[key] = value
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function exportData() {
  console.log("Fetching rda_values and nutrient_metadata...")

  const [nutrientsResult, metadataResult] = await Promise.all([
    supabase
      .from("rda_values")
      .select("code, nutrient_name, value_type, rda_value, unit, category")
      .order("nutrient_name"),
    supabase
      .from("nutrient_metadata")
      .select("id, category, code, name, unit"),
  ])

  if (nutrientsResult.error) throw nutrientsResult.error
  if (metadataResult.error) throw metadataResult.error

  const nutrients = nutrientsResult.data
  const metadata = metadataResult.data

  // Build dynamic column list (same logic as the hook)
  const nutrientColumns = nutrients?.map((n) => n.code).join(", ") || ""
  const selectColumns = `code, name${nutrientColumns ? ", " + nutrientColumns : ""}`

  console.log("Fetching foods...")

  const { data: foods, error: foodsError } = await supabase
    .from("foods")
    .select(selectColumns)

  if (foodsError) throw foodsError

  // Write to public/data/
  const outDir = join(process.cwd(), "public", "data")
  mkdirSync(outDir, { recursive: true })

  writeFileSync(join(outDir, "foods.json"), JSON.stringify(foods, null, 2))
  writeFileSync(join(outDir, "rda-values.json"), JSON.stringify(nutrients, null, 2))
  writeFileSync(join(outDir, "nutrient-metadata.json"), JSON.stringify(metadata, null, 2))

  console.log(`Exported:`)
  console.log(`  ${foods?.length} foods → public/data/foods.json`)
  console.log(`  ${nutrients?.length} nutrients → public/data/rda-values.json`)
  console.log(`  ${metadata?.length} metadata → public/data/nutrient-metadata.json`)
}

exportData().catch((err) => {
  console.error("Export failed:", err)
  process.exit(1)
})
