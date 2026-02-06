import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Recipe } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Image } from 'expo-image';

interface RecipeCardProps {
    recipe: Recipe;
    onPress: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress }) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Image source={{ uri: recipe.strMealThumb }} style={styles.image} cachePolicy="memory-disk" />
            <View style={styles.info}>
                <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
                    {recipe.strMeal}
                </Text>
                <Text style={[styles.category, { color: theme.colors.textSecondary }]}>
                    {recipe.strCategory} | {recipe.strArea}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: 150,
    },
    info: {
        padding: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    category: {
        fontSize: 14,
    },
});

export default RecipeCard;
