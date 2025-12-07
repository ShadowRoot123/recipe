import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '../services/api';

interface RecipeContextType {
    favorites: Recipe[];
    addFavorite: (recipe: Recipe) => void;
    removeFavorite: (id: string) => void;
    isFavorite: (id: string) => boolean;
}

const RecipeContext = createContext<RecipeContextType>({
    favorites: [],
    addFavorite: () => { },
    removeFavorite: () => { },
    isFavorite: () => false,
});

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [favorites, setFavorites] = useState<Recipe[]>([]);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('favorites');
            if (jsonValue != null) {
                setFavorites(JSON.parse(jsonValue));
            }
        } catch (e) {
            console.log('Failed to load favorites');
        }
    };

    const saveFavorites = async (newFavorites: Recipe[]) => {
        try {
            const jsonValue = JSON.stringify(newFavorites);
            await AsyncStorage.setItem('favorites', jsonValue);
        } catch (e) {
            console.log('Failed to save favorites');
        }
    };

    const addFavorite = (recipe: Recipe) => {
        const newFavorites = [...favorites, recipe];
        setFavorites(newFavorites);
        saveFavorites(newFavorites);
    };

    const removeFavorite = (id: string) => {
        const newFavorites = favorites.filter(r => r.idMeal !== id);
        setFavorites(newFavorites);
        saveFavorites(newFavorites);
    };

    const isFavorite = (id: string) => {
        return favorites.some(r => r.idMeal === id);
    };

    return (
        <RecipeContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
            {children}
        </RecipeContext.Provider>
    );
};

export const useRecipes = () => useContext(RecipeContext);
