import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/context/ThemeContext';
import { RecipeProvider } from './src/context/RecipeContext';
import { AuthProvider } from './src/context/AuthContext';
import { ReviewProvider } from './src/context/ReviewContext';
import AppNavigator from './src/navigation/AppNavigator';

import { ErrorProvider } from './src/context/ErrorContext';
import ErrorPopup from './src/components/ErrorPopup';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ReviewProvider>
          <ErrorProvider>
            <RecipeProvider>
              <AppNavigator />
              <ErrorPopup />
              <StatusBar style="auto" />
            </RecipeProvider>
          </ErrorProvider>
        </ReviewProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
