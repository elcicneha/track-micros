"use client"

import { useState } from "react"
import { PlusIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { NutrientMetadata } from "@/lib/types"

interface ColumnPickerProps {
  groupedNutrients: { category: string; nutrients: NutrientMetadata[] }[]
  selectedColumns: string[]
  primaryColumn: string
  onToggleColumn: (code: string) => void
}

export function ColumnPicker({
  groupedNutrients,
  selectedColumns,
  primaryColumn,
  onToggleColumn,
}: ColumnPickerProps) {
  const [search, setSearch] = useState("")
  const query = search.toLowerCase().trim()

  const filteredGroups = groupedNutrients
    .map((group) => ({
      ...group,
      nutrients: group.nutrients.filter((n) =>
        (n.name || n.code).toLowerCase().includes(query)
      ),
    }))
    .filter((group) => group.nutrients.length > 0)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <PlusIcon className="size-4" />
          <span className="hidden sm:inline">Add column</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="p-3 border-b">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search nutrients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
        <ScrollArea className="h-72">
          <div className="p-2 space-y-3">
            {filteredGroups.map((group) => (
              <div key={group.category}>
                <p className="text-xs font-medium text-muted-foreground px-2 mb-1">
                  {group.category}
                </p>
                {group.nutrients.map((nutrient) => {
                  const isPrimary = nutrient.code === primaryColumn
                  const isSelected = isPrimary || selectedColumns.includes(nutrient.code)
                  return (
                    <label
                      key={nutrient.code}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={isPrimary}
                        onCheckedChange={() => onToggleColumn(nutrient.code)}
                      />
                      <span className={isPrimary ? "text-muted-foreground" : ""}>
                        {nutrient.name || nutrient.code}
                      </span>
                      {isPrimary && (
                        <span className="text-xs text-muted-foreground ml-auto">primary</span>
                      )}
                    </label>
                  )
                })}
              </div>
            ))}
            {filteredGroups.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No nutrients found
              </p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
