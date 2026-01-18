"use client"

import { useState, useMemo, useRef } from "react"
import { X, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { NutrientCard } from "./nutrient-card"
import { FoodSearch } from "./food-search"
import { useNutritionData } from "@/hooks/use-nutrition-data"
import { calculateNutrientTotals, getEffectiveRda } from "@/lib/nutrition-utils"

import type { Food } from "@/lib/supabase"

type SelectedFood = Food & { quantity: number }

// Default user weight for per_kg RDA calculations (will be user-configurable later)
const USER_WEIGHT_KG = 50

export function NutritionTracker() {
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([])
  const { foods, nutrients, conversionMap, categoryMap, loading } = useNutritionData()

  const addFood = (food: Food) => {
    setSelectedFoods([...selectedFoods, { ...food, quantity: 100 }])
  }

  const removeFood = (code: string) => {
    setSelectedFoods(selectedFoods.filter((f) => f.code !== code))
  }

  const foodItemRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleFoodKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    index: number,
    foodCode: string
  ) => {
    // Only handle Delete/Backspace if not focused on an input
    if (e.target instanceof HTMLInputElement) return

    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        e.preventDefault()
        removeFood(foodCode)
        // Move focus to next item or previous if last
        const nextIndex = index < selectedFoods.length - 1 ? index : index - 1
        setTimeout(() => {
          if (nextIndex >= 0) {
            foodItemRefs.current[nextIndex]?.focus()
          }
        }, 0)
        break
      case 'ArrowDown':
        e.preventDefault()
        if (index < selectedFoods.length - 1) {
          foodItemRefs.current[index + 1]?.focus()
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (index > 0) {
          foodItemRefs.current[index - 1]?.focus()
        }
        break
    }
  }

  const updateQuantity = (code: string, quantity: number) => {
    setSelectedFoods(selectedFoods.map((f) => (f.code === code ? { ...f, quantity: Math.max(0, quantity) } : f)))
  }

  const totalNutrients = useMemo(
    () => calculateNutrientTotals(selectedFoods, nutrients, conversionMap, categoryMap),
    [selectedFoods, nutrients, conversionMap, categoryMap]
  )

  // Filter nutrients to only show those with valid RDA values
  const validNutrients = useMemo(
    () => nutrients.filter((n) => n.rda_value !== null && n.rda_value > 0),
    [nutrients]
  )

  // Calculate summary stats
  const completedNutrients = validNutrients.filter((nutrient) => {
    const current = totalNutrients[nutrient.code] || 0
    const target = getEffectiveRda(nutrient, USER_WEIGHT_KG)
    return (current / target) >= 0.9
  }).length

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
          <div className="space-y-6 md:sticky md:top-8 md:self-start md:max-h-[calc(100vh-4rem)] md:overflow-y-auto sticky-sidebar">
            {/* Search Bar */}
            <FoodSearch
              foods={foods}
              selectedFoodCodes={selectedFoods.map((f) => f.code)}
              onSelectFood={addFood}
            />

            {/* Selected Foods List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground/70">
                  Selected Foods
                </label>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {selectedFoods.length} items
                </span>
              </div>
              <Card className="bg-card border-border min-h-72">
                <CardContent className="space-y-2">
                  {selectedFoods.length === 0 ? (
                    <div className="text-center py-12 space-y-2">
                      <div className="text-3xl opacity-40">🥗</div>
                      <p className="text-muted-foreground text-sm">No foods selected yet</p>
                      <p className="text-muted-foreground/60 text-xs">Search above to add foods</p>
                    </div>
                  ) : (
                    selectedFoods.map((food, index) => (
                      <div
                        key={food.code}
                        ref={(el) => { foodItemRefs.current[index] = el }}
                        tabIndex={0}
                        onKeyDown={(e) => handleFoodKeyDown(e, index, food.code)}
                        className="flex items-center justify-between gap-3 bg-background rounded-lg p-3 hover:bg-muted/50 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring animate-fade-in-up group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <span className="text-foreground text-sm font-medium flex-1 min-w-0 truncate">{food.name}</span>
                        {/* Unified quantity stepper pill */}
                        <div className="flex items-center bg-muted/60 rounded-full border border-border/50 overflow-hidden transition-all duration-150 hover:border-border hover:bg-muted/80 focus-within:ring-2 focus-within:ring-ring/30">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => updateQuantity(food.code, food.quantity - 10)}
                            aria-label="Decrease quantity by 10g"
                            disabled={food.quantity <= 0}
                            className="h-7 w-7 rounded-none cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <div className="flex items-center border-x border-border/30">
                            <input
                              type="number"
                              value={food.quantity}
                              onChange={(e) => updateQuantity(food.code, Number.parseInt(e.target.value) || 0)}
                              onFocus={(e) => e.target.select()}
                              className="w-10 h-7 text-sm text-center bg-transparent border-none outline-none font-medium text-foreground tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              min="0"
                            />
                            <span className="text-muted-foreground text-xs pr-1.5">g</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => updateQuantity(food.code, food.quantity + 10)}
                            aria-label="Increase quantity by 10g"
                            className="h-7 w-7 rounded-none cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeFood(food.code)}
                          aria-label={`Remove ${food.name}`}
                          className="opacity-50 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
              {/* Total summary */}
              {selectedFoods.length > 0 && (
                <p className="text-xs text-muted-foreground text-right">
                  Total: {selectedFoods.reduce((sum, f) => sum + f.quantity, 0)}g
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Responsive Card Grid */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground/70">Daily Nutrients</h2>
              {selectedFoods.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  <span className="text-[var(--progress-high)] font-medium">{completedNutrients}</span>
                  <span> / {validNutrients.length} targets met</span>
                </span>
              )}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "0.875rem",
              }}
            >
              {validNutrients.map((nutrient, index) => (
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
          </div>
        </div>
      </div>
    </div>
  )
}
