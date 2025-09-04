# Spotter App - Gym Workout Tracker

A modern Next.js application that extracts workout data from Instagram posts and tracks gym sessions with detailed analytics.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │────│   Next.js API   │────│   External APIs │
│   (React/Next)  │    │   Routes        │    │   (Instagram)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Components     │    │  Workout Parser │    │  Apify Scraper  │
│  - WorkoutCard  │    │  - Exercise     │    │  - Instagram    │
│  - ExerciseForm │    │  - Sets/Reps    │    │  - Post Data    │
│  - Analytics    │    │  - Equipment    │    │  - Captions     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (Prisma + SQLite)              │
│  - Workouts  - Exercises  - Sets  - Equipment             │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Features

- **Instagram Integration**: Extract workout data from Instagram post captions
- **Smart Parsing**: AI-powered workout caption analysis
- **Workout Tracking**: Log exercises, sets, reps, and weights
- **Analytics Dashboard**: Track progress and performance metrics
- **Equipment Management**: Categorize workouts by equipment type
- **Body Part Targeting**: Track which muscle groups are worked

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Prisma ORM with SQLite
- **External APIs**: Apify Instagram Scraper
- **Authentication**: NextAuth.js (configured)

## 📁 Project Structure

```
spotter-prod/
├── app/                    # Next.js App Router pages
│   ├── add/               # Workout import interface
│   ├── api/               # API routes
│   │   ├── instagram-extract/  # Instagram scraping
│   │   └── parse-workout/      # Workout parsing
│   ├── dashboard/         # Analytics dashboard
│   └── workouts/         # Workout management
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   └── workout/         # Workout-specific components
├── lib/                 # Utilities and configurations
│   ├── workout-parser.ts # AI workout parsing logic
│   └── utils.ts         # Utility functions
├── prisma/              # Database schema and migrations
└── hooks/               # Custom React hooks
```

## 🔧 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/acastrillo/spotter_app.git
   cd spotter_app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   # Create .env.local
   APIFY_API_TOKEN=your_apify_token
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Initialize database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

## 📱 Core Workflow

### 1. Instagram Import Process
```
Instagram URL → Apify Scraper → Extract Caption → Parse Workout → Save to DB
```

### 2. Workout Parsing
The app uses intelligent parsing to extract:
- Exercise names and variations
- Sets, reps, and weights
- Equipment requirements
- Target muscle groups
- Workout metadata

### 3. Data Storage
```javascript
// Workout Schema
{
  id: string,
  title: string,
  description: string,
  date: Date,
  exercises: Exercise[],
  bodyParts: string[],
  equipment: string[]
}
```

## 🔌 API Endpoints

### `/api/instagram-extract`
Extracts workout data from Instagram posts using Apify scraper.

**Input**: `{ postUrl: string }`
**Output**: `{ success: boolean, caption: string, workoutContent: string }`

### `/api/parse-workout`
Parses workout captions into structured data.

**Input**: `{ caption: string }`
**Output**: `{ exercises: Exercise[], metadata: WorkoutMetadata }`

## 🎯 Key Components

- **WorkoutCard**: Display workout summaries
- **ExerciseForm**: Input/edit exercise details  
- **ProgressChart**: Visualize workout analytics
- **ImportInterface**: Instagram URL processing

## 🔍 Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes
npx prisma studio    # Open database browser

# Code Quality
npm run lint         # ESLint check
npx tsc --noEmit     # TypeScript check
```

## 🚀 Deployment

The app is configured for deployment on Vercel:

1. Push to GitHub repository
2. Connect to Vercel
3. Configure environment variables
4. Deploy automatically on commits

## 📝 Environment Variables

```env
# Required
APIFY_API_TOKEN=        # Apify API token for Instagram scraping
DATABASE_URL=           # Database connection string
NEXTAUTH_SECRET=        # NextAuth.js secret key
NEXTAUTH_URL=           # Application URL

# Optional
NODE_OPTIONS=--max-old-space-size=8192  # For build optimization
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is private and proprietary.