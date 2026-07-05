import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { loadAuthenticatedUserFromRequest } from "@/lib/supabase/auth";
import { getSiteUrl, getStripeClient } from "@/lib/supabase/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import { loadSubscriptionForUser } from "@/lib/supabase/subscriptionStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WorkshopProfileStripeRow = {
  stripe_customer_id: string | null;
};

type StripeCustomerLookup = {
  customerId: string;
  repaired: boolean;
};

function isMissingStripeResource(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const stripeError = error as {
    code?: string;
    statusCode?: number;
    type?: string;
  };

  return (
    stripeError.code === "resource_missing" ||
    stripeError.statusCode === 404 ||
    stripeError.type === "StripeInvalidRequestError"
  );
}

function isDeletedCustomer(
  customer:
    | Stripe.Customer
    | Stripe.DeletedCustomer
    | Stripe.Response<Stripe.Customer | Stripe.DeletedCustomer>
) {
  return "deleted" in customer && customer.deleted === true;
}

async function findStripeCustomerByEmail(stripe: Stripe, email?: string | null) {
  const cleanEmail = email?.trim().toLowerCase();

  if (!cleanEmail) {
    return "";
  }

  const customers = await stripe.customers.list({
    email: cleanEmail,
    limit: 10,
  });
  let firstExistingCustomerId = "";

  for (const customer of customers.data) {
    if (isDeletedCustomer(customer)) {
      continue;
    }

    firstExistingCustomerId ||= customer.id;

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 10,
    });
    const hasUsableSubscription = subscriptions.data.some((subscription) =>
      ["active", "trialing", "past_due", "unpaid"].includes(subscription.status)
    );

    if (hasUsableSubscription) {
      return customer.id;
    }
  }

  return firstExistingCustomerId;
}

async function persistStripeCustomerId(userId: string, stripeCustomerId: string) {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { error: profileError } = await supabase
    .from("workshop_profiles")
    .update({
      stripe_customer_id: stripeCustomerId,
      updated_at: now,
    })
    .eq("id", userId);

  if (profileError) {
    console.warn(
      `Stripe-Kunde konnte im Nutzerprofil nicht repariert werden: ${profileError.message}`
    );
  }

  const { error: subscriptionError } = await supabase
    .from("subscriptions")
    .update({
      stripe_customer_id: stripeCustomerId,
      updated_at: now,
    })
    .eq("user_id", userId);

  if (subscriptionError) {
    console.warn(
      `Stripe-Kunde konnte in Subscriptions nicht repariert werden: ${subscriptionError.message}`
    );
  }
}

async function resolveStripeCustomerId(
  request: Request
): Promise<StripeCustomerLookup> {
  const { user, supabase } = await loadAuthenticatedUserFromRequest(request);
  const stripe = getStripeClient();
  let subscriptionCustomerId = "";

  try {
    const subscription = await loadSubscriptionForUser(user.id);
    subscriptionCustomerId = subscription?.stripe_customer_id || "";
  } catch (error) {
    console.warn("Stripe-Kunde konnte nicht aus Subscription geladen werden:", error);
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
  const storedCustomerId = subscriptionCustomerId || profile?.stripe_customer_id || "";

  if (storedCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(storedCustomerId);

      if (!isDeletedCustomer(customer)) {
        return {
          customerId: storedCustomerId,
          repaired: false,
        };
      }
    } catch (error) {
      if (!isMissingStripeResource(error)) {
        throw error;
      }

      console.warn(
        `Gespeicherter Stripe-Kunde ${storedCustomerId} existiert nicht mehr. Suche per E-Mail.`
      );
    }
  }

  const recoveredCustomerId = await findStripeCustomerByEmail(stripe, user.email);

  if (recoveredCustomerId) {
    await persistStripeCustomerId(user.id, recoveredCustomerId);

    return {
      customerId: recoveredCustomerId,
      repaired: true,
    };
  }

  return {
    customerId: "",
    repaired: false,
  };
}

export async function POST(request: Request) {
  try {
    const { customerId: stripeCustomerId, repaired } =
      await resolveStripeCustomerId(request);

    if (!stripeCustomerId) {
      return NextResponse.json(
        {
          error:
            "Für diesen Account wurde kein gültiger Stripe-Kunde gefunden. Bitte erneut über Preise buchen oder prüfen, ob Vercel den richtigen Stripe Live/Test Secret Key nutzt.",
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
      repaired,
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
