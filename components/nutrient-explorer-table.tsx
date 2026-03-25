"use client"

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
    return <ArrowUpDownIcon className="size-3.5 text-muted-foreground/50" />
  }
  return sortConfig.direction === "desc"
    ? <ArrowDownIcon className="size-3.5" />
    : <ArrowUpIcon className="size-3.5" />
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
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium text-foreground">{selectedNutrientName}</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {filteredFoods.length} foods
          </span>
        </div>
        <ColumnPicker
          groupedNutrients={groupedNutrients}
          selectedColumns={additionalColumns}
          primaryColumn={selectedNutrientCode}
          onToggleColumn={onToggleColumn}
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-background z-10">
                <button
                  onClick={() => onToggleSort("name")}
                  className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                >
                  Food
                  <SortIcon column="name" sortConfig={sortConfig} />
                </button>
              </TableHead>
              {visibleColumns.map((col) => (
                <TableHead key={col.code} className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {!col.isPrimary && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-5 text-muted-foreground hover:text-destructive"
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
                      <span>{col.name}</span>
                      <span className="text-muted-foreground text-xs">({col.unit})</span>
                      <SortIcon column={col.code} sortConfig={sortConfig} />
                    </button>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFoods.map((food) => (
              <TableRow key={food.code}>
                <TableCell className="sticky left-0 bg-background z-10 font-medium max-w-[300px] truncate">
                  {food.name}
                </TableCell>
                {visibleColumns.map((col) => {
                  const val = food[col.code]
                  const numVal = typeof val === "number" ? val : 0
                  return (
                    <TableCell key={col.code} className="text-right tabular-nums">
                      {numVal > 0 ? formatNutrientValue(numVal) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
