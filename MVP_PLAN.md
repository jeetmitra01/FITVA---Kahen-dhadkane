# Calorie Tracking App - MVP Plan

## Product Overview
A MyFitnessPal competitor with AI-powered food analysis using GPT. Users can log meals by typing food descriptions and weights, get calorie/macro estimates, track daily intake, set goals, and receive AI-powered diet recommendations.

---

## Core MVP Features

### 1. **User Authentication & Profile**
- User registration/login (email/password)
- User profile with:
  - Basic info (name, age, gender, height, weight)
  - Activity level
  - Goal (lose weight / gain weight / maintain)
  - Target calories (calculated based on goal + TDEE)

### 2. **AI-Powered Food Logging**
- **Input**: Natural language food description + weight/quantity
  - Examples: "Grilled chicken breast 200g", "2 eggs scrambled with cheese", "Large apple"
- **Output**: Structured nutrition data
  - Calories
  - Macros (protein, carbs, fats)
  - Optional: micronutrients (vitamins, minerals)
- **Technology**: GPT-4 API with structured prompts and JSON responses

### 3. **Meal Tracking**
- Log meals with timestamps (breakfast, lunch, dinner, snacks)
- View meal history (chronological list)
- Edit/delete logged meals
- Quick add from recent meals
- Search meal history

### 4. **Daily Nutrition Dashboard**
- **Today's Summary**:
  - Total calories consumed
  - Calories remaining (based on goal)
  - Macros breakdown (protein/carbs/fats) with percentages
  - Progress bar for daily goal
- **Visual Indicators**:
  - Green = on track
  - Yellow = approaching limit
  - Red = over goal

### 5. **Goal Tracking**
- Set goal: Lose/Gain/Maintain weight
- Calculate TDEE (Total Daily Energy Expenditure) based on:
  - BMR (Basal Metabolic Rate) - Mifflin-St Jeor equation
  - Activity level
  - Goal adjustment (-500 cal for lose, +500 for gain)
- Daily progress tracking:
  - Hit goal indicator
  - Weekly average
  - Trend visualization

### 6. **AI Diet Tips & Insights** (After data accrual)
- **Trigger**: After 7+ days of data
- **Analysis**:
  - Pattern recognition in eating habits
  - Macro balance analysis
  - Meal timing insights
  - Suggestions for improvement
- **Output**: Personalized recommendations
  - "You tend to eat most calories at night, try distributing more to breakfast"
  - "Your protein intake is below optimal, consider adding lean meats"
  - "You're consistently under your goal by 300 cal, adjust your targets"

---

## Technical Architecture

### **Tech Stack Recommendation**

#### **Frontend**
- **Framework**: Next.js 14 (React) with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (for server state) + Zustand (for client state)
- **Charts**: Recharts or Chart.js
- **Forms**: React Hook Form + Zod validation

#### **Backend**
- **Framework**: Next.js API Routes (or separate Node.js/Express server)
- **AI Integration**: OpenAI GPT-4 API
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (or JWT)
- **Caching**: Redis (for GPT responses to reduce API costs)

#### **External APIs**
- **OpenAI GPT-4**: Food analysis and nutrition estimation
- **Optional**: USDA Food Database API (for fallback/validation)

---

## Database Schema

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  name          String?
  age           Int?
  gender        String?  // "male", "female", "other"
  height        Float?   // in cm
  currentWeight Float?   // in kg
  activityLevel String?  // "sedentary", "light", "moderate", "active", "very_active"
  goal          String   // "lose", "gain", "maintain"
  targetCalories Int?    // calculated TDEE
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  meals         Meal[]
  goals         Goal[]
}

model Meal {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  description   String   // original user input
  mealType      String   // "breakfast", "lunch", "dinner", "snack"
  timestamp     DateTime @default(now())
  
  // Nutrition data (from GPT)
  calories      Float
  protein       Float    // in grams
  carbs         Float    // in grams
  fats          Float    // in grams
  fiber         Float?
  sugar         Float?
  sodium        Float?
  
  // GPT metadata
  gptResponse   Json?    // store full GPT response for debugging
  
  createdAt     DateTime @default(now())
}

model Goal {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  targetWeight  Float
  currentWeight Float
  startDate     DateTime @default(now())
  targetDate    DateTime?
  status        String   @default("active") // "active", "completed", "paused"
  createdAt     DateTime @default(now())
}

model DailySummary {
  id            String   @id @default(cuid())
  userId        String
  date          DateTime @db.Date
  totalCalories Float    @default(0)
  totalProtein  Float    @default(0)
  totalCarbs    Float    @default(0)
  totalFats     Float    @default(0)
  goalCalories  Int
  meals         Meal[]
  
  @@unique([userId, date])
}
```

---

## API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### **User Profile**
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/calculate-tdee` - Calculate and set target calories

### **Meals**
- `POST /api/meals` - Log a meal (with GPT analysis)
  - Body: `{ description: string, mealType: string, timestamp?: Date }`
  - Returns: `{ meal: Meal, nutrition: NutritionData }`
- `GET /api/meals` - Get user's meals (with filters: date, mealType)
- `GET /api/meals/:id` - Get single meal
- `PUT /api/meals/:id` - Update meal
- `DELETE /api/meals/:id` - Delete meal

### **Nutrition Analysis**
- `POST /api/nutrition/analyze` - Analyze food description (GPT call)
  - Body: `{ description: string, quantity?: string }`
  - Returns: `{ calories, protein, carbs, fats, ... }`
- `GET /api/nutrition/daily` - Get daily nutrition summary
- `GET /api/nutrition/weekly` - Get weekly nutrition summary
- `GET /api/nutrition/insights` - Get AI-powered diet insights

### **Goals**
- `POST /api/goals` - Create/set goal
- `GET /api/goals` - Get current goal
- `GET /api/goals/progress` - Get goal progress data

---

## GPT Integration Strategy

### **Prompt Engineering**

```
System Prompt:
"You are a nutrition expert AI assistant. Analyze food descriptions and provide accurate nutritional information in JSON format. Always estimate calories, protein (g), carbohydrates (g), and fats (g) based on the food description and quantity provided."

User Prompt Template:
"Analyze this food item and provide nutrition information:
Food: {user_description}
Quantity: {weight/quantity}

Return ONLY valid JSON in this format:
{
  "calories": number,
  "protein": number,  // in grams
  "carbs": number,    // in grams
  "fats": number,     // in grams
  "fiber": number,    // optional, in grams
  "sugar": number,    // optional, in grams
  "sodium": number,   // optional, in mg
  "confidence": "high|medium|low",
  "notes": "string"   // optional clarification
}"
```

### **Caching Strategy**
- Cache common foods in Redis (e.g., "apple", "chicken breast 200g")
- TTL: 7 days
- Reduce API costs by ~60-70%

### **Error Handling**
- If GPT fails, use fallback database lookup
- If still fails, return estimated ranges with confidence scores
- Log all GPT responses for quality improvement

---

## User Flows

### **1. Onboarding Flow**
1. Sign up / Login
2. Enter profile info (age, gender, height, weight, activity level)
3. Select goal (lose/gain/maintain)
4. System calculates TDEE and target calories
5. User confirms or adjusts target

### **2. Log Meal Flow**
1. User clicks "Log Meal"
2. Selects meal type (breakfast/lunch/dinner/snack)
3. Types food description: "Grilled chicken breast 200g with rice"
4. Clicks "Analyze"
5. GPT processes → Returns nutrition data
6. User reviews and confirms
7. Meal saved to database
8. Dashboard updates in real-time

### **3. Daily Tracking Flow**
1. User views dashboard
2. Sees today's progress (calories, macros)
3. Views meal list for today
4. Can edit/delete meals
5. Sees remaining calories vs. goal

### **4. Insights Flow** (After 7+ days)
1. User clicks "Insights" tab
2. System analyzes last 7-30 days of data
3. GPT generates personalized recommendations
4. User sees:
   - Eating patterns
   - Macro balance analysis
   - Suggestions for improvement

---

## UI/UX Design Considerations

### **Key Screens**

1. **Dashboard (Home)**
   - Large calorie progress ring/circle
   - Macro breakdown (protein/carbs/fats)
   - Quick log button (prominent)
   - Today's meals list
   - Remaining calories display

2. **Log Meal**
   - Text input for food description
   - Meal type selector
   - "Analyze" button
   - Results card with nutrition breakdown
   - Confirm/Cancel buttons

3. **History**
   - Calendar view or list view
   - Filter by date range
   - Search meals
   - View/edit past meals

4. **Progress/Goals**
   - Weekly calorie average chart
   - Goal progress indicator
   - Weight tracking (if added)
   - Streak counter

5. **Insights**
   - AI-generated recommendations
   - Pattern visualizations
   - Actionable tips

### **Design Principles**
- **Simplicity**: Easy meal logging (primary action)
- **Visual Feedback**: Color-coded progress indicators
- **Speed**: Fast GPT responses (with loading states)
- **Mobile-First**: Optimized for phone usage

---

## MVP Phase Breakdown

### **Phase 1: Core MVP (Weeks 1-3)**
- ✅ User authentication
- ✅ User profile setup with goal selection
- ✅ TDEE calculation
- ✅ Basic meal logging with GPT analysis
- ✅ Daily nutrition dashboard
- ✅ Meal history view
- ✅ Goal tracking (hit/miss indicator)

### **Phase 2: Enhanced Features (Weeks 4-5)**
- ✅ GPT response caching (Redis)
- ✅ Weekly summaries and charts
- ✅ Edit/delete meals
- ✅ Search meal history
- ✅ Quick add from recent meals

### **Phase 3: AI Insights (Week 6)**
- ✅ AI diet tips after data accrual (7+ days)
- ✅ Pattern recognition
- ✅ Personalized recommendations
- ✅ Insights dashboard

### **Future Enhancements** (Post-MVP)
- Food database integration (USDA)
- Barcode scanning
- Recipe logging
- Social features (share meals)
- Meal planning
- Integration with fitness apps
- Photo recognition (multimodal GPT)

---

## Key Metrics to Track

1. **User Engagement**
   - Daily active users
   - Meals logged per user per day
   - App opens per week

2. **GPT Performance**
   - Response accuracy (user corrections)
   - Average response time
   - API cost per user

3. **Goal Achievement**
   - % of users hitting daily goals
   - Goal completion rate
   - User retention (7-day, 30-day)

---

## Development Priorities

### **Must Have (MVP)**
1. User auth & profile
2. GPT food analysis
3. Meal logging
4. Daily calorie tracking
5. Goal tracking
6. Basic insights (after data accrual)

### **Nice to Have (Post-MVP)**
- Advanced charts/visualizations
- Meal templates
- Recipe logging
- Social features
- Photo recognition

---

## Estimated Development Timeline

- **Week 1**: Setup + Auth + Profile
- **Week 2**: GPT integration + Meal logging
- **Week 3**: Dashboard + Daily tracking
- **Week 4**: History + Edit/Delete
- **Week 5**: Charts + Weekly summaries
- **Week 6**: AI Insights + Polish
- **Total**: ~6 weeks for full MVP

---

## Cost Considerations

### **OpenAI API Costs**
- GPT-4: ~$0.03 per request (food analysis)
- Average user: 3-5 meals/day = 3-5 requests/day
- With 50% cache hit rate: ~2 requests/user/day
- **Cost per user**: ~$0.06/day = $1.80/month
- **With caching**: ~$0.03/day = $0.90/month

### **Optimization Strategies**
1. **Caching**: Redis cache for common foods (60-70% reduction)
2. **GPT-3.5-turbo**: Use cheaper model where possible ($0.001/request)
3. **Batch processing**: Process multiple foods in one request
4. **User limits**: Free tier = 10 requests/day, paid = unlimited

---

## Success Criteria for MVP

1. ✅ Users can log meals with natural language
2. ✅ GPT provides accurate calorie/macro estimates
3. ✅ Users can track daily calories vs. goals
4. ✅ Dashboard shows clear progress indicators
5. ✅ AI insights provide actionable recommendations
6. ✅ App is usable on mobile devices
7. ✅ < 3 second response time for food analysis

---

## Next Steps

1. Set up Next.js project with TypeScript
2. Configure database (PostgreSQL + Prisma)
3. Set up OpenAI API integration
4. Build authentication system
5. Create GPT food analysis endpoint
6. Build meal logging UI
7. Create dashboard with daily tracking
8. Implement goal tracking
9. Add AI insights feature

Let's start building! 🚀

