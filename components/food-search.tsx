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
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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
    setIsOpen(false)
    // Refocus input for continued keyboard use
    inputRef.current?.focus()
  }

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Open dropdown when typing
  useEffect(() => {
    if (searchQuery) {
      setIsOpen(true)
    }
  }, [searchQuery])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // Reopen dropdown on focus or click (click needed when already focused)
  const handleInputInteraction = () => {
    if (searchQuery) {
      setIsOpen(true)
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <label className="text-sm font-semibold text-foreground/70 mb-2 block">Add Foods</label>
      <Command className="rounded-lg border border-border bg-card overflow-visible" shouldFilter={false}>
        <CommandInput
          ref={inputRef}
          placeholder="Search foods..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          onKeyDown={handleKeyDown}
          onFocus={handleInputInteraction}
          onClick={handleInputInteraction}
        />
        {searchQuery && isOpen && (
          <CommandList className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 rounded-lg border border-border bg-card shadow-lg">
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
