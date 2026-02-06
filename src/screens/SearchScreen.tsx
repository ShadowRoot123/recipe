import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, TextInput, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { filterRecipesByPreferences, getAllAreas, getAllIngredients, getRecipes, getRecipesByFilter } from '../services/supabaseRecipes';
import type { Recipe } from '../services/api';
import RecipeCard from '../components/RecipeCard';
import { useTheme } from '../context/ThemeContext';
import { usePreferences } from '../context/PreferencesContext';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigator';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SearchScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'Search'>,
    StackNavigationProp<RootStackParamList>
>;

import { useError } from '../context/ErrorContext';

const SearchScreen = () => {
    const [query, setQuery] = useState('');
    const [lastExecutedQuery, setLastExecutedQuery] = useState('');
    const [results, setResults] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [isRestoring, setIsRestoring] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedArea, setSelectedArea] = useState<string>('All');
    const [selectedIngredient, setSelectedIngredient] = useState<string>('All');

    const [categories, setCategories] = useState<string[]>(['All']);
    const [areas, setAreas] = useState<string[]>(['All']);
    const [ingredients, setIngredients] = useState<string[]>(['All']);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const { theme } = useTheme();
    const { preferences } = usePreferences();
    const { showError } = useError();
    const navigation = useNavigation<SearchScreenNavigationProp>();
    const { t } = useTranslation();

    const SEARCH_STATE_STORAGE_KEY = 'searchScreenState';

    const hasActiveFilters = useMemo(() => {
        return selectedCategory !== 'All' || selectedArea !== 'All' || selectedIngredient !== 'All';
    }, [selectedArea, selectedCategory, selectedIngredient]);

    const hasSearchContext = useMemo(() => {
        return Boolean(lastExecutedQuery.trim()) || hasActiveFilters;
    }, [hasActiveFilters, lastExecutedQuery]);

    const loadFilters = useCallback(async () => {
        try {
            const [allRecipes, allAreas, allIngredients] = await Promise.all([
                getRecipes(),
                getAllAreas(),
                getAllIngredients(),
            ]);

            const uniqueCats = Array.from(new Set(allRecipes.map((d) => d.strCategory).filter(Boolean)));
            setCategories(['All', ...uniqueCats]);
            setAreas(['All', ...allAreas]);
            setIngredients(['All', ...allIngredients]);
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        loadFilters();
    }, [loadFilters]);

    const persistSearchState = useCallback(
        async (next: {
            query: string;
            lastExecutedQuery: string;
            results: Recipe[];
            selectedCategory: string;
            selectedArea: string;
            selectedIngredient: string;
        }) => {
            try {
                await AsyncStorage.setItem(SEARCH_STATE_STORAGE_KEY, JSON.stringify(next));
            } catch {
                // ignore
            }
        },
        []
    );

    const restoreSearchState = useCallback(async () => {
        setIsRestoring(true);
        try {
            const raw = await AsyncStorage.getItem(SEARCH_STATE_STORAGE_KEY);
            if (!raw) return;

            const parsed = JSON.parse(raw) as Partial<{
                query: unknown;
                lastExecutedQuery: unknown;
                results: unknown;
                selectedCategory: unknown;
                selectedArea: unknown;
                selectedIngredient: unknown;
            }>;

            const restoredQuery = typeof parsed.query === 'string' ? parsed.query : '';
            const restoredExecutedQuery = typeof parsed.lastExecutedQuery === 'string' ? parsed.lastExecutedQuery : restoredQuery;

            setQuery(restoredQuery);
            setLastExecutedQuery(restoredExecutedQuery);
            setSelectedCategory(typeof parsed.selectedCategory === 'string' ? parsed.selectedCategory : 'All');
            setSelectedArea(typeof parsed.selectedArea === 'string' ? parsed.selectedArea : 'All');
            setSelectedIngredient(typeof parsed.selectedIngredient === 'string' ? parsed.selectedIngredient : 'All');

            if (Array.isArray(parsed.results)) {
                setResults(parsed.results as Recipe[]);
            }
        } catch {
            // ignore
        } finally {
            setIsRestoring(false);
        }
    }, []);

    useEffect(() => {
        restoreSearchState();
    }, [restoreSearchState]);

    const runSearch = useCallback(
        async (nextQuery: string) => {
            const normalized = nextQuery.trim().toLowerCase();
            if (!normalized && !hasActiveFilters) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const base = await getRecipesByFilter(selectedCategory, selectedArea, selectedIngredient);
                const searched = normalized
                    ? base.filter((r) => r.strMeal.toLowerCase().includes(normalized))
                    : base;
                const filtered = filterRecipesByPreferences(searched, preferences as any);
                setResults(filtered);
                await persistSearchState({
                    query: nextQuery.trim(),
                    lastExecutedQuery: nextQuery.trim(),
                    results: filtered,
                    selectedCategory,
                    selectedArea,
                    selectedIngredient,
                });
            } catch {
                showError(t('search.errors.searchFailed'));
                setResults([]);
            } finally {
                setLoading(false);
            }
        },
        [
            hasActiveFilters,
            persistSearchState,
            preferences,
            selectedArea,
            selectedCategory,
            selectedIngredient,
            showError,
            t,
        ]
    );

    const handleSearch = useCallback(async () => {
        const trimmed = query.trim();
        setQuery(trimmed);
        setLastExecutedQuery(trimmed);
        await runSearch(trimmed);
    }, [query, runSearch]);

    useEffect(() => {
        if (isRestoring) return;
        if (!lastExecutedQuery && !hasActiveFilters) return;
        runSearch(lastExecutedQuery);
    }, [hasActiveFilters, isRestoring, lastExecutedQuery, runSearch]);

    const renderFilterModal = () => (
        <Modal
            visible={isFilterVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsFilterVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('home.filters')}</Text>
                        <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                            <Ionicons name="close" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <Text style={[styles.filterLabel, { color: theme.colors.primary }]}>{t('home.category')}</Text>
                        <View style={styles.chipContainer}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => setSelectedCategory(cat)}
                                    style={[
                                        styles.modalChip,
                                        {
                                            borderColor: theme.colors.border,
                                            backgroundColor: selectedCategory === cat ? theme.colors.primary : theme.colors.background,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            { color: selectedCategory === cat ? '#FFF' : theme.colors.text },
                                        ]}
                                    >
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.filterLabel, { color: theme.colors.primary }]}>{t('home.area')}</Text>
                        <View style={styles.chipContainer}>
                            {areas.map((area) => (
                                <TouchableOpacity
                                    key={area}
                                    onPress={() => setSelectedArea(area)}
                                    style={[
                                        styles.modalChip,
                                        {
                                            borderColor: theme.colors.border,
                                            backgroundColor: selectedArea === area ? theme.colors.primary : theme.colors.background,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            { color: selectedArea === area ? '#FFF' : theme.colors.text },
                                        ]}
                                    >
                                        {area}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.filterLabel, { color: theme.colors.primary }]}>{t('home.mainIngredient')}</Text>
                        <View style={styles.chipContainer}>
                            {ingredients.map((ing) => (
                                <TouchableOpacity
                                    key={ing}
                                    onPress={() => setSelectedIngredient(ing)}
                                    style={[
                                        styles.modalChip,
                                        {
                                            borderColor: theme.colors.border,
                                            backgroundColor: selectedIngredient === ing ? theme.colors.primary : theme.colors.background,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            { color: selectedIngredient === ing ? '#FFF' : theme.colors.text },
                                        ]}
                                    >
                                        {ing}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.resetButton, { backgroundColor: theme.colors.error }]}
                        onPress={() => {
                            setSelectedCategory('All');
                            setSelectedArea('All');
                            setSelectedIngredient('All');
                        }}
                    >
                        <Text style={styles.resetButtonText}>{t('home.resetFilters')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
                <View style={styles.searchRow}>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text }]}
                        placeholder={t('search.placeholder')}
                        placeholderTextColor={theme.colors.textSecondary}
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    <TouchableOpacity
                        onPress={() => setIsFilterVisible(true)}
                        style={[styles.filterButton, { borderColor: theme.colors.border }]}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="options-outline" size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>
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
                        !loading && hasSearchContext ? (
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>{t('search.noResults')}</Text>
                        ) : null
                    }
                />
            )}
            {renderFilterModal()}
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
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        fontSize: 16,
        flex: 1,
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        marginLeft: 10,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
        height: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    modalBody: {
        flex: 1,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 8,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    modalChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
        marginBottom: 8,
    },
    chipText: {
        fontSize: 14,
    },
    resetButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    resetButtonText: {
        color: '#FFF',
        fontWeight: '600',
    },
});

export default SearchScreen;
