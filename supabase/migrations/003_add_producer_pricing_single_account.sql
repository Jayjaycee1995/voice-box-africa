-- Add pricing and single-producer constraints

-- Add pricing matrix to users table (JSONB with service type pricing)
alter table public.users add column if not exists pricing_matrix jsonb default jsonb_object(
  array['studio_only', 'raw_recording', 'produced_and_mixed', 'producer_only'],
  array[
    jsonb_build_object('rate_per_hour', 0, 'base_rate', 0),
    jsonb_build_object('rate_per_hour', 0, 'base_rate', 0),
    jsonb_build_object('rate_per_hour', 0, 'base_rate', 0),
    jsonb_build_object('rate_per_hour', 0, 'base_rate', 0)
  ]
);

-- Add flag to mark official VoiceBox producer
alter table public.users add column if not exists is_official_producer boolean default false;

-- Create constraint: only one official producer can exist
create or replace function check_single_official_producer()
returns trigger as $$
begin
  if new.is_official_producer = true then
    if exists (
      select 1 from public.users 
      where is_official_producer = true 
      and id != new.id
    ) then
      raise exception 'Only one official VoiceBox producer account is allowed';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

-- Create trigger for official producer constraint
drop trigger if exists enforce_single_official_producer on public.users;
create trigger enforce_single_official_producer
  before insert or update on public.users
  for each row
  execute function check_single_official_producer();

-- Prevent non-official accounts from becoming producers
create or replace function check_producer_account()
returns trigger as $$
begin
  if new.is_producer = true and new.is_official_producer = false then
    raise exception 'Only VoiceBox Africa Studio can be a producer. Please contact support.';
  end if;
  return new;
end;
$$ language plpgsql;

-- Create trigger to enforce producer restriction
drop trigger if exists enforce_official_producer_only on public.users;
create trigger enforce_official_producer_only
  before insert or update on public.users
  for each row
  execute function check_producer_account();

-- Create initial VoiceBox Africa Studio producer account (if it doesn't exist)
-- Note: You'll need to get the actual auth.users UUID and replace {VOICEBOX_AUTH_ID}
-- For now, this is a template - update with actual ID from Supabase Auth
insert into public.users (
  id,
  username,
  email,
  avatar_url,
  bio,
  is_producer,
  is_official_producer,
  producer_skills,
  production_rate_per_hour,
  turnaround_time_days,
  pricing_matrix,
  created_at,
  updated_at
) values (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'VoiceBox Africa Studio',
  'studio@voiceboxafrica.com',
  'https://voiceboxafrica.com/studio-logo.png',
  'Official VoiceBox Africa audio production studio. Professional mixing, mastering, and full production services.',
  true,
  true,
  array['mixing', 'mastering', 'vocal_production', 'full_production'],
  75,
  3,
  jsonb_object(
    array['studio_only', 'raw_recording', 'produced_and_mixed', 'producer_only'],
    array[
      jsonb_build_object('rate_per_hour', 75, 'base_rate', 0, 'currency', 'USD'),
      jsonb_build_object('rate_per_hour', 75, 'base_rate', 0, 'currency', 'USD'),
      jsonb_build_object('rate_per_hour', 100, 'base_rate', 0, 'currency', 'USD'),
      jsonb_build_object('rate_per_hour', 125, 'base_rate', 500, 'currency', 'USD')
    ]
  ),
  now(),
  now()
) on conflict (id) do nothing;

-- Add RLS policy for pricing updates
alter table public.users enable row level security;

-- Allow producers to update own pricing
create policy "Producers can update own pricing" 
  on public.users for update 
  using ( auth.uid() = id and is_producer = true )
  with check ( auth.uid() = id and is_producer = true );

-- Comment explaining pricing structure
comment on column public.users.pricing_matrix is 'JSON object with service type as keys. Each service has rate_per_hour, base_rate, and currency. Example: {"produced_and_mixed": {"rate_per_hour": 100, "base_rate": 500, "currency": "USD"}}';
