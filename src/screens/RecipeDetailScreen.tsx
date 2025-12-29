import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Linking, TextInput, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { getRecipeById, Recipe } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useRecipes } from '../context/RecipeContext';
import { useAuth } from '../context/AuthContext';
import { useReviews } from '../context/ReviewContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useError } from '../context/ErrorContext';
import { StackNavigationProp } from '@react-navigation/stack';

type RecipeDetailRouteProp = RouteProp<RootStackParamList, 'Details'>;
type RecipeDetailNavigationProp = StackNavigationProp<RootStackParamList, 'Details'>;

const RecipeDetailScreen = () => {
    const route = useRoute<RecipeDetailRouteProp>();
    const { recipeId } = route.params;
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const { showError } = useError();
    const { isFavorite, addFavorite, removeFavorite } = useRecipes();
    const { user } = useAuth();
    const { reviews, addReview, getReviewsByRecipeId } = useReviews();
    const navigation = useNavigation<RecipeDetailNavigationProp>();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const recipeReviews = getReviewsByRecipeId(recipeId);

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

    const handleSubmitReview = () => {
        if (rating === 0) {
            Alert.alert('Error', 'Please select a rating');
            return;
        }
        if (!comment.trim()) {
            Alert.alert('Error', 'Please enter a comment');
            return;
        }
        if (!user) {
            Alert.alert('Error', 'You must be logged in to review');
            return;
        }

        addReview({
            recipeId,
            userId: user.uid,
            userEmail: user.email || 'Anonymous',
            rating,
            comment,
        });

        setRating(0);
        setComment('');
        Alert.alert('Success', 'Review added successfully');
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

    const tags = recipe.strTags ? recipe.strTags.split(',').map(t => t.trim()).filter(Boolean) : [];

    const isFav = isFavorite(recipe.idMeal);

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Image source={{ uri: recipe.strMealThumb }} style={styles.image} cachePolicy="memory-disk" />
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

                <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
                    {recipe.strCategory} | {recipe.strArea}
                </Text>

                {recipe.strYoutube ? (
                    <TouchableOpacity
                        style={[styles.youtubeButton, { borderColor: theme.colors.border }]}
                        onPress={() => Linking.openURL(String(recipe.strYoutube))}
                    >
                        <Ionicons name="logo-youtube" size={20} color={theme.colors.primary} />
                        <Text style={[styles.youtubeText, { color: theme.colors.primary }]}>Watch on YouTube</Text>
                    </TouchableOpacity>
                ) : null}

                <Text style={[styles.subtitle, { color: theme.colors.primary }]}>Ingredients</Text>
                {ingredients.map((ing, index) => (
                    <Text key={index} style={[styles.text, { color: theme.colors.text }]}>• {ing}</Text>
                ))}

                {tags.length > 0 ? (
                    <>
                        <Text style={[styles.subtitle, { color: theme.colors.primary, marginTop: 20 }]}>Tags</Text>
                        <View style={styles.tagsContainer}>
                            {tags.map((tag, idx) => (
                                <View key={idx} style={[styles.tagChip, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                    <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                ) : null}

                <Text style={[styles.subtitle, { color: theme.colors.primary, marginTop: 20 }]}>Instructions</Text>
                <Text style={[styles.text, { color: theme.colors.text }]}>{recipe.strInstructions}</Text>

                <View style={styles.divider} />

                <Text style={[styles.subtitle, { color: theme.colors.primary, marginTop: 20 }]}>Reviews ({recipeReviews.length})</Text>

                {recipeReviews.map((review) => (
                    <View key={review.id} style={[styles.reviewCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <View style={styles.reviewHeader}>
                            <Text style={[styles.reviewUser, { color: theme.colors.text }]}>{review.userEmail}</Text>
                            <View style={styles.ratingContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Ionicons
                                        key={star}
                                        name={star <= review.rating ? 'star' : 'star-outline'}
                                        size={16}
                                        color={theme.colors.accent}
                                    />
                                ))}
                            </View>
                        </View>
                        <Text style={[styles.reviewComment, { color: theme.colors.textSecondary }]}>{review.comment}</Text>
                        <Text style={[styles.reviewDate, { color: theme.colors.textSecondary }]}>{new Date(review.date).toLocaleDateString()}</Text>
                    </View>
                ))}

                {user ? (
                    <View style={[styles.addReviewContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <Text style={[styles.addReviewTitle, { color: theme.colors.text }]}>Add a Review</Text>
                        <View style={styles.ratingInput}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                    <Ionicons
                                        name={star <= rating ? 'star' : 'star-outline'}
                                        size={32}
                                        color={theme.colors.accent}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: theme.colors.background,
                                color: theme.colors.text,
                                borderColor: theme.colors.border
                            }]}
                            placeholder="Write your comment..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={comment}
                            onChangeText={setComment}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleSubmitReview}
                        >
                            <Text style={styles.submitButtonText}>Submit Review</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginButtonText}>Log in to add a review</Text>
                    </TouchableOpacity>
                )}
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
        paddingBottom: 40,
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
    meta: {
        fontSize: 14,
        marginBottom: 12,
    },
    text: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 4,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    tagChip: {
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderWidth: 1,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 12,
    },
    youtubeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    youtubeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 24,
    },
    reviewCard: {
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 16,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewUser: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    ratingContainer: {
        flexDirection: 'row',
    },
    reviewComment: {
        fontSize: 14,
        marginBottom: 8,
    },
    reviewDate: {
        fontSize: 12,
    },
    addReviewContainer: {
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 16,
    },
    addReviewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    ratingInput: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
        gap: 8,
    },
    input: {
        height: 100,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        textAlignVertical: 'top',
    },
    submitButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loginButton: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    loginButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default RecipeDetailScreen;
