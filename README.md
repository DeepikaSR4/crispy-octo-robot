# LevelUp Engine 🚀
**4-Week Developer Evolution System**

A gamified, AI-powered structured growth platform for a single developer. Complete Flutter and SwiftUI challenges each week, submit your GitHub repo for AI code review, earn XP, unlock badges, and level up to **Product Engineer**.

---

## Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example env file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
# Firebase (from Firebase Console → Project Settings → Your Apps)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Google Gemini AI (from aistudio.google.com)
GEMINI_API_KEY=...

# GitHub Token (optional but recommended for 5000 req/hr vs 60)
# Generate at: github.com/settings/tokens (needs repo:read scope)
GITHUB_TOKEN=...
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → Create a new project
2. Add a **Web App** and copy the config values into `.env.local`
3. In the sidebar, click **Firestore Database** → **Create Database**
4. Start in **Test Mode** (you can add security rules later)
5. That's it — the app auto-seeds the initial user document on first load.

### 4. Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click **Get API Key** → Create new key
3. Add to `.env.local` as `GEMINI_API_KEY`

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How It Works

| Week | Title | Threshold | Badge |
|------|-------|-----------|-------|
| 1 | Foundation Builder | 70/100 | ⚔️ Foundation Knight |
| 2 | Systems Thinker | 70/100 | 🏗️ System Builder |
| 3 | AI Integrator | 75/100 | 🤖 AI Tactician |
| 4 | Product Engineer | 80/100 | 🚀 Product Engineer |

**Each week has 2 tasks (50 points each):**
- Task A → Flutter
- Task B → SwiftUI

**Scoring:**
- Both tasks combined must reach the threshold to unlock the next week
- Unlimited resubmissions allowed
- Highest score is always preserved
- XP only increases when score improves

**Levels:**
- 0–99 XP → Intern
- 100–199 XP → Junior Dev
- 200–299 XP → Engineer
- 300–400 XP → Product Engineer

---

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── review/route.ts     # POST: GitHub fetch → AI review → Firestore update
│   │   └── state/route.ts      # GET/POST: User state from Firestore
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Main dashboard
├── components/
│   ├── Dashboard/
│   │   ├── Header.tsx          # XP counter + level badge
│   │   ├── XPProgressBar.tsx   # Animated 0-400 XP bar
│   │   ├── WeekTimeline.tsx    # 4-week card grid
│   │   ├── BadgeDisplay.tsx    # Earned/locked badges
│   │   └── MissionView.tsx     # Task details + submission
│   ├── Review/
│   │   ├── SubmissionForm.tsx  # GitHub URL input + submit
│   │   ├── ReviewResult.tsx    # AI score + breakdown
│   │   └── AttemptHistory.tsx  # All past attempts
│   └── UI/
│       └── ConfettiEffect.tsx  # Week unlock celebration
├── lib/
│   ├── firebase.ts             # Firebase app init
│   ├── firestore.ts            # Data access layer + unlock logic
│   ├── missions.ts             # Static week/task definitions
│   ├── gamification.ts         # XP, level, delta calculations
│   ├── github.ts               # Repo content fetcher
│   └── aiReview.ts             # Gemini prompt + score normalization
└── types/
    └── index.ts                # All TypeScript interfaces
```

---

## AI Review Criteria

The AI reviews 8 categories (each scored 0-7, normalized to 50 total):

| Category | What it evaluates |
|----------|-------------------|
| Code Structure | Folder organization, separation of concerns |
| Architecture | Pattern usage, scalability design |
| Clean Code | Readability, naming, no duplication |
| Scalability | How well the app could grow |
| Documentation | README quality, code comments |
| Error Handling | Edge cases, loading/error states |
| Product Thinking | User experience, practical value |
| Performance | Efficiency, no obvious bottlenecks |
