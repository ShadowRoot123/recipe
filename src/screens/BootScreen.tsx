import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { usePreferences } from '../context/PreferencesContext';
import { useAuth } from '../context/AuthContext';

const BootScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { isLoading, hasCompletedOnboarding } = usePreferences();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (isLoading || authLoading) return;

    const target = hasCompletedOnboarding ? 'Main' : 'Onboarding';
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: target }],
      })
    );
  }, [isLoading, authLoading, hasCompletedOnboarding, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BootScreen;

