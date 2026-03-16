# Food Nutrients Tracker

**[Try it live](https://food-nutrients-tracking.vercel.app/)** - note: there are several [known limitations](#known-limitations)

Most nutrition tools focus on macros - calories, protein, carbs, fat. I built this because I wanted to track my **micronutrients** specifically. I wanted to see which vitamins, minerals, and amino acids I was actually getting from my food, so I could fill gaps through diet itself rather than defaulting to supplements for everything.

## What it does

- Search a database of foods and add them to your daily intake
- See a breakdown of nutrients (vitamins, minerals, amino acids, macros) with progress bars against RDA targets
- Color-coded progress indicators: red (<50% RDA), yellow (50-90%), green (90%+) 

## Tech stack

- **Next.js 16**
- **Supabase** 
- **Tailwind CSS v4** 
- **shadcn/ui** 

## Data sources

- **Food nutrient data** from IFCT (Indian Food Composition Tables)
- **RDA values** from FSSAI (Food Safety and Standards Authority of India)

## Known limitations

- **Incomplete food database** - Many common food items are missing from the database. Coverage needs to be significantly expanded.
- **Missing B12 data** - Vitamin B12 values have not been accounted for yet.
- **No personalised RDA** - Currently uses a single set of RDA values. There are no toggles to adjust recommendations based on your age, gender, or activity level.
- **No serving size options** - All quantities are entered in grams. I want to add household measures (e.g., "1 medium egg", "1 cup", "1 slice") with predefined default weights so you don't have to look up gram values for everything.
- **Not reviewed by a nutritionist** - The nutrient data and RDA values have not been verified by a nutritionist. Use this as a rough guide, not medical advice.
