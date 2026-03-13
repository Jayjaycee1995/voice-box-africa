-- The user already exists. Let's update it with producer fields.
UPDATE public.users SET
  role = 'producer',
  bio = 'Official VoiceBox Africa audio production studio. Professional mixing, mastering, and full production services.',
  is_producer = true,
  is_official_producer = true,
  is_available = true,
  producer_skills = ARRAY['mixing', 'mastering', 'vocal_production', 'full_production'],
  production_rate_per_hour = 75,
  turnaround_time_days = 3,
  pricing_matrix = '{
    "studio_only": {"rate_per_hour": 75, "base_rate": 0, "currency": "USD"},
    "raw_recording": {"rate_per_hour": 75, "base_rate": 0, "currency": "USD"},
    "produced_and_mixed": {"rate_per_hour": 100, "base_rate": 0, "currency": "USD"},
    "producer_only": {"rate_per_hour": 125, "base_rate": 500, "currency": "USD"}
  }'::jsonb,
  updated_at = now()
WHERE id = '79cf1e85-f433-4a37-b0ab-2ed0792fba7a'::uuid;
