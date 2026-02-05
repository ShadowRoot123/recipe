import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Linking, TextInput, Alert, Modal, Vibration } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { getRecipeById, Recipe } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useRecipes } from '../context/RecipeContext';
import { useAuth } from '../context/AuthContext';
import { useReviews } from '../context/ReviewContext';
import { useShoppingList } from '../context/ShoppingListContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useError } from '../context/ErrorContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

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
    const { addItems } = useShoppingList();
    const { user } = useAuth();
    const { reviews, loadReviews, addReview, getReviewsByRecipeId } = useReviews();
    const navigation = useNavigation<RecipeDetailNavigationProp>();
    const { t } = useTranslation();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [servingSize, setServingSize] = useState(1);
    const [isStepMode, setIsStepMode] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Timer State
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const recipeReviews = getReviewsByRecipeId(recipeId);

    useEffect(() => {
        fetchDetails();
    }, [recipeId]);

    useEffect(() => {
        loadReviews(recipeId).catch(() => { });
    }, [loadReviews, recipeId]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimerActive(false);
        setTimeLeft(0);
    }, [currentStep, isStepMode]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const data = await getRecipeById(recipeId);
            setRecipe(data);
        } catch (error) {
            showError(t('details.errors.loadDetails'));
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

    const handleSubmitReview = async () => {
        if (rating === 0) {
            Alert.alert(t('common.error'), t('details.alerts.ratingRequired'));
            return;
        }
        if (!comment.trim()) {
            Alert.alert(t('common.error'), t('details.alerts.commentRequired'));
            return;
        }
        if (!user) {
            Alert.alert(t('common.error'), t('details.alerts.mustBeLoggedInToReview'));
            return;
        }

        try {
            await addReview({
                recipeId,
                userId: user.id,
                userEmail: user.email || 'Anonymous',
                rating,
                comment,
            });
            setRating(0);
            setComment('');
            Alert.alert(t('common.success'), t('details.alerts.reviewAddedMessage'));
        } catch {
            Alert.alert(t('common.error'), t('details.errors.loadDetails'));
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
                <Text style={{ color: theme.colors.text }}>{t('details.recipeNotFound')}</Text>
            </View>
        );
    }

    // Parse ingredients and apply serving size scaling
    const scaleAmount = (amountStr: string, factor: number): string => {
        if (factor === 1) return amountStr;
        // Simple regex to find numbers (integers or decimals) at the start
        const match = amountStr.match(/^(\d+(\.\d+)?|\d+\/\d+)/);
        if (match) {
            const numStr = match[0];
            let val = 0;
            if (numStr.includes('/')) {
                const [n, d] = numStr.split('/').map(Number);
                val = n / d;
            } else {
                val = parseFloat(numStr);
            }
            const scaled = val * factor;
            // Format to avoid long decimals
            const formatted = Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(2).replace(/\.?0+$/, '');
            return amountStr.replace(numStr, formatted);
        }
        return amountStr;
    };

    const ingredients: { name: string; measure: string }[] = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== '') {
            ingredients.push({
                name: ingredient,
                measure: measure ? scaleAmount(measure, servingSize) : ''
            });
        }
    }

    const handleAddToShoppingList = () => {
        const itemsToAdd = ingredients
            .map(ing => ({
                name: String(ing.name || '').trim(),
                measure: String(ing.measure || '').trim(),
                recipeId: recipe.idMeal,
                recipeName: recipe.strMeal,
            }))
            .filter(item => item.name.length > 0);

        if (itemsToAdd.length === 0) {
            Alert.alert(t('common.error'), t('details.alerts.nothingToAddMessage'));
            return;
        }

        addItems(itemsToAdd);
        Alert.alert(t('common.success'), t('details.addToListSuccessMessage'));
    };

    const tags = recipe.strTags ? recipe.strTags.split(',').map(t => t.trim()).filter(Boolean) : [];

    const isFav = isFavorite(recipe.idMeal);

    // Extract time from step text
    const extractTime = (text: string): number | null => {
        // Match patterns like "5 minutes", "10 mins", "1 hour"
        const regex = /(\d+)\s*(min|minute|hour|hr|sec|second)s?/i;
        const match = text.match(regex);
        if (match) {
            const val = parseInt(match[1], 10);
            const unit = match[2].toLowerCase();
            if (unit.startsWith('min')) return val * 60;
            if (unit.startsWith('hour') || unit.startsWith('hr')) return val * 3600;
            if (unit.startsWith('sec')) return val;
        }
        return null;
    };

    const startTimer = (seconds: number) => {
        setTimeLeft(seconds);
        setTimerActive(true);
        if (timerRef.current) clearInterval(timerRef.current);
        
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setTimerActive(false);
                    Vibration.vibrate([500, 500, 500]); // Vibrate 3 times
                    Alert.alert(t('details.alerts.timerDoneTitle'), t('details.alerts.timerDoneMessage'));
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimerActive(false);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const buildSteps = (raw: string): string[] => {
        const text = (raw || '').replace(/\r\n/g, '\n').trim();
        if (!text) return [t('details.noInstructions')];

        const lines = text
            .split('\n')
            .map(l => l.trim())
            .filter(Boolean);

        const numberedSteps: string[] = [];
        const numberedRegex = /(?:^|\n)\s*(?:step\s*)?(\d+)\s*[\).:\-]\s*(.+)/gi;
        let match: RegExpExecArray | null;
        while ((match = numberedRegex.exec(text)) !== null) {
            const body = (match[2] || '').trim();
            if (body) numberedSteps.push(body);
        }

        if (numberedSteps.length >= 2) return numberedSteps;

        if (lines.length >= 2) {
            return lines.map(l => l.replace(/^\s*(?:step\s*)?\d+\s*[\).:\-]\s*/i, '').trim()).filter(Boolean);
        }

        const sentences = text
            .split(/[.?!]\s+/)
            .map(s => s.trim())
            .filter(Boolean);

        return sentences.length >= 2 ? sentences : [text];
    };

    const steps = buildSteps(recipe.strInstructions);
    const safeStepIndex = Math.min(Math.max(currentStep, 0), Math.max(steps.length - 1, 0));
    const stepTime = extractTime(steps[safeStepIndex] || '');

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView 
                style={styles.container} 
                contentContainerStyle={{ paddingBottom: 40 }}
            >
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
                            <Text style={[styles.youtubeText, { color: theme.colors.primary }]}>{t('details.watchOnYoutube')}</Text>
                        </TouchableOpacity>
                    ) : null}

                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={[styles.subtitle, { color: theme.colors.primary, marginBottom: 4 }]}>{t('details.ingredients')}</Text>
                            <View style={styles.servingContainer}>
                                <Text style={[styles.servingLabel, { color: theme.colors.textSecondary }]}>{t('details.servings', { count: servingSize })}</Text>
                                <TouchableOpacity onPress={() => setServingSize(Math.max(1, servingSize - 1))} style={[styles.servingButton, { borderColor: theme.colors.border }]}>
                                    <Ionicons name="remove" size={16} color={theme.colors.text} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setServingSize(servingSize + 1)} style={[styles.servingButton, { borderColor: theme.colors.border }]}>
                                    <Ionicons name="add" size={16} color={theme.colors.text} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity onPress={handleAddToShoppingList} style={[styles.addButton, { borderColor: theme.colors.primary }]}>
                            <Ionicons name="cart-outline" size={20} color={theme.colors.primary} />
                            <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>{t('details.addToList')}</Text>
                        </TouchableOpacity>
                    </View>
                    {ingredients.map((ing, index) => (
                        <Text key={index} style={[styles.text, { color: theme.colors.text }]}>
                            • {ing.measure} {ing.name}
                        </Text>
                    ))}

                    {tags.length > 0 ? (
                        <>
                            <Text style={[styles.subtitle, { color: theme.colors.primary, marginTop: 20 }]}>{t('details.tags')}</Text>
                            <View style={styles.tagsContainer}>
                                {tags.map((tag, idx) => (
                                    <View key={idx} style={[styles.tagChip, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                        <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    ) : null}

                    <View style={styles.sectionHeader}>
                        <Text style={[styles.subtitle, { color: theme.colors.primary, marginBottom: 0 }]}>{t('details.instructions')}</Text>
                        <TouchableOpacity
                            style={[styles.stepButton, { backgroundColor: theme.colors.primary }]}
                            onPress={() => {
                                setCurrentStep(0);
                                setTimeLeft(0);
                                setTimerActive(false);
                                setIsStepMode(true);
                            }}
                        >
                            <Text style={styles.stepButtonText}>{t('details.startCooking')}</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.text, { color: theme.colors.text }]}>{recipe.strInstructions}</Text>

                    <View style={styles.divider} />

                    <Text style={[styles.subtitle, { color: theme.colors.primary, marginTop: 20 }]}>{t('details.reviewsTitle', { count: recipeReviews.length })}</Text>

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
                            <Text style={[styles.addReviewTitle, { color: theme.colors.text }]}>{t('details.addReview')}</Text>
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
                                placeholder={t('details.writeComment')}
                                placeholderTextColor={theme.colors.textSecondary}
                                value={comment}
                                onChangeText={setComment}
                                multiline
                            />
                            <TouchableOpacity
                                style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                                onPress={handleSubmitReview}
                            >
                                <Text style={styles.submitButtonText}>{t('details.submitReview')}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.loginButtonText}>{t('details.loginToAddReview')}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            <Modal
                visible={isStepMode}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsStepMode(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('details.step.title', { current: safeStepIndex + 1, total: steps.length })}</Text>
                        <TouchableOpacity onPress={() => setIsStepMode(false)}>
                            <Ionicons name="close-circle" size={32} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        <ScrollView contentContainerStyle={styles.modalScroll}>
                            <Text style={[styles.stepText, { color: theme.colors.text }]}>
                                {steps[safeStepIndex]}
                            </Text>

                            {stepTime && (
                                <View style={styles.timerContainer}>
                                    {timerActive ? (
                                        <View style={styles.activeTimer}>
                                            <Text style={[styles.timerText, { color: theme.colors.primary }]}>
                                                {formatTime(timeLeft)}
                                            </Text>
                                            <TouchableOpacity 
                                                style={[styles.timerButton, { backgroundColor: theme.colors.error }]}
                                                onPress={stopTimer}
                                            >
                                                <Ionicons name="stop" size={24} color="#FFF" />
                                                <Text style={styles.timerButtonText}>{t('details.step.stop')}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity 
                                            style={[styles.timerButton, { backgroundColor: theme.colors.primary }]}
                                            onPress={() => startTimer(stepTime)}
                                        >
                                            <Ionicons name="timer-outline" size={24} color="#FFF" />
                                            <Text style={styles.timerButtonText}>{t('details.step.startTimer', { minutes: Math.floor(stepTime / 60) })}</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </ScrollView>
                    </View>

                    <View style={[styles.modalFooter, { borderTopColor: theme.colors.border }]}>
                        <TouchableOpacity
                            style={[styles.navButton, { opacity: safeStepIndex === 0 ? 0.3 : 1 }]}
                            disabled={safeStepIndex === 0}
                            onPress={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                        >
                            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                            <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>{t('common.previous')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.navButton, { opacity: safeStepIndex >= steps.length - 1 ? 0.3 : 1 }]}
                            disabled={safeStepIndex >= steps.length - 1}
                            onPress={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
                        >
                            <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>{t('common.next')}</Text>
                            <Ionicons name="arrow-forward" size={24} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 16,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderRadius: 16,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    addButtonText: {
        fontSize: 12,
        fontWeight: '600',
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
    servingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    servingLabel: {
        fontSize: 14,
    },
    servingButton: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 4,
    },
    stepButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    stepButtonText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalScroll: {
        flexGrow: 1,
    },
    stepText: {
        fontSize: 24,
        textAlign: 'center',
        lineHeight: 36,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    navButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },
    timerContainer: {
        marginTop: 32,
        alignItems: 'center',
    },
    activeTimer: {
        alignItems: 'center',
        gap: 16,
    },
    timerText: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    timerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
    },
    timerButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default RecipeDetailScreen;
