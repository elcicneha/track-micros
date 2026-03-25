"use client"

import { useState, useEffect } from "react"
import { useNutrientExplorer } from "@/hooks/use-nutrient-explorer"
import { NutrientExplorerSidebar } from "@/components/nutrient-explorer-sidebar"
import { NutrientExplorerTable } from "@/components/nutrient-explorer-table"
import type { Food, Nutrient, NutrientMetadata } from "@/lib/types"

export default function ExplorePage() {
  const [initialNutrient, setInitialNutrient] = useState<string | null>(null)
  const [foods, setFoods] = useState<Food[]>([])
  const [nutrients, setNutrients] = useState<Nutrient[]>([])
  const [nutrientMetadata, setNutrientMetadata] = useState<NutrientMetadata[]>([])
  const [loading, setLoading] = useState(true)

  // Read hash fragment once on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      setInitialNutrient(hash)
    }
  }, [])

  // Load full foods.json (all columns) for the explore page
  useEffect(() => {
    Promise.all([
      fetch("/data/foods.json").then((r) => r.json()),
      fetch("/data/rda-values.json").then((r) => r.json()),
      fetch("/data/nutrient-metadata.json").then((r) => r.json()),
    ])
      .then(([f, n, m]) => {
        setFoods(f)
        setNutrients(n)
        setNutrientMetadata(m)
      })
      .catch((err) => console.error("Failed to load data:", err))
      .finally(() => setLoading(false))
  }, [])

  const {
    selectedNutrientCode,
    selectedNutrientName,
    groupedNutrients,
    filteredFoods,
    visibleColumns,
    sortConfig,
    additionalColumns,
    selectNutrient,
    toggleColumn,
    toggleSort,
    removeColumn,
  } = useNutrientExplorer({
    initialNutrientCode: initialNutrient,
    foods,
    nutrientMetadata,
    nutrients,
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading nutrition data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <div className="flex flex-col md:flex-row h-full animate-fade-in-up" style={{ animationDuration: "200ms" }}>
        {/* Sidebar — hidden on mobile, shown on md+ */}
        <aside className="hidden md:flex md:flex-col w-64 lg:w-72 border-r bg-card flex-shrink-0 min-h-0 overflow-hidden">
          <NutrientExplorerSidebar
            groupedNutrients={groupedNutrients}
            selectedNutrientCode={selectedNutrientCode}
            onSelectNutrient={selectNutrient}
          />
        </aside>

        {/* Mobile nutrient selector */}
        <div className="md:hidden border-b p-3">
          <select
            value={selectedNutrientCode}
            onChange={(e) => selectNutrient(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {groupedNutrients.map((group) => (
              <optgroup key={group.category} label={group.category}>
                {group.nutrients.map((n) => (
                  <option key={n.code} value={n.code}>
                    {n.name || n.code}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 min-h-0">
          <NutrientExplorerTable
            filteredFoods={filteredFoods}
            visibleColumns={visibleColumns}
            sortConfig={sortConfig}
            additionalColumns={additionalColumns}
            groupedNutrients={groupedNutrients}
            selectedNutrientCode={selectedNutrientCode}
            selectedNutrientName={selectedNutrientName}
            onToggleSort={toggleSort}
            onToggleColumn={toggleColumn}
            onRemoveColumn={removeColumn}
          />
        </main>
      </div>
    </div>
  )
}
