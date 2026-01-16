"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import type { Food } from "@/lib/supabase"

interface FoodSearchProps {
  foods: Food[]
  selectedFoodCodes: string[]
  onSelectFood: (food: Food) => void
}

export function FoodSearch({ foods, selectedFoodCodes, onSelectFood }: FoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div>
      <label className="text-sm font-semibold text-foreground/70 mb-2 block">Add Foods</label>
      <Command className="rounded-lg border border-border bg-card" shouldFilter={false}>
        <CommandInput
          ref={inputRef}
          placeholder="Search foods..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        {searchQuery && (
          <CommandList className="max-h-48">
            {filteredFoods.length === 0 ? (
              <CommandEmpty>No foods found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredFoods.map((food) => (
                  <CommandItem
                    key={food.code}
                    value={food.code}
                    onSelect={() => handleSelectFood(food)}
                  >
                    {food.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  )
}
