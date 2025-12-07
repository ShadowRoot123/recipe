import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { getRecipeById, Recipe } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useRecipes } from '../context/RecipeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install or use standard icons

type RecipeDetailRouteProp = RouteProp<RootStackParamList, 'Details'>;

import { useError } from '../context/ErrorContext';

const RecipeDetailScreen = () => {
    const route = useRoute<RecipeDetailRouteProp>();
    const { recipeId } = route.params;
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const { showError } = useError();
    const { isFavorite, addFavorite, removeFavorite } = useRecipes();
    const navigation = useNavigation();

    useEffect(() => {
        fetchDetails();
    }, [recipeId]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const data = await getRecipeById(recipeId);
            setRecipe(data);
        } catch (error) {
            showError('Failed to load recipe details.');
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = () => {
        if (!recipe) return;
        if (isFavorite(recipe.idMeal)) {
            removeFavorite(recipe.idMeal);
        } else {
            addFavorite(recipe);
        }
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!recipe) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.text }}>Recipe not found</Text>
            </View>
        );
    }

    // Parse ingredients
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== '') {
            ingredients.push(`${measure ? measure : ''} ${ingredient}`);
        }
    }

    const isFav = isFavorite(recipe.idMeal);

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Image source={{ uri: recipe.strMealThumb }} style={styles.image} />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>{recipe.strMeal}</Text>
                    <TouchableOpacity onPress={toggleFavorite}>
                        <Ionicons
                            name={isFav ? 'heart' : 'heart-outline'}
                            size={28}
                            color={isFav ? theme.colors.primary : theme.colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.subtitle, { color: theme.colors.primary }]}>Ingredients</Text>
                {ingredients.map((ing, index) => (
                    <Text key={index} style={[styles.text, { color: theme.colors.text }]}>• {ing}</Text>
                ))}

                <Text style={[styles.subtitle, { color: theme.colors.primary, marginTop: 20 }]}>Instructions</Text>
                <Text style={[styles.text, { color: theme.colors.text }]}>{recipe.strInstructions}</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 250,
    },
    content: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        flex: 1,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    text: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 4,
    },
});

export default RecipeDetailScreen;
