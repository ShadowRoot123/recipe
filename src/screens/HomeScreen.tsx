import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, Text, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { getRecipes, getRecipesByFilter, getAllAreas, getAllIngredients, Recipe, filterRecipesByPreferences } from '../services/api';
import RecipeCard from '../components/RecipeCard';
import { useTheme } from '../context/ThemeContext';
import { useError } from '../context/ErrorContext';
import { usePreferences } from '../context/PreferencesContext';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

type HomeScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'Home'>,
    StackNavigationProp<RootStackParamList>
>;

const HomeScreen = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedArea, setSelectedArea] = useState<string>('All');
    const [selectedIngredient, setSelectedIngredient] = useState<string>('All');

    const [categories, setCategories] = useState<string[]>(['All']);
    const [areas, setAreas] = useState<string[]>(['All']);
    const [ingredients, setIngredients] = useState<string[]>(['All']);

    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);

    const { theme } = useTheme();
    const { showError } = useError();
    const { preferences } = usePreferences();
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { t } = useTranslation();

    useEffect(() => {
        loadFilters();
        fetchRecipes();
    }, []);

    useEffect(() => {
        fetchRecipes();
    }, [selectedCategory, selectedArea, selectedIngredient]);

    const loadFilters = async () => {
        try {
            const [allRecipes, allAreas, allIngredients] = await Promise.all([
                getRecipes(),
                getAllAreas(),
                getAllIngredients()
            ]);
            
            const uniqueCats = Array.from(new Set(allRecipes.map(d => d.strCategory).filter(Boolean)));
            setCategories(['All', ...uniqueCats]);
            setAreas(['All', ...allAreas]);
            setIngredients(['All', ...allIngredients]);
        } catch (error) {
            console.log('Failed to load filters');
        }
    };

    const fetchRecipes = async () => {
        setLoading(true);
        try {
            const data = await getRecipesByFilter(selectedCategory, selectedArea, selectedIngredient);
            const filteredByPrefs = filterRecipesByPreferences(data, preferences as any);
            setRecipes(filteredByPrefs);
            
            // Generate recommendations if filtering is active or just shuffle some
            if (filteredByPrefs.length > 0) {
                const shuffled = [...filteredByPrefs].sort(() => 0.5 - Math.random());
                setRecommendedRecipes(shuffled.slice(0, 5));
            } else {
                 const all = await getRecipes();
                 const allFiltered = filterRecipesByPreferences(all, preferences as any);
                 const shuffled = [...allFiltered].sort(() => 0.5 - Math.random());
                 setRecommendedRecipes(shuffled.slice(0, 5));
            }
        } catch (error) {
            showError(t('home.errors.fetchRecipes'));
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

    const renderRecommendedItem = ({ item }: { item: Recipe }) => (
        <TouchableOpacity
            style={[styles.recCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('Details', { recipeId: item.idMeal })}
        >
            <Image source={{ uri: item.strMealThumb }} style={styles.recImage} cachePolicy="memory-disk" />
            <View style={styles.recContent}>
                <Text numberOfLines={1} style={[styles.recTitle, { color: theme.colors.text }]}>{item.strMeal}</Text>
                <Text style={[styles.recMeta, { color: theme.colors.textSecondary }]}>{item.strCategory}</Text>
            </View>
        </TouchableOpacity>
    );

    const filtered = recipes;

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
                            {categories.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => setSelectedCategory(cat)}
                                    style={[
                                        styles.modalChip,
                                        { 
                                            borderColor: theme.colors.border,
                                            backgroundColor: selectedCategory === cat ? theme.colors.primary : theme.colors.background 
                                        }
                                    ]}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        { color: selectedCategory === cat ? '#FFF' : theme.colors.text }
                                    ]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.filterLabel, { color: theme.colors.primary }]}>{t('home.area')}</Text>
                        <View style={styles.chipContainer}>
                            {areas.map(area => (
                                <TouchableOpacity
                                    key={area}
                                    onPress={() => setSelectedArea(area)}
                                    style={[
                                        styles.modalChip,
                                        { 
                                            borderColor: theme.colors.border,
                                            backgroundColor: selectedArea === area ? theme.colors.primary : theme.colors.background 
                                        }
                                    ]}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        { color: selectedArea === area ? '#FFF' : theme.colors.text }
                                    ]}>{area}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.filterLabel, { color: theme.colors.primary }]}>{t('home.mainIngredient')}</Text>
                        <View style={styles.chipContainer}>
                            {ingredients.map(ing => (
                                <TouchableOpacity
                                    key={ing}
                                    onPress={() => setSelectedIngredient(ing)}
                                    style={[
                                        styles.modalChip,
                                        { 
                                            borderColor: theme.colors.border,
                                            backgroundColor: selectedIngredient === ing ? theme.colors.primary : theme.colors.background 
                                        }
                                    ]}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        { color: selectedIngredient === ing ? '#FFF' : theme.colors.text }
                                    ]}>{ing}</Text>
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
            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
            ) : (
                <>
                    <View style={styles.headerContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
                            <TouchableOpacity
                                onPress={() => setIsFilterVisible(true)}
                                style={[styles.filterButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                            >
                                <Ionicons name="options-outline" size={20} color={theme.colors.text} />
                            </TouchableOpacity>
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
                        ListHeaderComponent={
                            <>
                                {recommendedRecipes.length > 0 && (
                                    <View style={styles.sectionContainer}>
                                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('home.recommendedForYou')}</Text>
                                        <FlatList
                                            horizontal
                                            data={recommendedRecipes}
                                            renderItem={renderRecommendedItem}
                                            keyExtractor={(item) => item.idMeal}
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.recList}
                                        />
                                    </View>
                                )}
                                <Text style={[styles.sectionTitle, { color: theme.colors.text, paddingHorizontal: 16, marginTop: 8 }]}>
                                    {selectedCategory === 'All' && selectedArea === 'All' && selectedIngredient === 'All' ? t('home.allRecipes') : t('home.filteredResults')}
                                </Text>
                            </>
                        }
                        data={filtered}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.idMeal}
                        contentContainerStyle={styles.list}
                    />
                    {renderFilterModal()}
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
    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
    },
    filtersRow: {
        alignItems: 'center',
    },
    filterButton: {
        borderWidth: 1,
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 8,
        marginRight: 8,
        justifyContent: 'center',
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        height: '70%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalBody: {
        flex: 1,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    modalChip: {
        borderWidth: 1,
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    resetButton: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    resetButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    sectionContainer: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
        marginBottom: 12,
    },
    recList: {
        paddingHorizontal: 16,
    },
    recCard: {
        width: 160,
        marginRight: 12,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    recImage: {
        width: '100%',
        height: 100,
    },
    recContent: {
        padding: 8,
    },
    recTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    recMeta: {
        fontSize: 12,
    },
});

export default HomeScreen;
