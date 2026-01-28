# Acceptance Criteria – MVP/P1

This document captures the acceptance criteria for the essential (P1) features of the Recipe App MVP.

- FR1 – Fetch Recipes
  - On app launch with internet, the app requests recipes and receives data without crashing.
  - Shows a loading indicator during fetch and an error message if the request fails.
  - Network failure or empty response shows a user-friendly retry option.

- FR2 – Display Recipe List
  - Home screen lists recipes with title, thumbnail image, category, and area visible in each card.
  - List is scrollable and performant; tapping a card navigates to the details screen.
  - Empty state appears when no recipes are available.

- FR3 – Search Recipes
  - Search screen has an input that filters recipes by name; results update responsively.
  - Shows loading, empty results, and error states appropriately.
  - Search is case-insensitive and returns expected matches.

- FR4 – View Recipe Details
  - Details screen displays recipe title, image, ingredients with measures, and instructions.
  - Back navigation works from details to the originating screen.
  - Long instructions are readable (scrollable) and formatted clearly.

- FR5 – Favorite Recipes
  - User can toggle favorite from the details screen; the icon/state reflects the change immediately.
  - Favorites screen lists all saved recipes and allows removal.
  - Duplicate favorites are prevented.

- FR6 – Offline Favorites
  - Favorites persist via local storage and are available after app restart with no internet.
  - Adding/removing favorites works offline and updates local storage.

- FR7 – Basic Navigation
  - Navigation includes Home, Details, Favorites, and Settings; all screens are accessible.
  - Header/back actions behave consistently across screens.

- FR8 – Error Handling
  - API and network errors are captured globally and displayed via a non-blocking popup/toast.
  - The app never crashes due to API errors; users can retry or continue browsing.