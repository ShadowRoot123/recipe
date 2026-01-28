// Local data service using bundled JSON files instead of remote API
import mealsData from '../jsons/meals.json';
import mealIngredientsData from '../jsons/meal_ingredients.json';
import ingredientsData from '../jsons/ingredients.json';

export interface Recipe {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags?: string | null;
  strYoutube?: string | null;
  // Dynamic fields for ingredients/measures (e.g., strIngredient1..20, strMeasure1..20)
  [key: string]: string | null | undefined;
}

type MealRaw = {
  external_id: number;
  name: string;
  category: string;
  area: string;
  instructions: string;
  thumbnail_url: string;
  tags?: string | null;
  youtube_url?: string | null;
};

type IngredientRaw = { id: number; name: string };

type MealIngredientRaw = {
  meal_external_id: number;
  ingredient_id: number;
  measure: string | null;
};

const meals: MealRaw[] = mealsData as unknown as MealRaw[];
const mealIngredients: MealIngredientRaw[] = mealIngredientsData as unknown as MealIngredientRaw[];
const ingredients: IngredientRaw[] = ingredientsData as unknown as IngredientRaw[];

const ingredientNameById = new Map<number, string>();
ingredients.forEach((i) => ingredientNameById.set(i.id, i.name));

function buildRecipe(meal: MealRaw, includeIngredients = false): Recipe {
  const recipe: Recipe = {
    idMeal: String(meal.external_id),
    strMeal: meal.name,
    strCategory: meal.category,
    strArea: meal.area,
    strInstructions: meal.instructions,
    strMealThumb: meal.thumbnail_url,
    strTags: meal.tags ?? null,
    strYoutube: meal.youtube_url ?? null,
  };

  if (includeIngredients) {
    const items = mealIngredients.filter((mi) => mi.meal_external_id === meal.external_id);
    // Limit to 20 to match UI's expectations
    for (let i = 0; i < Math.min(20, items.length); i++) {
      const ing = items[i];
      const name = ingredientNameById.get(ing.ingredient_id) || '';
      recipe[`strIngredient${i + 1}`] = name;
      recipe[`strMeasure${i + 1}`] = ing.measure ?? '';
    }
  }

  return recipe;
}

export async function getRecipes(): Promise<Recipe[]> {
  // Return mapped recipes without ingredient fields for lists
  return meals.map((m) => buildRecipe(m, false));
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const q = query.trim().toLowerCase();
  const filtered = meals.filter((m) => m.name.toLowerCase().includes(q));
  return filtered.map((m) => buildRecipe(m, false));
}

export async function getRecipeById(idMeal: string): Promise<Recipe> {
  const id = Number(idMeal);
  const meal = meals.find((m) => m.external_id === id);
  if (!meal) {
    throw new Error('Recipe not found');
  }
  return buildRecipe(meal, true);
}

export async function getAllIngredients(): Promise<string[]> {
  return ingredients.map(i => i.name).sort();
}

export async function getAllAreas(): Promise<string[]> {
  const areas = Array.from(new Set(meals.map(m => m.area).filter(Boolean)));
  return areas.sort();
}

export async function getRecipesByFilter(
  category?: string | null,
  area?: string | null,
  ingredient?: string | null
): Promise<Recipe[]> {
  let filteredMeals = meals;

  if (category && category !== 'All') {
    filteredMeals = filteredMeals.filter(m => m.category === category);
  }

  if (area && area !== 'All') {
    filteredMeals = filteredMeals.filter(m => m.area === area);
  }

  if (ingredient && ingredient !== 'All') {
    // Find ingredient ID
    const ingObj = ingredients.find(i => i.name === ingredient);
    if (ingObj) {
      // Find all meal IDs that have this ingredient
      const mealIds = new Set(
        mealIngredients
          .filter(mi => mi.ingredient_id === ingObj.id)
          .map(mi => mi.meal_external_id)
      );
      filteredMeals = filteredMeals.filter(m => mealIds.has(m.external_id));
    } else {
      // Ingredient not found, return empty
      return [];
    }
  }

  return filteredMeals.map(m => buildRecipe(m, false));
}