# Calorie Tracker App - MVP

A MyFitnessPal competitor with AI-powered food analysis using GPT. Users can log meals by typing food descriptions, get calorie/macro estimates, track daily intake, set goals, and receive AI-powered diet recommendations.

## 🎯 Core Features

- **AI-Powered Food Analysis**: Type food descriptions and get instant calorie/macro estimates via GPT
- **Meal Tracking**: Log meals with timestamps, edit/delete, and view history
- **Daily Nutrition Dashboard**: Track calories and macros with visual progress indicators
- **Goal Tracking**: Set weight goals (lose/gain/maintain) and track progress
- **AI Diet Insights**: Get personalized recommendations after 7+ days of data

## 📋 MVP Documentation

- **[MVP_PLAN.md](./MVP_PLAN.md)** - Complete MVP plan with features, architecture, and user flows
- **[TECHNICAL_IMPLEMENTATION.md](./TECHNICAL_IMPLEMENTATION.md)** - Detailed technical implementation guide with code examples (Web/Next.js)
- **[REACT_NATIVE_TECH_STACK.md](./REACT_NATIVE_TECH_STACK.md)** - React Native mobile app tech stack guide
- **[REACT_NATIVE_SETUP.md](./REACT_NATIVE_SETUP.md)** - React Native setup and configuration guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your DATABASE_URL, OPENAI_API_KEY, etc.

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## 🏗️ Tech Stack

### **Option 1: Web App (Next.js)**
- **Frontend**: Next.js 14 (React + TypeScript), Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI GPT-4 API
- **Authentication**: NextAuth.js
- **Charts**: Recharts

### **Option 2: Mobile App (React Native)** ⭐ Recommended
- **Frontend**: React Native (Expo) + TypeScript, NativeWind (Tailwind)
- **Backend**: Node.js/Express API (same backend can serve both web and mobile)
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI GPT-4 API
- **Navigation**: React Navigation
- **State**: React Query + Zustand
- **Charts**: Victory Native
- **Storage**: Expo SecureStore + AsyncStorage

**Shared Backend**: The same backend API can serve both web and mobile apps!

## 📊 Key Metrics

- Daily calorie tracking vs. goals
- Macro breakdown (protein/carbs/fats)
- Weekly progress charts
- AI-powered diet insights

## 🎨 Key Screens

1. **Dashboard**: Daily calorie progress, macro breakdown, today's meals
2. **Log Meal**: Natural language food input with GPT analysis
3. **History**: Meal history with search and filters
4. **Progress**: Weekly charts and goal tracking
5. **Insights**: AI-generated diet recommendations

## 📱 Platform Options

This app can be built as:
- **Web App**: Next.js-based web application
- **Mobile App**: React Native app for iOS and Android (recommended for calorie tracking)
- **Both**: Share the same backend API between web and mobile

See [REACT_NATIVE_TECH_STACK.md](./REACT_NATIVE_TECH_STACK.md) for detailed mobile app setup.

## 📝 Development Status

MVP planning complete. Ready for implementation.
- ✅ MVP requirements defined
- ✅ Tech stack recommendations (Web + Mobile)
- ✅ Database schema designed
- ✅ API endpoints planned
- ✅ GPT integration strategy defined
- 🔲 Implementation in progress

## 📄 License

MIT

