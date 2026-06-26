import type { SupabaseClient, User } from "@supabase/supabase-js";

export type PremiumPlan = "werkstatt" | "pro";

export type PremiumLead = {
  id: string;
  createdAt: string;
  updatedAt?: string;
  plan: PremiumPlan;
  name: string;
  workshop: string;
  email: string;
  phone: string;
  note: string;
  userId?: string | null;
};

type PremiumLeadDatabaseRow = {
  id: string;
  user_id: string | null;
  plan: PremiumPlan;
  name: string;
  workshop: string;
  email: string;
  phone: string;
  note: string;
  created_at: string;
  updated_at: string;
};

function convertDatabaseRowToPremiumLead(
  row: PremiumLeadDatabaseRow
): PremiumLead {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    plan: row.plan,
    name: row.name,
    workshop: row.workshop,
    email: row.email,
    phone: row.phone || "",
    note: row.note || "",
  };
}

function convertPremiumLeadToDatabasePayload(
  lead: PremiumLead,
  user: User
) {
  return {
    id: lead.id,
    user_id: user.id,
    plan: lead.plan,
    name: lead.name,
    workshop: lead.workshop,
    email: lead.email,
    phone: lead.phone || "",
    note: lead.note || "",
  };
}

export async function loadPremiumLeadsFromSupabase(
  supabase: SupabaseClient,
  user: User
): Promise<PremiumLead[]> {
  const { data, error } = await supabase
    .from("premium_leads")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data || []) as PremiumLeadDatabaseRow[]).map(
    convertDatabaseRowToPremiumLead
  );
}

export async function savePremiumLeadToSupabase(
  supabase: SupabaseClient,
  user: User,
  lead: PremiumLead
): Promise<PremiumLead> {
  const payload = convertPremiumLeadToDatabasePayload(lead, user);

  const { data, error } = await supabase
    .from("premium_leads")
    .upsert(payload, {
      onConflict: "id",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return convertDatabaseRowToPremiumLead(data as PremiumLeadDatabaseRow);
}

export async function deletePremiumLeadFromSupabase(
  supabase: SupabaseClient,
  user: User,
  leadId: string
): Promise<void> {
  const { error } = await supabase
    .from("premium_leads")
    .delete()
    .eq("id", leadId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function migrateLocalPremiumLeadsToSupabase(
  supabase: SupabaseClient,
  user: User,
  localLeads: PremiumLead[]
): Promise<PremiumLead[]> {
  if (localLeads.length === 0) {
    return [];
  }

  const payload = localLeads.map((lead) => {
    return convertPremiumLeadToDatabasePayload(lead, user);
  });

  const { data, error } = await supabase
    .from("premium_leads")
    .upsert(payload, {
      onConflict: "id",
    })
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data || []) as PremiumLeadDatabaseRow[]).map(
    convertDatabaseRowToPremiumLead
  );
}