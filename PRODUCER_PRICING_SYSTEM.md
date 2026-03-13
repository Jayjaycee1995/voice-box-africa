# Producer Pricing & Single Account System

## Overview

VoiceBox Africa Studio is now the **only available producer account** on the platform, with full **dynamic pricing capabilities** per service type.

---

## What Changed

### 1. **Single Producer Account System**

#### Database Changes (Migration 003)
- Added `is_official_producer` boolean flag to users table
- Added database trigger `enforce_single_official_producer` - only ONE account can be marked official
- Added database trigger `enforce_official_producer_only` - prevents non-official accounts from becoming producers
- Created initial VoiceBox Africa Studio producer account (template with placeholder UUID)

#### Code Impact
- **ProducerDiscovery.tsx**: Changed query to fetch only `is_official_producer = true`
- **ProducerSelector.tsx**: Changed query to fetch only `is_official_producer = true`
- **Register.tsx**: Already doesn't include "producer" option (only "client" or "talent")

#### Result
✅ Users cannot register as producers
✅ Only VoiceBox Africa Studio can be the producer
✅ Database enforces this constraint at the SQL level

---

### 2. **Dynamic Pricing System**

#### Database Changes (Migration 003)
Added `pricing_matrix` JSONB column to users table:

```json
{
  "studio_only": {
    "rate_per_hour": 0,
    "base_rate": 0,
    "currency": "USD"
  },
  "raw_recording": {
    "rate_per_hour": 0,
    "base_rate": 0,
    "currency": "USD"
  },
  "produced_and_mixed": {
    "rate_per_hour": 100,
    "base_rate": 0,
    "currency": "USD"
  },
  "producer_only": {
    "rate_per_hour": 125,
    "base_rate": 500,
    "currency": "USD"
  }
}
```

Structure:
- **rate_per_hour**: Hourly production rate ($)
- **base_rate**: One-time flat fee for the project ($)
- **currency**: ISO currency code (default: USD)

#### Type System (database.types.ts)
```typescript
interface ServicePricing {
  rate_per_hour: number;
  base_rate: number;
  currency: string;
}

interface ProducerPricingMatrix {
  studio_only?: ServicePricing;
  raw_recording?: ServicePricing;
  produced_and_mixed?: ServicePricing;
  producer_only?: ServicePricing;
}

interface ProducerPricingConfig {
  [serviceType: string]: ServicePricing;
}
```

#### Code Updates

**ProducerProfileSetup.tsx** - NEW PRICING SECTION
- Four cards for each service type (studio_only, raw_recording, produced_and_mixed, producer_only)
- Each card has:
  - Hourly rate input
  - Base rate input (optional, for flat fees)
  - Help text explaining the pricing model
- Pricing saved to database when "Save Profile" is clicked

**ProducerDiscovery.tsx** - PRICING DISPLAY
Changed from:
```typescript
${producer.production_rate_per_hour}/hr
```

To:
```typescript
${producer.pricing_matrix?.produced_and_mixed?.rate_per_hour || 
  producer.production_rate_per_hour || 0}/hr
```

Shows the "produced_and_mixed" rate as the primary discovery rate (most common use case)

**ProducerSelector.tsx** - SERVICE-SPECIFIC PRICING
```typescript
const getProducerRate = (producer: User): number => {
  if (serviceType && producer.pricing_matrix?.[serviceType]) {
    return producer.pricing_matrix[serviceType].rate_per_hour || 0;
  }
  return producer.production_rate_per_hour || 0;
};
```

Updated props to accept `serviceType: ServiceType` parameter
When clients select a service type, the ProducerSelector automatically shows pricing for that specific service type

**GigPosting.tsx** - PASS SERVICE TYPE
```typescript
<ProducerSelector 
  assignmentType={...}
  serviceType={selectedServiceType}  // NEW
  onSelect={setSelectedProducer}
  budget={form.watch("budget")}
/>
```

---

## How It Works

### Setup Flow (First Time)
1. VoiceBox Admin logs in as the official producer account
2. Goes to their dashboard
3. Sets up pricing for each service type in ProducerProfileSetup
4. Example pricing config:
   - **Studio Only**: $75/hr (no base rate)
   - **Raw Recording**: $50/hr (no base rate)
   - **Produced & Mixed**: $100/hr (no base rate)
   - **Producer Only**: $125/hr + $500 base fee

### Client Workflow
1. Client posts a gig
2. Client selects service type (e.g., "produced_and_mixed")
3. ProducerSelector automatically shows VoiceBox pricing for that service
4. Estimated cost = ($100/hr × 8 hours/day × 3 days) = $2,400
5. Plus base rate if applicable
6. Client is immediately aware of producer cost

### Producer Discovery
- Clients browse ProducerDiscovery page
- Only VoiceBox Africa Studio appears
- Pricing shown is from `pricing_matrix.produced_and_mixed` rate
- Full profile shows all service type pricing

---

## Database Initialization

### Create VoiceBox Producer Account

Run this SQL after migrating (replace {UUID} with actual auth.users ID):

```sql
UPDATE public.users 
SET 
  is_official_producer = true,
  is_producer = true,
  pricing_matrix = jsonb_object(
    array['studio_only', 'raw_recording', 'produced_and_mixed', 'producer_only'],
    array[
      jsonb_build_object('rate_per_hour', 50, 'base_rate', 0, 'currency', 'USD'),
      jsonb_build_object('rate_per_hour', 50, 'base_rate', 0, 'currency', 'USD'),
      jsonb_build_object('rate_per_hour', 100, 'base_rate', 0, 'currency', 'USD'),
      jsonb_build_object('rate_per_hour', 125, 'base_rate', 500, 'currency', 'USD')
    ]
  )
WHERE id = '{VOICEBOX_PRODUCER_UUID}';
```

Or find the VoiceBox user and update directly in Supabase dashboard.

---

## Pricing Examples

### Example 1: Raw Recording for 2 Days
```
Service Type: raw_recording
Pricing: $50/hour, no base rate
Turnaround: 2 days
Calculation: $50/hr × 8 hrs/day × 2 days = $800
```

### Example 2: Full Production Studio
```
Service Type: produced_and_mixed
Pricing: $100/hour, no base rate
Turnaround: 3 days
Calculation: $100/hr × 8 hrs/day × 3 days = $2,400
```

### Example 3: Mixing/Mastering Only
```
Service Type: producer_only
Pricing: $125/hour + $500 base
Turnaround: 3 days
Calculation: ($125/hr × 8 hrs/day × 3 days) + $500 = $3,500
```

---

## API Queries

### Update Producer Pricing
```typescript
const { error } = await supabase
  .from("users")
  .update({
    pricing_matrix: {
      produced_and_mixed: { rate_per_hour: 120, base_rate: 0, currency: "USD" },
      producer_only: { rate_per_hour: 150, base_rate: 500, currency: "USD" },
      // ... etc
    }
  })
  .eq("id", producerId);
```

### Fetch Producer Pricing for Service Type
```typescript
const { data: producer } = await supabase
  .from("users")
  .select("pricing_matrix")
  .eq("is_official_producer", true)
  .single();

const producedAndMixedRate = producer.pricing_matrix?.produced_and_mixed?.rate_per_hour;
```

---

## UI Components Updated

| Component | Change |
|-----------|--------|
| ProducerProfileSetup | Added 4-card pricing configuration section |
| ProducerDiscovery | Shows pricing from pricing_matrix.produced_and_mixed |
| ProducerSelector | Uses pricing_matrix per serviceType |
| GigPosting | Passes serviceType to ProducerSelector |
| ServiceTypeSelector | Display only (no changes needed) |

---

## Security

### RLS Policies
```sql
-- Producers can update own pricing
create policy "Producers can update own pricing" 
  on public.users for update 
  using ( auth.uid() = id and is_producer = true )
  with check ( auth.uid() = id and is_producer = true );
```

Only the official producer can update their own pricing matrix.

### Trigger Enforcement
```sql
-- Prevents non-official users from becoming producers
CREATE FUNCTION check_producer_account()
  RAISES EXCEPTION if is_producer = true AND is_official_producer = false

-- Prevents multiple official producers
CREATE FUNCTION check_single_official_producer()
  RAISES EXCEPTION if is_official_producer = true AND another official exists
```

---

## Next Steps

1. **Deploy Migration**
   ```bash
   supabase db push  # or manually run 003_add_producer_pricing_single_account.sql
   ```

2. **Create Official Producer Account**
   - Get the UUID of the VoiceBox producer auth.users record
   - Run the initialization SQL above
   - OR manually update in Supabase dashboard

3. **Configure Pricing**
   - Log in as VoiceBox producer
   - Go to ProducerDashboard
   - Open ProducerProfileSetup
   - Set rates for each service type
   - Save

4. **Test End-to-End**
   - Register as client
   - Post gig with "produced_and_mixed" service type
   - See VoiceBox studio pricing appear in ProducerSelector
   - Verify estimated cost calculation

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| ProducerSelector shows no producers | Check if producer is marked `is_official_producer = true` |
| Can't update pricing | Ensure user is the official producer, has `is_producer = true` |
| Correct rate not showing | Check pricing_matrix for specific service type, fallback uses production_rate_per_hour |
| Multiple producers showing | Database trigger should prevent this - check RLS policies |
| Error: "Only VoiceBox Africa Studio can be a producer" | Only `is_official_producer = true` users can have `is_producer = true` |

---

## Summary

✅ Only VoiceBox Africa Studio can be a producer (database enforced)
✅ Users cannot self-register as producers
✅ Producer can set different prices for each service type
✅ Clients see service-specific pricing when selecting producer
✅ Estimated costs calculated based on service type pricing
✅ Full backward compatibility with existing `production_rate_per_hour` field

**Status: Ready for production deployment 🚀**
