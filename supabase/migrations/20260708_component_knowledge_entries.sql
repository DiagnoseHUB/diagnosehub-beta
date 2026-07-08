create table if not exists public.component_knowledge_entries (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  query text not null default '',
  normalized_query text not null,
  title text not null default '',
  topic_type text not null default 'component',
  answer text not null default '',
  answer_format_version integer not null default 1,
  model text not null default '',
  source text not null default 'ai_generated',
  status text not null default 'generated',
  visibility text not null default 'shared',
  hit_count integer not null default 0,
  last_used_at timestamptz,
  review_comment text not null default '',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint component_knowledge_entries_normalized_query_check check (
    length(trim(normalized_query)) >= 2
  ),
  constraint component_knowledge_entries_status_check check (
    status in ('generated', 'approved', 'needs_review', 'archived')
  ),
  constraint component_knowledge_entries_visibility_check check (
    visibility in ('shared', 'private')
  ),
  constraint component_knowledge_entries_source_check check (
    source in ('ai_generated', 'manual')
  ),
  constraint component_knowledge_entries_topic_type_check check (
    topic_type in ('component', 'sensor', 'actuator', 'system', 'network', 'fluid', 'term')
  )
);

create unique index if not exists component_knowledge_entries_normalized_query_idx
  on public.component_knowledge_entries(normalized_query);

create index if not exists component_knowledge_entries_status_updated_idx
  on public.component_knowledge_entries(status, updated_at desc);

create index if not exists component_knowledge_entries_topic_type_idx
  on public.component_knowledge_entries(topic_type, updated_at desc);

create index if not exists component_knowledge_entries_created_by_idx
  on public.component_knowledge_entries(created_by, updated_at desc);

create or replace function public.set_diagnosehub_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_component_knowledge_entries_updated_at
  on public.component_knowledge_entries;

create trigger set_component_knowledge_entries_updated_at
before update on public.component_knowledge_entries
for each row
execute function public.set_diagnosehub_updated_at();

alter table public.component_knowledge_entries enable row level security;

drop policy if exists "Freigegebenes Bauteilwissen lesen"
  on public.component_knowledge_entries;
drop policy if exists "Eigenes Bauteilwissen lesen"
  on public.component_knowledge_entries;
drop policy if exists "Bauteilwissen aus KI anlegen"
  on public.component_knowledge_entries;
drop policy if exists "Eigenes KI-Bauteilwissen bearbeiten"
  on public.component_knowledge_entries;

create policy "Freigegebenes Bauteilwissen lesen"
on public.component_knowledge_entries
for select
to authenticated
using (
  visibility = 'shared'
  and status in ('generated', 'approved')
);

create policy "Eigenes Bauteilwissen lesen"
on public.component_knowledge_entries
for select
to authenticated
using (created_by = auth.uid());

create policy "Bauteilwissen aus KI anlegen"
on public.component_knowledge_entries
for insert
to authenticated
with check (
  created_by = auth.uid()
  and source = 'ai_generated'
  and status = 'generated'
  and visibility = 'shared'
);

create policy "Eigenes KI-Bauteilwissen bearbeiten"
on public.component_knowledge_entries
for update
to authenticated
using (
  created_by = auth.uid()
  and source = 'ai_generated'
  and status in ('generated', 'needs_review')
)
with check (
  created_by = auth.uid()
  and source = 'ai_generated'
  and status in ('generated', 'needs_review')
);
