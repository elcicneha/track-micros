"use client"

import { useState, useMemo } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
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
  const { foods, nutrients, loading } = useNutritionData()

  const addFood = (food: Food) => {
    setSelectedFoods([...selectedFoods, { ...food, quantity: 100 }])
  }

  const removeFood = (code: string) => {
    setSelectedFoods(selectedFoods.filter((f) => f.code !== code))
  }

  const updateQuantity = (code: string, quantity: number) => {
    setSelectedFoods(selectedFoods.map((f) => (f.code === code ? { ...f, quantity: Math.max(0, quantity) } : f)))
  }

  const totalNutrients = useMemo(
    () => calculateNutrientTotals(selectedFoods, nutrients),
    [selectedFoods, nutrients]
  )

  // Filter nutrients to only show those with valid RDA values
  const validNutrients = useMemo(
    () => nutrients.filter((n) => n.rda_value !== null && n.rda_value > 0),
    [nutrients]
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading nutrition data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Responsive Layout: stacked on mobile, two-column on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(320px,1fr)_1fr] lg:grid-cols-[minmax(320px,1fr)_2fr] gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Search Bar */}
            <FoodSearch
              foods={foods}
              selectedFoodCodes={selectedFoods.map((f) => f.code)}
              onSelectFood={addFood}
            />

            {/* Selected Foods List */}
            <div>
              <label className="text-sm font-semibold text-foreground/70 mb-3 block">
                Selected Foods ({selectedFoods.length})
              </label>
              <Card className="bg-card border-border min-h-80">
                <CardContent className="space-y-3">
                  {selectedFoods.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">No foods selected yet</p>
                  ) : (
                    selectedFoods.map((food) => (
                      <div
                        key={food.code}
                        className="flex items-center justify-between gap-2 bg-background rounded-md p-3 hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-foreground text-sm font-medium flex-1 min-w-0">{food.name}</span>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={food.quantity}
                            onChange={(e) => updateQuantity(food.code, Number.parseInt(e.target.value) || 0)}
                            className="w-14 h-8 px-2 py-1 text-sm text-right bg-muted border-border"
                            min="0"
                          />
                          <span className="text-muted-foreground text-sm whitespace-nowrap">g</span>
                        </div>
                        <Button variant="ghost" size="icon-sm"
                          onClick={() => removeFood(food.code)}
                          aria-label={`Remove ${food.name}`}>
                          <X />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* RIGHT COLUMN - Responsive Card Grid */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground/70">Daily Nutrients</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
              }}
            >
              {validNutrients.map((nutrient) => (
                <NutrientCard
                  key={nutrient.code}
                  name={nutrient.nutrient_name || nutrient.code}
                  current={totalNutrients[nutrient.code] || 0}
                  target={getEffectiveRda(nutrient, USER_WEIGHT_KG)}
                  unit={nutrient.unit || ''}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
