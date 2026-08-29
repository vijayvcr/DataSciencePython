-- Family Habit Tracker schema for Supabase
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)

-- Families
create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  invite_code text unique not null,
  created_at timestamptz not null default now()
);

-- Family membership
create table if not exists family_members (
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create index if not exists family_members_user_id_idx on family_members(user_id);

-- Shared habits per family
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  emoji text not null,
  color text not null,
  created_at timestamptz not null default now()
);

create index if not exists habits_family_id_idx on habits(family_id);

-- Daily completions
create table if not exists completions (
  habit_id uuid not null references habits(id) on delete cascade,
  date date not null,
  primary key (habit_id, date)
);

create index if not exists completions_habit_id_idx on completions(habit_id);

-- Helper: family IDs for the current user
create or replace function get_user_family_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select family_id from family_members where user_id = auth.uid();
$$;

-- Create a new family and add the caller as a member
create or replace function create_family(family_name text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  new_family families%rowtype;
  code text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from family_members where user_id = auth.uid()) then
    raise exception 'Already in a family';
  end if;

  loop
    code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    exit when not exists (select 1 from families where invite_code = code);
  end loop;

  insert into families (name, invite_code)
  values (trim(family_name), code)
  returning * into new_family;

  insert into family_members (family_id, user_id)
  values (new_family.id, auth.uid());

  return json_build_object(
    'id', new_family.id,
    'name', new_family.name,
    'invite_code', new_family.invite_code
  );
end;
$$;

-- Join an existing family by invite code
create or replace function join_family(code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  fam families%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from family_members where user_id = auth.uid()) then
    raise exception 'Already in a family';
  end if;

  select * into fam
  from families
  where invite_code = upper(trim(code));

  if fam.id is null then
    raise exception 'Invalid invite code';
  end if;

  insert into family_members (family_id, user_id)
  values (fam.id, auth.uid());

  return json_build_object(
    'id', fam.id,
    'name', fam.name,
    'invite_code', fam.invite_code
  );
end;
$$;

-- Row Level Security
alter table families enable row level security;
alter table family_members enable row level security;
alter table habits enable row level security;
alter table completions enable row level security;

-- Families: members can read their family
create policy "Members can view their family"
  on families for select
  using (id in (select get_user_family_ids()));

-- Family members: can view co-members
create policy "Members can view family members"
  on family_members for select
  using (family_id in (select get_user_family_ids()));

-- Habits
create policy "Members can view habits"
  on habits for select
  using (family_id in (select get_user_family_ids()));

create policy "Members can create habits"
  on habits for insert
  with check (family_id in (select get_user_family_ids()));

create policy "Members can update habits"
  on habits for update
  using (family_id in (select get_user_family_ids()));

create policy "Members can delete habits"
  on habits for delete
  using (family_id in (select get_user_family_ids()));

-- Completions (via habit's family)
create policy "Members can view completions"
  on completions for select
  using (
    habit_id in (
      select id from habits where family_id in (select get_user_family_ids())
    )
  );

create policy "Members can add completions"
  on completions for insert
  with check (
    habit_id in (
      select id from habits where family_id in (select get_user_family_ids())
    )
  );

create policy "Members can remove completions"
  on completions for delete
  using (
    habit_id in (
      select id from habits where family_id in (select get_user_family_ids())
    )
  );

-- Realtime (optional): enable replication for habits and completions in Supabase Dashboard
-- Database → Replication → supabase_realtime → add habits, completions
