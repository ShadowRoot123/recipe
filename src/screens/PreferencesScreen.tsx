import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { usePreferences } from '../context/PreferencesContext';
import { ALLERGENS, type AllergenId } from '../constants/allergens';
import { getAllAreas, getAllIngredients, getRecipes } from '../services/supabaseRecipes';

const normalize = (value: string) => value.trim().toLowerCase();

const isAllergenId = (value: string): value is AllergenId => {
  return ALLERGENS.some((a) => a.id === value);
};

const PreferencesScreen = () => {
  const { theme } = useTheme();
  const { preferences, updatePreferences, resetPreferences } = usePreferences();

  const commonIngredientExamples = useMemo(
    () => ['Milk', 'Eggs', 'Peanut Butter', 'Butter', 'Flour', 'Garlic', 'Onion', 'Tomato'],
    []
  );

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);

  const [ingredientQuery, setIngredientQuery] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const [areaQuery, setAreaQuery] = useState('');
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>(preferences.excludedIngredients ?? []);
  const [preferredCategories, setPreferredCategories] = useState<string[]>(preferences.preferredCategories ?? []);
  const [preferredAreas, setPreferredAreas] = useState<string[]>(preferences.preferredAreas ?? []);
  const [selectedAllergens, setSelectedAllergens] = useState<AllergenId[]>(
    (preferences.allergens ?? []).filter(isAllergenId)
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [allRecipes, allAreas, allIngredients] = await Promise.all([
          getRecipes(),
          getAllAreas(),
          getAllIngredients(),
        ]);
        const uniqueCats = Array.from(new Set(allRecipes.map((r) => r.strCategory).filter(Boolean)));
        setCategories(uniqueCats);
        setAreas(allAreas);
        setIngredients(allIngredients);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const ingredientSuggestions = useMemo(() => {
    const q = normalize(ingredientQuery);
    if (!q) return [];
    const excluded = new Set(excludedIngredients.map(normalize));
    return ingredients
      .filter((i) => {
        const key = normalize(i);
        return key.includes(q) && !excluded.has(key);
      })
      .slice(0, 12);
  }, [ingredientQuery, ingredients, excludedIngredients]);

  const ingredientExamples = useMemo(() => {
    const q = normalize(ingredientQuery);
    if (q) return [];

    const excluded = new Set(excludedIngredients.map(normalize));
    const byKey = new Map(ingredients.map((i) => [normalize(i), i] as const));

    const picked: string[] = [];
    for (const candidate of commonIngredientExamples) {
      const item = byKey.get(normalize(candidate));
      if (!item) continue;
      if (excluded.has(normalize(item))) continue;
      picked.push(item);
      if (picked.length >= 8) break;
    }

    if (picked.length >= 4) return picked;

    const fallback = ingredients
      .filter((i) => !excluded.has(normalize(i)))
      .slice(0, 8 - picked.length);

    return [...picked, ...fallback];
  }, [ingredientQuery, ingredients, excludedIngredients, commonIngredientExamples]);

  const categorySuggestions = useMemo(() => {
    const q = normalize(categoryQuery);
    if (!q) return [];
    const selected = new Set(preferredCategories.map(normalize));
    return categories
      .filter((c) => {
        const key = normalize(c);
        return key.includes(q) && !selected.has(key);
      })
      .slice(0, 12);
  }, [categoryQuery, categories, preferredCategories]);

  const categoryExamples = useMemo(() => {
    const q = normalize(categoryQuery);
    if (q) return [];
    const selected = new Set(preferredCategories.map(normalize));
    return [...categories]
      .sort((a, b) => a.localeCompare(b))
      .filter((c) => !selected.has(normalize(c)))
      .slice(0, 8);
  }, [categoryQuery, categories, preferredCategories]);

  const areaSuggestions = useMemo(() => {
    const q = normalize(areaQuery);
    if (!q) return [];
    const selected = new Set(preferredAreas.map(normalize));
    return areas
      .filter((a) => {
        const key = normalize(a);
        return key.includes(q) && !selected.has(key);
      })
      .slice(0, 12);
  }, [areaQuery, areas, preferredAreas]);

  const areaExamples = useMemo(() => {
    const q = normalize(areaQuery);
    if (q) return [];
    const selected = new Set(preferredAreas.map(normalize));
    return [...areas]
      .sort((a, b) => a.localeCompare(b))
      .filter((a) => !selected.has(normalize(a)))
      .slice(0, 8);
  }, [areaQuery, areas, preferredAreas]);

  const addItem = (list: string[], value: string, setList: (next: string[]) => void) => {
    if (list.includes(value)) return;
    setList([...list, value]);
  };

  const removeItem = (list: string[], value: string, setList: (next: string[]) => void) => {
    setList(list.filter((x) => x !== value));
  };

  const toggleAllergen = (id: AllergenId) => {
    setSelectedAllergens((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    await updatePreferences({
      allergens: selectedAllergens as any,
      excludedIngredients,
      preferredCategories,
      preferredAreas,
    });
  };

  const handleReset = async () => {
    await resetPreferences();
    setSelectedAllergens([]);
    setExcludedIngredients([]);
    setPreferredCategories([]);
    setPreferredAreas([]);
    setIngredientQuery('');
    setCategoryQuery('');
    setAreaQuery('');
  };

  if (loading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Allergies</Text>
        <View style={styles.chipContainer}>
          {ALLERGENS.map((a) => {
            const active = selectedAllergens.includes(a.id);
            return (
              <TouchableOpacity
                key={a.id}
                onPress={() => toggleAllergen(a.id)}
                style={[
                  styles.chip,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: active ? theme.colors.primary : theme.colors.card,
                  },
                ]}
                activeOpacity={0.85}
              >
                <Text style={[styles.chipText, { color: active ? '#FFF' : theme.colors.text }]}>{a.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.primary, marginTop: 18 }]}>Ingredients to avoid</Text>
        {excludedIngredients.length > 0 && (
          <View style={styles.chipContainer}>
            {excludedIngredients.map((ing) => (
              <TouchableOpacity
                key={ing}
                onPress={() => removeItem(excludedIngredients, ing, setExcludedIngredients)}
                style={[
                  styles.chip,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.primary },
                ]}
                activeOpacity={0.85}
              >
                <Text style={[styles.chipText, { color: '#FFF' }]}>{ing}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <TextInput
            value={ingredientQuery}
            onChangeText={setIngredientQuery}
            placeholder="Search ingredients..."
            placeholderTextColor={theme.colors.textSecondary}
            style={[styles.input, { color: theme.colors.text }]}
          />
        </View>
        {ingredientSuggestions.length > 0 && (
          <View style={[styles.suggestionList, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
            {ingredientSuggestions.map((ing, idx) => (
              <TouchableOpacity
                key={ing}
                onPress={() => {
                  addItem(excludedIngredients, ing, setExcludedIngredients);
                  setIngredientQuery('');
                }}
                style={[
                  styles.suggestionItem,
                  { borderBottomColor: theme.colors.border, borderBottomWidth: idx === ingredientSuggestions.length - 1 ? 0 : 1 },
                ]}
                activeOpacity={0.85}
              >
                <Text style={[styles.suggestionText, { color: theme.colors.text }]}>{ing}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {ingredientSuggestions.length === 0 && ingredientExamples.length > 0 && !ingredientQuery.trim() && (
          <>
            <Text style={[styles.exampleLabel, { color: theme.colors.textSecondary }]}>Examples</Text>
            <View style={styles.chipContainer}>
              {ingredientExamples.map((ing) => (
                <TouchableOpacity
                  key={ing}
                  onPress={() => addItem(excludedIngredients, ing, setExcludedIngredients)}
                  style={[styles.chip, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.chipText, { color: theme.colors.text }]}>{ing}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={[styles.sectionTitle, { color: theme.colors.primary, marginTop: 18 }]}>Preferred categories</Text>
        {preferredCategories.length > 0 && (
          <View style={styles.chipContainer}>
            {preferredCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => removeItem(preferredCategories, cat, setPreferredCategories)}
                style={[styles.chip, { borderColor: theme.colors.border, backgroundColor: theme.colors.primary }]}
                activeOpacity={0.85}
              >
                <Text style={[styles.chipText, { color: '#FFF' }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <TextInput
            value={categoryQuery}
            onChangeText={setCategoryQuery}
            placeholder="Search categories..."
            placeholderTextColor={theme.colors.textSecondary}
            style={[styles.input, { color: theme.colors.text }]}
          />
        </View>
        {categorySuggestions.length > 0 && (
          <View style={[styles.suggestionList, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
            {categorySuggestions.map((cat, idx) => (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  addItem(preferredCategories, cat, setPreferredCategories);
                  setCategoryQuery('');
                }}
                style={[
                  styles.suggestionItem,
                  { borderBottomColor: theme.colors.border, borderBottomWidth: idx === categorySuggestions.length - 1 ? 0 : 1 },
                ]}
                activeOpacity={0.85}
              >
                <Text style={[styles.suggestionText, { color: theme.colors.text }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {categorySuggestions.length === 0 && categoryExamples.length > 0 && !categoryQuery.trim() && (
          <>
            <Text style={[styles.exampleLabel, { color: theme.colors.textSecondary }]}>Examples</Text>
            <View style={styles.chipContainer}>
              {categoryExamples.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => addItem(preferredCategories, cat, setPreferredCategories)}
                  style={[styles.chip, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.chipText, { color: theme.colors.text }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={[styles.sectionTitle, { color: theme.colors.primary, marginTop: 18 }]}>Preferred areas</Text>
        {preferredAreas.length > 0 && (
          <View style={styles.chipContainer}>
            {preferredAreas.map((area) => (
              <TouchableOpacity
                key={area}
                onPress={() => removeItem(preferredAreas, area, setPreferredAreas)}
                style={[styles.chip, { borderColor: theme.colors.border, backgroundColor: theme.colors.primary }]}
                activeOpacity={0.85}
              >
                <Text style={[styles.chipText, { color: '#FFF' }]}>{area}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <TextInput
            value={areaQuery}
            onChangeText={setAreaQuery}
            placeholder="Search areas..."
            placeholderTextColor={theme.colors.textSecondary}
            style={[styles.input, { color: theme.colors.text }]}
          />
        </View>
        {areaSuggestions.length > 0 && (
          <View style={[styles.suggestionList, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
            {areaSuggestions.map((area, idx) => (
              <TouchableOpacity
                key={area}
                onPress={() => {
                  addItem(preferredAreas, area, setPreferredAreas);
                  setAreaQuery('');
                }}
                style={[
                  styles.suggestionItem,
                  { borderBottomColor: theme.colors.border, borderBottomWidth: idx === areaSuggestions.length - 1 ? 0 : 1 },
                ]}
                activeOpacity={0.85}
              >
                <Text style={[styles.suggestionText, { color: theme.colors.text }]}>{area}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {areaSuggestions.length === 0 && areaExamples.length > 0 && !areaQuery.trim() && (
          <>
            <Text style={[styles.exampleLabel, { color: theme.colors.textSecondary }]}>Examples</Text>
            <View style={styles.chipContainer}>
              {areaExamples.map((area) => (
                <TouchableOpacity
                  key={area}
                  onPress={() => addItem(preferredAreas, area, setPreferredAreas)}
                  style={[styles.chip, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.chipText, { color: theme.colors.text }]}>{area}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleReset} style={[styles.secondaryButton, { borderColor: theme.colors.border }]}>
          <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.primaryButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  input: {
    fontSize: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  suggestionList: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 10,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PreferencesScreen;
