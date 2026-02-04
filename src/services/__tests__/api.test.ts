import {
    getRecipes,
    searchRecipes,
    filterRecipesByPreferences,
    Recipe,
} from '../api';

describe('API Service', () => {
    it('getRecipes returns a list of recipes', async () => {
        const recipes = await getRecipes();
        expect(Array.isArray(recipes)).toBe(true);
        expect(recipes.length).toBeGreaterThan(0);
        expect(recipes[0]).toHaveProperty('idMeal');
        expect(recipes[0]).toHaveProperty('strMeal');
    });

    it('searchRecipes filters by name case-insensitive', async () => {
        const results = await searchRecipes('Apple');
        expect(Array.isArray(results)).toBe(true);
        // Assuming 'Apple' is in the DB
        const apple = results.find((r) => r.strMeal.includes('Apple'));
        expect(apple).toBeDefined();
    });

    describe('filterRecipesByPreferences', () => {
        // Mock data for deterministic testing
        const mockRecipes: Recipe[] = [
            {
                idMeal: '1',
                strMeal: 'Spicy Beef',
                strCategory: 'Beef',
                strArea: 'Ethiopian',
                strInstructions: 'Cook it',
                strMealThumb: 'url',
                strIngredient1: 'Beef',
                strIngredient2: 'Chili',
                // dynamic props
            } as Recipe,
            {
                idMeal: '2',
                strMeal: 'Vegetable Stew',
                strCategory: 'Vegetarian',
                strArea: 'Ethiopian',
                strInstructions: 'Boil it',
                strMealThumb: 'url',
                strIngredient1: 'Carrot',
                strIngredient2: 'Potato',
            } as Recipe,
        ];

        it('returns all recipes if no preferences provided', () => {
            const filtered = filterRecipesByPreferences(mockRecipes, null);
            expect(filtered).toHaveLength(2);
        });

        it('filters by category', () => {
            const preferences = {
                preferredCategories: ['Vegetarian'],
            };
            const filtered = filterRecipesByPreferences(mockRecipes, preferences);
            expect(filtered).toHaveLength(1);
            expect(filtered[0].strMeal).toBe('Vegetable Stew');
        });

        // Note: detailed allergen/ingredient testing depends on the internal maps 
        // populated by the real JSONs. We rely on the real svc logic for that or 
        // would need to mock the data imports which is harder in this setup.
        // For now we test with the real data implicitly or just logic paths we control.
    });
});
