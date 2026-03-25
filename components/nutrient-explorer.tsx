"use client"

import { useNutrientExplorer } from "@/hooks/use-nutrient-explorer"
import { NutrientExplorerSidebar } from "./nutrient-explorer-sidebar"
import { NutrientExplorerTable } from "./nutrient-explorer-table"
import type { Food, Nutrient, NutrientMetadata } from "@/lib/types"

interface NutrientExplorerProps {
  initialNutrientCode: string | null
  foods: Food[]
  nutrients: Nutrient[]
  nutrientMetadata: NutrientMetadata[]
}

export function NutrientExplorer({
  initialNutrientCode,
  foods,
  nutrients,
  nutrientMetadata,
}: NutrientExplorerProps) {
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
    initialNutrientCode,
    foods,
    nutrientMetadata,
    nutrients,
  })

  return (
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
  )
}
