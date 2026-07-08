import type { SupabaseClient } from "@supabase/supabase-js";

export type ComponentKnowledgeStatus =
  | "generated"
  | "approved"
  | "needs_review"
  | "archived";

export type ComponentKnowledgeTopicType =
  | "component"
  | "sensor"
  | "actuator"
  | "system"
  | "network"
  | "fluid"
  | "term";

export type ComponentKnowledgeRow = {
  id: string;
  created_by: string | null;
  query: string | null;
  normalized_query: string;
  title: string | null;
  topic_type: ComponentKnowledgeTopicType | null;
  answer: string | null;
  answer_format_version: number | null;
  model: string | null;
  source: string | null;
  status: ComponentKnowledgeStatus | null;
  visibility: string | null;
  hit_count: number | null;
  last_used_at: string | null;
  review_comment: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ComponentKnowledgeEntry = {
  id: string;
  createdBy: string | null;
  query: string;
  normalizedQuery: string;
  title: string;
  topicType: ComponentKnowledgeTopicType;
  answer: string;
  answerFormatVersion: number;
  model: string;
  source: string;
  status: ComponentKnowledgeStatus;
  visibility: string;
  hitCount: number;
  lastUsedAt: string | null;
  reviewComment: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ComponentKnowledgeSaveInput = {
  userId: string;
  query: string;
  answer: string;
  model: string;
};

function normalizeKnowledgeText(value: string) {
  return value
    .toLowerCase()
    .replace(/\u00e4/g, "ae")
    .replace(/\u00f6/g, "oe")
    .replace(/\u00fc/g, "ue")
    .replace(/\u00df/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function trimText(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

function detectTopicType(query: string): ComponentKnowledgeTopicType {
  const normalizedQuery = normalizeKnowledgeText(query);

  if (
    normalizedQuery.includes("sensor") ||
    normalizedQuery.includes("geber") ||
    normalizedQuery.includes("fuehler")
  ) {
    return "sensor";
  }

  if (
    normalizedQuery.includes("aktor") ||
    normalizedQuery.includes("ventil") ||
    normalizedQuery.includes("steller") ||
    normalizedQuery.includes("motor")
  ) {
    return "actuator";
  }

  if (
    normalizedQuery.includes("can bus") ||
    normalizedQuery.includes("lin bus") ||
    normalizedQuery.includes("flexray") ||
    normalizedQuery.includes("abschlusswiderstand")
  ) {
    return "network";
  }

  if (
    normalizedQuery.includes("system") ||
    normalizedQuery.includes("regelung") ||
    normalizedQuery.includes("kreislauf")
  ) {
    return "system";
  }

  if (
    normalizedQuery.includes("oel") ||
    normalizedQuery.includes("kuehlmittel") ||
    normalizedQuery.includes("kaeltemittel") ||
    normalizedQuery.includes("bremsfluessigkeit")
  ) {
    return "fluid";
  }

  if (
    normalizedQuery.includes("begriff") ||
    normalizedQuery.includes("was bedeutet") ||
    normalizedQuery.includes("definition")
  ) {
    return "term";
  }

  return "component";
}

function isMissingTableError(error: unknown) {
  const message =
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message
      : "";

  return (
    message.includes("component_knowledge_entries") ||
    message.includes("relation") ||
    message.includes("does not exist")
  );
}

export function normalizeComponentKnowledgeQuery(query: string) {
  return normalizeKnowledgeText(query).slice(0, 300);
}

export function toComponentKnowledgeEntry(
  row: ComponentKnowledgeRow
): ComponentKnowledgeEntry {
  return {
    id: row.id,
    createdBy: row.created_by,
    query: row.query || "",
    normalizedQuery: row.normalized_query,
    title: row.title || row.query || "Bauteilwissen",
    topicType: row.topic_type || "component",
    answer: row.answer || "",
    answerFormatVersion: row.answer_format_version || 1,
    model: row.model || "",
    source: row.source || "ai_generated",
    status: row.status || "generated",
    visibility: row.visibility || "shared",
    hitCount: row.hit_count || 0,
    lastUsedAt: row.last_used_at,
    reviewComment: row.review_comment || "",
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findComponentKnowledgeEntry(
  supabase: SupabaseClient,
  query: string
) {
  const normalizedQuery = normalizeComponentKnowledgeQuery(query);

  if (normalizedQuery.length < 2) {
    return {
      entry: null as ComponentKnowledgeEntry | null,
      error: null as unknown,
    };
  }

  const { data, error } = await supabase
    .from("component_knowledge_entries")
    .select("*")
    .eq("normalized_query", normalizedQuery)
    .eq("visibility", "shared")
    .in("status", ["approved", "generated"])
    .maybeSingle();

  if (error) {
    return {
      entry: null,
      error,
    };
  }

  return {
    entry: data ? toComponentKnowledgeEntry(data as ComponentKnowledgeRow) : null,
    error: null,
  };
}

export async function saveGeneratedComponentKnowledgeEntry(
  supabase: SupabaseClient,
  input: ComponentKnowledgeSaveInput
) {
  const query = trimText(input.query, 300);
  const normalizedQuery = normalizeComponentKnowledgeQuery(query);

  if (normalizedQuery.length < 2 || !input.answer.trim()) {
    return {
      entry: null as ComponentKnowledgeEntry | null,
      saved: false,
      error: null as unknown,
    };
  }

  const payload = {
    created_by: input.userId,
    query,
    normalized_query: normalizedQuery,
    title: query,
    topic_type: detectTopicType(query),
    answer: input.answer.trim(),
    answer_format_version: 2,
    model: trimText(input.model, 120),
    source: "ai_generated",
    status: "generated",
    visibility: "shared",
    hit_count: 1,
    last_used_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("component_knowledge_entries")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    const cachedEntry = await findComponentKnowledgeEntry(supabase, query);

    return {
      entry: cachedEntry.entry,
      saved: false,
      error: isMissingTableError(error) ? error : cachedEntry.error || error,
    };
  }

  return {
    entry: toComponentKnowledgeEntry(data as ComponentKnowledgeRow),
    saved: true,
    error: null,
  };
}

export function getComponentKnowledgeStorageWarning(error: unknown) {
  if (!error) {
    return "";
  }

  if (isMissingTableError(error)) {
    return "Die Bauteilwissen-Datenbank ist noch nicht eingerichtet. Bitte die Datenbank-Migration ausführen.";
  }

  const message =
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message
      : "";

  return message || "Bauteilwissen konnte nicht in der Datenbank gespeichert werden.";
}
