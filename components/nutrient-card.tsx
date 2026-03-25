"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface NutrientCardProps {
  code: string
  name: string
  current: number
  target: number
  unit: string
  icon?: string
}

export function NutrientCard({ code, name, current, target, unit, icon }: NutrientCardProps) {
  const router = useRouter()
  const percentage = Math.round((current / target) * 100)
  const clampedPercentage = Math.min(percentage, 100)
  const isComplete = percentage >= 90

  // Softer botanical color coding
  let barColorClass = "bg-[var(--progress-low)]" // < 50% - warm amber-red
  if (percentage >= 50 && percentage < 90) {
    barColorClass = "bg-[var(--progress-mid)]" // 50-90% - golden
  } else if (percentage >= 90) {
    barColorClass = "bg-[var(--progress-high)]" // 90%+ - sage green
  }

  return (
    <Card className={cn(
      "p-3.5 sm:p-5 bg-card border-border",
      "hover:shadow-lg hover:-translate-y-0.5",
      "transition-all duration-200 ease-out",
      isComplete && "ring-1 ring-[var(--progress-high)]/20"
    )}>
      <div className="space-y-2 sm:space-y-3">
        {/* Header with icon and name */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span className="text-xl flex-shrink-0">{icon}</span>}
            <button
              onClick={() => {
                sessionStorage.setItem("exploreNutrient", code)
                router.push("/explore")
              }}
              className="font-medium text-foreground text-sm leading-tight truncate hover:underline hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {name}
            </button>
          </div>
          <span className={cn(
            "text-lg font-bold tabular-nums flex-shrink-0",
            percentage < 50 && "text-[var(--progress-low)]",
            percentage >= 50 && percentage < 90 && "text-[var(--progress-mid)]",
            percentage >= 90 && "text-[var(--progress-high)]"
          )}>
            {percentage}%
          </span>
        </div>

        {/* Current and Target */}
        <div className="text-sm">
          <p className="text-foreground/80">
            <span className="font-medium text-foreground">{current.toFixed(1)}</span>
            <span className="text-muted-foreground"> / {target} {unit}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              barColorClass
            )}
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>
      </div>
    </Card>
  )
}
