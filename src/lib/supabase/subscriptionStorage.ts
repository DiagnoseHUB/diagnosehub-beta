import type { UserPlan } from "@/config/plans";
import { createSupabaseAdminClient } from "./supabaseAdmin";

const SERVICE_REMINDER_PRICE_ID = "price_1TpVO842X13b5UMoMVnPM0Dd";
const DIAGNOSE_150_PRICE_ID = "price_1TpkdG42X13b5UMo5cogbSq9";
const COMPLETE_150_PRICE_ID = "price_1TpkdX42X13b5UMoidQ4ainw";

export type SubscriptionDatabaseRow = {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan: UserPlan;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

type SaveStripeSubscriptionInput = {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

function isProSubscriptionStatus(status: string) {
  return status === "active" || status === "trialing";
}

function getPlanFromStripePriceId(priceId: string): UserPlan | null {
  const normalizedPriceId = priceId.trim();

  if (
    normalizedPriceId &&
    (normalizedPriceId === process.env.STRIPE_SERVICE_REMINDER_PRICE_ID?.trim() ||
      normalizedPriceId === SERVICE_REMINDER_PRICE_ID)
  ) {
    return null;
  }

  if (
    normalizedPriceId &&
    (normalizedPriceId === process.env.STRIPE_DIAGNOSE_150_PRICE_ID?.trim() ||
      normalizedPriceId === DIAGNOSE_150_PRICE_ID)
  ) {
    return "diagnose_150";
  }

  if (
    normalizedPriceId &&
    (normalizedPriceId === process.env.STRIPE_COMPLETE_150_PRICE_ID?.trim() ||
      normalizedPriceId === COMPLETE_150_PRICE_ID)
  ) {
    return "complete_150";
  }

  if (
    normalizedPriceId &&
    (normalizedPriceId === process.env.STRIPE_UNLIMITED_PRICE_ID?.trim() ||
      normalizedPriceId === process.env.STRIPE_PRO_PRICE_ID?.trim())
  ) {
    return "unlimited";
  }

  return "unlimited";
}

function getPlanFromSubscriptionStatus(
  status: string,
  priceId: string
): UserPlan | null {
  return isProSubscriptionStatus(status) ? getPlanFromStripePriceId(priceId) : "free";
}

async function syncWorkshopProfilePlan(userId: string, plan: UserPlan) {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("workshop_profiles")
    .update({
      plan,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.warn(
      `Nutzerprofil-Plan konnte nicht synchronisiert werden: ${error.message}`
    );
  }
}

export async function loadSubscriptionForUser(userId: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Abo konnte nicht geladen werden: ${error.message}`);
  }

  return (data as SubscriptionDatabaseRow | null) || null;
}

export async function loadSubscriptionByStripeSubscriptionId(
  stripeSubscriptionId: string
) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();

  if (error) {
    throw new Error(`Abo konnte nicht geladen werden: ${error.message}`);
  }

  return (data as SubscriptionDatabaseRow | null) || null;
}

export async function saveStripeSubscription(
  input: SaveStripeSubscriptionInput
) {
  const supabase = createSupabaseAdminClient();

  const now = new Date().toISOString();
  const activePlan = getPlanFromSubscriptionStatus(input.status, input.stripePriceId);
  const plan = activePlan ?? "free";

  const payload = {
    user_id: input.userId,
    stripe_customer_id: input.stripeCustomerId,
    stripe_subscription_id: input.stripeSubscriptionId,
    stripe_price_id: input.stripePriceId,
    plan,
    status: input.status,
    current_period_start: input.currentPeriodStart,
    current_period_end: input.currentPeriodEnd,
    cancel_at_period_end: input.cancelAtPeriodEnd,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("subscriptions")
    .upsert(payload, {
      onConflict: "stripe_subscription_id",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Abo konnte nicht gespeichert werden: ${error.message}`);
  }

  if (activePlan) {
    await syncWorkshopProfilePlan(input.userId, activePlan);
  }

  return data as SubscriptionDatabaseRow;
}
