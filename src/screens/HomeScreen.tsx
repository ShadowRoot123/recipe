import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
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
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [categories, setCategories] = useState<string[]>(['All']);
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
            const uniqueCats = Array.from(new Set(data.map(d => d.strCategory).filter(Boolean)));
            setCategories(['All', ...uniqueCats]);
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

    const filtered = selectedCategory === 'All' ? recipes : recipes.filter(r => r.strCategory === selectedCategory);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>        
            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
            ) : (
                <>
                    <View style={styles.filtersContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
                            {categories.map((cat) => {
                                const selected = cat === selectedCategory;
                                return (
                                    <TouchableOpacity
                                        key={cat}
                                        onPress={() => setSelectedCategory(cat)}
                                        style={[
                                            styles.chip,
                                            { borderColor: theme.colors.border, backgroundColor: selected ? theme.colors.primary : theme.colors.card },
                                        ]}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.chipText, { color: selected ? theme.colors.background : theme.colors.textSecondary }]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                    <FlatList
                        data={filtered}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.idMeal}
                        contentContainerStyle={styles.list}
                    />
                </>
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
    filtersContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
    },
    filtersRow: {
        alignItems: 'center',
    },
    chip: {
        borderWidth: 1,
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 8,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
    },
});

export default HomeScreen;
