# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
pnpm dev         # Start development server
pnpm build       # Production build (note: typescript.ignoreBuildErrors is true in next.config.mjs)
pnpm lint        # Run ESLint
pnpm start       # Start production server
```

No test framework is configured. No environment variables are required.

## Architecture Overview

This is a Next.js 16 nutrition tracking application with local JSON data files. Users can search and select foods to track their daily nutrient intake against RDA (Recommended Daily Allowance) values.

### Tech Stack
- **Framework**: Next.js 16 with App Router (all interactive components use `"use client"`)
- **Data**: Local JSON files in `public/data/`, served via fetch with browser caching
- **Styling**: Tailwind CSS v4 with CSS custom properties (OKLCH color space) for theming
- **UI Components**: shadcn/ui (new-york style) with Radix UI primitives in `components/ui/`
- **Search**: Fuse.js for fuzzy matching, `@tanstack/react-virtual` for virtualized lists
- **Typography**: DM Sans (body, `--font-sans`), DM Serif Display (headings, `--font-serif`)

### Key Files and Data Flow

**Main Application Flow:**
- `app/page.tsx` → `components/nutrition-tracker.tsx` (orchestrator: state, search, selection, calculation)
- `components/food-search.tsx` - Fuzzy search with debouncing (150ms) and virtual scrolling
- `components/selected-foods-list.tsx` - Selected foods with roving tabindex keyboard navigation
- `components/nutrient-card.tsx` - Individual nutrient progress with color-coded bars

**Data Layer (Strategy pattern for easy backend swapping):**
- `lib/data/data-source.ts` - `DataSource` interface with `fetchNutritionData()` method
- `lib/data/json-data-source.ts` - Current implementation (fetches from `public/data/`)
- `lib/data/index.ts` - Barrel export; change this one file to swap backends

**Data Files (`public/data/`):**
- `foods.json` - Complete food data with ALL nutrient columns (355 cols, ~3.4MB). Full Supabase mirror. Used by the `/explore` page.
- `foods-core.json` - Slim version with only RDA nutrient columns (41 cols, ~380KB). Used by the main tracker page for fast loading.
- `rda-values.json` - RDA targets with fields: `code`, `nutrient_name`, `value_type`, `rda_value`, `unit`, `category`
- `nutrient-metadata.json` - Category and unit information: `id`, `category`, `code`, `name`, `unit`
- To re-export from Supabase: `npx tsx scripts/export-supabase-data.ts` (generates all files including both foods JSONs)

**Data Fetching:**
- `hooks/use-nutrition-data.ts` - Fetches `foods-core.json` via `DataSource`, builds conversion and category maps
- `/explore` page fetches `foods.json` directly for full nutrient data

**Nutrient Calculation:**
- `lib/nutrition-utils.ts` - `calculateNutrientTotals()` (sums with unit conversion), `getEffectiveRda()` (fixed vs per_kg)
- `lib/unit-conversion.ts` - Unit conversion utilities (g↔mg↔mcg, kJ↔kcal)

### Business Logic Notes

- **Amino acids** are calculated differently: values are per 100g of protein content, not per 100g of food weight
- **RDA value types**: `fixed` (absolute value) or `per_kg` (multiplied by user weight)
- **User weight**: Hardcoded as `USER_WEIGHT_KG = 50` in `nutrition-tracker.tsx`
- **Nutrient progress colors**: red (<50% RDA), yellow (50-90%), green (≥90%)

### Styling Conventions

- Tailwind CSS v4 with `@import "tailwindcss"` syntax
- Theme colors defined as CSS custom properties in `app/globals.css` using OKLCH color space
- Dark mode support via `.dark` class
- `cn()` utility from `lib/utils.ts` for conditional class merging

### Path Aliases

`@/*` maps to the project root (configured in tsconfig.json)

## UI Component Guidelines

Use shadcn/ui components wherever applicable. The project uses the **new-york** style variant (configured in `components.json`). When adding new UI elements:
- Check if a shadcn/ui component exists for the use case
- Add new components with `npx shadcn@latest add <component>`
- Components go in `components/ui/` following the existing pattern

## Code Quality Guidelines

### Separation of Concerns
- **Hooks** (`hooks/`) for reusable logic (data fetching, keyboard navigation, debouncing)
- **Components** (`components/`) for UI rendering only — receive data and callbacks via props
- **Utils** (`lib/`) for pure functions (calculations, conversions)
- Keep components under 150-200 lines; split larger ones into focused pieces
- Page components orchestrate; leaf components render

### Performance
- Use `useMemo` for expensive calculations that depend on props/state
- Use `useCallback` for handlers passed to child components
- Avoid creating new objects/arrays in render (move to useMemo or outside component)

### Accessibility
- Follow WAI-ARIA guidelines (see https://www.w3.org/WAI/ARIA/apg/patterns/)
- Use semantic HTML and ARIA roles (`role="listbox"`, `role="option"`, etc.)
- Ensure full keyboard navigation for all interactive elements (Arrow keys, Home/End, Escape, Delete)
