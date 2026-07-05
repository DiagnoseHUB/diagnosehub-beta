import { NextResponse } from "next/server";
import { getSiteUrl, getStripeClient } from "@/lib/supabase/stripe";
import { loadAuthenticatedUserFromRequest } from "@/lib/supabase/auth";
import { loadSubscriptionForUser } from "@/lib/supabase/subscriptionStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WorkshopProfileStripeRow = {
  stripe_customer_id: string | null;
};

async function loadStripeCustomerId(request: Request) {
  const { user, supabase } = await loadAuthenticatedUserFromRequest(request);
  let subscriptionCustomerId = "";

  try {
    const subscription = await loadSubscriptionForUser(user.id);
    subscriptionCustomerId = subscription?.stripe_customer_id || "";
  } catch (error) {
    console.warn("Stripe-Kunde konnte nicht aus Subscription geladen werden:", error);
  }

  if (subscriptionCustomerId) {
    return subscriptionCustomerId;
  }

  const { data, error } = await supabase
    .from("workshop_profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Stripe-Kunde konnte nicht geladen werden: ${error.message}`);
  }

  const profile = data as WorkshopProfileStripeRow | null;

  return profile?.stripe_customer_id || "";
}

export async function POST(request: Request) {
  try {
    const stripeCustomerId = await loadStripeCustomerId(request);

    if (!stripeCustomerId) {
      return NextResponse.json(
        {
          error:
            "Für diesen Account wurde noch kein Stripe-Kunde gefunden. Bitte zuerst einen Tarif buchen.",
        },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const siteUrl = getSiteUrl();

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${siteUrl}/login?portal=returned`,
    });

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error("Stripe Kundenportal konnte nicht geöffnet werden:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Stripe Kundenportal konnte nicht geöffnet werden.",
      },
      { status: 500 }
    );
  }
}
