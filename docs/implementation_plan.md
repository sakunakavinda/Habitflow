# Multi-User Custom Habit Tracking with Firebase Auth & Firestore

Transform HabitWave into a multi-user, cloud-synced habit tracking platform where users can log in, create custom habits (with custom names, colors, and icons), delete/edit habits, and track daily completions backed by Firebase Authentication and Cloud Firestore.

---

## User Review Required

> [!IMPORTANT]
> **Firebase Project Credentials**:
> To connect your live Firebase project, you will need to provide your Firebase config keys (from the Firebase Console -> Project Settings -> General -> Web Apps).
> We will configure an environment file (`.env.local`) with placeholders:
> - `VITE_FIREBASE_API_KEY`
> - `VITE_FIREBASE_AUTH_DOMAIN`
> - `VITE_FIREBASE_PROJECT_ID`
> - `VITE_FIREBASE_STORAGE_BUCKET`
> - `VITE_FIREBASE_MESSAGING_SENDER_ID`
> - `VITE_FIREBASE_APP_ID`
>
> **Graceful Offline / Local Mode**:
> If Firebase credentials are not configured yet, the app will continue to run with local persistence and show a friendly banner guiding you to add the `.env.local` keys.

---

## Architecture & Data Schema

### 1. User's Firestore Hierarchy
```
users (Collection)
  └── {userId} (Document - created using Firebase Auth UID)
        ├── name: "Alex"
        ├── joinedAt: Timestamp
        │
        └── habits (Subcollection)
              └── {habitId} (Document - auto-generated ID)
                    ├── name: "Drink 2L Water"
                    ├── frequency: "daily"
                    ├── color: "#10b981" (custom accent color for calendar lines)
                    ├── icon: "droplets" (icon for detail dialogs & badges)
                    ├── createdAt: Timestamp
                    │
                    └── logs (Subcollection)
                          └── {dateString} (Document - e.g., "2026-09-17")
                                ├── completed: true
                                └── loggedAt: Timestamp
```

### 2. Firestore Sync & Query Strategy
- **Habits Listener**: `onSnapshot(collection(db, 'users', userId, 'habits'))` keeps the list of user habits updated in real time.
- **Monthly Logs Sync**:
  - We can query each habit's `logs` subcollection for the visible date range (or listen to `collectionGroup('logs')` / per-habit logs collection) to populate the calendar grid.
  - When a user toggles a habit on a day:
    - If completing: `setDoc(doc(db, 'users', userId, 'habits', habitId, 'logs', dateString), { completed: true, loggedAt: serverTimestamp() })`
    - If uncompleting: `deleteDoc(doc(db, 'users', userId, 'habits', habitId, 'logs', dateString))` or `{ completed: false }`.

### 3. Default Habits for New Accounts
When a new user registers, they are automatically initialized with 2 starter habits:
1. **Smoke-Free** (Emerald `#10b981`, `cigarette-off`)
2. **Workout** (Amber `#f59e0b`, `dumbbell`)
They can keep them, edit their names/colors, or delete them and add entirely new habits.

---

## Proposed Changes

### Dependencies
#### [MODIFY] [package.json](file:///Users/sakunakavinda/Documents/Web/calendar/package.json)
- Install `firebase` (`npm install firebase`).

---

### Firebase Core & Services
#### [NEW] [src/firebase/firebaseConfig.js](file:///Users/sakunakavinda/Documents/Web/calendar/src/firebase/firebaseConfig.js)
- Initializes Firebase app, `getAuth()`, and `getFirestore()`.
- Reads `import.meta.env.VITE_FIREBASE_*`.
- Exports `auth`, `db`, and helper `isFirebaseConfigured()`.

#### [NEW] [src/context/AuthContext.jsx](file:///Users/sakunakavinda/Documents/Web/calendar/src/context/AuthContext.jsx)
- React Context providing:
  - `user`: current Firebase user object (or `null`)
  - `loading`: auth state initialization flag
  - `signInWithEmail(email, password)`
  - `signUpWithEmail(email, password, displayName)`
  - `signInWithGoogle()`
  - `logout()`
  - `isConfigured`: boolean flag if Firebase keys are detected

#### [NEW] [src/hooks/useUserHabits.js](file:///Users/sakunakavinda/Documents/Web/calendar/src/hooks/useUserHabits.js)
- Replaces hardcoded two-habit hook with a real-time Firestore synchronization hook:
  - Real-time `onSnapshot` listener on `/users/{userId}/habits`
  - Real-time `onSnapshot` listener on `/users/{userId}/entries`
  - `addHabit({ name, color, icon })`
  - `updateHabit(habitId, updates)`
  - `deleteHabit(habitId)`
  - `toggleHabitForDay(dateKey, habitId)`
  - `clearDay(dateKey)`
  - Offline fallback to LocalStorage if user is not logged in or Firebase is unconfigured.

---

### UI Components

#### [NEW] [src/components/AuthModal.jsx](file:///Users/sakunakavinda/Documents/Web/calendar/src/components/AuthModal.jsx)
- Premium dark glassmorphic modal with:
  - Sign In / Create Account toggle
  - Google One-Click Sign In
  - Email & Password fields with live validation
  - Error toast / feedback display

#### [NEW] [src/components/ManageHabitsModal.jsx](file:///Users/sakunakavinda/Documents/Web/calendar/src/components/ManageHabitsModal.jsx)
- Modal allowing users to:
  - View all their active habits with custom colors & icons
  - Create a new habit with name input, color swatch picker (8 curated palette colors), and icon picker
  - Delete an existing habit (with confirmation)
  - Edit habit name and color

#### [MODIFY] [src/components/CalendarHeader.jsx](file:///Users/sakunakavinda/Documents/Web/calendar/src/components/CalendarHeader.jsx) & [App.jsx](file:///Users/sakunakavinda/Documents/Web/calendar/src/App.jsx)
- Add User Profile Button / Login Button in the top header:
  - When logged out: Shows `"Sign In"` button with User icon.
  - When logged in: Shows User Avatar / Name with a dropdown menu (*"Manage Habits"*, *"Sign Out"*).
- Add *"Manage Habits"* button in the top action bar.

#### [MODIFY] [src/components/CalendarGrid.jsx](file:///Users/sakunakavinda/Documents/Web/calendar/src/components/CalendarGrid.jsx)
- Dynamically render habit line indicators inside each day cell based on the user's active habits:
  - Each completed habit renders its custom color line (`style={{ background: habit.color, boxShadow: `0 0 6px ${habit.color}88` }}`).
- Update legend below the calendar to reflect the user's actual custom habits list.

#### [MODIFY] [src/components/MonthStats.jsx](file:///Users/sakunakavinda/Documents/Web/calendar/src/components/MonthStats.jsx)
- Dynamically render stat cards for each habit (or scrollable/grid cards):
  - Completion count & monthly consistency percentage for each custom habit
  - All-habits-done "Perfect Day" count
  - Longest active streak

#### [MODIFY] [src/components/QuickModeBar.jsx](file:///Users/sakunakavinda/Documents/Web/calendar/src/components/QuickModeBar.jsx)
- Dynamically list tap actions matching the user's habits (e.g. `Detail View`, plus 1 tap toggle button per custom habit).

#### [MODIFY] [src/components/DayModal.jsx](file:///Users/sakunakavinda/Documents/Web/calendar/src/components/DayModal.jsx)
- Display interactive toggle cards for each of the user's custom habits on the selected day.
- Confetti celebration when all habits for that day are completed.

---

## Verification Plan

### Automated Tests / Builds
- Run `npm install firebase` and verify dependencies resolve cleanly.
- Run `npm run build` to ensure all React Context, Firebase SDK imports, and dynamic habit components build with zero syntax/type errors.

### Manual Verification Flows
1. **Unauthenticated / Demo Mode**:
   - Verify app runs without crashing when Firebase keys are not provided.
   - Verify local habits can still be toggled and previewed.
2. **Authentication Flow**:
   - Open Auth modal ➔ Sign up with a test email & password.
   - Verify user avatar and email display in the top bar.
   - Log out and log back in.
3. **Custom Habit Management**:
   - Open "Manage Habits" ➔ Create a new habit (e.g., "Read 20 Mins" with Blue `#3b82f6` and Book icon).
   - Verify the new habit appears in:
     - Calendar day cells (blue line indicator when checked)
     - Day detail modal
     - Month stats card
     - Tap Action selector
   - Delete a habit ➔ verify it is removed from UI and day cells.
4. **Cloud Firestore Sync**:
   - Toggle a habit on a day ➔ verify real-time update in Firestore.
   - Open in an incognito window / second browser ➔ verify live multi-user isolation (each user sees only their own habits and entries).
