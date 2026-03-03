"use client"

import { useState, useMemo } from "react"
import { NutrientCard } from "./nutrient-card"
import { FoodSearch } from "./food-search"
import { SelectedFoodsList } from "./selected-foods-list"
import { useNutritionData } from "@/hooks/use-nutrition-data"
import { calculateNutrientTotals, getEffectiveRda } from "@/lib/nutrition-utils"

import type { Food } from "@/lib/supabase"

type SelectedFood = Food & { quantity: number }

// Default user weight for per_kg RDA calculations (will be user-configurable later)
const USER_WEIGHT_KG = 50

export function NutritionTracker() {
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([])
  const { foods, nutrients, conversionMap, categoryMap, loading } = useNutritionData()

  // Food list handlers
  const addFood = (food: Food) => {
    setSelectedFoods([...selectedFoods, { ...food, quantity: 100 }])
  }

  const removeFood = (code: string) => {
    setSelectedFoods(selectedFoods.filter((f) => f.code !== code))
  }

  const updateQuantity = (code: string, quantity: number) => {
    setSelectedFoods(selectedFoods.map((f) =>
      f.code === code ? { ...f, quantity: Math.max(0, quantity) } : f
    ))
  }

  // Nutrient calculations
  const totalNutrients = useMemo(
    () => calculateNutrientTotals(selectedFoods, nutrients, conversionMap, categoryMap),
    [selectedFoods, nutrients, conversionMap, categoryMap]
  )

  const validNutrients = useMemo(
    () => nutrients.filter((n) => n.rda_value !== null && n.rda_value > 0),
    [nutrients]
  )

  const groupedNutrients = useMemo(() => {
    const groups: Record<string, typeof validNutrients> = {}
    for (const nutrient of validNutrients) {
      const category = nutrient.category || "Other"
      if (!groups[category]) groups[category] = []
      groups[category].push(nutrient)
    }

    // Sort categories: Macros first, then alphabetically
    const sortedCategories = Object.keys(groups).sort((a, b) => {
      if (a.toLowerCase() === "macros") return -1
      if (b.toLowerCase() === "macros") return 1
      return a.localeCompare(b)
    })

    return sortedCategories.map((category) => ({
      category,
      nutrients: groups[category],
    }))
  }, [validNutrients])

  const completedNutrients = validNutrients.filter((nutrient) => {
    const current = totalNutrients[nutrient.code] || 0
    const target = getEffectiveRda(nutrient, USER_WEIGHT_KG)
    return (current / target) >= 0.9
  }).length

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading nutrition data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-normal text-foreground tracking-tight">
            Daily Nutrition
          </h1>
          <p className="text-muted-foreground text-sm">
            Track your nutrients, one meal at a time
          </p>
        </header>

        {/* Responsive Layout: stacked on mobile, two-column on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(320px,1fr)_1fr] lg:grid-cols-[minmax(340px,1fr)_2fr] gap-8">
          {/* LEFT COLUMN - Sticky on desktop */}
          <div className="flex flex-col gap-6 md:sticky md:top-8 md:self-start md:max-h-[calc(100vh-4rem)] sticky-sidebar">
            {/* Search Bar */}
            <FoodSearch
              foods={foods}
              selectedFoodCodes={selectedFoods.map((f) => f.code)}
              onSelectFood={addFood}
            />

            {/* Selected Foods List */}
            <SelectedFoodsList
              foods={selectedFoods}
              onUpdateQuantity={updateQuantity}
              onRemoveFood={removeFood}
            />
          </div>

          {/* RIGHT COLUMN - Nutrient Cards Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              {/* <label className="text-sm font-medium text-foreground/70">Daily Nutrients</label> */}
              {selectedFoods.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  <span className="text-[var(--progress-high)] font-medium">{completedNutrients}</span>
                  <span> / {validNutrients.length} targets met</span>
                </span>
              )}
            </div>
            <div className="space-y-10">
              {groupedNutrients.map(({ category, nutrients: groupNutrients }) => (
                <section key={category}>
                  <h2 className="text-sm font-medium font-sans text-muted-foreground mb-3">{category}</h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "0.875rem",
                    }}
                  >
                    {groupNutrients.map((nutrient, index) => (
                      <div
                        key={nutrient.code}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <NutrientCard
                          name={nutrient.nutrient_name || nutrient.code}
                          current={totalNutrients[nutrient.code] || 0}
                          target={getEffectiveRda(nutrient, USER_WEIGHT_KG)}
                          unit={nutrient.unit || ''}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
