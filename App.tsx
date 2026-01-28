import React from 'react';
import { StatusBar } from 'expo-status-bar';
import './src/i18n';
import { ThemeProvider } from './src/context/ThemeContext';
import { RecipeProvider } from './src/context/RecipeContext';
import { AuthProvider } from './src/context/AuthContext';
import { ReviewProvider } from './src/context/ReviewContext';
import { ShoppingListProvider } from './src/context/ShoppingListContext';
import AppNavigator from './src/navigation/AppNavigator';
import { LocaleProvider } from './src/context/LocaleContext';

import { ErrorProvider } from './src/context/ErrorContext';
import ErrorPopup from './src/components/ErrorPopup';

export default function App() {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <AuthProvider>
          <ReviewProvider>
            <ErrorProvider>
              <RecipeProvider>
                <ShoppingListProvider>
                  <AppNavigator />
                  <ErrorPopup />
                  <StatusBar style="auto" />
                </ShoppingListProvider>
              </RecipeProvider>
            </ErrorProvider>
          </ReviewProvider>
        </AuthProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}
