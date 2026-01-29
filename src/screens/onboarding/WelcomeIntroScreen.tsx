import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const WelcomeIntroScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Welcome</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Tell us your allergies and what you prefer so we can filter meals for you.
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('WelcomeAllergies')}
        style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
      >
        <Text style={styles.primaryButtonText}>Get Started</Text>
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
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 28,
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

export default WelcomeIntroScreen;

