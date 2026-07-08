create table if not exists public.torque_specs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  manufacturer text not null default '',
  model text not null default '',
  series text not null default '',
  year_from integer,
  year_to integer,
  engine_code text not null default '',
  transmission_code text not null default '',
  drive_type text not null default '',
  system_group text not null default '',
  component text not null default '',
  fastener text not null default '',
  position text not null default '',
  torque_nm numeric(8,2) not null,
  torque_angle_deg numeric(8,2),
  torque_sequence text not null default '',
  new_fastener_required boolean not null default false,
  thread_condition text not null default '',
  safety_level text not null default 'important',
  note text not null default '',
  source_type text not null default 'Herstellerdaten',
  source_reference text not null default '',
  source_note text not null default '',
  status text not null default 'draft',
  visibility text not null default 'private',
  review_comment text not null default '',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint torque_specs_status_check check (
    status in ('draft', 'pending_review', 'approved', 'rejected', 'blocked', 'outdated')
  ),
  constraint torque_specs_visibility_check check (
    visibility in ('private', 'shared')
  ),
  constraint torque_specs_safety_level_check check (
    safety_level in ('normal', 'important', 'safety_critical', 'engine_critical', 'high_voltage')
  ),
  constraint torque_specs_torque_nm_check check (torque_nm > 0),
  constraint torque_specs_torque_angle_check check (
    torque_angle_deg is null or torque_angle_deg > 0
  ),
  constraint torque_specs_year_range_check check (
    year_from is null or year_to is null or year_from <= year_to
  )
);

create index if not exists torque_specs_user_updated_idx
  on public.torque_specs(user_id, updated_at desc);

create index if not exists torque_specs_status_updated_idx
  on public.torque_specs(status, updated_at desc);

create index if not exists torque_specs_lookup_idx
  on public.torque_specs(status, manufacturer, model, engine_code, system_group, component);

create or replace function public.set_diagnosehub_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_torque_specs_updated_at
  on public.torque_specs;

create trigger set_torque_specs_updated_at
before update on public.torque_specs
for each row
execute function public.set_diagnosehub_updated_at();

alter table public.torque_specs enable row level security;

drop policy if exists "Eigene Drehmomente lesen"
  on public.torque_specs;
drop policy if exists "Freigegebene Drehmomente lesen"
  on public.torque_specs;
drop policy if exists "Eigene Drehmomente anlegen"
  on public.torque_specs;
drop policy if exists "Eigene Drehmomente bearbeiten"
  on public.torque_specs;
drop policy if exists "Eigene Drehmomente löschen"
  on public.torque_specs;

create policy "Eigene Drehmomente lesen"
on public.torque_specs
for select
to authenticated
using (user_id = auth.uid());

create policy "Freigegebene Drehmomente lesen"
on public.torque_specs
for select
to authenticated
using (status = 'approved' and visibility = 'shared');

create policy "Eigene Drehmomente anlegen"
on public.torque_specs
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status in ('draft', 'pending_review')
  and visibility = 'private'
);

create policy "Eigene Drehmomente bearbeiten"
on public.torque_specs
for update
to authenticated
using (
  user_id = auth.uid()
  and status in ('draft', 'pending_review', 'rejected')
)
with check (
  user_id = auth.uid()
  and status in ('draft', 'pending_review', 'rejected')
  and visibility = 'private'
);

create policy "Eigene Drehmomente löschen"
on public.torque_specs
for delete
to authenticated
using (
  user_id = auth.uid()
  and status <> 'approved'
);
