# React Native Setup Guide

## Quick Start Guide for Calorie Tracker Mobile App

---

## Prerequisites

- **Node.js** 18+ and npm/yarn
- **PostgreSQL** database
- **OpenAI API** key
- **Xcode** (for iOS development on Mac)
- **Android Studio** (for Android development)
- **Expo CLI** (optional, but recommended)

---

## Step 1: Create React Native Project

### Option A: Expo (Recommended for MVP)

```bash
# Install Expo CLI globally
npm install -g expo-cli

# Create new Expo app with TypeScript
npx create-expo-app calorie-tracker-mobile --template

# Navigate to project
cd calorie-tracker-mobile

# Install dependencies
npm install
```

### Option B: React Native CLI

```bash
# Create React Native app
npx react-native init CalorieTracker --template react-native-template-typescript

# Navigate to project
cd CalorieTracker

# Install dependencies
npm install
```

---

## Step 2: Install Core Dependencies

```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated

# State Management
npm install @tanstack/react-query zustand

# HTTP Client
npm install axios

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# UI & Styling
npm install nativewind tailwindcss
npm install react-native-paper

# Storage
npm install @react-native-async-storage/async-storage
npm install expo-secure-store  # If using Expo

# Charts
npm install victory-native react-native-svg

# Utilities
npm install date-fns
npm install @react-native-community/datetimepicker
npm install @react-native-netinfo/netinfo
npm install jwt-decode

# Development
npm install --save-dev @types/react @types/react-native typescript
npm install --save-dev eslint prettier
```

---

## Step 3: Configure TypeScript

Create `tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

---

## Step 4: Configure NativeWind (Tailwind CSS)

Create `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Update `babel.config.js`:

```js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      'react-native-reanimated/plugin',
    ],
  };
};
```

---

## Step 5: Set Up Environment Variables

Create `.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_OPENAI_API_KEY=your-openai-key
```

Install `react-native-dotenv`:

```bash
npm install react-native-dotenv
npm install --save-dev @types/react-native-dotenv
```

Create `babel.config.js` (if using dotenv):

```js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      'module:react-native-dotenv'
    ],
  };
};
```

---

## Step 6: Project Structure Setup

```
src/
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   ├── dashboard/
│   │   └── DashboardScreen.tsx
│   ├── log-meal/
│   │   └── LogMealScreen.tsx
│   ├── history/
│   │   └── HistoryScreen.tsx
│   ├── progress/
│   │   └── ProgressScreen.tsx
│   └── insights/
│       └── InsightsScreen.tsx
├── components/
│   ├── ui/
│   ├── forms/
│   └── charts/
├── navigation/
│   ├── AppNavigator.tsx
│   └── AuthNavigator.tsx
├── services/
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── meals.ts
│   │   └── nutrition.ts
│   └── storage/
│       └── asyncStorage.ts
├── store/
│   ├── authStore.ts
│   └── userStore.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useMeals.ts
│   └── useNutrition.ts
├── utils/
│   ├── tdee.ts
│   └── formatters.ts
└── types/
    ├── user.ts
    ├── meal.ts
    └── nutrition.ts
```

---

## Step 7: Set Up Navigation

Create `src/navigation/AppNavigator.tsx`:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import LogMealScreen from '../screens/log-meal/LogMealScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import InsightsScreen from '../screens/insights/InsightsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Log Meal" component={LogMealScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## Step 8: Set Up API Client

Create `src/services/api/client.ts`:

```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      await SecureStore.deleteItemAsync('auth_token');
    }
    return Promise.reject(error);
  }
);
```

---

## Step 9: Set Up React Query

Update `App.tsx`:

```typescript
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
```

---

## Step 10: Set Up Authentication Store

Create `src/store/authStore.ts`:

```typescript
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../services/api/client';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    await SecureStore.setItemAsync('auth_token', token);
    set({ user, token, isAuthenticated: true });
  },
  
  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  checkAuth: async () => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      try {
        const response = await apiClient.get('/auth/me');
        set({ user: response.data.user, token, isAuthenticated: true });
      } catch (error) {
        await SecureStore.deleteItemAsync('auth_token');
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },
}));
```

---

## Step 11: Run the App

### Development

```bash
# Start Expo development server
npx expo start

# Or with React Native CLI
npx react-native start
```

### iOS

```bash
# Expo
npx expo start --ios

# React Native CLI
npx react-native run-ios
```

### Android

```bash
# Expo
npx expo start --android

# React Native CLI
npx react-native run-android
```

---

## Step 12: Backend Setup

The backend can remain the same as the web version:
- Node.js/Express API
- PostgreSQL database
- Prisma ORM
- OpenAI GPT integration

The mobile app will call the same REST API endpoints.

---

## Next Steps

1. ✅ Complete project setup
2. 🔲 Implement authentication screens
3. 🔲 Build dashboard screen
4. 🔲 Create meal logging screen with GPT integration
5. 🔲 Add meal history view
6. 🔲 Implement progress tracking
7. 🔲 Add AI insights feature
8. 🔲 Test on both iOS and Android
9. 🔲 Prepare for app store submission

---

## Common Issues & Solutions

### Issue: Metro bundler not starting
**Solution**: Clear cache and restart
```bash
npx expo start -c
# or
npx react-native start --reset-cache
```

### Issue: iOS build fails
**Solution**: 
- Install pods: `cd ios && pod install && cd ..`
- Clean build: `npx react-native run-ios --clean`

### Issue: Android build fails
**Solution**:
- Clean gradle: `cd android && ./gradlew clean && cd ..`
- Check Android SDK setup

### Issue: Navigation not working
**Solution**: Ensure all dependencies are installed and linked:
```bash
npm install react-native-screens react-native-safe-area-context
```

---

## Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)
- [NativeWind](https://www.nativewind.dev/)

Happy coding! 🚀

