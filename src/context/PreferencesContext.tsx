import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserPreferences = {
  allergens: string[];
  excludedIngredients: string[];
  preferredCategories: string[];
  preferredAreas: string[];
};

type PreferencesContextType = {
  preferences: UserPreferences;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => Promise<void>;
  setPreferences: (next: UserPreferences) => Promise<void>;
  updatePreferences: (patch: Partial<UserPreferences>) => Promise<void>;
  togglePreferenceItem: (key: keyof UserPreferences, value: string) => Promise<void>;
  resetPreferences: () => Promise<void>;
};

const DEFAULT_PREFERENCES: UserPreferences = {
  allergens: [],
  excludedIngredients: [],
  preferredCategories: [],
  preferredAreas: [],
};

const PreferencesContext = createContext<PreferencesContextType>({
  preferences: DEFAULT_PREFERENCES,
  isLoading: true,
  hasCompletedOnboarding: false,
  setHasCompletedOnboarding: async () => {},
  setPreferences: async () => {},
  updatePreferences: async () => {},
  togglePreferenceItem: async () => {},
  resetPreferences: async () => {},
});

const PREFERENCES_STORAGE_KEY = 'userPreferences';
const ONBOARDING_STORAGE_KEY = 'hasCompletedOnboarding';

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferencesState] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [prefsRaw, onboardingRaw] = await Promise.all([
          AsyncStorage.getItem(PREFERENCES_STORAGE_KEY),
          AsyncStorage.getItem(ONBOARDING_STORAGE_KEY),
        ]);

        if (prefsRaw) {
          const parsed = JSON.parse(prefsRaw) as Partial<UserPreferences>;
          setPreferencesState({
            allergens: Array.isArray(parsed.allergens) ? parsed.allergens : [],
            excludedIngredients: Array.isArray(parsed.excludedIngredients) ? parsed.excludedIngredients : [],
            preferredCategories: Array.isArray(parsed.preferredCategories) ? parsed.preferredCategories : [],
            preferredAreas: Array.isArray(parsed.preferredAreas) ? parsed.preferredAreas : [],
          });
        }

        setHasCompletedOnboardingState(onboardingRaw === 'true');
      } catch {
        setPreferencesState(DEFAULT_PREFERENCES);
        setHasCompletedOnboardingState(false);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const persistPreferences = async (next: UserPreferences) => {
    setPreferencesState(next);
    try {
      await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const setPreferences = async (next: UserPreferences) => {
    await persistPreferences(next);
  };

  const updatePreferences = async (patch: Partial<UserPreferences>) => {
    const next: UserPreferences = {
      allergens: patch.allergens ?? preferences.allergens,
      excludedIngredients: patch.excludedIngredients ?? preferences.excludedIngredients,
      preferredCategories: patch.preferredCategories ?? preferences.preferredCategories,
      preferredAreas: patch.preferredAreas ?? preferences.preferredAreas,
    };
    await persistPreferences(next);
  };

  const togglePreferenceItem = async (key: keyof UserPreferences, value: string) => {
    const current = preferences[key];
    const exists = current.includes(value);
    const nextItems = exists ? current.filter((v) => v !== value) : [...current, value];
    await updatePreferences({ [key]: nextItems } as Partial<UserPreferences>);
  };

  const resetPreferences = async () => {
    await persistPreferences(DEFAULT_PREFERENCES);
    try {
      await AsyncStorage.removeItem(PREFERENCES_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const setHasCompletedOnboarding = async (value: boolean) => {
    setHasCompletedOnboardingState(value);
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, value ? 'true' : 'false');
    } catch {
      // ignore
    }
  };

  const ctxValue = useMemo<PreferencesContextType>(
    () => ({
      preferences,
      isLoading,
      hasCompletedOnboarding,
      setHasCompletedOnboarding,
      setPreferences,
      updatePreferences,
      togglePreferenceItem,
      resetPreferences,
    }),
    [preferences, isLoading, hasCompletedOnboarding]
  );

  return <PreferencesContext.Provider value={ctxValue}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = () => useContext(PreferencesContext);

