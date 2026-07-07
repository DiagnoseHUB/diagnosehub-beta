-- Accountgebundene Geräte-/Sessionbegrenzung. Keine IP-Begrenzung.

create table if not exists public.device_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null,
  device_name text not null default 'Unbekanntes Gerät',
  user_agent text not null default '',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, device_id)
);

create index if not exists device_registrations_user_active_idx
  on public.device_registrations(user_id, revoked_at, last_seen_at desc);

alter table public.device_registrations
  alter column device_name set default 'Unbekanntes Gerät';

create or replace function public.set_device_registrations_last_seen_at()
returns trigger
language plpgsql
as $$
begin
  new.last_seen_at = now();
  return new;
end;
$$;

drop trigger if exists set_device_registrations_last_seen_at
  on public.device_registrations;

create trigger set_device_registrations_last_seen_at
before update on public.device_registrations
for each row
execute function public.set_device_registrations_last_seen_at();

alter table public.device_registrations enable row level security;

drop policy if exists "Eigene Geräte lesen"
  on public.device_registrations;
drop policy if exists "Eigene Geräte anlegen"
  on public.device_registrations;
drop policy if exists "Eigene Geräte aktualisieren"
  on public.device_registrations;
drop policy if exists "Eigene Geräte löschen"
  on public.device_registrations;

create policy "Eigene Geräte lesen"
on public.device_registrations
for select
to authenticated
using (user_id = auth.uid());

create policy "Eigene Geräte anlegen"
on public.device_registrations
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Eigene Geräte aktualisieren"
on public.device_registrations
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Eigene Geräte löschen"
on public.device_registrations
for delete
to authenticated
using (user_id = auth.uid());
