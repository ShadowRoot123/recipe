## Goal
Add first-launch welcome screens to ask allergies + preferences and automatically filter meals everywhere.

## What Will Be Asked In Welcome Screens
- Allergies (multi-select): dairy, eggs, gluten, peanuts, tree nuts, fish, shellfish, soy, sesame
- Ingredients to avoid (multi-select from your ingredient list)
- Preferences (multi-select): preferred categories and preferred areas/cuisines
- Optional: dietary style (vegetarian/vegan) if you want later (can map to ingredient exclusions)

## Where The Data Comes From
- Your meals already have Category + Area fields, and your app already supports filtering by Category/Area/Ingredient using local JSON (`src/services/api.ts`).

## How Filtering Will Work
- Ingredient exclusions: remove meals that contain any excluded ingredient (reliable because you have `meal_ingredients.json`).
- Allergy filtering: map each allergen to ingredient keywords (e.g., Dairy → milk/cheese/butter/yogurt) and exclude meals containing matching ingredients.
- Preferences: optionally “prefer only” certain categories/areas (or treat them as a boost later).

## Implementation Steps
1) Create a Preferences context + storage
- Add `src/context/PreferencesContext.tsx` with AsyncStorage persistence.
- Store: `allergens[]`, `excludedIngredients[]`, `preferredCategories[]`, `preferredAreas[]`, `hasCompletedOnboarding`.

2) Add allergen mapping constants
- Add `src/constants/allergens.ts` with:
  - allergen list for UI
  - allergen → ingredient keyword mapping

3) Add filtering helpers in the data layer
- Extend `src/services/api.ts` with functions that filter recipes by preferences (using the ingredient join table).

4) Build the onboarding/welcome screens
- Add screens under `src/screens/onboarding/` (multi-step flow):
  - Intro → Allergies → Preferences → Finish
- Each step updates PreferencesContext.

5) Add boot/onboarding routes to navigation
- Add a `BootScreen` that decides whether to show onboarding or go straight to Main.
- Register `Boot` + `Onboarding` routes in `src/navigation/AppNavigator.tsx` before `Main`.

6) Apply filtering to Home and Search
- Home: fetch recipes using preferences (so lists + “recommended” are filtered).
- Search: filter search results using the same preferences.

7) Add Settings entry to edit preferences
- Add “Food Preferences” in Settings and a screen to edit the same selections later.

## Verification
- First app launch shows onboarding.
- Completing onboarding saves preferences and opens Main tabs.
- Restarting the app skips onboarding.
- Home + Search both hide meals that conflict with allergies/excluded ingredients.
- Settings changes immediately affect results.