# React Native Tech Stack - Calorie Tracker Mobile App

## 🎯 Overview

This document outlines the recommended tech stack for building the calorie tracking app as a React Native mobile application (iOS and Android).

---

## 📱 Mobile App Tech Stack

### **Frontend (React Native)**

#### **Core Framework**
- **React Native** (latest stable - v0.73+)
- **TypeScript** - Type safety across the app
- **Expo** (recommended) or **React Native CLI**
  - **Expo** benefits: Faster development, OTA updates, easier builds
  - **React Native CLI** benefits: More native control, custom native modules

#### **Navigation**
- **React Navigation v6** - Industry standard navigation library
  - `@react-navigation/native`
  - `@react-navigation/stack` - Stack navigation
  - `@react-navigation/bottom-tabs` - Tab navigation
  - `@react-navigation/drawer` - Drawer navigation (optional)

#### **State Management**
- **Zustand** - Lightweight, simple state management
  - Perfect for user profile, app settings
- **React Query (TanStack Query)** - Server state management
  - Caching, background refetching, offline support
  - Perfect for meals, nutrition data, API calls
- **React Context** - For auth state and theme

#### **UI Components & Styling**
- **React Native Paper** or **NativeBase** - Material Design components
- **Tailwind CSS for React Native** - Using `nativewind` (v4)
  - Write Tailwind classes directly in React Native
  - Consistent styling across platforms
- **React Native Reanimated** - Smooth animations
- **React Native Gesture Handler** - Touch gestures

#### **Forms & Validation**
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation (works great with React Hook Form)
- **Yup** - Alternative validation library

#### **Charts & Data Visualization**
- **Victory Native** - Powerful charting library
- **react-native-chart-kit** - Simpler, lightweight charts
- **React Native SVG** - For custom charts and visualizations

#### **HTTP Client & API**
- **Axios** - HTTP client for API calls
- **React Query** - Wrapper around API calls with caching
- **React Native NetInfo** - Network status detection

#### **Local Storage & Offline Support**
- **AsyncStorage** - Simple key-value storage
- **WatermelonDB** or **Realm** - SQLite database for offline-first
  - **WatermelonDB** recommended - Built for React Native, reactive
- **React Query** - Built-in offline support with cache persistence

#### **Authentication**
- **Expo AuthSession** (if using Expo) - OAuth providers
- **React Native Keychain** - Secure token storage
- **JWT Decode** - Decode JWT tokens on client
- **Biometric Auth** - `expo-local-authentication` or `react-native-biometrics`

#### **Date & Time**
- **date-fns** - Lightweight date utility library
- **React Native DateTimePicker** - Native date/time pickers

#### **Image Handling** (Future: Photo Recognition)
- **React Native Image Picker** - Camera/gallery access
- **Expo ImagePicker** - If using Expo
- **React Native Fast Image** - Optimized image loading

#### **Notifications**
- **Expo Notifications** - Push notifications (if using Expo)
- **React Native Push Notifications** - Alternative
- **Firebase Cloud Messaging** - For push notifications

#### **Analytics & Monitoring**
- **Sentry** - Error tracking and monitoring
- **React Native Firebase Analytics** - Usage analytics
- **Mixpanel** or **Amplitude** - User behavior analytics

#### **Development Tools**
- **React Native Debugger** - Debugging tool
- **Flipper** - Platform debugging
- **Reactotron** - Development debugging
- **ESLint + Prettier** - Code formatting

---

## 🔧 Backend Tech Stack

### **Option 1: Node.js/Express Backend** (Recommended)
- **Node.js** + **Express** or **Fastify**
- **TypeScript** - Type safety
- **Prisma ORM** - Database access (same as web version)
- **PostgreSQL** - Database
- **Redis** - Caching GPT responses
- **JWT** - Authentication tokens
- **OpenAI SDK** - GPT API integration

### **Option 2: Next.js API Routes**
- Same as web version
- Can serve both web and mobile apps
- Good for MVP, scales well

### **API Architecture**
- **RESTful API** - Standard REST endpoints
- **GraphQL** (optional) - More flexible, but adds complexity
- **WebSocket** (optional) - Real-time updates

---

## 📦 Package.json Dependencies

### **Core Dependencies**
```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.73.0",
    "expo": "~50.0.0",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.2",
    "react-hook-form": "^7.49.2",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.2",
    "nativewind": "^4.0.1",
    "react-native-paper": "^5.11.3",
    "react-native-reanimated": "~3.6.1",
    "react-native-gesture-handler": "~2.14.0",
    "react-native-safe-area-context": "4.8.2",
    "react-native-screens": "~3.29.0",
    "@react-native-async-storage/async-storage": "1.21.0",
    "date-fns": "^3.0.6",
    "@react-native-community/datetimepicker": "7.6.2",
    "victory-native": "^36.9.2",
    "react-native-svg": "14.1.0",
    "@react-native-netinfo/netinfo": "^11.1.0",
    "jwt-decode": "^4.0.0",
    "expo-secure-store": "~12.8.1",
    "expo-notifications": "~0.27.6",
    "expo-local-authentication": "~13.8.0"
  },
  "devDependencies": {
    "@types/react": "~18.2.45",
    "@types/react-native": "~0.73.0",
    "typescript": "~5.3.3",
    "tailwindcss": "^3.4.1",
    "eslint": "^8.55.0",
    "prettier": "^3.1.1"
  }
}
```

---

## 🏗️ Project Structure

```
calorie-tracker-mobile/
├── src/
│   ├── app/                    # App entry point
│   ├── screens/                # Screen components
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   ├── log-meal/
│   │   │   └── LogMealScreen.tsx
│   │   ├── history/
│   │   │   └── HistoryScreen.tsx
│   │   ├── progress/
│   │   │   └── ProgressScreen.tsx
│   │   └── insights/
│   │       └── InsightsScreen.tsx
│   ├── components/             # Reusable components
│   │   ├── ui/                 # UI components
│   │   ├── forms/              # Form components
│   │   ├── charts/             # Chart components
│   │   └── meal/               # Meal-related components
│   ├── navigation/             # Navigation setup
│   │   ├── AppNavigator.tsx
│   │   └── AuthNavigator.tsx
│   ├── services/               # API services
│   │   ├── api/
│   │   │   ├── client.ts       # Axios instance
│   │   │   ├── auth.ts
│   │   │   ├── meals.ts
│   │   │   └── nutrition.ts
│   │   └── storage/
│   │       └── asyncStorage.ts
│   ├── store/                  # State management
│   │   ├── authStore.ts        # Zustand store
│   │   └── userStore.ts
│   ├── hooks/                  # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useMeals.ts
│   │   └── useNutrition.ts
│   ├── utils/                  # Utilities
│   │   ├── tdee.ts
│   │   ├── validation.ts
│   │   └── formatters.ts
│   └── types/                  # TypeScript types
│       ├── user.ts
│       ├── meal.ts
│       └── nutrition.ts
├── assets/                     # Images, fonts, etc.
├── App.tsx                     # Root component
├── app.json                    # Expo config
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🔐 Authentication Flow

### **JWT Token Storage**
- Store JWT tokens in **Expo SecureStore** (secure storage)
- Refresh token handling with automatic retry
- Token expiration handling

### **Biometric Authentication** (Optional)
- Face ID / Touch ID / Fingerprint
- Quick access without re-entering credentials

---

## 📊 Data Management Strategy

### **Online-First with Offline Support**
1. **Primary**: React Query with API calls
2. **Cache**: React Query cache + AsyncStorage persistence
3. **Offline Queue**: Queue meal logs when offline, sync when online
4. **Optimistic Updates**: Update UI immediately, rollback on error

### **Data Synchronization**
- Background sync when app comes online
- Conflict resolution for offline edits
- Last-write-wins or merge strategies

---

## 🎨 UI/UX Considerations

### **Mobile-Specific Features**
- **Pull-to-refresh** - Refresh daily summary
- **Swipe gestures** - Swipe to delete meals
- **Haptic feedback** - Tactile feedback on actions
- **Dark mode** - System theme support
- **Safe areas** - Handle notches and status bars

### **Performance Optimizations**
- **FlatList** - Optimized lists for meal history
- **Image optimization** - Lazy loading, caching
- **Memoization** - React.memo, useMemo, useCallback
- **Code splitting** - Lazy load screens

---

## 🚀 Development Workflow

### **Expo Setup**
```bash
# Create Expo app
npx create-expo-app calorie-tracker --template

# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

### **React Native CLI Setup** (Alternative)
```bash
# Create React Native app
npx react-native init CalorieTracker --template react-native-template-typescript

# Run on iOS
npx react-native run-ios

# Run on Android
npx react-native run-android
```

---

## 📱 Platform-Specific Considerations

### **iOS**
- App Store guidelines compliance
- Privacy permissions (camera, health data)
- Push notification setup
- In-App Purchase (if monetizing)

### **Android**
- Google Play Store guidelines
- Runtime permissions
- Background services for sync
- Material Design guidelines

---

## 🔄 API Integration Example

### **API Client Setup** (`src/services/api/client.ts`)
```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { QueryClient } from '@tanstack/react-query';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// React Query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
    },
  },
});
```

### **Meal Service** (`src/services/api/meals.ts`)
```typescript
import { apiClient } from './client';
import { useMutation, useQuery } from '@tanstack/react-query';

export const mealService = {
  // Log meal
  logMeal: async (mealData: {
    description: string;
    mealType: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }) => {
    const response = await apiClient.post('/meals', mealData);
    return response.data;
  },

  // Get meals
  getMeals: async (date?: string) => {
    const params = date ? { date } : {};
    const response = await apiClient.get('/meals', { params });
    return response.data.meals;
  },

  // Delete meal
  deleteMeal: async (mealId: string) => {
    const response = await apiClient.delete(`/meals/${mealId}`);
    return response.data;
  },
};

// React Query hooks
export const useLogMeal = () => {
  return useMutation({
    mutationFn: mealService.logMeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
    },
  });
};

export const useMeals = (date?: string) => {
  return useQuery({
    queryKey: ['meals', date],
    queryFn: () => mealService.getMeals(date),
  });
};
```

---

## 📦 Deployment

### **Expo Deployment**
- **EAS Build** - Build iOS/Android apps
- **EAS Submit** - Submit to app stores
- **EAS Update** - Over-the-air updates

### **React Native CLI Deployment**
- **iOS**: Xcode Archive → App Store Connect
- **Android**: Generate APK/AAB → Google Play Console

---

## 💰 Cost Considerations

### **Mobile-Specific Costs**
- **App Store Fees**: 
  - Apple: $99/year (developer account)
  - Google: $25 one-time
- **Expo**: Free tier available, paid for advanced features
- **Backend**: Same as web (OpenAI API, hosting, database)

### **Optimizations**
- Offline-first reduces API calls
- Caching reduces GPT API costs
- Background sync batches requests

---

## ✅ Recommended Stack Summary

### **Frontend**
- ✅ React Native (Expo) + TypeScript
- ✅ React Navigation
- ✅ React Query + Zustand
- ✅ NativeWind (Tailwind)
- ✅ React Native Paper
- ✅ Victory Native (charts)
- ✅ React Hook Form + Zod

### **Backend**
- ✅ Node.js/Express + TypeScript
- ✅ PostgreSQL + Prisma
- ✅ Redis (caching)
- ✅ JWT authentication
- ✅ OpenAI API

### **Key Advantages**
1. **Cross-platform** - One codebase for iOS and Android
2. **Native performance** - React Native compiles to native code
3. **Hot reload** - Fast development iteration
4. **Rich ecosystem** - Large library ecosystem
5. **Offline support** - Built-in capabilities
6. **App store distribution** - Native app experience

---

## 🎯 Next Steps

1. Set up React Native project (Expo recommended)
2. Configure navigation structure
3. Set up API client and React Query
4. Implement authentication flow
5. Build core screens (Dashboard, Log Meal)
6. Integrate GPT API for food analysis
7. Add offline support and caching
8. Test on both iOS and Android
9. Prepare for app store submission

This mobile-first approach gives you a native app experience while maintaining all the core features of your calorie tracking MVP! 🚀

