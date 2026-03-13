# Audio Producer System - Implementation Guide

## Overview
This guide covers the implementation of a complete audio producer system for VoiceBox Africa, enabling clients to choose between different service types (studio recording, remote recording, or fully produced audio with professional producers).

---

## System Architecture

### Service Types
Clients now choose how they want their project delivered:

```
┌─────────────────────────────────────────────────────┐
│              SERVICE TYPES                          │
├─────────────────────────────────────────────────────┤
│ 1. Studio Only                                      │
│    - Talent records at client's studio              │
│    - Direct oversight and control                   │
│    - No producer involvement                        │
│                                                      │
│ 2. Remote Raw Recording                             │
│    - Talent records from home                       │
│    - Raw audio delivered (no production)            │
│    - Fastest turnaround                             │
│                                                      │
│ 3. Produced & Mixed ⭐ Most Popular                 │
│    - Talent records remotely                        │
│    - Producer handles mixing/mastering              │
│    - Transparent workflow                           │
│    - Best audio quality                             │
│                                                      │
│ 4. Production Services Only                         │
│    - Client provides raw audio                      │
│    - Producer mixes/masters/edits                   │
│    - Flexible scope (mixing, mastering, etc.)       │
└─────────────────────────────────────────────────────┘
```

---

## Database Schema

### New Enums
```sql
-- service_type: How the gig will be delivered
studio_only | raw_recording | produced_and_mixed | producer_only

-- production_assignment_type: What the producer does
vocal_production | mixing | mastering | full_production

-- production_assignment_status: Assignment workflow
pending | accepted | in_progress | revision_requested | completed | cancelled

-- audio_deliverable_type: Version history
raw | produced | final | revision

-- audio_deliverable_status: Approval workflow
pending | approved | rejected | pending_revision
```

### New Tables

#### `production_services` (Producer Service Catalog)
```
id,
producer_id (FK to users),
title: "Professional Mixing Service",
description: "Full mix for voice-overs...",
assignment_type,
rate_per_hour: 75,
turnaround_days: 3,
featured_work_urls: ["example.com/sample1"],
is_active: true,
timestamp
```

#### `production_assignments` (Links Producers to Gigs)
```
id,
gig_id (FK),
producer_id (FK),
assignment_type,
status: "pending" → "accepted" → "in_progress" → "completed",
rate_amount: 450,
started_at,
completed_at,
feedback,
timestamp
```

#### `audio_deliverables` (Audio Version Tracking)
```
id,
gig_id (FK),
talent_id (FK - raw recording version),
producer_id (FK - produced version),
audio_type: "raw" | "produced" | "final",
file_url: "s3://bucket/file.mp3",
version_number: 1,
status: "pending" → "approved",
feedback: "Needs more compression on vocals",
created_by,
timestamp
```

#### `producer_ratings` (Client Reviews)
```
id,
producer_id (FK),
client_id (FK),
gig_id (FK),
rating: 4.8,
comment: "Excellent work!",
timestamp
```

### Updated Tables

#### `users` table - Added Producer Fields
```
is_producer: boolean
producer_skills: ["mixing", "mastering", "vocal_tuning"]
production_rate_per_hour: 75
production_equipment: "SSL 4000E, Neumann U87..."
turnaround_time_days: 3
portfolio_samples: [{title, url, type}]
```

#### `gigs` table - Added Producer Fields
```
service_type: "produced_and_mixed"
production_notes: "Any special mix requirements..."
requires_producer: true
assigned_producer_id: (UUID to producer)
```

---

## UI Components Created

### 1. ServiceTypeSelector Component
**File**: `src/components/gig/ServiceTypeSelector.tsx`
**Purpose**: Let clients choose how their project will be delivered

**Features**:
- 4 service options with icons and descriptions
- Feature highlights for each option
- "Most Popular" badge for produced_and_mixed
- Click to select, visual feedback with ring highlight

**Usage**:
```tsx
<ServiceTypeSelector 
  selectedServiceType={serviceType}
  onSelect={(type) => setServiceType(type)}
/>
```

### 2. ProducerSelector Component
**File**: `src/components/gig/ProducerSelector.tsx`
**Purpose**: Search and select a producer for a gig

**Features**:
- Real-time producer search
- Skills filtering (by assignment type)
- Rate and turnaround display
- Cost estimation calculation
- Producer profile preview
- Selected producer summary card

**Usage**:
```tsx
<ProducerSelector 
  assignmentType="full_production"
  onSelect={(producer) => setSelectedProducer(producer)}
  budget={3000}
/>
```

### 3. ProducerProfileSetup Component
**File**: `src/components/producer/ProducerProfileSetup.tsx`
**Purpose**: Allow producers to set up their profile

**Features**:
- Bio/about section
- Skill selection (add/remove)
- Rate per hour input
- Turnaround time setting
- Equipment list
- Save to database

**Skills Available**:
- vocal_production, mixing, mastering
- voice_tuning, sound_design, editing
- compression, eq, reverb, noise_reduction

### 4. AudioDeliverableUpload Component
**File**: `src/components/audio/AudioDeliverableUpload.tsx`
**Purpose**: Upload audio files for projects

**Features**:
- Audio file upload with drag-drop
- File validation (type, size)
- Upload progress tracking
- Optional notes/feedback
- Version tracking
- Success confirmation

**Limits**:
- Max 50MB per file
- Supported: MP3, WAV, FLAC, OGG

---

## Updated Pages

### GigPosting Page (4-Step Wizard)
**File**: `src/pages/GigPosting.tsx`

**New Flow**:
```
Step 1: Project Basics
├─ Title
├─ Language
├─ Accent
└─ Tone

Step 2: Details & Script
├─ Description
└─ Script snippet

Step 3: Service Type ⭐ NEW
├─ Select service type (studio_only, raw_recording, etc.)
└─ If producer needed: Select producer + add production notes

Step 4: Budget & Timeline
├─ Budget ($)
├─ Deadline
└─ Visibility
```

**Key Changes**:
- When "produced_and_mixed" or "producer_only" is selected, ProducerSelector appears
- GigPosting automatically creates ProductionAssignment record
- Assigns producer_id and service_type to gig

### ProducerDashboard Page
**File**: `src/pages/ProducerDashboard.tsx`

**Sections**:
1. **Stats Dashboard**
   - Total Earned
   - Completed Projects
   - Active Tasks
   - Average Rating

2. **Producer Profile Card**
   - Profile picture, name, skills
   - Production rate

3. **Production Assignments List**
   - Gig title and client info
   - Assignment type (vocal_production, mixing, etc.)
   - Budget and deadline
   - Status (pending, accepted, in_progress, completed)
   - Action buttons:
     - Accept/Decline (for pending)
     - Start Production (for accepted)

---

## Workflow Examples

### Example 1: Client Posts "Produced & Mixed" Gig
```
1. Client navigates to GigPosting
2. Fills in Project Basics (title, language, tone)
3. Adds Details & Script
4. Chooses "Produced & Mixed" service type
5. Sees available producers
6. Selects ProducerJohn (mixing expert)
7. Adds production notes: "Heavy vocal compression style"
8. Sets budget: $2,500 and deadline
9. Posts gig
→ ProductionAssignment created: 
   - gig_id, producer_id (ProducerJohn)
   - status: "pending", rate_amount: $2,000 (producer gets 80%, platform 20%)
→ Gig saved with: service_type="produced_and_mixed", assigned_producer_id
→ ProducerJohn receives notification
```

### Example 2: Talent Submits Raw Audio + Producer Processes
```
Scenario: Talent records remotely, producer mixes

Step 1: Talent accepts gig (raw_recording service)
Step 2: Talent uploads raw audio file
  → AudioDeliverable created: audio_type="raw", status="pending"
Step 3: Producer sees raw audio in their dashboard
Step 4: Producer downloads and mixes the audio
Step 5: Producer uploads produced version
  → AudioDeliverable created: audio_type="produced", status="pending"
Step 6: Client reviews produced version
Step 7: Client approves or requests revisions
Step 8: Producer uploads final master
  → AudioDeliverable created: audio_type="final", status="pending"
Step 9: Client approves and downloads final
```

---

## Payment Model

```
Project Budget: $3,000

Scenario 1: Studio Only (No Producer)
├─ Talent: $2,850 (95%)
└─ Platform: $150 (5%)

Scenario 2: Produced & Mixed
├─ Talent Fee: $1,500 (50%)
├─ Producer Fee: $1,350 (45%)
└─ Platform Fee: $150 (5%)

Scenario 3: Producer Only
├─ Producer Fee: $2,850 (95%)
└─ Platform Fee: $150 (5%)
```

---

## Database Migration

To apply these changes to your Supabase database:

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy and paste the contents of: `supabase/migrations/002_add_producer_system.sql`
4. Execute the migration

```bash
# Or use Supabase CLI
supabase db push
```

---

## Next Steps to Complete Integration

### 1. Update App Routing
Add ProducerDashboard to your App routing:
```tsx
// In your main routing file
<Route path="/producer-dashboard" element={<ProducerDashboard />} />
```

### 2. Update Registration Flow
Allow users to register as "producer" role:
```tsx
// In Register page, add role selection step
```

### 3. Add Navigation
Update navigation/menu to include:
- For Producers: Link to ProducerDashboard
- For Clients: New service type selection when posting gigs

### 4. Create Additional Components (Optional but Recommended)
- **AudioDeliverableViewer**: Waveform comparison, version history
- **ProducerDiscovery**: Browse/search all producers
- **ProducerPortfolio**: Showcase producer's best work samples
- **RevisionRequest**: Client feedback on audio deliverables

---

## Database Relationships

```
users
  ├─ has_many production_assignments (as producer)
  ├─ has_many production_services
  ├─ has_many producer_ratings (as producer)
  └─ has_many audio_deliverables (as producer or talent)

gigs
  ├─ has_one production_assignments (through producer)
  ├─ has_many audio_deliverables
  └─ belongs_to users (client)

production_assignments
  ├─ belongs_to gigs
  ├─ belongs_to users (producer)
  └─ has_many audio_deliverables

audio_deliverables
  ├─ belongs_to gigs
  ├─ belongs_to users (talent or producer)
  └─ belongs_to production_assignments (indirectly)

producer_ratings
  ├─ belongs_to users (producer)
  ├─ belongs_to users (client)
  └─ belongs_to gigs
```

---

## Testing Checklist

- [ ] Can post gig with each service_type
- [ ] Producer selector filters by skills
- [ ] ProductionAssignment created on gig post
- [ ] Producer receives notification / sees in dashboard
- [ ] Producer can accept/decline assignment
- [ ] Talent can upload raw audio
- [ ] Producer can upload produced audio
- [ ] Client can see all audio versions
- [ ] Ratings system works
- [ ] Payment splits calculated correctly

---

## Security Considerations

✅ **Implemented**:
- RLS policies on all producer tables
- Only producers can view/update own assignments
- Only clients can see proposals for their gigs
- Audio files stored in private storage bucket

⚠️ **To Implement**:
- Producer verification (email, portfolio review)
- Audio file access control (only involved parties)
- Payment escrow system
- Dispute resolution

---

## File Structure

```
src/
├── pages/
│   ├── GigPosting.tsx (Updated ✓)
│   ├── ProducerDashboard.tsx (NEW ✓)
│   └── ...
├── components/
│   ├── gig/
│   │   ├── ServiceTypeSelector.tsx (NEW ✓)
│   │   └── ProducerSelector.tsx (NEW ✓)
│   ├── producer/
│   │   └── ProducerProfileSetup.tsx (NEW ✓)
│   ├── audio/
│   │   └── AudioDeliverableUpload.tsx (NEW ✓)
│   └── ...
├── lib/
│   ├── database.types.ts (Updated ✓)
│   └── ...
└── supabase/
    └── migrations/
        ├── 001_create_notifications_table.sql
        └── 002_add_producer_system.sql (NEW ✓)
```

---

## API/Database Changes Summary

| Component | Type | Change |
|-----------|------|--------|
| users | Column | `is_producer` |
| users | Column | `producer_skills[]` |
| users | Column | `production_rate_per_hour` |
| users | Column | `production_equipment` |
| users | Column | `turnaround_time_days` |
| users | Column | `portfolio_samples` |
| gigs | Column | `service_type` |
| gigs | Column | `production_notes` |
| gigs | Column | `requires_producer` |
| gigs | Column | `assigned_producer_id` |
| - | Table | `production_services` (NEW) |
| - | Table | `production_assignments` (NEW) |
| - | Table | `audio_deliverables` (NEW) |
| - | Table | `producer_ratings` (NEW) |

---

## Questions & Support

For issues or questions about the producer system:
1. Check this guide first
2. Review the component code and comments
3. Test with a specific service_type scenario
4. Check Supabase dashboard for data
