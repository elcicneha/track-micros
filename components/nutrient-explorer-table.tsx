"use client"

import { useRef, useEffect } from "react"
import { ArrowUpIcon, ArrowDownIcon, ArrowUpDownIcon, XIcon } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatNutrientValue } from "@/lib/nutrient-explorer-utils"
import { ColumnPicker } from "./column-picker"
import type { Food, NutrientMetadata } from "@/lib/types"
import type { ColumnInfo } from "@/hooks/use-nutrient-explorer"

interface NutrientExplorerTableProps {
  filteredFoods: Food[]
  visibleColumns: ColumnInfo[]
  sortConfig: { column: string; direction: "asc" | "desc" }
  additionalColumns: string[]
  groupedNutrients: { category: string; nutrients: NutrientMetadata[] }[]
  selectedNutrientCode: string
  selectedNutrientName: string
  onToggleSort: (column: string) => void
  onToggleColumn: (code: string) => void
  onRemoveColumn: (code: string) => void
}

function SortIcon({ column, sortConfig }: {
  column: string
  sortConfig: { column: string; direction: "asc" | "desc" }
}) {
  if (sortConfig.column !== column) {
    return <ArrowUpDownIcon className="size-3.5 text-muted-foreground/40 shrink-0" />
  }
  return sortConfig.direction === "desc"
    ? <ArrowDownIcon className="size-3.5 shrink-0" />
    : <ArrowUpIcon className="size-3.5 shrink-0" />
}

export function NutrientExplorerTable({
  filteredFoods,
  visibleColumns,
  sortConfig,
  additionalColumns,
  groupedNutrients,
  selectedNutrientCode,
  selectedNutrientName,
  onToggleSort,
  onToggleColumn,
  onRemoveColumn,
}: NutrientExplorerTableProps) {
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const prevColumnCount = useRef(visibleColumns.length)

  useEffect(() => {
    if (visibleColumns.length > prevColumnCount.current) {
      const container = tableWrapperRef.current?.querySelector<HTMLElement>(
        '[data-slot="table-container"]'
      )
      if (container) {
        container.scrollTo({ left: container.scrollWidth, behavior: "smooth" })
      }
    }
    prevColumnCount.current = visibleColumns.length
  }, [visibleColumns.length])

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-4 py-2 border-b flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm font-medium text-foreground truncate">{selectedNutrientName}</h2>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full tabular-nums shrink-0">
            {filteredFoods.length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div ref={tableWrapperRef} className="flex-1 min-h-0">
        <Table>
          <TableHeader className="sticky top-0 z-20">
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead data-pinned className="bg-muted min-w-[200px] max-w-[300px]">
                <button
                  onClick={() => onToggleSort("name")}
                  className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                >
                  Food <span className="text-muted-foreground text-xs">(per 100g)</span>
                  <SortIcon column="name" sortConfig={sortConfig} />
                </button>
              </TableHead>
              {visibleColumns.map((col, i) => (
                <TableHead
                  key={col.code}
                  className={cn(
                    "text-right bg-muted group",
                    sortConfig.column === col.code && "bg-muted/80",
                    i === visibleColumns.length - 1 && "pr-6"
                  )}
                >
                  <div className="flex items-center justify-end gap-1">
                    {!col.isPrimary && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-5 text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive transition-colors"
                        onClick={() => onRemoveColumn(col.code)}
                      >
                        <XIcon className="size-3" />
                      </Button>
                    )}
                    <button
                      onClick={() => onToggleSort(col.code)}
                      className={cn(
                        "flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer",
                        col.isPrimary && "font-semibold"
                      )}
                    >
                      {col.name}
                      <span className="text-muted-foreground text-xs">({col.unit})</span>
                      <SortIcon column={col.code} sortConfig={sortConfig} />
                    </button>
                    {col.isPrimary && (
                      <span className="text-xs text-muted-foreground ml-1">primary</span>
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-full bg-muted">
                <ColumnPicker
                  groupedNutrients={groupedNutrients}
                  selectedColumns={additionalColumns}
                  primaryColumn={selectedNutrientCode}
                  onToggleColumn={onToggleColumn}
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFoods.map((food) => (
              <TableRow key={food.code} className="hover:bg-transparent">
                <TableCell data-pinned className="font-medium max-w-[300px] truncate">
                  {food.name}
                </TableCell>
                {visibleColumns.map((col, i) => {
                  const val = food[col.code]
                  const numVal = typeof val === "number" ? val : 0
                  return (
                    <TableCell
                      key={col.code}
                      className={cn(
                        "text-right tabular-nums",
                        sortConfig.column === col.code && "bg-muted/30",
                        i === visibleColumns.length - 1 && "pr-6"
                      )}
                    >
                      {numVal > 0 ? formatNutrientValue(numVal) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>
                  )
                })}
                <TableCell className="w-full" />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
