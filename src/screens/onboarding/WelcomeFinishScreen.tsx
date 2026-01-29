import React from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { usePreferences } from '../../context/PreferencesContext';

const WelcomeFinishScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { preferences, setHasCompletedOnboarding } = usePreferences();

  const handleFinish = async () => {
    await setHasCompletedOnboarding(true);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      })
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>All set</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        We’ll filter meals based on your choices.
      </Text>

      <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          Allergies: {preferences.allergens.length}
        </Text>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          Excluded ingredients: {preferences.excludedIngredients.length}
        </Text>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          Preferred categories: {preferences.preferredCategories.length}
        </Text>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          Preferred areas: {preferences.preferredAreas.length}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleFinish}
        style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
      >
        <Text style={styles.primaryButtonText}>Finish</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 22,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 22,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default WelcomeFinishScreen;

