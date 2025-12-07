import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { getRecipes, Recipe } from '../services/api';
import RecipeCard from '../components/RecipeCard';
import { useTheme } from '../context/ThemeContext';
import { useError } from '../context/ErrorContext';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'Home'>,
    StackNavigationProp<RootStackParamList>
>;

const HomeScreen = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const { showError } = useError();
    const navigation = useNavigation<HomeScreenNavigationProp>();

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        setLoading(true);
        try {
            const data = await getRecipes();
            setRecipes(data);
        } catch (error) {
            showError('Failed to fetch recipes. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Recipe }) => (
        <RecipeCard
            recipe={item}
            onPress={() => navigation.navigate('Details', { recipeId: item.idMeal })}
        />
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
            ) : (
                <FlatList
                    data={recipes}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.idMeal}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: 16,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default HomeScreen;
