## Goal
- Add a filter UI to SearchScreen (category/area/main-ingredient) and persist the last search query + results so they reappear after navigating away or restarting the app.

## Current Behavior (What I Found)
- SearchScreen only searches on submit (keyboard “Search”) and then applies preferences filtering; it does not expose category/area/ingredient filters and it does not persist query/results.
- HomeScreen already implements a filter modal UI (chips + slide-up Modal) and the API already supports `getAllAreas()`, `getAllIngredients()`, and `getRecipesByFilter(category, area, ingredient)`.

## UI Changes (Filter)
- Add a small filter button (options icon) next to the search input.
- Reuse the HomeScreen filter pattern:
  - Slide-up Modal with chips for Category / Area / Main Ingredient.
  - Reset button to set all filters back to `All`.
- Load filter option lists on mount:
  - Categories from `getRecipes()` (unique `strCategory`), plus `All`.
  - Areas from `getAllAreas()`, plus `All`.
  - Ingredients from `getAllIngredients()`, plus `All`.

## Data Logic (Search + Filter)
- Replace the current `searchRecipes(query)` call with a combined “search within filters” flow:
  - Fetch base list using `getRecipesByFilter(selectedCategory, selectedArea, selectedIngredient)`.
  - If query is non-empty, filter by name match (case-insensitive `includes`).
  - Apply `filterRecipesByPreferences(..., preferences)` last.
- Keep the existing loading + empty-state behavior.
- When filters change and a search has already been performed, automatically re-run the search so results update immediately.

## Persistence (Remember Last Search + Found Meals)
- Add AsyncStorage persistence for SearchScreen state using a dedicated key (e.g. `searchScreenState`).
- Persist:
  - `query`
  - `results` (the found meals shown in the list)
  - `selectedCategory`, `selectedArea`, `selectedIngredient`
  - (optional) `savedAt` timestamp for future UX (not required)
- On mount:
  - Load and validate the stored state.
  - Restore query/results/filters into screen state so the user sees the last search instantly.

## Files I Will Change
- `src/screens/SearchScreen.tsx`
  - Add filter modal UI + filter option loading.
  - Update search logic to support filter selections.
  - Add AsyncStorage load/save for last search + results.

## Verification
- Manual checks in the app:
  - Search for a meal → results show.
  - Apply filters → results update and still respect user preferences.
  - Restart app / reload screen → last query + results + filters are restored.
  - Reset filters → results update accordingly.

If you confirm, I’ll implement this directly by reusing the HomeScreen filter UI pattern and adding AsyncStorage persistence to SearchScreen.