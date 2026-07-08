import {
  hasComponentKnowledgeAccess,
  hasLearningAccess,
  isValidUserPlan,
  type UserPlan,
} from "@/config/plans";
import { loadAuthenticatedUserFromRequest } from "@/lib/supabase/auth";

type WorkshopProfilePlanRow = {
  plan: UserPlan | string | null;
};

async function loadUserPlanContextFromRequest(request: Request) {
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

  return {
    plan: isValidUserPlan(profile?.plan) ? profile.plan : "free",
    user,
    supabase,
  };
}

export async function loadUserPlanFromRequest(request: Request): Promise<UserPlan> {
  const { plan } = await loadUserPlanContextFromRequest(request);

  return plan;
}

export async function requireComponentKnowledgeAccess(request: Request) {
  const { plan, user, supabase } = await loadUserPlanContextFromRequest(request);

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
    user,
    supabase,
  };
}

export async function requireLearningAccess(request: Request) {
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
  const plan: UserPlan = isValidUserPlan(profile?.plan) ? profile.plan : "free";

  if (!hasLearningAccess(plan)) {
    return {
      ok: false as const,
      plan,
      error:
        "Lernen und Prüfungsfragen sind in deinem aktuellen Tarif nicht enthalten. Dafür brauchst du Komplett 150 oder Unlimited.",
    };
  }

  return {
    ok: true as const,
    plan,
    user,
  };
}
