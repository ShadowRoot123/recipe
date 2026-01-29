import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import { useTheme } from '../context/ThemeContext';
import BootScreen from '../screens/BootScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import WelcomeIntroScreen from '../screens/onboarding/WelcomeIntroScreen';
import WelcomeAllergiesScreen from '../screens/onboarding/WelcomeAllergiesScreen';
import WelcomePreferencesScreen from '../screens/onboarding/WelcomePreferencesScreen';
import WelcomeFinishScreen from '../screens/onboarding/WelcomeFinishScreen';

export type RootStackParamList = {
    Boot: undefined;
    Onboarding: undefined;
    Main: undefined;
    Details: { recipeId: string };
    Preferences: undefined;
    Login: undefined;
    SignUp: undefined;
};

export type OnboardingStackParamList = {
    WelcomeIntro: undefined;
    WelcomeAllergies: undefined;
    WelcomePreferences: undefined;
    WelcomeFinish: undefined;
};

export type TabParamList = {
    Home: undefined;
    Search: undefined;
    Favorites: undefined;
    ShoppingList: undefined;
    Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const OnboardingStack = createStackNavigator<OnboardingStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const OnboardingNavigator = () => {
    const { theme } = useTheme();

    return (
        <OnboardingStack.Navigator screenOptions={{
            headerStyle: { backgroundColor: theme.colors.card },
            headerTintColor: theme.colors.text,
        }}>
            <OnboardingStack.Screen name="WelcomeIntro" component={WelcomeIntroScreen} options={{ headerShown: false }} />
            <OnboardingStack.Screen name="WelcomeAllergies" component={WelcomeAllergiesScreen} options={{ title: 'Allergies' }} />
            <OnboardingStack.Screen name="WelcomePreferences" component={WelcomePreferencesScreen} options={{ title: 'Preferences' }} />
            <OnboardingStack.Screen name="WelcomeFinish" component={WelcomeFinishScreen} options={{ headerShown: false }} />
        </OnboardingStack.Navigator>
    );
};

const TabNavigator = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Search') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'Favorites') {
                        iconName = focused ? 'heart' : 'heart-outline';
                    } else if (route.name === 'ShoppingList') {
                        iconName = focused ? 'cart' : 'cart-outline';
                    } else {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: theme.colors.card,
                    borderTopColor: theme.colors.border,
                },
                headerStyle: {
                    backgroundColor: theme.colors.card,
                },
                headerTintColor: theme.colors.text,
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: t('nav.home'), tabBarLabel: t('nav.home') }}
            />
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{ title: t('nav.search'), tabBarLabel: t('nav.search') }}
            />
            <Tab.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{ title: t('nav.favorites'), tabBarLabel: t('nav.favorites') }}
            />
            <Tab.Screen
                name="ShoppingList"
                component={ShoppingListScreen}
                options={{ title: t('nav.shoppingList'), tabBarLabel: t('nav.shoppingList') }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: t('nav.settings'), tabBarLabel: t('nav.settings') }}
            />
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    const { theme, isDark } = useTheme();
    const { t } = useTranslation();

    return (
        <NavigationContainer theme={{
            dark: isDark,
            colors: {
                primary: theme.colors.primary,
                background: theme.colors.background,
                card: theme.colors.card,
                text: theme.colors.text,
                border: theme.colors.border,
                notification: theme.colors.notification,
            },
            fonts: DefaultTheme.fonts,
        }}>
            <Stack.Navigator screenOptions={{
                headerStyle: { backgroundColor: theme.colors.card },
                headerTintColor: theme.colors.text,
            }}>
                <Stack.Screen name="Boot" component={BootScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Onboarding" component={OnboardingNavigator} options={{ headerShown: false }} />
                <Stack.Screen
                    name="Main"
                    component={TabNavigator}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Details"
                    component={RecipeDetailScreen}
                    options={{ title: t('nav.recipeDetails') }}
                />
                <Stack.Screen
                    name="Preferences"
                    component={PreferencesScreen}
                    options={{ title: t('settings.foodPreferences') }}
                />
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="SignUp"
                    component={SignUpScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
