## What You’ll Get
- A first-launch welcome/onboarding flow that asks:
  - Allergies (nuts, dairy, gluten, eggs, fish, shellfish, soy, sesame)
  - Ingredients to avoid (multi-select)
  - Preferred categories and cuisines/areas (multi-select)
- Saved preferences (AsyncStorage) and applied automatically to filter meals in Home + Search.
- A Settings entry to edit preferences later.

## How Filtering Will Work (With Your Current Data)
- Your data already supports filtering by Category/Area/Ingredient via `meal_ingredients.json`.
- Allergies will be implemented by mapping allergens → ingredient name keywords (example: Dairy → milk/cheese/butter/yogurt). Meals containing matching ingredients will be hidden.
- You can also manually exclude specific ingredients (stronger and more reliable than keyword-based allergens).

## Code Changes (High Level)
### 1) Add a Preferences Store
- Create `src/context/PreferencesContext.tsx`:
  - `preferences`: allergens[], excludedIngredients[], preferredCategories[], preferredAreas[], usePreferences
  - `load/save/reset` via AsyncStorage (new keys like `userPreferences` and `hasCompletedOnboarding`)
- Wrap the app with `PreferencesProvider` in `App.tsx`.

### 2) Add Allergen → Ingredient Keyword Mapping
- Add a small constants module (e.g., `src/constants/allergens.ts`) with:
  - The allergen list for UI
  - Keyword lists used to detect ingredients that match an allergen

### 3) Apply Preferences in the Data Layer
- Update `src/services/api.ts` by adding helper functions to:
  - Filter a list of meals by excluded ingredient names (using `meal_ingredients.json`)
  - Optionally restrict results to preferred categories/areas
- Expose a single function used by Home/Search, e.g. `getRecipesForUser(filters, preferences)`.

### 4) Add Welcome / Onboarding Screens
- Create onboarding screens under `src/screens/onboarding/`:
  - `WelcomeIntroScreen`
  - `WelcomeAllergiesScreen`
  - `WelcomePreferencesScreen`
  - `WelcomeFinishScreen`
- Each screen updates `PreferencesContext` and advances to the next step.

### 5) Gate App Startup With a Boot Screen
- Add a lightweight `BootScreen` that:
  - Reads `hasCompletedOnboarding` from AsyncStorage
  - Resets navigation to either `Onboarding` or `Main`
- Register `Boot` and `Onboarding` routes in `src/navigation/AppNavigator.tsx` before `Main`.

### 6) Hook Preferences Into Home + Search
- Home: use preferences when fetching recipes; optionally add a “Use my preferences” toggle in the existing Filters modal.
- Search: after `searchRecipes(query)`, apply the same exclusions (allergens + excluded ingredients) before rendering results.

### 7) Add Preferences Editing In Settings
- Add a new Settings option: “Food Preferences” → opens a `PreferencesScreen` (reusing the same selection UI as onboarding).

## Verification
- Launch the app and confirm:
  - First launch shows onboarding; finishing takes you to the tabs.
  - Restarting the app skips onboarding.
  - Selecting allergens/excluded ingredients actually removes matching meals from Home and Search.
  - Settings → Food Preferences updates the filtering immediately.

## Notes / Safety
- The allergen filtering is best-effort based on ingredient names in your local dataset; it’s not medical advice. Manual ingredient exclusion is the most reliable control.