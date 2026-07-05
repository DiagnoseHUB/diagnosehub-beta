create or replace function public.protect_workshop_profile_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  request_role text := coalesce(auth.role(), '');
begin
  if tg_op = 'INSERT' then
    if new.plan is null then
      new.plan := 'free';
    end if;

    if new.plan <> 'free'
      and request_role <> 'service_role'
      and current_user not in ('postgres', 'supabase_admin', 'service_role')
    then
      new.plan := 'free';
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE' and new.plan is distinct from old.plan then
    if request_role <> 'service_role'
      and current_user not in ('postgres', 'supabase_admin', 'service_role')
    then
      raise exception 'Tarif kann nur serverseitig geändert werden.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_workshop_profile_plan_trigger
  on public.workshop_profiles;

create trigger protect_workshop_profile_plan_trigger
before insert or update on public.workshop_profiles
for each row
execute function public.protect_workshop_profile_plan();
