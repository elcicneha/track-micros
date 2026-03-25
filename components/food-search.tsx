"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import Fuse from "fuse.js"
import { useVirtualizer } from "@tanstack/react-virtual"
import {
  Command,
  CommandInput,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import type { Food } from "@/lib/types"

interface FoodSearchProps {
  foods: Food[]
  selectedFoodCodes: string[]
  onSelectFood: (food: Food) => void
}

const ITEM_HEIGHT = 40

export function FoodSearch({ foods, selectedFoodCodes, onSelectFood }: FoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebouncedValue(searchQuery, 150)

  // Exclude already-selected foods
  const availableFoods = useMemo(() => {
    const selectedSet = new Set(selectedFoodCodes)
    return foods.filter(f => !selectedSet.has(f.code))
  }, [foods, selectedFoodCodes])

  // Build Fuse index (recomputed only when available foods change)
  const fuse = useMemo(
    () => new Fuse(availableFoods, {
      keys: ["name"],
      threshold: 0.3,
    }),
    [availableFoods]
  )

  // Fuzzy search results
  const results = useMemo(() => {
    if (!debouncedQuery) return []
    return fuse.search(debouncedQuery).map(r => r.item)
  }, [fuse, debouncedQuery])

  const isDebouncing = searchQuery !== debouncedQuery

  // Virtualizer for the results list
  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  })

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0)
  }, [results])

  const handleSelectFood = useCallback((food: Food) => {
    onSelectFood(food)
    setSearchQuery("")
    setIsOpen(false)
    inputRef.current?.focus()
  }, [onSelectFood])

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
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false)
      return
    }

    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setActiveIndex(prev => {
          const next = prev < results.length - 1 ? prev + 1 : 0
          virtualizer.scrollToIndex(next, { align: "auto" })
          return next
        })
        break
      case "ArrowUp":
        e.preventDefault()
        setActiveIndex(prev => {
          const next = prev > 0 ? prev - 1 : results.length - 1
          virtualizer.scrollToIndex(next, { align: "auto" })
          return next
        })
        break
      case "Enter":
        e.preventDefault()
        if (results[activeIndex]) {
          handleSelectFood(results[activeIndex])
        }
        break
    }
  }, [isOpen, results, activeIndex, virtualizer, handleSelectFood])

  const handleInputInteraction = () => {
    if (searchQuery) {
      setIsOpen(true)
    }
  }

  const showDropdown = searchQuery && isOpen
  const hasResults = results.length > 0

  return (
    <div className="relative" ref={containerRef}>
      <label className="text-sm font-medium text-foreground/70 mb-2 block">Add Foods</label>
      <Command className="rounded-xl border border-border bg-card overflow-visible shadow-sm h-auto [&_[data-slot=command-input-wrapper]]:border-b-0" shouldFilter={false}>
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
      </Command>
      {showDropdown && (
        <div
          ref={listRef}
          className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-72 rounded-xl border border-border bg-card shadow-xl overflow-y-auto animate-fade-in-up"
          style={{ animationDuration: "150ms" }}
          role="listbox"
        >
          {hasResults ? (
            <div
              className="relative w-full"
              style={{ height: `${virtualizer.getTotalSize()}px` }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const food = results[virtualRow.index]
                const isActive = virtualRow.index === activeIndex
                return (
                  <div
                    key={food.code}
                    role="option"
                    aria-selected={isActive}
                    className={cn(
                      "absolute top-0 left-0 w-full flex items-center px-3 cursor-pointer text-sm truncate rounded-sm",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    )}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    onClick={() => handleSelectFood(food)}
                    onMouseEnter={() => setActiveIndex(virtualRow.index)}
                  >
                    {food.name}
                  </div>
                )
              })}
            </div>
          ) : (
            !isDebouncing && (
              <div className="py-8 text-center">
                <span className="text-muted-foreground text-sm">No foods found</span>
              </div>
            )
          )}
        </div>
      )}
      <p className="hidden sm:block text-xs text-muted-foreground/60 mt-2">
        ↑↓ navigate &bull; ↵ select &bull; esc close
      </p>
    </div>
  )
}
