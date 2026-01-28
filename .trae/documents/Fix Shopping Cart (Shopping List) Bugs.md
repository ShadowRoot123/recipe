## What’s Broken (Root Cause)
- The “Shopping Cart” in this app is the **Shopping List** feature.
- When you tap “Add to List” on a recipe, it calls `addItem()` many times quickly ([RecipeDetailScreen.tsx](file:///c:/Users/HP/Documents/projects/react%20native/EthiopianRecipeApp/src/screens/RecipeDetailScreen.tsx#L159-L168)).
- `addItem()` currently builds the next list from a **stale `items` snapshot** (`[...items, newItem]`) and writes AsyncStorage on each call ([ShoppingListContext.tsx](file:///c:/Users/HP/Documents/projects/react%20native/EthiopianRecipeApp/src/context/ShoppingListContext.tsx#L56-L65)).
- Result: **lost updates** (often only some/last ingredients appear), plus possible AsyncStorage last-write-wins races.

## Fix Strategy
1. Make Shopping List state updates concurrency-safe
   - Change `addItem/removeItem/toggleItem/clearList` to use functional updates (`setItems(prev => ...)`) so rapid operations never drop items.
2. Serialize persistence correctly
   - Persist `items` from a single `useEffect` that watches `items` (and only after initial load), instead of calling `saveList()` on every action.
   - This removes write races and makes AsyncStorage reflect the latest state.
3. Add a bulk add API for recipes
   - Add `addItems(items: Omit<ShoppingItem,'id'|'checked'>[])` to the context.
   - Update `handleAddToShoppingList` to call `addItems()` once (instead of looping `addItem()`), improving correctness and performance.
4. Normalize ingredient strings to reduce “phantom duplicates”
   - Trim ingredient name/measure before storing.
   - (Optional) Dedupe exact duplicates for the same recipe+ingredient+measure; keep behavior configurable if you want duplicates.

## Files To Change
- [ShoppingListContext.tsx](file:///c:/Users/HP/Documents/projects/react%20native/EthiopianRecipeApp/src/context/ShoppingListContext.tsx)
  - Add `addItems`, refactor mutations to functional updates, move AsyncStorage saving into `useEffect`.
- [RecipeDetailScreen.tsx](file:///c:/Users/HP/Documents/projects/react%20native/EthiopianRecipeApp/src/screens/RecipeDetailScreen.tsx)
  - Replace `ingredients.forEach(addItem)` with a single `addItems()` call (trim fields before passing).

## Verification (After Implementation)
- Repro check: open any recipe → tap “Add to List” → confirm **all ingredients** show in [ShoppingListScreen.tsx](file:///c:/Users/HP/Documents/projects/react%20native/EthiopianRecipeApp/src/screens/ShoppingListScreen.tsx).
- Stress check: tap “Add to List” multiple times quickly → ensure list doesn’t lose items or glitch.
- Persistence check: restart app / reload → shopping list remains intact (AsyncStorage).
- Toggle/delete/clear: verify checkbox toggle, delete item, and “Clear All” still work.
