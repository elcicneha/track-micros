"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Food } from "@/lib/supabase"

interface FoodSearchProps {
  foods: Food[]
  selectedFoodCodes: string[]
  onSelectFood: (food: Food) => void
}

export function FoodSearch({ foods, selectedFoodCodes, onSelectFood }: FoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFoods = useMemo(
    () =>
      foods.filter(
        (food) =>
          food.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !selectedFoodCodes.includes(food.code)
      ),
    [foods, searchQuery, selectedFoodCodes]
  )

  const handleSelectFood = (food: Food) => {
    onSelectFood(food)
    setSearchQuery("")
  }

  return (
    <div>
      <label className="text-sm font-semibold text-foreground/70 mb-2 block">Add Foods</label>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search foods..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card border-border"
        />

        {searchQuery && filteredFoods.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
            {filteredFoods.map((food) => (
              <button
                key={food.code}
                onClick={() => handleSelectFood(food)}
                className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground text-sm"
              >
                {food.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
