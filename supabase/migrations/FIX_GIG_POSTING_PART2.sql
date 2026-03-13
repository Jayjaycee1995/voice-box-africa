-- PART 2: Add columns to users and gigs tables
-- Run this in Supabase SQL Editor

-- Add columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_producer BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS producer_skills TEXT[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS production_rate_per_hour NUMERIC(10, 2);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS production_equipment TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS turnaround_time_days INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS portfolio_samples JSONB;

-- Add pricing matrix column (without default to avoid the jsonb_build_object issue)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pricing_matrix JSONB;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_official_producer BOOLEAN DEFAULT false;

-- Add columns to gigs table
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS service_type service_type DEFAULT 'studio_only';
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS production_notes TEXT;
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS requires_producer BOOLEAN DEFAULT false;
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS assigned_producer_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
