import type { SupabaseClient, User } from "@supabase/supabase-js";

export type DiagnosisUsage = {
  date: string;
  count: number;
};

type DiagnosisUsageDatabaseRow = {
  id: string;
  user_id: string;
  usage_date: string;
  diagnosis_count: number;
  created_at: string;
  updated_at: string;
};

export function getTodayKey() {
  return new Date().toLocaleDateString("sv-SE");
}

export function getInitialDiagnosisUsage(): DiagnosisUsage {
  return {
    date: getTodayKey(),
    count: 0,
  };
}

export function normalizeDiagnosisUsage(usage: DiagnosisUsage): DiagnosisUsage {
  const today = getTodayKey();

  if (usage.date !== today) {
    return {
      date: today,
      count: 0,
    };
  }

  return usage;
}

function convertDatabaseRowToDiagnosisUsage(
  row: DiagnosisUsageDatabaseRow
): DiagnosisUsage {
  return {
    date: row.usage_date,
    count: row.diagnosis_count,
  };
}

export async function loadDiagnosisUsageFromSupabase(
  supabase: SupabaseClient,
  user: User
): Promise<DiagnosisUsage> {
  const today = getTodayKey();

  const { data, error } = await supabase
    .from("diagnosis_usage")
    .select("*")
    .eq("user_id", user.id)
    .eq("usage_date", today)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return {
      date: today,
      count: 0,
    };
  }

  return convertDatabaseRowToDiagnosisUsage(data as DiagnosisUsageDatabaseRow);
}

export async function saveDiagnosisUsageToSupabase(
  supabase: SupabaseClient,
  user: User,
  usage: DiagnosisUsage
): Promise<DiagnosisUsage> {
  const normalizedUsage = normalizeDiagnosisUsage(usage);

  const { data, error } = await supabase
    .from("diagnosis_usage")
    .upsert(
      {
        user_id: user.id,
        usage_date: normalizedUsage.date,
        diagnosis_count: normalizedUsage.count,
      },
      {
        onConflict: "user_id,usage_date",
      }
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return convertDatabaseRowToDiagnosisUsage(data as DiagnosisUsageDatabaseRow);
}

export async function incrementDiagnosisUsageInSupabase(
  supabase: SupabaseClient,
  user: User
): Promise<DiagnosisUsage> {
  const currentUsage = await loadDiagnosisUsageFromSupabase(supabase, user);

  const nextUsage: DiagnosisUsage = {
    date: currentUsage.date,
    count: currentUsage.count + 1,
  };

  return saveDiagnosisUsageToSupabase(supabase, user, nextUsage);
}

export async function resetDiagnosisUsageInSupabase(
  supabase: SupabaseClient,
  user: User
): Promise<DiagnosisUsage> {
  const nextUsage: DiagnosisUsage = {
    date: getTodayKey(),
    count: 0,
  };

  return saveDiagnosisUsageToSupabase(supabase, user, nextUsage);
}