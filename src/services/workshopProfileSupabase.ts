import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isValidUserPlan, type UserPlan } from "@/config/plans";

export type ProfileSource = "localStorage" | "supabase" | "fallback";

export type DemoAccount = {
  name: string;
  workshop: string;
  email: string;
  role: string;
  plan: UserPlan;
  updatedAt: string;
  supabaseUserId?: string;
};

export type WorkshopProfileDatabaseRow = {
  id: string;
  full_name: string;
  workshop_name: string;
  email: string;
  role: string;
  plan: UserPlan;
  created_at: string;
  updated_at: string;
};

export type WorkshopProfileInput = {
  fullName: string;
  workshopName: string;
  email: string;
  role: string;
  plan: UserPlan;
};

export type WorkshopProfileState = {
  name: string;
  workshop: string;
  email: string;
  role: string;
  plan: UserPlan;
  updatedAt: string;
  source: ProfileSource;
};

export const DEMO_ACCOUNT_STORAGE_KEY = "diagnosehub-demo-account";
export const USER_PLAN_STORAGE_KEY = "diagnosehub-user-plan";

export const defaultWorkshopProfileState: WorkshopProfileState = {
  name: "Nicht hinterlegt",
  workshop: "Nicht hinterlegt",
  email: "Nicht hinterlegt",
  role: "Werkstatt",
  plan: "free",
  updatedAt: "",
  source: "fallback",
};

export function convertProfileToDemoAccount(
  profile: WorkshopProfileDatabaseRow
): DemoAccount {
  return {
    name: profile.full_name,
    workshop: profile.workshop_name,
    email: profile.email,
    role: profile.role,
    plan: isValidUserPlan(profile.plan) ? profile.plan : "free",
    updatedAt: profile.updated_at,
    supabaseUserId: profile.id,
  };
}

export function convertProfileToState(
  profile: WorkshopProfileDatabaseRow
): WorkshopProfileState {
  return {
    name: profile.full_name || defaultWorkshopProfileState.name,
    workshop: profile.workshop_name || defaultWorkshopProfileState.workshop,
    email: profile.email || defaultWorkshopProfileState.email,
    role: profile.role || defaultWorkshopProfileState.role,
    plan: isValidUserPlan(profile.plan) ? profile.plan : "free",
    updatedAt: profile.updated_at || "",
    source: "supabase",
  };
}

export function readLocalDemoAccount(): DemoAccount | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const savedAccount = localStorage.getItem(DEMO_ACCOUNT_STORAGE_KEY);

    if (!savedAccount) {
      return null;
    }

    return JSON.parse(savedAccount) as DemoAccount;
  } catch (error) {
    console.error("Lokaler Account konnte nicht gelesen werden:", error);
    return null;
  }
}

export function readLocalPlan(): UserPlan {
  if (typeof window === "undefined") {
    return "free";
  }

  try {
    const savedPlan = localStorage.getItem(USER_PLAN_STORAGE_KEY);

    if (isValidUserPlan(savedPlan)) {
      return savedPlan;
    }

    const savedAccount = readLocalDemoAccount();

    if (savedAccount && isValidUserPlan(savedAccount.plan)) {
      return savedAccount.plan;
    }
  } catch (error) {
    console.error("Lokaler Plan konnte nicht gelesen werden:", error);
  }

  return "free";
}

export function readLocalWorkshopProfileState(): WorkshopProfileState {
  const localAccount = readLocalDemoAccount();
  const localPlan = readLocalPlan();

  if (!localAccount) {
    return {
      ...defaultWorkshopProfileState,
      plan: localPlan,
      source: localPlan === "free" ? "fallback" : "localStorage",
    };
  }

  return {
    name: localAccount.name || defaultWorkshopProfileState.name,
    workshop: localAccount.workshop || defaultWorkshopProfileState.workshop,
    email: localAccount.email || defaultWorkshopProfileState.email,
    role: localAccount.role || defaultWorkshopProfileState.role,
    plan: isValidUserPlan(localAccount.plan) ? localAccount.plan : localPlan,
    updatedAt: localAccount.updatedAt || "",
    source: "localStorage",
  };
}

export function syncWorkshopProfileToLocalStorage(
  profile: WorkshopProfileDatabaseRow
) {
  if (typeof window === "undefined") {
    return;
  }

  const localAccount = convertProfileToDemoAccount(profile);

  localStorage.setItem(DEMO_ACCOUNT_STORAGE_KEY, JSON.stringify(localAccount));
  localStorage.setItem(USER_PLAN_STORAGE_KEY, localAccount.plan);
}

export function clearLocalWorkshopProfileState() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(DEMO_ACCOUNT_STORAGE_KEY);
  localStorage.setItem(USER_PLAN_STORAGE_KEY, "free");
}

export function notifyWorkshopProfileChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("storage"));
  window.dispatchEvent(new Event("diagnosehub-account-updated"));
}

export async function loadWorkshopProfileFromSupabase(
  supabase: SupabaseClient,
  user: User
): Promise<WorkshopProfileDatabaseRow | null> {
  const { data, error } = await supabase
    .from("workshop_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return data as WorkshopProfileDatabaseRow;
}

export async function saveWorkshopProfileToSupabase(
  supabase: SupabaseClient,
  user: User,
  input: WorkshopProfileInput
): Promise<WorkshopProfileDatabaseRow> {
  const payload = {
    id: user.id,
    full_name: input.fullName,
    workshop_name: input.workshopName,
    email: input.email,
    role: input.role,
    plan: input.plan,
  };

  const { data, error } = await supabase
    .from("workshop_profiles")
    .upsert(payload, {
      onConflict: "id",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as WorkshopProfileDatabaseRow;
}

export async function deleteWorkshopProfileFromSupabase(
  supabase: SupabaseClient,
  user: User
): Promise<void> {
  const { error } = await supabase
    .from("workshop_profiles")
    .delete()
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function loadWorkshopProfileState(
  supabase: SupabaseClient,
  user: User | null
): Promise<WorkshopProfileState> {
  const localState = readLocalWorkshopProfileState();

  if (!user) {
    return localState;
  }

  const profile = await loadWorkshopProfileFromSupabase(supabase, user);

  if (!profile) {
    return {
      ...localState,
      email: user.email || localState.email,
    };
  }

  syncWorkshopProfileToLocalStorage(profile);

  return convertProfileToState(profile);
}