do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'public.workshop_profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%plan%'
  loop
    execute format(
      'alter table public.workshop_profiles drop constraint if exists %I',
      constraint_record.conname
    );
  end loop;
end $$;

alter table public.workshop_profiles
  add constraint workshop_profiles_plan_check
  check (
    plan in (
      'free',
      'werkstatt',
      'pro',
      'diagnose_150',
      'complete_150',
      'unlimited'
    )
  );

do $$
declare
  constraint_record record;
begin
  if to_regclass('public.subscriptions') is null then
    return;
  end if;

  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'public.subscriptions'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%plan%'
  loop
    execute format(
      'alter table public.subscriptions drop constraint if exists %I',
      constraint_record.conname
    );
  end loop;
end $$;

do $$
begin
  if to_regclass('public.subscriptions') is null then
    return;
  end if;

  alter table public.subscriptions
    add constraint subscriptions_plan_check
    check (
      plan in (
        'free',
        'werkstatt',
        'pro',
        'diagnose_150',
        'complete_150',
        'unlimited'
      )
    );
end $$;
