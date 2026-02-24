# VOIBOX AFRICA — Full Application Documentation

> **Version:** 1.1  
> **Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui  
> **Backend Status:** ✅ Supabase Backend Connected — Database, Authentication, and Edge Functions implemented

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Brand Identity & Design System](#2-brand-identity--design-system)
3. [Application Architecture](#3-application-architecture)
4. [Routing & Pages](#4-routing--pages)
5. [Shared Layout Components](#5-shared-layout-components)
6. [Homepage Sections](#6-homepage-sections)
7. [Artist Discovery & Profiles](#7-artist-discovery--profiles)
8. [Booking Flow](#8-booking-flow)
9. [Authentication Pages](#9-authentication-pages)
10. [Dashboard Pages](#10-dashboard-pages)
11. [Informational Pages](#11-informational-pages)
12. [UI Component Library](#12-ui-component-library)
13. [Backend Requirements (Not Yet Built)](#13-backend-requirements-not-yet-built)
14. [Data Models (Mock)](#14-data-models-mock)

---

## 1. Project Overview

**Voibox Africa** is Africa's premium voice-over marketplace connecting global clients with verified African voice talent. The platform enables:

- **Clients** to discover, preview, and book African voice artists
- **Voice Talent** to showcase their skills, receive bookings, and earn income
- **Enterprises** to access curated voice talent at scale

### Current State

The application is a **full-stack marketplace platform** with:
- ✅ Complete UI across all pages
- ✅ Brand identity implemented (Sonic Purple + Electric Orange palette)
- ✅ Responsive design (mobile + desktop) with mobile bottom navigation
- ✅ Supabase backend integration (database, authentication, real-time features)
- ✅ Multi-step booking wizard with price calculation
- ✅ Client and Talent dashboard UIs with full functionality
- ✅ Real-time messaging system
- ✅ User management with role-based access (client, talent, admin)
- ✅ Project/gig management system
- ✅ Proposal and invitation system
- ✅ Supabase Edge Functions for advanced operations (user deletion)

---

## 2. Brand Identity & Design System

### Colors (defined in `src/index.css` as CSS variables)

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--primary` | `271 76% 53%` | Sonic Purple — primary actions, links, CTAs |
| `--secondary` | `24 95% 53%` | Electric Orange — accents, highlights, warmth |
| `--navy` | `222 47% 11%` | Midnight Navy — dark anchors, enterprise sections |
| `--background` | `0 0% 100%` | Page background |
| `--foreground` | `222 47% 11%` | Main text |
| `--muted` | `220 14% 96%` | Subtle backgrounds |
| `--muted-foreground` | `220 9% 46%` | Secondary text |
| `--destructive` | `0 84% 60%` | Errors, alerts |
| `--success` | `271 76% 53%` | Success states (purple tint) |
| `--warning` | `24 95% 53%` | Warning states (orange) |

Dark mode is fully defined but not actively toggled.

### Typography (Google Fonts loaded in `index.css`)

| Role | Font | Tailwind Class |
|------|------|---------------|
| Headings | **Sora** | `font-heading` |
| Body/UI | **DM Sans** | `font-sans` (default) |

### Custom CSS Classes (in `index.css` `@layer components`)

| Class | Purpose |
|-------|---------|
| `.gradient-brand` | Orange → Purple gradient background |
| `.gradient-brand-text` | Gradient text effect |
| `.btn-primary` | Elevated primary button with glow on hover |
| `.btn-gradient` | Orange-to-purple gradient button |
| `.card-elevated` | Card with border, shadow, hover lift effect |
| `.card-gradient` | Card with gradient top border accent |
| `.category-card` | Hoverable category card with glow |
| `.enterprise-section` | Dark navy section styling |
| `.hero-gradient` | Radial gradient overlay for hero sections |
| `.sound-wave-bg` | Decorative vertical line pattern |
| `.accent-line` | 4px gradient horizontal line |
| `.badge-available` / `.badge-busy` | Status badge styles |

### Animations (in `index.css` `@layer utilities`)

| Class | Effect |
|-------|--------|
| `.animate-fade-in` | Opacity 0→1, 0.5s |
| `.animate-slide-up` | Translate Y 20px→0 + fade, 0.6s |
| `.animate-scale-in` | Scale 0.95→1 + fade, 0.4s |
| `.animate-pulse-glow` | Pulsing purple glow shadow, infinite |
| `.animate-sound-wave` | Vertical scale oscillation for sound bars |

### Button Variants (in `src/components/ui/button.tsx`)

| Variant | Description |
|---------|-------------|
| `default` | Solid primary purple |
| `destructive` | Red for destructive actions |
| `outline` | Bordered, transparent background |
| `secondary` | Orange secondary |
| `ghost` | No background, hover muted |
| `link` | Underlined text link |
| `hero` | **Gradient** orange→purple with glow hover |
| `accent` | Orange accent button |
| `enterprise` | Dark navy button |

### Tailwind Config (`tailwind.config.ts`)

Extends default Tailwind with:
- Custom `fontFamily`: `sans` (DM Sans), `heading` (Sora)
- Full semantic color palette mapped to CSS variables
- Custom `boxShadow`: `card`, `elevated`, `glow`
- Accordion keyframe animations

---

## 3. Application Architecture

```
src/
├── assets/                    # Static assets (logo)
│   └── voibox-logo.png
├── components/
│   ├── artists/
│   │   └── ArtistCard.tsx     # Reusable artist card with play, rating, pricing
│   ├── audio/
│   │   └── WaveformVisualizer.tsx  # Animated waveform bars (visual only)
│   ├── home/                  # Homepage section components (13 sections)
│   ├── layout/
│   │   ├── Header.tsx         # Global navigation bar
│   │   └── Footer.tsx         # Global footer
│   ├── ui/                    # shadcn/ui component library (40+ components)
│   └── NavLink.tsx            # Navigation link helper
├── hooks/
│   ├── use-mobile.tsx         # Mobile breakpoint detection
│   └── use-toast.ts           # Toast notification hook
├── lib/
│   └── utils.ts               # cn() utility for className merging
├── pages/                     # Route-level page components (13 pages)
├── App.tsx                    # Root component with routing
├── main.tsx                   # Entry point
└── index.css                  # Global styles + design system tokens
```

### Key Dependencies

| Package | Purpose |
|---------|---------|
| `react-router-dom` | Client-side routing |
| `@tanstack/react-query` | Data fetching (configured but unused — no backend) |
| `lucide-react` | Icon library |
| `class-variance-authority` | Component variant system |
| `tailwind-merge` + `clsx` | Class name utilities |
| `recharts` | Charts (installed, not actively used) |
| `sonner` | Toast notifications |
| `@radix-ui/*` | Headless UI primitives (via shadcn/ui) |

---

## 4. Routing & Pages

Defined in `src/App.tsx`:

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Index` | Homepage / Landing page |
| `/artists` | `Artists` | Browse & filter voice talent |
| `/artists/:id` | `ArtistProfile` | Individual artist profile with demos & reviews |
| `/book/:id` | `BookingWizard` | 4-step booking flow for a specific artist |
| `/register` | `Register` | Multi-step registration (Client or Talent) |
| `/login` | `Login` | Login with email/password + social options |
| `/forgot-password` | `ForgotPassword` | Password reset request |
| `/how-it-works` | `HowItWorks` | Platform explanation for clients & talent |
| `/pricing` | `Pricing` | Pricing tiers, calculator, FAQs |
| `/dashboard` | `Dashboard` | Generic dashboard (legacy, similar to Client) |
| `/client-dashboard` | `ClientDashboard` | Client-specific dashboard |
| `/talent-dashboard` | `TalentDashboard` | Talent-specific dashboard |
| `*` | `NotFound` | 404 page |

---

## 5. Shared Layout Components

### Header (`src/components/layout/Header.tsx`)
- Voibox Africa logo (imported from `src/assets/voibox-logo.png`)
- Navigation links: Find Talent, How It Works, Pricing
- CTA buttons: Log In, Join Voibox
- Mobile hamburger menu

### Footer (`src/components/layout/Footer.tsx`)
- Multi-column layout: Company info, For Clients, For Talent, Resources
- Social links
- Copyright notice
- "Africa Has a Voice" tagline

---

## 6. Homepage Sections

All located in `src/components/home/`. Rendered in order by `src/pages/Index.tsx`:

| # | Component | Description |
|---|-----------|-------------|
| 1 | `HeroSection` | Main hero with tagline "Africa Has a Voice. We Power It.", search bar, trust stats |
| 2 | `BrowseByCategory` | Grid of voiceover categories (Commercial, Documentary, E-learning, etc.) |
| 3 | `EnterpriseSection` | Dark navy section targeting enterprise clients |
| 4 | `FindTalentSection` | Value proposition for hiring African voice talent |
| 5 | `WhyVoiceBoxSection` | Platform differentiators (Verified Talent, Secure Payment, etc.) |
| 6 | `ForTalentSection` | Value proposition for voice artists joining the platform |
| 7 | `TrustedBrandsSection` | Logos of trusted brands (placeholder text-based) |
| 8 | `CTASection` | Final call-to-action with gradient background |
| 9 | `SkillsSection` | Skills/specialties overview |

**Not currently rendered but exist:**
- `FeaturedArtists` — Grid of 6 featured artist cards
- `TestimonialsSection` — Customer testimonials
- `LanguagesSection` — Language showcase
- `HowItWorks` (home variant) — Abbreviated how-it-works

---

## 7. Artist Discovery & Profiles

### Artists Page (`src/pages/Artists.tsx`)
- **Search**: Text search by name or specialty
- **Filters**: Language dropdown (12 African languages), Price range (4 tiers), Available-only toggle
- **Mobile**: Collapsible filter panel
- **Grid**: Responsive 1/2/3 column layout
- **Data**: 8 hardcoded mock artists
- **Empty State**: "No artists found" with clear filters button

### Artist Card (`src/components/artists/ArtistCard.tsx`)
Displays for each artist:
- Avatar with play/pause overlay button
- Name, location (MapPin icon), availability badge
- Star rating + review count
- Waveform visualizer (animated bars, visual only — no actual audio)
- Language tags
- Specialty tags (gradient background)
- Price per word + "View Profile" CTA
- Entire card links to `/artists/:id`

### Artist Profile (`src/pages/ArtistProfile.tsx`)
- **Cover image** with gradient overlay
- **Profile header**: Avatar, name, location, availability, favorite/share buttons
- **Stats**: Rating, review count, completed jobs
- **Languages**: Tag list
- **About**: Bio text, specialties tags, equipment tags
- **Voice Demos**: 3 demo tracks with play/pause + waveform (visual only)
- **Reviews**: 2 sample reviews with avatars, ratings, project type
- **Sidebar (sticky)**:
  - Price per word display
  - Quick packages (100/250/500 words)
  - "Book Now" button → links to `/book/:id`
  - "Send Inquiry" button (non-functional)
  - Response time & member since stats

### Waveform Visualizer (`src/components/audio/WaveformVisualizer.tsx`)
- Purely visual animated bars
- Accepts `isPlaying` prop to toggle animation
- Configurable `barCount`
- **No actual audio playback** — this is cosmetic only

---

## 8. Booking Flow

### Booking Wizard (`src/pages/BookingWizard.tsx`)

A 4-step wizard for booking a specific artist:

| Step | Name | Fields |
|------|------|--------|
| 1 | Project Details | Project name, Usage rights (Social Media, Radio, TV, Web, Corporate, Broadcast) |
| 2 | Script | Script text area with live word count, Special instructions, File upload button (non-functional) |
| 3 | Deadline | Date picker, Rush delivery toggle (+50% surcharge) |
| 4 | Review | Summary of all selections, "Proceed to Payment" button (non-functional) |

**Price Calculation (client-side):**
```
Base Price = Word Count × $0.15/word (hardcoded)
Rush Fee = Base Price × 50% (if rush selected)
Total = Base Price + Rush Fee
```

**Sidebar**: Live order summary with running total, escrow note, payment method logos (Paystack, Flutterwave, Stripe — text only)

**Navigation**: Back/Continue buttons, progress stepper with icons

---

## 9. Authentication Pages

### Register (`src/pages/Register.tsx`)
- **User type selector**: Client or Voice Talent (toggle cards)
- **Client flow** (1 step): Full name, Email, Company (optional), Password, Confirm password, Terms checkbox
- **Talent flow** (3 steps):
  1. Basic info: Name, Email, Location, Password
  2. Profile: Display name, Bio, Languages (12 checkboxes), Specialties (10 checkboxes)
  3. Professional: Price per word, Equipment description, Demo upload (non-functional), Terms checkbox
- All forms are local state only — **no data is submitted anywhere**

### Login (`src/pages/Login.tsx`)
- Email + Password fields with icons
- Show/hide password toggle
- "Remember me" checkbox
- "Forgot password?" link
- "Sign In" button (logs to console only)
- Social login buttons: Google, GitHub (non-functional)
- Link to Register page

### Forgot Password (`src/pages/ForgotPassword.tsx`)
- Email input
- "Send Reset Link" button
- Success state with confirmation message
- "Back to sign in" link
- **No actual email is sent**

---

## 10. Dashboard Pages

### Client Dashboard (`src/pages/ClientDashboard.tsx`)

**Sidebar tabs**: Overview, My Projects, Messages, Payments, Settings

**Overview tab:**
- Stats cards: Active Projects (3), Total Spent ($1,245), Completed (12), Avg Rating (4.8)
- Recent projects list with artist avatar, status badge, amount

**Projects tab:**
- Full project list with filters/search buttons (non-functional)

**Messages tab:**
- Message list with unread indicators

**Payments tab:** Placeholder text  
**Settings tab:** Placeholder text

**Mock data:** 3 projects (MTN Commercial, E-learning Module, Radio Jingle), 2 messages

---

### Talent Dashboard (`src/pages/TalentDashboard.tsx`)

**Sidebar tabs**: Overview, Active Jobs, Earnings, My Profile, Settings

**Header:** Availability toggle switch (Available/Busy)

**Overview tab:**
- Stats cards: Active Jobs (2), Pending Earnings ($195), Total Earned ($2,450), Avg Rating (4.9)
- Active jobs list with client name, word count, status badge, amount
- Quick Actions: Upload New Demo, View Public Profile
- This Month summary: Jobs Completed (8), Earnings ($890), Profile Views (234)

**Jobs tab:** Active jobs list with details

**Earnings tab:**
- Available ($1,250), Pending ($195), This Month ($890)
- "Withdraw Funds" button (non-functional)

**Profile tab:** Placeholder text  
**Settings tab:** Placeholder text

**Mock data:** 2 active jobs (MTN Commercial, E-learning Module)

---

### Legacy Dashboard (`src/pages/Dashboard.tsx`)
- Similar to Client Dashboard but older structure
- Tabs: Overview, Projects, Messages, Settings
- Same mock data pattern
- **Can be removed** — superseded by `ClientDashboard`

---

## 11. Informational Pages

### How It Works (`src/pages/HowItWorks.tsx`)
- Hero section with CTAs
- **For Clients** — 6 steps: Browse → Preview → Book → Pay → Receive → Rate
- **For Talent** — 6 steps: Profile → Demos → Rates → Bookings → Deliver → Get Paid
- **Why Choose VoiceBox** — 4 features: Secure Escrow, Fast Turnaround, Pro Quality, Verified Reviews
- CTA section

### Pricing (`src/pages/Pricing.tsx`)
- **3 tiers**: Standard (up to 100 words, ~$20), Professional (100-500 words, ~$60), Enterprise (500+ words, custom)
- "Most Popular" badge on Professional tier
- Feature comparison lists
- **How Pricing Works**: Base Price + Add-ons = Total breakdown
- **8 FAQs** using Accordion component (escrow, fees, rush orders, payment methods, negotiations)
- CTA section

---

## 12. UI Component Library

Full shadcn/ui library installed at `src/components/ui/`:

Accordion, Alert, AlertDialog, AspectRatio, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, ContextMenu, Dialog, Drawer, DropdownMenu, Form, HoverCard, InputOTP, Input, Label, Menubar, NavigationMenu, Pagination, Popover, Progress, RadioGroup, Resizable, ScrollArea, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Switch, Table, Tabs, Textarea, Toast, Toaster, Toggle, ToggleGroup, Tooltip

---

## 13. Backend Requirements (Not Yet Built)

The following backend infrastructure is needed to make this application functional:

### Authentication & Users
- Email/password registration and login
- Social OAuth (Google, GitHub)
- Password reset via email
- User roles: `client`, `talent`, `admin`
- Session management

### Database Tables Needed
- `users` — id, email, password_hash, role, created_at
- `profiles` — user_id, display_name, avatar_url, location, bio, languages[], specialties[], equipment, price_per_word, is_available
- `demos` — id, artist_id, title, duration, audio_url
- `projects` (bookings) — id, client_id, artist_id, name, status, script, instructions, usage_rights[], deadline, rush_delivery, word_count, base_price, total_price, created_at
- `messages` — id, project_id, sender_id, content, read, created_at
- `reviews` — id, project_id, client_id, artist_id, rating, content, created_at
- `payments` — id, project_id, amount, status, payment_method, created_at

### File Storage
- Artist avatar uploads
- Voice demo audio files (MP3/WAV)
- Delivered voice-over files

### Payment Integration
- Paystack (African cards, bank transfers, M-Pesa)
- Flutterwave (alternative African payment)
- Stripe (international payments)
- Escrow system: Hold funds until client approves delivery

### Real-time Features
- Messaging between client and talent
- Notification system (new bookings, messages, deliveries)
- Project status updates

### Edge Functions / Server Logic
- Word count → price calculation with artist's actual rate
- Booking creation and status management
- Payment webhook handlers
- Email notifications (booking confirmation, delivery notification, password reset)
- Review/rating aggregation

### Search & Discovery
- Full-text search across artist names, bios, specialties
- Filter by language, price range, availability, rating
- Sort by rating, price, relevance

---

## 14. Data Models (Mock)

### Artist Object (used across Artists page, ArtistCard, FeaturedArtists)
```typescript
{
  id: string;
  name: string;
  avatar: string;          // Unsplash URL
  location: string;        // "City, Country"
  languages: string[];     // e.g. ["English (Nigerian)", "Yoruba"]
  pricePerWord: number;    // e.g. 0.15
  rating: number;          // e.g. 4.9
  reviewCount: number;
  isAvailable: boolean;
  specialties: string[];   // e.g. ["Commercial", "Documentary"]
  demoUrl: string;         // Placeholder path
}
```

### Extended Artist Profile (ArtistProfile page)
```typescript
{
  ...Artist,
  coverImage: string;
  flatRates: { words: number; price: number }[];
  completedJobs: number;
  responseTime: string;
  memberSince: string;
  bio: string;
  equipment: string[];
  demos: { id: string; title: string; duration: string }[];
  reviews: {
    id: string;
    author: string;
    avatar: string;
    rating: number;
    date: string;
    content: string;
    project: string;
  }[];
}
```

### Project/Booking Object (Dashboard mock data)
```typescript
{
  id: string;
  name: string;
  artist: string;         // or client (Talent dashboard)
  artistAvatar: string;
  status: "pending" | "in_progress" | "delivered" | "completed" | "cancelled" | "pending_review";
  amount: number;
  deadline: string;
  wordCount?: number;
}
```

### Message Object
```typescript
{
  id: string;
  from: string;
  avatar: string;
  message: string;
  time: string;
  unread: boolean;
}
```

---

*End of Documentation*
