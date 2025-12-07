import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useRecipes } from '../context/RecipeContext';
import RecipeCard from '../components/RecipeCard';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigator';

type FavoritesScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'Favorites'>,
    StackNavigationProp<RootStackParamList>
>;

const FavoritesScreen = () => {
    const { favorites } = useRecipes();
    const { theme } = useTheme();
    const navigation = useNavigation<FavoritesScreenNavigationProp>();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                data={favorites}
                renderItem={({ item }) => (
                    <RecipeCard
                        recipe={item}
                        onPress={() => navigation.navigate('Details', { recipeId: item.idMeal })}
                    />
                )}
                keyExtractor={(item) => item.idMeal}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                        No favorites yet. Start exploring!
                    </Text>
                }
            />
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
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
});

export default FavoritesScreen;
