# Producer System - Quick Reference

## 🗺️ Architecture Overview

```
┌─ User Registration ─────────────────────┐
│ Choose role: client, talent, producer   │
└─────────────────────────────────────────┘
  ↓
┌─ Producer Profile Setup ────────────────┐
│ Skills, rates, equipment, portfolio      │
│ Stored in: users table (producer fields) │
└─────────────────────────────────────────┘
  ↓
┌─ Client Posts Gig ──────────────────────┐
│ Selects service_type:                   │
│ - studio_only                           │
│ - raw_recording                         │
│ - produced_and_mixed ← triggers this→ →┐│
│ - producer_only                         │││
└─────────────────────────────────────────┘││
  ↓                                       ││
┌─ Producer Auto-matched ────────────────┐││
│ Based on skills + availability          │││
│ Producer can Accept/Decline assignment  │││
│ Stored in: production_assignments table ││
└────────────────────────────────────────┘││
  ↓                                       ││
┌─ Producer Records/Produces Audio ──────┐││
│ Uploads file(s)                        │││
│ Stored in: supabase audio-deliverables │││
│ Status: pending                        │││
└────────────────────────────────────────┘││
  ↓                                       ││
┌─ Client Reviews ──────────────────────┐││
│ Option 1: Approve → Final payment ✓   │││
│ Option 2: Request Revision           │││
│ Stored: feedback in audio_deliverable ││
└────────────────────────────────────────┘││
  ↓                                       ││
┌─ Producer Revises ──────────────────┐│││
│ Gets feedback notification           ││
│ Downloads original audio             ││
│ Makes changes, uploads new version   ││
│ Creates new audio_deliverable record ││
└─────────────────────────────────────┘││
  ↓                                    ││
└─ Cycle repeats until approval ──────┘││
```

## 📊 Database Tables

### 1. users (Extended)
```sql
-- New columns for producers:
is_producer         BOOLEAN DEFAULT false
producer_skills     TEXT[] -- ['mixing', 'mastering', 'vocal_production']
production_rate_per_hour  INTEGER -- in cents ($75 = 7500)
turnaround_time_days INTEGER DEFAULT 3
portfolio_samples   JSONB -- {url, title, description}
```

### 2. gigs (Extended)
```sql
-- New columns:
service_type        service_type_enum -- studio_only, raw_recording, etc.
production_notes    TEXT
requires_producer   BOOLEAN DEFAULT false
assigned_producer_id UUID FOREIGN KEY -> users.id
```

### 3. production_assignments ⭐ NEW
```sql
gig_id              UUID FOREIGN KEY -> gigs.id
producer_id         UUID FOREIGN KEY -> users.id
status              assignment_status -- pending, accepted, in_progress, completed
accepted_at         TIMESTAMP
started_at          TIMESTAMP
completed_at        TIMESTAMP
producer_notes      TEXT
```

### 4. audio_deliverables ⭐ NEW
```sql
gig_id              UUID FOREIGN KEY -> gigs.id
producer_id         UUID FOREIGN KEY -> users.id
audio_type          audio_deliverable_type -- recording, revision
file_url            TEXT -- path in supabase storage
file_size           INTEGER
duration_seconds    INTEGER
version_number      INTEGER DEFAULT 1
status              audio_deliverable_status -- pending, pending_revision, approved
feedback            TEXT -- revision notes from client
approval_notes      TEXT -- notes when approved
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

### 5. producer_ratings ⭐ NEW
```sql
rater_id            UUID FOREIGN KEY -> users.id (the client)
producer_id         UUID FOREIGN KEY -> users.id (the producer)
gig_id              UUID FOREIGN KEY -> gigs.id
rating              INTEGER (1-5 stars)
review_text         TEXT
created_at          TIMESTAMP
```

## 🎯 Enums

```typescript
// In database.types.ts
export type ServiceType = 
  | 'studio_only' 
  | 'raw_recording' 
  | 'produced_and_mixed' 
  | 'producer_only';

export type ProductionAssignmentStatus = 
  | 'pending' 
  | 'accepted' 
  | 'in_progress' 
  | 'completed';

export type AudioDeliverableType = 
  | 'recording' 
  | 'revision';

export type AudioDeliverableStatus = 
  | 'pending' 
  | 'pending_revision' 
  | 'approved';
```

## 🧩 Components Map

```
src/pages/
├── ProducerDashboard.tsx
│   ├── Stats cards (earnings, projects, tasks, rating)
│   ├── Producer profile card (editable)
│   └── Production assignments list (with Accept/Decline)
│
└── ProducerDiscovery.tsx
    ├── Search/filter bar
    ├── Sort options dropdown
    ├── Producer grid (responsive)
    └── Producer cards (tappable for details)

src/components/audio/
├── RevisionRequestForm.tsx (dialog)
│   ├── Client writes feedback
│   ├── Sends to producer
│   └── Updates status to pending_revision
│
├── AudioDeliverableViewer.tsx
│   ├── Pending section (with Approve/Request Revision/Download)
│   ├── Approved section (with Download Master)
│   └── Audio players for each version
│
└── AudioDeliverableUpload.tsx (existing - used in GigPosting)

src/components/producer/ (new folder)
└── RevisionRequestList.tsx
    ├── Shows pending revisions for producer
    ├── Client feedback display
    ├── Revision upload dialog
    └── Updates status back to pending
```

## 🔐 Security Rules (RLS Policies)

```sql
-- production_assignments
- Producers can SELECT/UPDATE own assignments
- Clients can SELECT assignments for their gigs
- Only system can INSERT/DELETE

-- audio_deliverables
- Producers can SELECT/INSERT/UPDATE own files
- Clients can SELECT files for their gigs
- Clients can UPDATE status (approve/feedback)
- Clients CANNOT DELETE

-- producer_ratings
- Clients can INSERT ratings for completed gigs
- Everyone can SELECT (public ratings)
- Ratings cannot be updated (immutable)

-- users (producer fields)
- Producers can UPDATE own fields
- Everyone can SELECT is_producer, skills, rate (public)
```

## 🔄 Complete User Flows

### Flow 1: I'm a New Producer
```
1. Register → Choose "producer" role
2. Set up profile:
   - Upload avatar
   - Write bio
   - Select skills
   - Set hourly rate
   - Add turnaround time
   - Upload portfolio samples
3. Save profile
4. Go to /producer-dashboard
5. Wait for assignment requests
6. Accept gigs you want
7. Work on them
```

### Flow 2: I'm a Client Hiring a Producer

```
1. Search: Go to /producers
2. Filter: By skill, max rate, turnaround
3. Sort: By rating, price, or speed
4. Review: Click producer card for full profile
5. Post gig: Create gig with service_type="produced_and_mixed"
6. Select producer: ProducerSelector auto-appears
7. Producer accepts: You get notified
8. Producer uploads: You see in your dashboard
9. Review: Either approve or request revision
10. Done: Download final master file when approved
```

### Flow 3: I'm Talent Not Directly Hiring
```
1. Post gig normally
2. Clients choose to hire a producer
3. You still get paid the same
4. Producer handles quality
5. You get final product from producer
```

## 🚀 API Endpoints (Supabase)

```typescript
// Select producers with ratings
.from('users')
.select(`
  *,
  producer_ratings(avg(rating), count)
`)
.eq('is_producer', true)

// Get producer assignments
.from('production_assignments')
.select(`
  *,
  gigs(*),
  producer_id
`)
.eq('producer_id', userId)

// Get audio deliverables for gig
.from('audio_deliverables')
.select('*')
.eq('gig_id', gigId)
.order('created_at', { ascending: false })

// Update deliverable status
.from('audio_deliverables')
.update({ status: 'approved', approval_notes: '...' })
.eq('id', delivId)

// Request revision (update + message)
.from('audio_deliverables')
.update({ status: 'pending_revision', feedback: '...' })
.eq('id', delivId)
```

## 💰 Payment Logic

```typescript
// When gig with producer is completed:
totalBudget = $5000

if (serviceType === 'produced_and_mixed') {
  producerCut = talentHourlyRate * turnaroundDays // e.g. $75 * 3 = $225
  talentCut = totalBudget - producerCut - platformFee
  platformFee = totalBudget * 0.1 // 10% platform cut
}
```

## 🎨 Status Badge Colors

```typescript
// AudioDeliverableStatus
'pending'           → Gray ("⏱️ Pending Approval")
'pending_revision'  → Orange ("🔄 Revision Requested")
'approved'          → Green ("✅ Approved")

// ProductionAssignmentStatus
'pending'           → Blue ("Waiting for response...")
'accepted'          → Green ("In Progress")
'in_progress'       → Purple ("🎵 Recording")
'completed'         → Green ("✅ Complete")
```

## 📱 Component Props Quick Reference

### AudioDeliverableViewer
```typescript
interface Props {
  gigId: string;
  onDeliverableApprove?: (delivId: string) => void;
}
```

### RevisionRequestForm
```typescript
interface Props {
  gigId: string;
  deliverableId: string;
  producerId: string;
  audioFileName: string;
  onRevisionSuccess?: () => void;
}
```

### RevisionRequestList
```typescript
// No props - auto-fetches for current logged-in producer
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Producer not showing in discovery | Check `is_producer: true` in database |
| Can't upload audio | Check storage bucket permissions |
| Revision request button doesn't appear | Check `authenticated` guard in component |
| Assignment not appearing in dashboard | Check `producer_id` matches logged-in user |
| Audio player won't play | Verify file_url is correct path in storage |

## 🔗 File Storage Structure

```
supabase/storage/audio-deliverables/
├── {user_id}/
│   └── {gig_id}/
│       ├── original.mp3
│       ├── revision_1.mp3
│       ├── revision_2.mp3
│       └── final_master.mp3
```

## 📈 Notifications to Add

```javascript
// ProducerAssignmentCreated
→ "New gig assigned! {gig_name} by {client_name}"

// RevisionRequested
→ "{client_name} requested revisions: {feedback}"

// DeliverableApproved
→ "{client_name} approved audio. You've been paid!"

// ProducerAssignmentAccepted
→ "{producer_name} accepted your gig!"
```

## ✅ Testing Checklist

- [ ] Register as producer, complete profile
- [ ] Search producers on /producers page
- [ ] Post gig with service_type="produced_and_mixed"
- [ ] Auto-matching assigns correct producer
- [ ] Producer sees assignment in dashboard
- [ ] Producer accepts/declines
- [ ] Upload audio as producer
- [ ] Client sees audio in deliverables viewer
- [ ] Client approves audio successfully
- [ ] Client requests revision (feedback sent)
- [ ] Producer sees revision request
- [ ] Producer uploads revised version
- [ ] Client approves revised version
- [ ] Final status shows "approved" (green)

---

**Last Updated:** After complete producer system integration
**Status:** ✅ Ready for integration into dashboards
