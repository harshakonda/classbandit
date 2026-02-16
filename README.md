# 🐹 ClassBandit

**Classroom gamification app** — virtual class pets that motivate student behavior through CASEL-aligned goals, real-time point tracking, and level progression.

Built for the **NYEdTech Hackathon 2026**.

## Features

- 🎯 **CASEL Goals** — Select from 15+ research-backed behavioral goals
- 🐾 **Class Pets** — Choose from 4 unique pets (hamster, rabbit, cat, owl)
- ⭐ **Point System** — Award points per goal, track daily progress
- 📊 **Level Progression** — Pets level up as classes earn points
- 💬 **Reflect Check-ins** — Midday mood & emotion tracking
- 🏆 **Streak Tracking** — Daily engagement streaks
- 👩‍🏫 **Multi-class Support** — Teachers manage multiple classrooms
- 🔐 **Google/Microsoft SSO** — School-friendly authentication via Supabase

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Row-Level Security)
- **Styling**: Inline styles + Tailwind utilities
- **Deployment**: Vercel

## Quick Start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

Run `supabase/schema.sql` in your Supabase SQL Editor.

## Deploy to Vercel

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy

## License

MIT
