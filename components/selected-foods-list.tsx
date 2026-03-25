"use client"

import { useRef, useState, useEffect } from "react"
import { X, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRovingTabindex } from "@/hooks/use-roving-tabindex"
import { cn } from "@/lib/utils"

import type { Food } from "@/lib/types"

type SelectedFood = Food & { quantity: number }

type SelectedFoodsListProps = {
  foods: SelectedFood[]
  onUpdateQuantity: (code: string, quantity: number) => void
  onRemoveFood: (code: string) => void
}

export function SelectedFoodsList({
  foods,
  onUpdateQuantity,
  onRemoveFood,
}: SelectedFoodsListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const [showTopFade, setShowTopFade] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(false)

  // Keyboard navigation via roving tabindex
  const { activeIndex, getItemProps, focusActiveItem } = useRovingTabindex({
    itemCount: foods.length,
    onDelete: (index) => onRemoveFood(foods[index].code),
  })

  // Handle focus entering the list from outside (e.g., Shift+Tab)
  // Redirect to the active item container instead of last tabbable element
  const handleListFocus = (e: React.FocusEvent) => {
    const cameFromOutside = !e.currentTarget.contains(e.relatedTarget as Node)
    if (cameFromOutside && foods.length > 0) {
      focusActiveItem()
    }
  }

  // Scroll detection for bidirectional fade masks
  useEffect(() => {
    const el = listRef.current
    if (!el) return

    const checkScroll = () => {
      const hasOverflow = el.scrollHeight > el.clientHeight
      const isAtTop = el.scrollTop <= 1
      const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 1

      setShowTopFade(hasOverflow && !isAtTop)
      setShowBottomFade(hasOverflow && !isAtBottom)
    }

    checkScroll()
    el.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)

    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [foods])

  // Compute fade class based on scroll state
  const fadeClass = showTopFade && showBottomFade
    ? "scroll-fade-both"
    : showTopFade
      ? "scroll-fade-top"
      : showBottomFade
        ? "scroll-fade-bottom"
        : ""

  const scrollFadeSize = "3rem"

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-3">
      <style>{`
        .scroll-fade-bottom { mask-image: linear-gradient(to bottom, black 0%, black calc(100% - ${scrollFadeSize}), transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 0%, black calc(100% - ${scrollFadeSize}), transparent 100%); }
        .scroll-fade-top { mask-image: linear-gradient(to bottom, transparent 0%, black ${scrollFadeSize}, black 100%); -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black ${scrollFadeSize}, black 100%); }
        .scroll-fade-both { mask-image: linear-gradient(to bottom, transparent 0%, black ${scrollFadeSize}, black calc(100% - ${scrollFadeSize}), transparent 100%); -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black ${scrollFadeSize}, black calc(100% - ${scrollFadeSize}), transparent 100%); }
      `}</style>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground/70">
          Selected Foods
        </label>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {foods.length} items
        </span>
      </div>
      <Card className="bg-card border-border flex-1 flex flex-col min-h-0 py-0">
        <CardContent
          ref={listRef}
          className={cn(
            "flex-1 overflow-y-auto px-4",
            fadeClass
          )}
        >
          <div
            className="py-4 space-y-2"
            role="listbox"
            aria-label="Selected foods"
            onFocus={handleListFocus}
          >
            {foods.length === 0 ? (
              // Empty state
              <div className="text-center py-8 space-y-2">
                <div className="text-3xl">🥗</div>
                <div>
                  <p className="text-muted-foreground text-sm mb-[2px]">No foods selected yet</p>
                  <p className="text-muted-foreground/60 text-xs">Search above to add foods</p>
                </div>
              </div>
            ) : (
              foods.map((food, index) => {
                const itemProps = getItemProps(index)
                return (
                  <div
                    key={food.code}
                    role="option"
                    aria-selected="true"
                    ref={itemProps.ref as React.Ref<HTMLDivElement>}
                    tabIndex={itemProps.tabIndex}
                    onKeyDown={itemProps.onKeyDown}
                    className="flex items-center justify-between gap-2 sm:gap-3 bg-background rounded-lg p-2.5 sm:p-3 hover:bg-muted/50 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring animate-fade-in-up group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="text-foreground text-sm font-medium flex-1 min-w-0 truncate">{food.name}</span>
                    {/* Unified quantity stepper pill */}
                    <div className="flex items-center bg-muted/60 rounded-full border border-border/50 overflow-hidden transition-all duration-150 hover:border-border hover:bg-muted/80 focus-within:ring-2 focus-within:ring-ring/30">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        tabIndex={-1}
                        onClick={() => onUpdateQuantity(food.code, food.quantity - 10)}
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
                          onChange={(e) => onUpdateQuantity(food.code, Number.parseInt(e.target.value) || 0)}
                          onFocus={(e) => e.target.select()}
                          tabIndex={index === activeIndex ? 0 : -1}
                          className="w-8 sm:w-10 h-7 text-xs sm:text-sm text-center bg-transparent border-none outline-none font-medium text-foreground tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min="0"
                        />
                        <span className="text-muted-foreground text-xs pr-1.5">g</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        tabIndex={-1}
                        onClick={() => onUpdateQuantity(food.code, food.quantity + 10)}
                        aria-label="Increase quantity by 10g"
                        className="h-7 w-7 rounded-none cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      tabIndex={index === activeIndex ? 0 : -1}
                      onClick={() => onRemoveFood(food.code)}
                      aria-label={`Remove ${food.name}`}
                      className="opacity-50 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
      {/* Total summary */}
      {foods.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          Total: {foods.reduce((sum, f) => sum + f.quantity, 0)}g
        </p>
      )}
    </div>
  )
}
