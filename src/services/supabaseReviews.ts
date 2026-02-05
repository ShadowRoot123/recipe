import { supabase } from './supabaseClient';

export type MealRatingRow = {
  meal_id: string;
  user_id: string;
  rating: number;
};

export type MealCommentRow = {
  id: string;
  meal_id: string;
  user_id: string;
  body: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  profiles?:
    | {
        display_name: string | null;
        avatar_url: string | null;
      }
    | {
        display_name: string | null;
        avatar_url: string | null;
      }[]
    | null;
};

export async function fetchMealComments(mealId: string): Promise<MealCommentRow[]> {
  const { data, error } = await supabase
    .from('meal_comments')
    .select('id, meal_id, user_id, body, is_deleted, created_at, updated_at, profiles(display_name, avatar_url)')
    .eq('meal_id', mealId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as MealCommentRow[];
}

export async function fetchMealRatings(mealId: string): Promise<MealRatingRow[]> {
  const { data, error } = await supabase
    .from('meal_ratings')
    .select('meal_id, user_id, rating')
    .eq('meal_id', mealId);

  if (error) throw error;
  return (data ?? []) as unknown as MealRatingRow[];
}

export async function upsertMealRating(mealId: string, userId: string, rating: number): Promise<void> {
  const { error } = await supabase
    .from('meal_ratings')
    .upsert({ meal_id: mealId, user_id: userId, rating }, { onConflict: 'meal_id,user_id' });

  if (error) throw error;
}

export async function upsertMealComment(mealId: string, userId: string, body: string): Promise<void> {
  const { error } = await supabase
    .from('meal_comments')
    .upsert({ meal_id: mealId, user_id: userId, body, is_deleted: false }, { onConflict: 'meal_id,user_id' });

  if (error) throw error;
}
