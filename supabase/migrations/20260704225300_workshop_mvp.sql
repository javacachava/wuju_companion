create extension if not exists pgcrypto;

create table if not exists public.workshop_characters (
  id text primary key,
  name text not null,
  author text not null,
  description text not null,
  category text not null,
  price integer not null default 0 check (price >= 0),
  rating numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5),
  saves_count integer not null default 0 check (saves_count >= 0),
  status text not null default 'published',
  current_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workshop_bundle_blobs (
  id uuid primary key default gen_random_uuid(),
  bundle_base64 text not null,
  bundle_size_bytes integer not null check (bundle_size_bytes > 0),
  checksum_sha256 text,
  created_at timestamptz not null default now()
);

create table if not exists public.workshop_character_versions (
  id uuid primary key default gen_random_uuid(),
  character_id text not null references public.workshop_characters(id) on delete cascade,
  version text not null,
  bundle_blob_id uuid not null references public.workshop_bundle_blobs(id) on delete cascade,
  metadata jsonb not null,
  created_at timestamptz not null default now(),
  unique(character_id, version)
);

create table if not exists public.character_minds (
  id text primary key,
  character_id text not null references public.workshop_characters(id) on delete cascade,
  version text not null,
  personality_raw text not null,
  instructions_raw text not null,
  permissions jsonb not null,
  voice jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.skins (
  id text primary key,
  character_id text not null references public.workshop_characters(id) on delete cascade,
  version text not null,
  skin_path text not null,
  preview_path text,
  icon_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_installed_characters (
  user_id text not null,
  character_id text not null references public.workshop_characters(id) on delete cascade,
  version text not null,
  mind_id text not null references public.character_minds(id) on delete cascade,
  skin_id text not null references public.skins(id) on delete cascade,
  installed_at timestamptz not null default now(),
  primary key (user_id, character_id)
);

create table if not exists public.user_active_profile (
  user_id text primary key,
  character_id text not null references public.workshop_characters(id) on delete cascade,
  mind_id text not null references public.character_minds(id) on delete cascade,
  skin_id text not null references public.skins(id) on delete cascade,
  applied_at timestamptz not null default now()
);

create table if not exists public.installation_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  character_id text not null,
  version text not null,
  event_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_workshop_characters_category on public.workshop_characters(category);
create index if not exists idx_workshop_characters_updated_at on public.workshop_characters(updated_at desc);
create index if not exists idx_workshop_characters_saves on public.workshop_characters(saves_count desc);
create index if not exists idx_user_installed_user on public.user_installed_characters(user_id);
create index if not exists idx_character_versions_character on public.workshop_character_versions(character_id);

alter table public.workshop_characters enable row level security;
alter table public.workshop_character_versions enable row level security;
alter table public.workshop_bundle_blobs enable row level security;
alter table public.user_installed_characters enable row level security;
alter table public.user_active_profile enable row level security;
alter table public.character_minds enable row level security;
alter table public.skins enable row level security;
alter table public.installation_audit_log enable row level security;

drop policy if exists "public_read_workshop_characters" on public.workshop_characters;
create policy "public_read_workshop_characters"
  on public.workshop_characters
  for select
  using (status = 'published');

drop policy if exists "public_read_workshop_versions" on public.workshop_character_versions;
create policy "public_read_workshop_versions"
  on public.workshop_character_versions
  for select
  using (true);

drop policy if exists "service_role_manage_bundles" on public.workshop_bundle_blobs;
create policy "service_role_manage_bundles"
  on public.workshop_bundle_blobs
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "own_installed_characters" on public.user_installed_characters;
create policy "own_installed_characters"
  on public.user_installed_characters
  for select
  using (user_id = auth.uid()::text or auth.role() = 'service_role');

drop policy if exists "own_active_profile" on public.user_active_profile;
create policy "own_active_profile"
  on public.user_active_profile
  for select
  using (user_id = auth.uid()::text or auth.role() = 'service_role');

drop policy if exists "service_role_manage_install_state" on public.user_installed_characters;
create policy "service_role_manage_install_state"
  on public.user_installed_characters
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service_role_manage_active_profile" on public.user_active_profile;
create policy "service_role_manage_active_profile"
  on public.user_active_profile
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service_role_manage_assets" on public.character_minds;
create policy "service_role_manage_assets"
  on public.character_minds
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service_role_manage_skins" on public.skins;
create policy "service_role_manage_skins"
  on public.skins
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service_role_manage_audit" on public.installation_audit_log;
create policy "service_role_manage_audit"
  on public.installation_audit_log
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create or replace function public.save_character_to_profile(
  p_user_id text,
  p_character_id text,
  p_version text,
  p_mind_id text,
  p_skin_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.character_minds cm
    where cm.id = p_mind_id
      and cm.character_id = p_character_id
      and cm.version = p_version
  ) then
    raise exception 'Character mind not found for this version';
  end if;

  if not exists (
    select 1
    from public.skins s
    where s.id = p_skin_id
      and s.character_id = p_character_id
      and s.version = p_version
  ) then
    raise exception 'Character skin not found for this version';
  end if;

  insert into public.user_installed_characters (
    user_id,
    character_id,
    version,
    mind_id,
    skin_id
  )
  values (
    p_user_id,
    p_character_id,
    p_version,
    p_mind_id,
    p_skin_id
  )
  on conflict (user_id, character_id) do update
  set
    version = excluded.version,
    mind_id = excluded.mind_id,
    skin_id = excluded.skin_id,
    installed_at = now();

  update public.workshop_characters
  set saves_count = saves_count + 1, updated_at = now()
  where id = p_character_id;

  insert into public.installation_audit_log (
    user_id,
    character_id,
    version,
    event_type
  )
  values (
    p_user_id,
    p_character_id,
    p_version,
    'saved_to_profile'
  );
end;
$$;

create or replace function public.apply_character_profile(
  p_user_id text,
  p_character_id text,
  p_mind_id text,
  p_skin_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.user_installed_characters uic
    where uic.user_id = p_user_id
      and uic.character_id = p_character_id
      and uic.mind_id = p_mind_id
      and uic.skin_id = p_skin_id
  ) then
    raise exception 'Character profile not installed for this user';
  end if;

  insert into public.user_active_profile (
    user_id,
    character_id,
    mind_id,
    skin_id
  )
  values (
    p_user_id,
    p_character_id,
    p_mind_id,
    p_skin_id
  )
  on conflict (user_id) do update
  set
    character_id = excluded.character_id,
    mind_id = excluded.mind_id,
    skin_id = excluded.skin_id,
    applied_at = now();

  insert into public.installation_audit_log (
    user_id,
    character_id,
    version,
    event_type
  )
  values (
    p_user_id,
    p_character_id,
    (
      select version
      from public.user_installed_characters
      where user_id = p_user_id and character_id = p_character_id
      limit 1
    ),
    'applied'
  );
end;
$$;
