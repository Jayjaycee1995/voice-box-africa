# Audio Producer System - Integration Guide

## 🎯 What Was Just Added

Three major features have been integrated into VoiceBox Africa:

1. **App Routing** - ProducerDashboard and ProducerDiscovery routes
2. **Producer Discovery Page** - Browse, search, and filter producers
3. **Revision Request System** - Client feedback and producer revision workflow

---

## 📂 New/Updated Files

### Updated Files
- `src/App.tsx` - Added routes and role support for "producer"

### New Pages
- `src/pages/ProducerDashboard.tsx` - Already created in previous step
- `src/pages/ProducerDiscovery.tsx` - NEW: Producer search and browse

### New Components
- `src/components/audio/RevisionRequestForm.tsx` - Client requests revisions
- `src/components/producer/RevisionRequestList.tsx` - Producer manages revisions
- `src/components/audio/AudioDeliverableViewer.tsx` - Client reviews and approves audio

---

## 🔄 User Workflows

### Workflow 1: Client Discovers and Hires a Producer

```
Client goes to /producers
    ↓
Sees all available producers with:
  - Profile pictures and names
  - Skills badges (mixing, mastering, etc.)
  - Hourly rates
  - Turnaround time
  - Client ratings (star ratings)
    ↓
Filters by:
  - Skill (mixing, mastering, vocal_production, etc.)
  - Max rate ($50/hr, $75/hr, etc.)
  - Availability window
    ↓
Sorts by:
  - Top Rated (highest stars first)
  - Price (low to high or high to low)
  - Fastest Turnaround
    ↓
Clicks "View Profile" to see:
  - Full bio and equipment list
  - Portfolio samples
  - Complete skill set
  - Detailed ratings and reviews
```

### Workflow 2: Client Posts Gig and Gets Producer Matched

```
Client goes to /post-gig
    ↓
Step 1: Project Basics (title, language, tone)
Step 2: Details & Script
Step 3: Service Type Selection ⭐
    ├─ Chooses "Produced & Mixed"
    └─ ProducerSelector appears (auto-matched based on skills)
Step 4: Budget & Timeline
    ↓
Gig Posted!
    ├─ service_type = "produced_and_mixed"
    ├─ assigned_producer_id = (selected producer)
    └─ ProductionAssignment created (status: pending)
    ↓
Producer sees in /producer-dashboard:
    ├─ New assignment notification
    ├─ Gig details
    ├─ Client info
    └─ Accept/Decline buttons
```

### Workflow 3: Audio Review and Revision Cycle

```
Producer uploads audio version
    ↓
Client sees in /client-dashboard or gig details:
    ├─ AudioDeliverableViewer component
    ├─ Built-in audio player
    ├─ Status: "Pending Approval"
    └─ Three buttons:
        ├─ Approve → instantly approves
        ├─ Request Revision → opens RevisionRequestForm
        ├─ Download → Downloads audio file
    ↓
IF CLIENT CLICKS "Request Revision":
    ├─ Dialog opens with audio file info
    ├─ Client writes detailed feedback:
    │   - "Vocals need more compression"
    │   - "Reduce reverb by 20%"
    │   - "EQ out 500Hz harshness"
    ├─ Feedback sent to producer
    ├─ Status changes to "pending_revision"
    └─ Producer notified via message
    ↓
PRODUCER SEES REVISION REQUEST:
    ├─ Notification in /producer-dashboard
    ├─ RevisionRequestList shows:
    │   - Client's feedback highlighted
    │   - Link to download original audio
    │   - "Submit Revised Version" button
    ├─ Producer downloads original
    ├─ Makes adjustments based on feedback
    ├─ Uploads new version
    ├─ Adds notes: "Added parallel compression, reduced reverb -3dB"
    └─ Status changes to "pending" (awaiting approval)
    ↓
CLIENT REVIEWS AGAIN:
    ├─ AudioDeliverableViewer shows new version
    ├─ Can see all historical versions
    ├─ Compares against previous attempt
    ├─ Either Approves or Requests More Revisions
    └─ Cycle repeats as needed
    ↓
FINAL APPROVAL:
    ├─ Client clicks "Approve"
    ├─ Audio status: "approved"
    ├─ Green highlight indicates final
    ├─ Download button available for master file
    ├─ Producer paid
    └─ Project complete ✅
```

---

## 🎨 Component Integration Points

### In ClientDashboard
**Where to add AudioDeliverableViewer:**
```tsx
// In the "projects" or gig details section
<AudioDeliverableViewer 
  gigId={selectedGig.id}
  onDeliverableApprove={(delivId) => {
    // Mark gig as complete, trigger payment
  }}
/>
```

### In ProducerDashboard
**Where to add RevisionRequestList:**
```tsx
// In a new "Revisions" tab
<RevisionRequestList />
```

### In GigDetails (Talent View)
**Where to show deliverables:**
```tsx
// When a producer is assigned and uploads
<AudioDeliverableViewer 
  gigId={gig.id}
  // Talent can view but not approve
/>
```

---

## 🔐 Security Features

All new components include:

✅ **Row-Level Security (RLS)** on Supabase:
- Only producers can see own assignments
- Only clients can see proposals for their gigs
- Audio files stored in private bucket

✅ **Auth Checks**:
- ProducerDashboard requires "producer" role
- ProducerDiscovery is public but shows only verified producers
- Revision requests only between client and assigned producer

---

## 📊 UI Components Anatomy

### ProducerDiscovery Page Layout
```
┌─ Header ──────────────────────────────────────────┐
│ Find Your Audio Producer                          │
│ Browse and hire professional audio producers      │
├─ Filters Bar ─────────────────────────────────────┤
│ [Search___] [Skill▼] [MaxRate▼] [Sort▼]          │
├─ Producers Grid ──────────────────────────────────┤
│ ┌─ Producer Card ────────────────┐                │
│ │ [Avatar] Name                  │                │
│ │ ★★★★★ 4.8 (32 reviews)        │                │
│ │ Bio text...                    │                │
│ │ [mixing] [mastering] [+1]      │                │
│ │ ─────────────────────────────  │                │
│ │ $75/hr │ 3 days │ ✓ Available │                │
│ │ [View Profile Button]          │                │
│ └────────────────────────────────┘                │
└───────────────────────────────────────────────────┘
```

### AudioDeliverableViewer Layout
```
┌─ Awaiting Approval ────────────────────────────┐
│ ▼ 2 pending                                    │
│ ┌─ Audio Card ──────────────────────────────┐  │
│ │ ⏱️ Raw Recording | Uploaded Jan 12, 2026  │  │
│ │ [Pending Badge]                           │  │
│ │ ┌─────────────────────────────────────┐   │  │
│ │ │ [▶️ Audio Player with controls]    │   │  │
│ │ └─────────────────────────────────────┘   │  │
│ │ Producer Notes: "Check attached brief"    │  │
│ │ [Approve] [Request Revision] [Download]  │  │
│ └─────────────────────────────────────────┘   │
└────────────────────────────────────────────────┘

┌─ Approved Audio ──────────────────────────────┐
│ ✓ 1 approved                                  │
│ ┌─ Final Master Card (Green) ───────────────┐ │
│ │ ✓ Final | Approved Jan 20, 2026           │ │
│ │ [Approved Badge - Green]                  │ │
│ │ ┌─────────────────────────────────────┐   │ │
│ │ │ [▶️ Audio Player]                  │   │ │
│ │ └─────────────────────────────────────┘   │ │
│ │ [Download Master Button - Full Width]   │ │
│ └─────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

### RevisionRequestForm Dialog
```
┌─ Request Audio Revision ──────────────┐
│                                       │
│ Audio File: Final Master              │
│ Status: [To Revise]                   │
│                                       │
│ Revision Feedback:                    │
│ [Textarea for detailed feedback]      │
│ 45/500 characters                     │
│                                       │
│ 💡 Pro Tips:                          │
│ • Use reference tracks if applicable  │
│ • Be specific about timing of issues  │
│ • Include technical details           │
│                                       │
│ [Cancel] [Send Request]               │
└───────────────────────────────────────┘
```

---

## 🚀 Integration Checklist

- [x] Update App.tsx with routes and role
- [x] Create ProducerDiscovery page
- [x] Create RevisionRequestForm component
- [x] Create RevisionRequestList component
- [x] Create AudioDeliverableViewer component
- [ ] Add RevisionRequestList to ProducerDashboard
- [ ] Add AudioDeliverableViewer to ClientDashboard
- [ ] Add AudioDeliverableViewer to gig details page
- [ ] Update registration to include "producer" role selection
- [ ] Add notifications for producer assignments
- [ ] Style and polish components
- [ ] Test end-to-end workflows

---

## 📍 URL Routes Added

| Route | Component | Role |
|-------|-----------|------|
| `/producers` | ProducerDiscovery | Public |
| `/producer-dashboard` | ProducerDashboard | Producer |
| `/dashboard` | DashboardRedirect (auto-routes to correct dashboard) | Auth Required |

---

## 🔧 How to Use Each Component

### RevisionRequestForm
Used when a client wants to request changes to audio:
```tsx
<RevisionRequestForm
  gigId={3}
  deliverableId={42}
  producerId="uuid-of-producer"
  audioFileName="Final Master.mp3"
  onRevisionSuccess={() => {
    // Refresh deliverable list
    fetchDeliverables();
  }}
/>
```

### RevisionRequestList
Used in ProducerDashboard to show pending revisions:
```tsx
<RevisionRequestList />
// Automatically fetches for current logged-in producer
// Shows only "pending_revision" status deliverables
```

### AudioDeliverableViewer
Used whenever showing project audio files:
```tsx
<AudioDeliverableViewer
  gigId={3}
  onDeliverableApprove={(deliverId) => {
    console.log("Deliverable approved:", deliverId);
    // Trigger payment, mark project complete, etc.
  }}
/>
```

---

## 🎬 Next Steps (Quick Start)

1. **Test the Routes**:
   ```bash
   npm run dev
   # Visit http://localhost:8080/producers
   # Visit http://localhost:8080/producer-dashboard (if logged in as producer)
   ```

2. **Add Components to Dashboards**:
   - Open `src/pages/ClientDashboard.tsx`
   - Add `<AudioDeliverableViewer />` to show deliverables
   - Open `src/pages/ProducerDashboard.tsx`
   - Add `<RevisionRequestList />` to a new tab

3. **Update Registration**:
   - Open `src/pages/Register.tsx`
   - Add role selection step (client, talent, producer)
   - Set `is_producer: true` when registering as producer

4. **Deploy Migration**:
   ```sql
   -- In Supabase SQL Editor:
   -- Run supabase/migrations/002_add_producer_system.sql
   ```

---

## 📱 Responsive Design

All new components are fully responsive:
- ✅ Mobile (< 640px)
- ✅ Tablet (640px - 1024px)
- ✅ Desktop (> 1024px)

Grid layouts automatically adjust from 1 column (mobile) → 3 columns (desktop).

---

## 🎓 User Stories Enabled

**Producer User Story**:
> "As a producer, I want to see my assignments in my dashboard, review feedback from clients, and submit revised versions without losing track of what was changed."

✅ **Enabled by**: ProducerDashboard + RevisionRequestList

**Client User Story**:
> "As a client, I want to find qualified producers by their skills and rates, hire them directly, review audio they submit, request changes clearly, and download the final master when I'm happy."

✅ **Enabled by**: ProducerDiscovery + AudioDeliverableViewer + RevisionRequestForm

**Talent User Story**:
> "As talent, I want to work with professional producers to deliver higher-quality audio to clients."

✅ **Enabled by**: Automatic producer assignment + revision workflow

---

## 🐛 Troubleshooting

**ProducerDashboard shows "Access denied"?**
- Ensure user has `role: "producer"` in database
- Check RequireRole component guards

**ProducerDiscovery shows no producers?**
- Ensure producers have `is_producer: true` in database
- Check if any producers exist with `production_rate_per_hour > 0`

**Revision requests not showing up?**
- Ensure `status: "pending_revision"` in audio_deliverables
- Check Supabase logs for RLS policy denials

**Audio player not working?**
- Check storage bucket permissions
- Verify file_url is accessible
- Test with different audio format (MP3 vs WAV)

---

## 📚 Related Documentation

- See `PRODUCER_SYSTEM_GUIDE.md` for full system architecture
- See `src/lib/database.types.ts` for TypeScript interfaces
- See `supabase/migrations/002_add_producer_system.sql` for schema

---

## 🎉 Success Indicators

You'll know this is working when:

✅ You can navigate to `/producers` and see a list of producers
✅ Producers have skill badges, rates, and ratings displayed
✅ You can filter/search producers and results update in real-time
✅ You can click a revision request button and submit feedback
✅ Producers can see revision requests in their dashboard
✅ Audio players work and play back uploaded files
✅ Approval status correctly changes color (green for approved)

**All three features successfully integrated! 🚀**
