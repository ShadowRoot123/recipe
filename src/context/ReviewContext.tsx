import React, { createContext, useState, useContext, ReactNode } from 'react';

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
    addReview: (review: Omit<Review, 'id' | 'date'>) => void;
    getReviewsByRecipeId: (recipeId: string) => Review[];
}

const ReviewContext = createContext<ReviewContextType>({
    reviews: [],
    addReview: () => { },
    getReviewsByRecipeId: () => [],
});

export const useReviews = () => useContext(ReviewContext);

interface ReviewProviderProps {
    children: ReactNode;
}

export const ReviewProvider: React.FC<ReviewProviderProps> = ({ children }) => {
    const [reviews, setReviews] = useState<Review[]>([]);

    const addReview = (reviewData: Omit<Review, 'id' | 'date'>) => {
        const newReview: Review = {
            ...reviewData,
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
        };
        setReviews((prev) => [newReview, ...prev]);
    };

    const getReviewsByRecipeId = (recipeId: string) => {
        return reviews.filter((r) => r.recipeId === recipeId);
    };

    return (
        <ReviewContext.Provider value={{ reviews, addReview, getReviewsByRecipeId }}>
            {children}
        </ReviewContext.Provider>
    );
};
