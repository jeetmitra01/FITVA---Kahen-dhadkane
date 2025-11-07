# Technical Implementation Guide

## Project Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database
- OpenAI API key
- Redis (optional, for caching)

### Initial Setup Commands

```bash
# Create Next.js app
npx create-next-app@latest calorie-tracker --typescript --tailwind --app

# Install dependencies
npm install @prisma/client prisma
npm install openai
npm install next-auth
npm install zod react-hook-form @hookform/resolvers
npm install recharts  # for charts
npm install zustand  # for state management
npm install @tanstack/react-query  # for data fetching
npm install bcryptjs
npm install redis  # optional, for caching

# Initialize Prisma
npx prisma init
```

---

## Database Setup

### Prisma Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  name          String?
  age           Int?
  gender        String?
  height        Float?
  currentWeight Float?
  activityLevel String?
  goal          String   @default("maintain")
  targetCalories Int?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  meals         Meal[]
  goals         Goal[]
  dailySummaries DailySummary[]

  @@map("users")
}

model Meal {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  description   String
  mealType      String
  timestamp     DateTime @default(now())
  
  calories      Float
  protein       Float
  carbs         Float
  fats          Float
  fiber         Float?
  sugar         Float?
  sodium        Float?
  
  gptResponse   Json?
  
  createdAt     DateTime @default(now())

  @@map("meals")
  @@index([userId, timestamp])
}

model Goal {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  targetWeight  Float
  currentWeight Float
  startDate     DateTime @default(now())
  targetDate    DateTime?
  status        String   @default("active")
  createdAt     DateTime @default(now())

  @@map("goals")
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
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, date])
  @@map("daily_summaries")
  @@index([userId, date])
}
```

### Environment Variables (`.env`)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/calorie_tracker"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="your-openai-api-key"
REDIS_URL="redis://localhost:6379"  # optional
```

---

## Core API Implementation

### 1. GPT Food Analysis API (`app/api/nutrition/analyze/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analyzeRequestSchema = z.object({
  description: z.string().min(1),
  quantity: z.string().optional(),
});

const nutritionResponseSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fats: z.number(),
  fiber: z.number().optional(),
  sugar: z.number().optional(),
  sodium: z.number().optional(),
  confidence: z.enum(['high', 'medium', 'low']),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { description, quantity } = analyzeRequestSchema.parse(body);

    // Check cache first (if Redis is set up)
    // const cached = await redis.get(`food:${description}:${quantity}`);
    // if (cached) return NextResponse.json(JSON.parse(cached));

    const prompt = `Analyze this food item and provide accurate nutritional information.

Food: ${description}
${quantity ? `Quantity: ${quantity}` : ''}

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "calories": <number>,
  "protein": <number in grams>,
  "carbs": <number in grams>,
  "fats": <number in grams>,
  "fiber": <number in grams, optional>,
  "sugar": <number in grams, optional>,
  "sodium": <number in mg, optional>,
  "confidence": "high|medium|low",
  "notes": "<optional clarification>"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use gpt-4o-mini for cost efficiency
      messages: [
        {
          role: "system",
          content: "You are a nutrition expert AI assistant. Analyze food descriptions and provide accurate nutritional information in JSON format. Always estimate calories, protein (g), carbohydrates (g), and fats (g) based on the food description and quantity provided."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent results
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    const nutrition = nutritionResponseSchema.parse(JSON.parse(responseText));

    // Cache the result (if Redis is set up)
    // await redis.setex(`food:${description}:${quantity}`, 604800, JSON.stringify(nutrition)); // 7 days

    return NextResponse.json(nutrition);
  } catch (error) {
    console.error('Nutrition analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze food' },
      { status: 500 }
    );
  }
}
```

### 2. Meal Logging API (`app/api/meals/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createMealSchema = z.object({
  description: z.string().min(1),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  timestamp: z.string().datetime().optional(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fats: z.number(),
  fiber: z.number().optional(),
  sugar: z.number().optional(),
  sodium: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = createMealSchema.parse(body);

    const meal = await prisma.meal.create({
      data: {
        userId: session.user.id,
        description: data.description,
        mealType: data.mealType,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fats: data.fats,
        fiber: data.fiber,
        sugar: data.sugar,
        sodium: data.sodium,
      },
    });

    // Update daily summary
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailySummary = await prisma.dailySummary.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
      update: {
        totalCalories: { increment: data.calories },
        totalProtein: { increment: data.protein },
        totalCarbs: { increment: data.carbs },
        totalFats: { increment: data.fats },
      },
      create: {
        userId: session.user.id,
        date: today,
        totalCalories: data.calories,
        totalProtein: data.protein,
        totalCarbs: data.carbs,
        totalFats: data.fats,
        goalCalories: (await prisma.user.findUnique({
          where: { id: session.user.id },
        }))?.targetCalories || 2000,
      },
    });

    return NextResponse.json({ meal, dailySummary });
  } catch (error) {
    console.error('Create meal error:', error);
    return NextResponse.json(
      { error: 'Failed to create meal' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const mealType = searchParams.get('mealType');

    const where: any = { userId: session.user.id };
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.timestamp = { gte: startDate, lte: endDate };
    }
    
    if (mealType) {
      where.mealType = mealType;
    }

    const meals = await prisma.meal.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json({ meals });
  } catch (error) {
    console.error('Get meals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meals' },
      { status: 500 }
    );
  }
}
```

### 3. Daily Summary API (`app/api/nutrition/daily/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const date = dateParam ? new Date(dateParam) : new Date();
    date.setHours(0, 0, 0, 0);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { targetCalories: true },
    });

    const dailySummary = await prisma.dailySummary.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: date,
        },
      },
    });

    const summary = dailySummary || {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      goalCalories: user?.targetCalories || 2000,
    };

    const remaining = (summary.goalCalories || 0) - summary.totalCalories;
    const percentage = summary.goalCalories 
      ? (summary.totalCalories / summary.goalCalories) * 100 
      : 0;

    return NextResponse.json({
      ...summary,
      remaining,
      percentage: Math.min(percentage, 100),
      goalCalories: summary.goalCalories || user?.targetCalories || 2000,
    });
  } catch (error) {
    console.error('Get daily summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily summary' },
      { status: 500 }
    );
  }
}
```

### 4. AI Insights API (`app/api/nutrition/insights/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get last 7 days of data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const meals = await prisma.meal.findMany({
      where: {
        userId: session.user.id,
        timestamp: { gte: sevenDaysAgo },
      },
      orderBy: { timestamp: 'asc' },
    });

    const dailySummaries = await prisma.dailySummary.findMany({
      where: {
        userId: session.user.id,
        date: { gte: sevenDaysAgo },
      },
      orderBy: { date: 'asc' },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (meals.length < 5) {
      return NextResponse.json({
        message: 'Not enough data yet. Log at least 5 meals to get insights.',
        insights: [],
      });
    }

    // Prepare data for GPT analysis
    const analysisPrompt = `Analyze this user's nutrition data and provide personalized diet recommendations.

User Profile:
- Goal: ${user?.goal || 'maintain'}
- Target Calories: ${user?.targetCalories || 2000}
- Activity Level: ${user?.activityLevel || 'moderate'}

Last 7 Days Summary:
${dailySummaries.map((day, i) => `
Day ${i + 1}:
- Calories: ${day.totalCalories.toFixed(0)} / ${day.goalCalories}
- Protein: ${day.totalProtein.toFixed(1)}g
- Carbs: ${day.totalCarbs.toFixed(1)}g
- Fats: ${day.totalFats.toFixed(1)}g
`).join('')}

Average Daily Intake:
- Calories: ${(dailySummaries.reduce((sum, d) => sum + d.totalCalories, 0) / dailySummaries.length).toFixed(0)}
- Protein: ${(dailySummaries.reduce((sum, d) => sum + d.totalProtein, 0) / dailySummaries.length).toFixed(1)}g
- Carbs: ${(dailySummaries.reduce((sum, d) => sum + d.totalCarbs, 0) / dailySummaries.length).toFixed(1)}g
- Fats: ${(dailySummaries.reduce((sum, d) => sum + d.totalFats, 0) / dailySummaries.length).toFixed(1)}g

Provide 3-5 actionable insights and recommendations in JSON format:
{
  "insights": [
    {
      "title": "<short title>",
      "description": "<detailed explanation>",
      "category": "calories|macros|timing|variety",
      "priority": "high|medium|low"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a nutrition expert AI assistant. Analyze eating patterns and provide actionable, personalized diet recommendations."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    const insights = JSON.parse(responseText);

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Get insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
```

### 5. TDEE Calculator Utility (`lib/tdee.ts`)

```typescript
export function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  // Mifflin-St Jeor Equation
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  
  return Math.round(bmr * (multipliers[activityLevel] || 1.375));
}

export function calculateTargetCalories(tdee: number, goal: string): number {
  const adjustments: Record<string, number> = {
    lose: -500,
    gain: 500,
    maintain: 0,
  };
  
  return Math.round(tdee + (adjustments[goal] || 0));
}
```

---

## Frontend Components Structure

### Key Components to Build

1. **Dashboard** (`app/dashboard/page.tsx`)
   - Calorie progress ring
   - Macro breakdown
   - Today's meals list
   - Quick log button

2. **Log Meal** (`app/log-meal/page.tsx`)
   - Food description input
   - Meal type selector
   - Analyze button
   - Nutrition results display
   - Confirm button

3. **Meal History** (`app/history/page.tsx`)
   - Calendar/date picker
   - Meals list
   - Edit/delete actions
   - Search functionality

4. **Progress** (`app/progress/page.tsx`)
   - Weekly charts
   - Goal tracking
   - Trend visualization

5. **Insights** (`app/insights/page.tsx`)
   - AI-generated recommendations
   - Pattern visualizations

---

## Next Steps

1. Set up the Next.js project structure
2. Configure Prisma and run migrations
3. Set up NextAuth for authentication
4. Implement the GPT integration
5. Build the core UI components
6. Test the meal logging flow
7. Add charts and visualizations
8. Implement AI insights feature

Would you like me to start implementing any specific part of this?

