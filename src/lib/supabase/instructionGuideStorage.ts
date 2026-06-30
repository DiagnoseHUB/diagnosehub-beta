import type { InstructionGuide } from "@/types/instruction";
import { createSupabaseAdminClient } from "./supabaseAdmin";

type InstructionGuideDatabaseRow = {
  id: string;
  slug: string;
  source_query: string;
  source_type: string;
  title: string;
  subtitle: string;
  category: InstructionGuide["category"];
  difficulty: InstructionGuide["difficulty"];
  estimated_time: string;
  vehicle_applicability: string;
  tags: string[];
  symptoms: string[];
  tools: string[];
  safety_notes: string[];
  initial_checks: string[];
  steps: InstructionGuide["steps"];
  common_causes: string[];
  next_actions: string[];
  pro_hint: string | null;
  last_updated: string;
  created_at: string;
  updated_at: string;
};

function mapDatabaseRowToInstructionGuide(
  row: InstructionGuideDatabaseRow
): InstructionGuide {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    category: row.category,
    difficulty: row.difficulty,
    estimatedTime: row.estimated_time,
    vehicleApplicability: row.vehicle_applicability,
    tags: Array.isArray(row.tags) ? row.tags : [],
    symptoms: Array.isArray(row.symptoms) ? row.symptoms : [],
    tools: Array.isArray(row.tools) ? row.tools : [],
    safetyNotes: Array.isArray(row.safety_notes) ? row.safety_notes : [],
    initialChecks: Array.isArray(row.initial_checks) ? row.initial_checks : [],
    steps: Array.isArray(row.steps) ? row.steps : [],
    commonCauses: Array.isArray(row.common_causes) ? row.common_causes : [],
    nextActions: Array.isArray(row.next_actions) ? row.next_actions : [],
    proHint: row.pro_hint || undefined,
    lastUpdated: row.last_updated,
  };
}

export async function loadSavedInstructionGuides(limit = 100) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("instruction_guides")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(
      `Gespeicherte Anleitungen konnten nicht geladen werden: ${error.message}`
    );
  }

  return ((data || []) as InstructionGuideDatabaseRow[]).map(
    mapDatabaseRowToInstructionGuide
  );
}

export async function loadSavedInstructionGuideBySlug(slug: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("instruction_guides")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Gespeicherte Anleitung konnte nicht geladen werden: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return mapDatabaseRowToInstructionGuide(data as InstructionGuideDatabaseRow);
}

export async function saveInstructionGuideToDatabase(
  guide: InstructionGuide,
  sourceQuery: string,
  sourceType: "ai" | "diagnosis" | "manual" = "ai"
) {
  const supabase = createSupabaseAdminClient();

  const now = new Date().toISOString();

  const payload = {
    slug: guide.slug,
    source_query: sourceQuery,
    source_type: sourceType,

    title: guide.title,
    subtitle: guide.subtitle,
    category: guide.category,
    difficulty: guide.difficulty,
    estimated_time: guide.estimatedTime,
    vehicle_applicability: guide.vehicleApplicability,

    tags: guide.tags || [],
    symptoms: guide.symptoms || [],
    tools: guide.tools || [],
    safety_notes: guide.safetyNotes || [],
    initial_checks: guide.initialChecks || [],
    steps: guide.steps || [],
    common_causes: guide.commonCauses || [],
    next_actions: guide.nextActions || [],

    pro_hint: guide.proHint || null,
    last_updated: guide.lastUpdated || now.slice(0, 10),
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("instruction_guides")
    .upsert(payload, {
      onConflict: "slug",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `KI-Anleitung konnte nicht gespeichert werden: ${error.message}`
    );
  }

  return mapDatabaseRowToInstructionGuide(data as InstructionGuideDatabaseRow);
}