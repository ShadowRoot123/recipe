import React, { createContext, useCallback, useMemo, useState, useContext, ReactNode } from 'react';
import { fetchMealComments, fetchMealRatings, upsertMealComment, upsertMealRating } from '../services/supabaseReviews';

export interface Review {
    id: string;
    recipeId: string;
    userId: string;
    userEmail: string;
    rating: number;
    comment: string;
    date: string;
}

interface ReviewContextType {
    reviews: Review[];
    loadReviews: (recipeId: string) => Promise<void>;
    addReview: (review: Omit<Review, 'id' | 'date'>) => Promise<void>;
    getReviewsByRecipeId: (recipeId: string) => Review[];
}

const ReviewContext = createContext<ReviewContextType>({
    reviews: [],
    loadReviews: async () => { },
    addReview: async () => { },
    getReviewsByRecipeId: () => [],
});

export const useReviews = () => useContext(ReviewContext);

interface ReviewProviderProps {
    children: ReactNode;
}

export const ReviewProvider: React.FC<ReviewProviderProps> = ({ children }) => {
    const [reviewsByRecipeId, setReviewsByRecipeId] = useState<Record<string, Review[]>>({});

    const loadReviews = useCallback(async (recipeId: string) => {
        const [comments, ratings] = await Promise.all([
            fetchMealComments(recipeId),
            fetchMealRatings(recipeId),
        ]);

        const ratingByUserId = new Map<string, number>();
        for (const r of ratings) {
            ratingByUserId.set(r.user_id, r.rating);
        }

        const mapped: Review[] = comments.map((c) => {
            const profile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;

            return {
                id: c.id,
                recipeId: c.meal_id,
                userId: c.user_id,
                userEmail: profile?.display_name?.trim() || 'Anonymous',
                rating: ratingByUserId.get(c.user_id) ?? 0,
                comment: c.body,
                date: c.created_at,
            };
        });

        setReviewsByRecipeId((prev) => ({ ...prev, [recipeId]: mapped }));
    }, []);

    const addReview = useCallback(async (reviewData: Omit<Review, 'id' | 'date'>) => {
        await Promise.all([
            upsertMealRating(reviewData.recipeId, reviewData.userId, reviewData.rating),
            upsertMealComment(reviewData.recipeId, reviewData.userId, reviewData.comment),
        ]);

        await loadReviews(reviewData.recipeId);
    }, [loadReviews]);

    const getReviewsByRecipeId = useCallback((recipeId: string) => {
        return reviewsByRecipeId[recipeId] ?? [];
    }, [reviewsByRecipeId]);

    const reviews = useMemo(() => Object.values(reviewsByRecipeId).flat(), [reviewsByRecipeId]);

    return (
        <ReviewContext.Provider value={{ reviews, loadReviews, addReview, getReviewsByRecipeId }}>
            {children}
        </ReviewContext.Provider>
    );
};
