"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import type { Food, NutrientMetadata, Nutrient } from "@/lib/types"
import { buildNutrientDisplayMap, type NutrientDisplayInfo } from "@/lib/nutrient-explorer-utils"

type SortConfig = {
  column: string
  direction: "asc" | "desc"
}

export type ColumnInfo = {
  code: string
  name: string
  unit: string
  isPrimary: boolean
}

type GroupedNutrients = {
  category: string
  nutrients: NutrientMetadata[]
}

type UseNutrientExplorerOptions = {
  initialNutrientCode: string | null
  foods: Food[]
  nutrientMetadata: NutrientMetadata[]
  nutrients: Nutrient[]
}

export function useNutrientExplorer({
  initialNutrientCode,
  foods,
  nutrientMetadata,
  nutrients,
}: UseNutrientExplorerOptions) {
  const [selectedNutrientCode, setSelectedNutrientCode] = useState<string>(
    initialNutrientCode || "enerc"
  )

  // Sync state when URL param changes (browser back/forward)
  useEffect(() => {
    if (initialNutrientCode && initialNutrientCode !== selectedNutrientCode) {
      setSelectedNutrientCode(initialNutrientCode)
      setSortConfig({ column: initialNutrientCode, direction: "desc" })
    }
  }, [initialNutrientCode]) // eslint-disable-line react-hooks/exhaustive-deps

  const [additionalColumns, setAdditionalColumns] = useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem("explore-columns")
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: initialNutrientCode || "enerc",
    direction: "desc",
  })

  useEffect(() => {
    try {
      sessionStorage.setItem("explore-columns", JSON.stringify(additionalColumns))
    } catch { /* quota errors */ }
  }, [additionalColumns])

  const displayMap = useMemo(
    () => buildNutrientDisplayMap(nutrientMetadata, nutrients),
    [nutrientMetadata, nutrients]
  )

  const groupedNutrients = useMemo(() => {
    const groups: Record<string, NutrientMetadata[]> = {}
    for (const meta of nutrientMetadata) {
      const cat = meta.category || "Other"
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(meta)
    }

    return Object.keys(groups)
      .sort()
      .map((category) => ({
        category,
        nutrients: groups[category].sort((a, b) =>
          (a.name || a.code).localeCompare(b.name || b.code)
        ),
      }))
  }, [nutrientMetadata])

  const filteredFoods = useMemo(() => {
    const nonZero = foods.filter((food) => {
      const val = food[selectedNutrientCode]
      return typeof val === "number" && val > 0
    })

    const sorted = [...nonZero].sort((a, b) => {
      if (sortConfig.column === "name") {
        const cmp = (a.name || "").localeCompare(b.name || "")
        return sortConfig.direction === "desc" ? -cmp : cmp
      }
      const aVal = typeof a[sortConfig.column] === "number" ? a[sortConfig.column] : 0
      const bVal = typeof b[sortConfig.column] === "number" ? b[sortConfig.column] : 0
      return sortConfig.direction === "desc" ? bVal - aVal : aVal - bVal
    })

    return sorted
  }, [foods, selectedNutrientCode, sortConfig])

  const visibleColumns = useMemo((): ColumnInfo[] => {
    const codes = [selectedNutrientCode, ...additionalColumns]
    return codes.map((code) => {
      const info = displayMap[code]
      return {
        code,
        name: info?.name || code,
        unit: info?.unit || "",
        isPrimary: code === selectedNutrientCode,
      }
    })
  }, [selectedNutrientCode, additionalColumns, displayMap])

  const selectedNutrientName = displayMap[selectedNutrientCode]?.name || selectedNutrientCode

  const selectNutrient = useCallback((code: string) => {
    setSelectedNutrientCode(code)
    // Remove the new primary from additional columns (avoid duplicate), but keep the rest
    setAdditionalColumns((prev) => prev.filter((c) => c !== code))
    setSortConfig({ column: code, direction: "desc" })
  }, [])

  const toggleColumn = useCallback(
    (code: string) => {
      if (code === selectedNutrientCode) return
      setAdditionalColumns((prev) =>
        prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
      )
    },
    [selectedNutrientCode]
  )

  const removeColumn = useCallback(
    (code: string) => {
      if (code === selectedNutrientCode) return
      setAdditionalColumns((prev) => prev.filter((c) => c !== code))
      // If we're sorting by the removed column, reset sort to primary
      setSortConfig((prev) =>
        prev.column === code
          ? { column: selectedNutrientCode, direction: "desc" }
          : prev
      )
    },
    [selectedNutrientCode]
  )

  const toggleSort = useCallback((column: string) => {
    setSortConfig((prev) => {
      if (prev.column === column) {
        return { column, direction: prev.direction === "desc" ? "asc" : "desc" }
      }
      return { column, direction: "desc" }
    })
  }, [])

  return {
    selectedNutrientCode,
    selectedNutrientName,
    groupedNutrients,
    filteredFoods,
    visibleColumns,
    sortConfig,
    additionalColumns,
    displayMap,
    selectNutrient,
    toggleColumn,
    toggleSort,
    removeColumn,
  }
}
