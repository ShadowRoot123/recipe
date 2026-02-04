import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RecipeCard from '../RecipeCard';
import { Recipe } from '../../services/api';

// Mock the ThemeContext
jest.mock('../../context/ThemeContext', () => ({
    useTheme: () => ({
        theme: {
            colors: {
                card: '#ffffff',
                border: '#e0e0e0',
                text: '#000000',
                textSecondary: '#888888',
            },
        },
    }),
}));

const mockRecipe: Recipe = {
    idMeal: '123',
    strMeal: 'Test Recipe',
    strCategory: 'Test Category',
    strArea: 'Test Area',
    strInstructions: 'Do nothing',
    strMealThumb: 'https://example.com/image.jpg',
    strIngredient1: 'Ingredient 1',
    strMeasure1: '1 cup',
};

describe('RecipeCard', () => {
    it('renders correctly', () => {
        const onPress = jest.fn();
        const { getByText } = render(
            <RecipeCard recipe={mockRecipe} onPress={onPress} />
        );

        expect(getByText('Test Recipe')).toBeTruthy();
        expect(getByText('Test Category | Test Area')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
        const onPress = jest.fn();
        const { getByText } = render(
            <RecipeCard recipe={mockRecipe} onPress={onPress} />
        );

        fireEvent.press(getByText('Test Recipe'));
        expect(onPress).toHaveBeenCalledTimes(1);
    });
});
