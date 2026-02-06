import { supabase } from './supabaseClient';
import type { Recipe, RecipePreferences } from './api';
import ingredientsData from '../jsons/ingredients.json';
import mealIngredientsData from '../jsons/meal_ingredients.json';
import { ALLERGEN_KEYWORDS, type AllergenId } from '../constants/allergens';

export type { Recipe, RecipePreferences } from './api';

type DbMeal = {
  id: string;
  name: string;
  category: string | null;
  area: string | null;
  thumbnail_url: string | null;
  instructions: string | null;
  tags: string | null;
  youtube_url: string | null;
  source_json: any;
};

type IngredientRaw = { id: number; name: string };
type MealIngredientRaw = { meal_external_id: number; ingredient_id: number; measure: string | null };

const ingredients: IngredientRaw[] = ingredientsData as unknown as IngredientRaw[];
const mealIngredients: MealIngredientRaw[] = mealIngredientsData as unknown as MealIngredientRaw[];

const ingredientNameById = new Map<number, string>();
ingredients.forEach((i) => ingredientNameById.set(i.id, i.name));

const normalize = (value: string) => value.trim().toLowerCase();

const ingredientNamesLowerByMealId = new Map<number, string[]>();
mealIngredients.forEach((mi) => {
  const name = ingredientNameById.get(mi.ingredient_id);
  if (!name) return;
  const list = ingredientNamesLowerByMealId.get(mi.meal_external_id) ?? [];
  list.push(normalize(name));
  ingredientNamesLowerByMealId.set(mi.meal_external_id, list);
});

function dbMealToRecipe(meal: DbMeal): Recipe {
  const recipe: Recipe = {
    idMeal: meal.id,
    strMeal: meal.name,
    strCategory: meal.category || '',
    strArea: meal.area || '',
    strInstructions: meal.instructions || '',
    strMealThumb: meal.thumbnail_url || '',
    strTags: meal.tags,
    strYoutube: meal.youtube_url,
  };

  return recipe;
}

export async function getRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('meals')
    .select('id, name, category, area, thumbnail_url, instructions, tags, youtube_url, source_json')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []).map((meal) => dbMealToRecipe(meal as DbMeal));
}

export async function getRecipeById(idMeal: string): Promise<Recipe> {
  const { data, error } = await supabase
    .from('meals')
    .select('id, name, category, area, thumbnail_url, instructions, tags, youtube_url, source_json')
    .eq('id', idMeal)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Recipe not found');

  const recipe = dbMealToRecipe(data as DbMeal);

  const mealId = Number(idMeal);
  const items = mealIngredients.filter((mi) => mi.meal_external_id === mealId).slice(0, 20);

  items.forEach((ing, index) => {
    const name = ingredientNameById.get(ing.ingredient_id) ?? '';
    if (!name) return;
    recipe[`strIngredient${index + 1}`] = name;
    recipe[`strMeasure${index + 1}`] = ing.measure ?? '';
  });

  return recipe;
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const { data, error } = await supabase
    .from('meals')
    .select('id, name, category, area, thumbnail_url, instructions, tags, youtube_url, source_json')
    .ilike('name', `%${q}%`)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []).map((meal) => dbMealToRecipe(meal as DbMeal));
}

export async function getRecipesByFilter(
  category?: string | null,
  area?: string | null,
  ingredient?: string | null
): Promise<Recipe[]> {
  let query = supabase
    .from('meals')
    .select('id, name, category, area, thumbnail_url, instructions, tags, youtube_url, source_json');

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  if (area && area !== 'All') {
    query = query.eq('area', area);
  }

  if (ingredient && ingredient !== 'All') {
    const ingObj = ingredients.find((i) => i.name === ingredient);
    if (!ingObj) {
      return [];
    }

    const mealIds = Array.from(
      new Set(
        mealIngredients
          .filter((mi) => mi.ingredient_id === ingObj.id)
          .map((mi) => String(mi.meal_external_id))
      )
    );

    if (mealIds.length === 0) return [];
    query = query.in('id', mealIds);
  }

  const { data, error } = await query.order('name', { ascending: true });

  if (error) throw error;
  return (data || []).map((meal) => dbMealToRecipe(meal as DbMeal));
}

export async function getAllCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('meals')
    .select('category')
    .not('category', 'is', null);

  if (error) throw error;
  
  const categories = Array.from(new Set((data || []).map(m => m.category).filter(Boolean)));
  return categories.sort();
}

export async function getAllAreas(): Promise<string[]> {
  const { data, error } = await supabase
    .from('meals')
    .select('area')
    .not('area', 'is', null);

  if (error) throw error;
  
  const areas = Array.from(new Set((data || []).map(m => m.area).filter(Boolean)));
  return areas.sort();
}

export async function getAllIngredients(): Promise<string[]> {
  return ingredients.map((i) => i.name).sort();
}

export function filterRecipesByPreferences(recipes: Recipe[], preferences?: RecipePreferences | null): Recipe[] {
  if (!preferences) return recipes;

  const preferredCategories = preferences.preferredCategories ?? [];
  const preferredAreas = preferences.preferredAreas ?? [];
  const excludedIngredients = preferences.excludedIngredients ?? [];
  const allergens = preferences.allergens ?? [];

  let filtered = recipes;

  if (preferredCategories.length > 0) {
    const preferredSet = new Set(preferredCategories);
    filtered = filtered.filter((r) => preferredSet.has(r.strCategory));
  }

  if (preferredAreas.length > 0) {
    const preferredSet = new Set(preferredAreas);
    filtered = filtered.filter((r) => preferredSet.has(r.strArea));
  }

  const excludedSet = new Set(excludedIngredients.map(normalize));
  const allergyKeywords = allergens.flatMap((a) => ALLERGEN_KEYWORDS[a as AllergenId] ?? []).map(normalize);

  if (excludedSet.size === 0 && allergyKeywords.length === 0) return filtered;

  return filtered.filter((r) => {
    const mealId = Number(r.idMeal);
    const ingredientNames = ingredientNamesLowerByMealId.get(mealId) ?? [];

    for (const name of ingredientNames) {
      if (excludedSet.has(name)) return false;
      if (allergyKeywords.length > 0 && allergyKeywords.some((k) => name.includes(k))) return false;
    }

    return true;
  });
}
