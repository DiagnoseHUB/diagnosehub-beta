import {
  hasComponentKnowledgeAccess,
  isValidUserPlan,
  type UserPlan,
} from "@/config/plans";
import { loadAuthenticatedUserFromRequest } from "@/lib/supabase/auth";

type WorkshopProfilePlanRow = {
  plan: UserPlan | string | null;
};

export async function loadUserPlanFromRequest(request: Request): Promise<UserPlan> {
  const { user, supabase } = await loadAuthenticatedUserFromRequest(request);

  const { data, error } = await supabase
    .from("workshop_profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Plan konnte nicht geladen werden: ${error.message}`);
  }

  const profile = data as WorkshopProfilePlanRow | null;

  return isValidUserPlan(profile?.plan) ? profile.plan : "free";
}

export async function requireComponentKnowledgeAccess(request: Request) {
  const plan = await loadUserPlanFromRequest(request);

  if (!hasComponentKnowledgeAccess(plan)) {
    return {
      ok: false as const,
      plan,
      error:
        "Bauteilwissen ist in deinem aktuellen Tarif nicht enthalten. Dafür brauchst du Komplett 150 oder Unlimited.",
    };
  }

  return {
    ok: true as const,
    plan,
  };
}
