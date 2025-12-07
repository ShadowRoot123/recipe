import React, { useState } from 'react';
import { View, TextInput, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { searchRecipes, Recipe } from '../services/api';
import RecipeCard from '../components/RecipeCard';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigator';

type SearchScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'Search'>,
    StackNavigationProp<RootStackParamList>
>;

import { useError } from '../context/ErrorContext';

const SearchScreen = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();
    const { showError } = useError();
    const navigation = useNavigation<SearchScreenNavigationProp>();

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const data = await searchRecipes(query);
            setResults(data);
        } catch (error) {
            showError('Failed to search recipes. Please try again.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
                <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="Search recipes..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />
            </View>
            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
            ) : (
                <FlatList
                    data={results}
                    renderItem={({ item }) => (
                        <RecipeCard
                            recipe={item}
                            onPress={() => navigation.navigate('Details', { recipeId: item.idMeal })}
                        />
                    )}
                    keyExtractor={(item) => item.idMeal}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        !loading && query ? (
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No results found</Text>
                        ) : null
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        padding: 12,
        margin: 16,
        borderRadius: 8,
        elevation: 2,
    },
    input: {
        fontSize: 16,
    },
    list: {
        paddingHorizontal: 16,
    },
    loader: {
        marginTop: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
});

export default SearchScreen;
