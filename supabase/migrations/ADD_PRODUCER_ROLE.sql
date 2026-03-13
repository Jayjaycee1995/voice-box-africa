-- First, add 'producer' to the user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'producer';

-- Then run the insert again
INSERT INTO public.users (
  id, email, name, role, bio, is_producer, is_official_producer, is_available,
  producer_skills, production_rate_per_hour, turnaround_time_days, pricing_matrix,
  created_at, updated_at
) VALUES (
  '79cf1e85-f433-4a37-b0ab-2ed0792fba7a'::uuid,
  'studio@voiceboxafrica.com',
  'VoiceBox Africa Studio',
  'producer',
  'Official VoiceBox Africa audio production studio. Professional mixing, mastering, and full production services.',
  true, true, true,
  ARRAY['mixing', 'mastering', 'vocal_production', 'full_production'],
  75, 3,
  '{
    "studio_only": {"rate_per_hour": 75, "base_rate": 0, "currency": "USD"},
    "raw_recording": {"rate_per_hour": 75, "base_rate": 0, "currency": "USD"},
    "produced_and_mixed": {"rate_per_hour": 100, "base_rate": 0, "currency": "USD"},
    "producer_only": {"rate_per_hour": 125, "base_rate": 500, "currency": "USD"}
  }'::jsonb,
  now(), now()
);
