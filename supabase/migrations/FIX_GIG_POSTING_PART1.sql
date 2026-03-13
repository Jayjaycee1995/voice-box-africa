-- PART 1: Run this first in Supabase SQL Editor
-- Create Enums

-- Create service_type enum for gigs
DO $$
BEGIN
  CREATE TYPE service_type AS ENUM (
    'studio_only',
    'raw_recording',
    'produced_and_mixed',
    'producer_only'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create production_assignment_type enum
DO $$
BEGIN
  CREATE TYPE production_assignment_type AS ENUM (
    'vocal_production',
    'mixing',
    'mastering',
    'full_production'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create production_assignment_status enum
DO $$
BEGIN
  CREATE TYPE production_assignment_status AS ENUM (
    'pending',
    'accepted',
    'in_progress',
    'revision_requested',
    'completed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create audio_deliverable_type enum
DO $$
BEGIN
  CREATE TYPE audio_deliverable_type AS ENUM (
    'raw',
    'produced',
    'final',
    'revision'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create audio_deliverable_status enum
DO $$
BEGIN
  CREATE TYPE audio_deliverable_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'pending_revision'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
