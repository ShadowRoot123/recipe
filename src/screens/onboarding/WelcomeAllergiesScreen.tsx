import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { usePreferences } from '../../context/PreferencesContext';
import { ALLERGENS, type AllergenId } from '../../constants/allergens';

const isAllergenId = (value: string): value is AllergenId => {
  return ALLERGENS.some((a) => a.id === value);
};

const WelcomeAllergiesScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { preferences, updatePreferences } = usePreferences();

  const initial = useMemo<AllergenId[]>(
    () => (preferences.allergens ?? []).filter(isAllergenId),
    [preferences.allergens]
  );

  const [selected, setSelected] = useState<AllergenId[]>(initial);

  const toggle = (id: AllergenId) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleNext = async () => {
    await updatePreferences({ allergens: selected });
    navigation.navigate('WelcomePreferences');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Allergies</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Select any allergies. Meals containing matching ingredients will be hidden.
      </Text>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.chipContainer}>
          {ALLERGENS.map((a) => {
            const active = selected.includes(a.id);
            return (
              <TouchableOpacity
                key={a.id}
                onPress={() => toggle(a.id)}
                style={[
                  styles.chip,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: active ? theme.colors.primary : theme.colors.card,
                  },
                ]}
                activeOpacity={0.85}
              >
                <Text style={[styles.chipText, { color: active ? '#FFF' : theme.colors.text }]}>
                  {a.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.primaryButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  content: {
    paddingBottom: 20,
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
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
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

export default WelcomeAllergiesScreen;

