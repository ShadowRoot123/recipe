## Goal
- Add multi-language support (English + Amharic) across core UI (tabs, headers, screens, alerts, error messages) with a persistent language selector in Settings.

## Current State (Repo Survey)
- No existing i18n/localization setup; UI strings are hardcoded in screens and navigation.
- Settings exists and already persists theme via AsyncStorage; we’ll mirror that pattern for language.

## Approach
- Use i18next + react-i18next for translations.
- Use expo-localization to detect device language on first run.
- Store the user’s chosen language in AsyncStorage (so it persists offline and across restarts).

## Dependencies to Add
- i18next
- react-i18next
- expo-localization

## Files to Add
- src/i18n/index.ts (initialize i18next, load resources, set fallback language)
- src/i18n/locales/en.json (English strings)
- src/i18n/locales/am.json (Amharic strings)
- src/context/LocaleContext.tsx (language state + setLanguage + AsyncStorage persistence)

## Files to Update
- App.tsx
  - Import i18n initialization once.
  - Wrap providers with LocaleProvider so all screens can call useTranslation().
- src/navigation/AppNavigator.tsx
  - Replace tab names/titles and stack titles with translated labels.
  - Ensure titles update when language changes (by reading LocaleContext state inside navigators).
- src/screens/SettingsScreen.tsx
  - Add a “Language” section with selectable options (English / አማርኛ).
  - Persist selection and reflect current selection.
- Core screens/components with visible copy (replace hardcoded strings with t('...'))
  - src/screens/HomeScreen.tsx (Filters UI, section headers, list headings, fetch error)
  - src/screens/SearchScreen.tsx (placeholder, empty state, search error)
  - src/screens/FavoritesScreen.tsx (empty state)
  - src/screens/ShoppingListScreen.tsx (title, clear confirmation, empty state, “From:”)
  - src/screens/LoginScreen.tsx and src/screens/SignUpScreen.tsx (titles, placeholders, buttons, alerts)
  - src/screens/RecipeDetailScreen.tsx (buttons, headings, step mode labels, alerts, empty strings)

## Translation Key Structure (Proposed)
- nav.* (tabs, headers)
- settings.* (dark mode, language, login/logout)
- home.* (filters, sections)
- search.* (search UI)
- favorites.*
- shopping.*
- auth.* (login/signup)
- details.* (recipe detail UI)
- common.* (generic: cancel/confirm/success/error)

## Language Selection Rules
- On first run: pick device language if supported (am/en), else fallback to English.
- If user selects a language: override device language and persist.

## Verification
- Run the app and switch language in Settings; confirm:
  - Tab labels and header titles update immediately.
  - Core screens show translated strings.
  - Alerts and error popup messages are translated.
  - App restart keeps the selected language.

## Scope Note
- Recipe content from the external API (recipe names/instructions) remains as provided by the API; FR15 covers the app UI language and system messages.
