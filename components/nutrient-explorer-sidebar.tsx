"use client"

import { useEffect, useRef } from "react"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { NutrientMetadata } from "@/lib/types"

interface NutrientExplorerSidebarProps {
  groupedNutrients: { category: string; nutrients: NutrientMetadata[] }[]
  selectedNutrientCode: string
  onSelectNutrient: (code: string) => void
}

export function NutrientExplorerSidebar({
  groupedNutrients,
  selectedNutrientCode,
  onSelectNutrient,
}: NutrientExplorerSidebarProps) {
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [selectedNutrientCode])

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-3">
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" asChild>
          <Link href="/">
            <ArrowLeftIcon className="size-4" />
            Back
          </Link>
        </Button>
        <h2 className="text-lg font-medium text-foreground">Nutrients</h2>
      </div>
      <ScrollArea className="flex-1 overflow-hidden">
        <nav className="p-2 space-y-4">
          {groupedNutrients.map((group) => (
            <div key={group.category}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1">
                {group.category}
              </p>
              <ul className="space-y-0.5">
                {group.nutrients.map((nutrient) => {
                  const isActive = nutrient.code === selectedNutrientCode
                  return (
                    <li key={nutrient.code}>
                      <button
                        ref={isActive ? activeRef : undefined}
                        onClick={() => onSelectNutrient(nutrient.code)}
                        className={cn(
                          "w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors",
                          "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isActive && "bg-accent font-medium text-accent-foreground"
                        )}
                      >
                        {nutrient.name || nutrient.code}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  )
}
