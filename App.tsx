import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/context/ThemeContext';
import { RecipeProvider } from './src/context/RecipeContext';
import AppNavigator from './src/navigation/AppNavigator';

import { ErrorProvider } from './src/context/ErrorContext';
import ErrorPopup from './src/components/ErrorPopup';

export default function App() {
  return (
    <ThemeProvider>
      <ErrorProvider>
        <RecipeProvider>
          <AppNavigator />
          <ErrorPopup />
          <StatusBar style="auto" />
        </RecipeProvider>
      </ErrorProvider>
    </ThemeProvider>
  );
}
