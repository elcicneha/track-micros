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
      <label className="text-sm font-medium text-foreground/70 mb-2 block">Add Foods</label>
      <Command className="rounded-xl border border-border bg-card overflow-visible shadow-sm [&_[data-slot=command-input-wrapper]]:border-b-0" shouldFilter={false}>
        <CommandInput
          ref={inputRef}
          placeholder="Search for foods..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          onKeyDown={handleKeyDown}
          onFocus={handleInputInteraction}
          onClick={handleInputInteraction}
          className="h-11"
        />
        {searchQuery && isOpen && (
          <CommandList
            className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-56 rounded-xl border border-border bg-card shadow-xl overflow-y-auto animate-fade-in-up"
            style={{ animationDuration: '150ms' }}
          >
            {filteredFoods.length === 0 ? (
              <CommandEmpty className="py-8 text-center">
                <span className="text-2xl block mb-2 opacity-40">🔍</span>
                <span className="text-muted-foreground text-sm">No foods found</span>
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredFoods.slice(0, 8).map((food) => (
                  <CommandItem
                    key={food.code}
                    value={food.code}
                    onSelect={() => handleSelectFood(food)}
                    className="py-2.5 px-3 cursor-pointer"
                  >
                    <span className="truncate">{food.name}</span>
                  </CommandItem>
                ))}
                {filteredFoods.length > 8 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border/50">
                    +{filteredFoods.length - 8} more results
                  </div>
                )}
              </CommandGroup>
            )}
          </CommandList>
        )}
      </Command>
      {/* Keyboard hints */}
      <p className="text-xs text-muted-foreground/60 mt-2">
        ↑↓ navigate • ↵ select • esc close
      </p>
    </div>
  )
}
