# VoiceBox Africa

A modern voice talent marketplace connecting African voice artists with global opportunities. Clients can post projects, discover talented voice artists, and collaborate on voice-over work.

## Features

- 🎤 **Voice Talent Discovery** - Browse and discover talented African voice artists
- 💼 **Project Management** - Post gigs, receive proposals, and manage projects
- 🎛️ **Producer System** - Professional audio production services (mixing, mastering, full production)
- 💬 **Real-time Messaging** - Chat with clients and talents
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🌐 **Multi-language Support** - Support for various African languages

## User Roles

### Clients
- Post voice-over projects
- Discover and hire talent
- Manage projects and deliverables

### Talents
- Create professional profiles
- Submit proposals to projects
- Upload audio deliverables

### Producers
- Official VoiceBox Africa Studio for audio production
- Services include: mixing, mastering, vocal production, full production
- Integrated into the gig creation flow

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Bun or npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Jayjaycee1995/voice-box-africa.git
   cd voice-box-africa
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up Supabase:
   - Create a new Supabase project
   - Run the migrations in `supabase/migrations/`
   - Configure authentication settings

5. Start development server:
   ```bash
   npm run dev
   ```

## Database Setup

Run the following migrations in your Supabase SQL Editor:

1. `supabase/migrations/RUN_THIS_FIRST.sql` - Creates tables and columns
2. Add the producer role enum: `ALTER TYPE user_role ADD VALUE 'producer';`
3. `supabase/migrations/UPDATE_VOICEBOX_STUDIO.sql` - Sets up VoiceBox Africa Studio

## Project Structure

```
src/
├── assets/          # Static assets
├── components/     # React components
│   ├── audio/      # Audio-related components
│   ├── dashboard/  # Dashboard components
│   ├── gig/        # Gig/Project components
│   ├── home/       # Home page components
│   ├── layout/     # Layout components
│   ├── producer/   # Producer-specific components
│   └── ui/         # UI components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and Supabase client
├── pages/          # Page components
└── store/          # Zustand state management
```

## Deployment

This project can be deployed to:
- **Vercel** (Frontend) - Recommended for React apps
- **Supabase** (Backend/Database)

## Contributing

We welcome contributions! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ in Africa
