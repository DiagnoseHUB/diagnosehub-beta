import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";
import {
  detectEngineContext,
  type EngineContext,
  type EngineType,
} from "../../../services/engineDatabase";
import {
  detectFaultCodeContext,
  formatFaultCodeContext,
  type FaultCodeContext,
} from "../../../services/faultCodeDatabase";
import {
  detectTechnicalSpecContext,
  formatTechnicalSpecContext,
  type TechnicalSpecContext,
} from "../../../services/technicalSpecs";
import {
  detectTorqueSpecContext,
  formatTorqueSpecTitle,
  formatTorqueSpecContext,
  formatTorqueValue,
  hasTorqueSpecIntent,
  toTorqueSpec,
  type TorqueSpecContext,
  type TorqueSpecRow,
} from "@/services/torqueSpecs";
import {
  PLAN_DAILY_LIMITS,
  PLAN_LABELS,
  isValidUserPlan,
  type UserPlan,
} from "@/config/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FALLBACK_DIAGNOSIS_MODEL = "gpt-4o-mini";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type DiagnosisAudienceMode = "workshop" | "hobby";

type WorkshopProfileDatabaseRow = {
  id: string;
  full_name: string;
  workshop_name: string;
  email: string;
  role: string;
  plan: UserPlan;
  created_at: string;
  updated_at: string;
};

type DiagnosisUsageDatabaseRow = {
  id: string;
  user_id: string;
  usage_date: string;
  diagnosis_count: number;
  created_at: string;
  updated_at: string;
};

type UsageControl = {
  enabled: boolean;
  source: "supabase";
  supabase: SupabaseClient;
  user: User;
  plan: UserPlan;
  planLabel: string;
  todayKey: string;
  countBefore: number;
  maxDailyDiagnoses: number;
};

type UsageLimitPayload = {
  enabled: boolean;
  source: "supabase";
  plan: UserPlan;
  planLabel: string;
  todayKey: string;
  countBefore: number;
  countAfter: number | null;
  maxDailyDiagnoses: number;
  remainingBefore: number;
  remainingAfter: number | null;
  limitReached: boolean;
  warning?: string;
};

function getTodayKeyGermany() {
  const currentDateGermany = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const currentMonth = currentDateGermany.slice(0, 7);

  return `${currentMonth}-01`;
}

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function normalizeTechnicalSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/\u00e4/g, "ae")
    .replace(/\u00f6/g, "oe")
    .replace(/\u00fc/g, "ue")
    .replace(/\u00df/g, "ss");
}

function formatHistory(messages: ChatMessage[]) {
  return messages
    .map((message) => {
      const speaker = message.role === "user" ? "Nutzer" : "DiagnoseHUB";
      return `${speaker}: ${message.content}`;
    })
    .join("\n\n");
}

function normalizeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .flatMap((entry): ChatMessage[] => {
      if (!entry || typeof entry !== "object") {
        return [];
      }

      const candidate = entry as {
        role?: unknown;
        content?: unknown;
      };

      if (
        (candidate.role === "user" || candidate.role === "assistant") &&
        typeof candidate.content === "string"
      ) {
        const content = sanitizeText(candidate.content, 1600);

        if (!content) {
          return [];
        }

        return [
          {
            role: candidate.role,
            content,
          },
        ];
      }

      return [];
    })
    .slice(-8);
}

function normalizeAudienceMode(value: unknown): DiagnosisAudienceMode {
  return value === "hobby" ? "hobby" : "workshop";
}

function createAuthenticatedSupabaseClient(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL fehlt in .env.local");
  }

  if (!supabaseKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY oder NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY fehlt in .env.local"
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

async function loadUserFromAccessToken(
  supabase: SupabaseClient,
  accessToken: string
) {
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error) {
    throw new Error(`Anmeldung ungültig: ${error.message}`);
  }

  if (!data.user) {
    throw new Error("Keine gültige Anmeldung gefunden.");
  }

  return data.user;
}

async function loadUserPlanFromSupabase(
  supabase: SupabaseClient,
  user: User
): Promise<UserPlan> {
  const { data, error } = await supabase
    .from("workshop_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Plan konnte nicht geladen werden: ${error.message}`);
  }

  if (!data) {
    return "free";
  }

  const profile = data as WorkshopProfileDatabaseRow;

  if (!isValidUserPlan(profile.plan)) {
    return "free";
  }

  return profile.plan;
}

async function loadDiagnosisUsageCount(
  supabase: SupabaseClient,
  user: User,
  todayKey: string
) {
  const { data, error } = await supabase
    .from("diagnosis_usage")
    .select("*")
    .eq("user_id", user.id)
    .eq("usage_date", todayKey)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Nutzungszähler konnte nicht geladen werden: ${error.message}`
    );
  }

  if (!data) {
    return 0;
  }

  const usageRow = data as DiagnosisUsageDatabaseRow;

  return usageRow.diagnosis_count || 0;
}

async function saveDiagnosisUsageCount(
  supabase: SupabaseClient,
  user: User,
  todayKey: string,
  nextCount: number
) {
  const { data, error } = await supabase
    .from("diagnosis_usage")
    .upsert(
      {
        user_id: user.id,
        usage_date: todayKey,
        diagnosis_count: nextCount,
      },
      {
        onConflict: "user_id,usage_date",
      }
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Nutzungszähler konnte nicht gespeichert werden: ${error.message}`
    );
  }

  const usageRow = data as DiagnosisUsageDatabaseRow;

  return usageRow.diagnosis_count || nextCount;
}

function createEmptyTorqueSpecContext(): TorqueSpecContext {
  return {
    foundSpecs: [],
    summary: "Keine freigegebenen Drehmomentwerte erkannt.",
  };
}

async function loadApprovedTorqueSpecContext(
  supabase: SupabaseClient,
  combinedContext: string
): Promise<TorqueSpecContext> {
  if (!hasTorqueSpecIntent(combinedContext)) {
    return createEmptyTorqueSpecContext();
  }

  const { data, error } = await supabase
    .from("torque_specs")
    .select("*")
    .eq("status", "approved")
    .eq("visibility", "shared")
    .order("updated_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Freigegebene Drehmomentwerte konnten nicht geladen werden:", error);
    return createEmptyTorqueSpecContext();
  }

  return detectTorqueSpecContext(
    combinedContext,
    ((data || []) as TorqueSpecRow[]).map(toTorqueSpec)
  );
}

async function resolveUsageControl(
  accessToken: string
): Promise<UsageControl> {
  const todayKey = getTodayKeyGermany();

  if (!accessToken) {
    throw new Error(
      "Für serverseitige Plan-Limits fehlt der Zugriffstoken."
    );
  }

  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const user = await loadUserFromAccessToken(supabase, accessToken);
  let plan: UserPlan = "free";
  let countBefore = 0;

  try {
    plan = await loadUserPlanFromSupabase(supabase, user);
  } catch (error) {
    console.error("Plan konnte nicht geladen werden, Free-Fallback aktiv:", error);
  }

  try {
    countBefore = await loadDiagnosisUsageCount(supabase, user, todayKey);
  } catch (error) {
    console.error(
      "Nutzungszähler konnte nicht geladen werden, Diagnose läuft ohne Blockade weiter:",
      error
    );
  }

  return {
    enabled: true,
    source: "supabase",
    supabase,
    user,
    plan,
    planLabel: PLAN_LABELS[plan],
    todayKey,
    countBefore,
    maxDailyDiagnoses: PLAN_DAILY_LIMITS[plan],
  };
}

function buildUsageLimitPayload(
  usageControl: UsageControl,
  countAfter: number | null,
  warning?: string
): UsageLimitPayload {
  const effectiveCountAfter = countAfter ?? null;

  return {
    enabled: usageControl.enabled,
    source: usageControl.source,
    plan: usageControl.plan,
    planLabel: usageControl.planLabel,
    todayKey: usageControl.todayKey,
    countBefore: usageControl.countBefore,
    countAfter: effectiveCountAfter,
    maxDailyDiagnoses: usageControl.maxDailyDiagnoses,
    remainingBefore: Math.max(
      usageControl.maxDailyDiagnoses - usageControl.countBefore,
      0
    ),
    remainingAfter:
      effectiveCountAfter === null
        ? null
        : Math.max(usageControl.maxDailyDiagnoses - effectiveCountAfter, 0),
    limitReached:
      usageControl.enabled &&
      usageControl.countBefore >= usageControl.maxDailyDiagnoses,
    warning,
  };
}

function termHasNegationContext(text: string, term: string) {
  const normalizedText = text.toLowerCase();
  const normalizedTerm = term.toLowerCase();

  let searchIndex = 0;

  while (searchIndex < normalizedText.length) {
    const termIndex = normalizedText.indexOf(normalizedTerm, searchIndex);

    if (termIndex === -1) {
      return true;
    }

    const contextStart = Math.max(0, termIndex - 80);
    const contextEnd = Math.min(
      normalizedText.length,
      termIndex + normalizedTerm.length + 80
    );

    const context = normalizedText.slice(contextStart, contextEnd);

    const allowedPatterns = [
      `keine ${normalizedTerm}`,
      `keinen ${normalizedTerm}`,
      `nicht ${normalizedTerm}`,
      `${normalizedTerm} nicht`,
      `${normalizedTerm} gibt es nicht`,
      `ohne ${normalizedTerm}`,
      `statt ${normalizedTerm}`,
      `keinesfalls ${normalizedTerm}`,
      `niemals ${normalizedTerm}`,
    ];

    const isAllowed = allowedPatterns.some((pattern) =>
      context.includes(pattern)
    );

    if (!isAllowed) {
      return false;
    }

    searchIndex = termIndex + normalizedTerm.length;
  }

  return true;
}

function hasForbiddenTermWithoutCorrection(answer: string, terms: string[]) {
  const text = normalizeTechnicalSearchText(answer);

  return terms.some((term) => {
    if (!text.includes(term)) {
      return false;
    }

    return !termHasNegationContext(text, term);
  });
}

function hasTechnicalConflict(engineType: EngineType, answer: string) {
  if (engineType === "Diesel") {
    return hasForbiddenTermWithoutCorrection(answer, [
      "zuendkerze",
      "zuendkerzen",
      "zuendspule",
      "zuendspulen",
      "zuendfunke",
      "zuendanlage",
    ]);
  }

  if (engineType === "Benziner") {
    return hasForbiddenTermWithoutCorrection(answer, [
      "gluehkerze",
      "gluehkerzen",
      "gluehsteuergerät",
    ]);
  }

  return false;
}

function getDiagnosisModel() {
  return (
    process.env.OPENAI_DIAGNOSIS_MODEL ||
    process.env.OPENAI_MODEL ||
    FALLBACK_DIAGNOSIS_MODEL
  );
}

function getOpenAiErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return String(error);
}

function shouldRetryWithFallbackModel(error: unknown, model: string) {
  if (model === FALLBACK_DIAGNOSIS_MODEL) {
    return false;
  }

  const message = getOpenAiErrorMessage(error).toLowerCase();

  return (
    message.includes("model") &&
    (message.includes("not found") ||
      message.includes("does not exist") ||
      message.includes("unsupported") ||
      message.includes("invalid"))
  );
}

function modelSupportsReasoning(model: string) {
  return (
    model.startsWith("gpt-5") ||
    model.startsWith("o1") ||
    model.startsWith("o3") ||
    model.startsWith("o4")
  );
}

function getDiagnosisReasoningEffort(): "minimal" | "low" | "medium" | "high" {
  const effort =
    process.env.OPENAI_DIAGNOSIS_REASONING_EFFORT ||
    process.env.OPENAI_REASONING_EFFORT;

  if (effort === "minimal") return "minimal";
  if (effort === "medium") return "medium";
  if (effort === "high") return "high";

  return "low";
}

function getDiagnosisMaxOutputTokens() {
  const value = Number(process.env.OPENAI_DIAGNOSIS_MAX_OUTPUT_TOKENS || 1900);

  if (Number.isNaN(value)) {
    return 1900;
  }

  return Math.min(Math.max(value, 900), 3000);
}

function shouldAutoRetryDiagnosis() {
  return process.env.DIAGNOSIS_AUTO_RETRY === "true";
}

function buildAudienceModeInstructions(audienceMode: DiagnosisAudienceMode) {
  if (audienceMode === "hobby") {
    return `
Ausgabemodus: Hobby-Modus.
Gleicher technischer Inhalt wie im Werkstatt-Modus, aber in normaler Sprache.
Fachbegriffe kurz erklären, ohne die Antwort aufzublasen.
Risiko höher gewichten: Bremsen, Airbag, Hochvolt, Kraftstoff, Steuerzeiten, Lenkung, Klima-Kältemittel und ein möglicherweise fahruntüchtiges Fahrzeug klar markieren.

Pflichtinhalt Hobby-Modus:
- Fehlercode: Was bedeutet der Code normalsprachlich? Welche Systeme sind betroffen?
- Soll-/Richtwerte: immer angeben, wenn interne Werte zum Fall erkannt wurden.
- Selbst machbar?: Ja, nein oder eingeschränkt, mit Begründung.
- Schwierigkeit: Einfach, mittel, schwer oder Profi.
- Werkzeug: Grundwerkzeug, Spezialwerkzeug, Diagnosegerät, Hebebühne nötig?
- Risiko: nur relevante Risiken nennen, aber klar.
- Prüfreihenfolge: erst einfache Checks, dann Messungen, dann Teiletausch.
- Werkstattkosten grob: optional; wenn genannt, immer als grobe Schätzung kennzeichnen.
- Nächste Schritte: konkret und für den Nutzer verständlich.

Antwortformat Hobby-Modus:
# Fehlercode
# Soll-/Richtwerte
# Selbst machbar?
# Schwierigkeit
# Werkzeug
# Risiko
# Prüfreihenfolge
# Werkstattkosten grob
# Nächste Schritte
`;
  }

  return `
Ausgabemodus: Werkstatt-Modus.
Gleicher technischer Inhalt wie im Hobby-Modus, aber knapp, fachlich und entscheidungsorientiert.
Fokus: Diagnosepfad, Messlogik, Plausibilität und nächster Arbeitsschritt.

Pflichtinhalt Werkstatt-Modus:
- Diagnosepfad: Symptom -> mögliche Ursachen -> Prüfungen -> Messwerte -> Entscheidung.
- Soll-/Richtwerte: erkannte Werte immer nennen und in die Messwertlogik einbauen.
- Arbeitswerte/Teile: nur wenn sicher; sonst "als interne Daten/Herstellerdaten ergänzen" schreiben.
- Spezialwerkzeug: klar benennen, wenn nötig; keine erfundenen Werkzeugnummern.
- Typische Fehler: Fehldiagnosen, bekannte Schwachstellen, Plausibilitätschecks.
- Speicherung: Fall speichern, später wiederfinden, interne Notizen/Schadteil dokumentieren.

Antwortformat Werkstatt-Modus:
# Diagnosepfad
# Mögliche Ursachen
# Soll-/Richtwerte
# Prüfungen und Messwerte
# Entscheidung
# Spezialwerkzeug / Teile
# Typische Fehler
# Speicherung / Notizen
`;
}

function buildSystemPrompt(
  engineContext: EngineContext,
  faultCodeContext: FaultCodeContext,
  technicalSpecContext: TechnicalSpecContext,
  torqueSpecContext: TorqueSpecContext,
  audienceMode: DiagnosisAudienceMode,
  retryWarning?: string
) {
  return `
Du bist DiagnoseHUB, ein technischer KI-Diagnoseassistent für freie Kfz-Werkstätten.

Antworte immer auf Deutsch.
Antworte kurz, direkt und werkstattnah.
Keine Textwand, aber auch keine groben Allgemeinplätze.
Die Antwort soll so sein, dass ein Kfz-Mechatroniker daraus direkt den nächsten Arbeitsschritt ableiten kann.

Grundregeln:
- Keine langen Einleitungen.
- Keine pauschalen Disclaimer.
- Keine unnötigen Sicherheitshinweise.
- Keine erfundenen Drehmomente, Füllmengen, Spezialwerkzeugnummern oder Herstellersollwerte.
- Wenn genaue Werte fahrzeugabhängig sind, schreibe kurz: "nach Herstellervorgabe prüfen".
- Keine illegalen Manipulationen erklären.
- Keine Deaktivierung von Abgas-, Airbag-, ABS-, ESP- oder Assistenzsystemen erklären.

Wichtig zur Antwortlänge:
- Standardantwort kompakt halten; die Pflichtabschnitte des aktiven Ausgabemodus haben Vorrang.
- Maximal 3 bis 7 Bulletpoints pro Abschnitt.
- Kurze Sätze.
- Keine Roman-Erklärung.
- Trotzdem konkrete Arbeitsschritte nennen.
- Nicht schreiben: "Zugang schaffen", sondern genauer beschreiben, welche Verkleidung, Abdeckung, Stecker, Halter oder Baugruppe typischerweise entfernt wird.
- Wenn der genaue Aufbau fahrzeugabhängig ist, schreibe: "typischer Zugang" und nenne die wahrscheinlichste Demontagefolge.

Werkstatt-Präzision:
- Bei Aus-/Einbau immer konkrete Demontagereihenfolge nennen.
- Beispiel: nicht "Verkleidung ausbauen", sondern "Handschuhfach ausbauen, untere Fußraumverkleidung lösen, seitliche Mittelkonsole-Verkleidung entfernen".
- Beispiel: nicht "Stecker abziehen", sondern "Stecker entriegeln, Verriegelungsnase nicht abbrechen, auf verschmorte Pins prüfen".
- Beispiel: nicht "Befestigung lösen", sondern "Schrauben lösen oder Bajonettverschluss gegen Anschlag drehen, je nach Ausführung".
- Bauteillage und Zugang kurz, aber konkret beschreiben.
- Stecker, Verriegelungen, Clips, Halter, Kunststoffnasen und Bruchstellen erwähnen, wenn relevant.
- Linksgewinde ausdrücklich erwähnen, wenn es bei diesem Bauteil/System möglich oder typisch ist.
- Schrauben, Muttern, Exzenter, Einstellpunkte oder Markierungen nennen, die nicht gelöst oder nicht verstellt werden dürfen.
- Bei Steuerzeiten, Achsgeometrie, Lenkung, Bremse, Hochvolt, Airbag, Klimaanlage und Kraftstoffsystem besonders präzise sein.
- Erst prüfen, dann ersetzen. Keine reine Teiletausch-Empfehlung.
- "Daten sichern" nur nennen, wenn Steuergerät, Codierung, Programmierung, Anlernung oder Batterieabklemmen mit relevanten Speicherwerten betroffen ist.
- "Batterie abklemmen" nur nennen, wenn technisch nötig: Airbag, Starter, Generator, Hochstromleitung, Steuergerätetausch oder Kurzschlussgefahr.
- Kritische Hinweise direkt am passenden Schritt nennen.

Der Nutzer kann Folgefragen stellen.
Kurze Folgefragen wie "Wo messen?", "Was als nächstes?", "Welche Schraube?", "Linksgewinde?", "Wie ausbauen?" beziehen sich auf den bisherigen Verlauf.
Nutze den bisherigen Fall als Kontext.

${buildAudienceModeInstructions(audienceMode)}

Erkannter Motortyp:
${engineContext.engineType}

Quelle der Motortyp-Erkennung:
${engineContext.source}

Erkannter Motor:
${engineContext.label}

Motorcode:
${engineContext.code ?? "nicht erkannt"}

Motorkontext-Hinweis:
${engineContext.notes ?? "Kein Zusatzhinweis vorhanden."}

Erkannte Fehlercodes aus interner Datenbank:
${formatFaultCodeContext(faultCodeContext)}

Generische Soll-/Richtwerte aus interner Datenbank:
${formatTechnicalSpecContext(technicalSpecContext)}

Manuell freigegebene Drehmomentwerte:
${formatTorqueSpecContext(torqueSpecContext)}

${retryWarning ?? ""}

Motortyp-Regeln:

Diesel:
- Keine Zündkerzen, Zündspulen, Zündfunken oder Zündanlage nennen.
- Bei Kaltstart nur Glühkerzen/Glühsteuergerät nennen, wenn passend.
- Bei Laufproblemen bevorzugt prüfen: Injektoren, Raildruck, Kraftstoffversorgung, Luftmasse, Ladedruck, AGR, DPF-Differenzdruck, Ladeluftstrecke.

Benziner:
- Zündkerzen und Zündspulen dürfen genannt werden.
- Keine Glühkerzen oder Glühsteuergerät nennen.
- Bei TSI/TFSI/FSI auch Falschluft, KGE, Injektoren, Hochdruckpumpe, Verkokung, Ladedruck und Steuerzeiten berücksichtigen.

Unbekannter Motortyp:
- Keine Diesel-/Benziner-spezifischen Bauteile blind nennen.
- Fehlende Fahrzeugdaten kurz nennen.

Fehlercode-Regel:
- Erkannte Fehlercodes aus der internen Datenbank vorrangig nutzen.
- Unbekannte Fehlercodes nicht sicher erklären. Dann Testertext anfordern.

Sollwerte-Regel:
- Erkannte Soll-/Richtwerte aus der internen generischen Datenbank immer sichtbar nennen, wenn sie zum Fall passen.
- Die Soll-/Richtwerte in einem eigenen Abschnitt "# Soll-/Richtwerte" oder direkt im Abschnitt "Prüfungen und Messwerte" mit angeben.
- Diese Werte als Richtwerte kennzeichnen, wenn Fahrzeugdaten fehlen.
- Exakte Herstellerdaten, Sicherungsnummern, Pinbelegungen, Drehmomente oder Spezialvorgaben nicht erfinden.
- Wenn keine passenden Werte vorhanden sind, kurz schreiben: "Keine passenden Sollwerte hinterlegt."
- Wenn Modell, Baujahr, Motorcode, Lampentyp oder Systemvariante fehlen, kurz sagen, welche Daten die Antwort genauer machen.

Drehmoment-Regel:
- Manuell freigegebene Drehmomentwerte aus der DiagnoseHUB-Drehmomenttabelle dürfen genannt werden.
- Drehmomente aus Entwürfen, ungeprüften Einreichungen oder Vermutungen nicht verwenden.
- Wenn kein passender freigegebener Wert vorhanden ist, schreibe kurz: "Kein freigegebener Drehmomentwert hinterlegt."
- Bei sicherheitsrelevanten Verschraubungen den hinterlegten Fahrzeugbezug, die Schraubstelle und eine Neuteilpflicht mit nennen.
- Je genauer Hersteller, Modell, Baujahr, Motorcode, System und Schraubstelle angegeben sind, desto genauer kann der passende Wert gefunden werden.

Antwortformat-Fallback bei normaler Diagnose:
Verwende zwingend das Antwortformat des aktiven Ausgabemodus.
Wenn ein Pflichtabschnitt im Einzelfall nicht sinnvoll ist, kurz "nicht relevant" oder "fahrzeugabhängig" schreiben.

# Kurzdiagnose
2 bis 4 Sätze. Direkt sagen, was am wahrscheinlichsten ist.

# Sofort prüfen
3 bis 6 konkrete Prüfpunkte.
Nicht nur Bauteile nennen, sondern kurz sagen, wie geprüft wird.

# Nächste Schritte
Konkrete Arbeitsfolge.
Bei Ausbau/Reparatur typische Demontage nennen:
- welche Abdeckung
- welche Verkleidung
- welcher Stecker
- welche Befestigung
- welche Richtung / Lage, wenn sinnvoll

# Kritische Punkte
Nur wenn relevant:
- Linksgewinde
- Schrauben nicht lösen
- Einstellpunkte nicht verstellen
- Clips/Verriegelungen
- Dichtflächen
- Steuerzeiten
- Hochdruck/Klima/Bremse/Airbag

# Abschluss
Kurz nennen, was danach geprüft werden muss.

Antwortformat bei ausdrücklicher Anleitung:
Wenn der Nutzer schreibt "genaue Anleitung", "Schritt für Schritt", "Ausbauanleitung", "Einbauanleitung" oder "druckbar", dann ausführlicher, aber weiterhin kompakt:

# Werkzeug
Nur relevante Werkzeuge.

# Zugang
Konkrete Demontage bis zum Bauteil.
Keine groben Formulierungen wie "Zugang schaffen".

# Arbeitsschritte
Nummerierte Schritte mit konkreter Reihenfolge.

# Kritische Punkte
Nur relevante Hinweise direkt und knapp.

# Abschlussprüfung
Funktionstest, Fehlerspeicher, Live-Daten, Dichtheit, Probefahrt oder Anlernung nur wenn relevant.

Antwortformat bei kurzer Folgefrage:
- Direkt antworten.
- Keine komplette neue Diagnose.
- Maximal 5 bis 8 Bulletpoints.
`;
}

function buildAutomaticTechnicalSpecBlock(
  technicalSpecContext: TechnicalSpecContext
) {
  if (technicalSpecContext.foundSpecs.length === 0) {
    return "";
  }

  const specs = technicalSpecContext.foundSpecs
    .map((spec) => {
      const values = spec.values
        .map((value) => {
          const note = value.note ? ` Hinweis: ${value.note}` : "";

          return `- ${value.label}: ${value.value} (${value.condition}).${note}`;
        })
        .join("\n");

      return `**${spec.title}** (${spec.category})
${values}`;
    })
    .join("\n\n");

  return `# Soll-/Richtwerte
${specs}

Hinweis: Das sind interne generische Richtwerte. Exakte Herstellerdaten, Drehmomente, Pinbelegungen, Sicherungsnummern und Spezialvorgaben bleiben fahrzeugabhängig.`;
}

function appendAutomaticTechnicalSpecBlock(
  answer: string,
  technicalSpecContext: TechnicalSpecContext
) {
  const technicalSpecBlock = buildAutomaticTechnicalSpecBlock(
    technicalSpecContext
  );

  if (!technicalSpecBlock) {
    return answer;
  }

  return `${answer}

${technicalSpecBlock}`;
}

function buildAutomaticTorqueSpecBlock(torqueSpecContext: TorqueSpecContext) {
  if (torqueSpecContext.foundSpecs.length === 0) {
    return "";
  }

  const specs = torqueSpecContext.foundSpecs
    .map((spec) => {
      const details = [
        `- Fahrzeugbezug: ${[
          spec.manufacturer,
          spec.model,
          spec.series,
          spec.engineCode ? `Motor ${spec.engineCode}` : "",
        ]
          .filter(Boolean)
          .join(" ") || "fahrzeugübergreifend hinterlegt"}`,
        `- Schraubstelle: ${formatTorqueSpecTitle(spec)}`,
        `- Drehmoment: ${formatTorqueValue(spec)}`,
        spec.torqueSequence ? `- Reihenfolge: ${spec.torqueSequence}` : "",
        spec.threadCondition ? `- Gewinde/Zustand: ${spec.threadCondition}` : "",
        spec.newFastenerRequired ? "- Neue Schraube/Mutter erforderlich: ja" : "",
        spec.sourceReference
          ? `- Quelle: ${spec.sourceType}, ${spec.sourceReference}`
          : `- Quelle: ${spec.sourceType || "manuell geprüft"}`,
      ].filter(Boolean);

      return `**${formatTorqueSpecTitle(spec)}**
${details.join("\n")}`;
    })
    .join("\n\n");

  return `# Drehmomentwerte
${specs}

Hinweis: Diese Drehmomentwerte wurden manuell geprüft und freigegeben. Nicht passende oder fehlende Drehmomente nicht ableiten.`;
}

function appendAutomaticTorqueSpecBlock(
  answer: string,
  torqueSpecContext: TorqueSpecContext
) {
  const torqueSpecBlock = buildAutomaticTorqueSpecBlock(torqueSpecContext);

  if (!torqueSpecBlock) {
    return answer;
  }

  return `${answer}

${torqueSpecBlock}`;
}

async function createDiagnosisAnswer(
  engineContext: EngineContext,
  faultCodeContext: FaultCodeContext,
  technicalSpecContext: TechnicalSpecContext,
  torqueSpecContext: TorqueSpecContext,
  messages: ChatMessage[],
  input: string,
  audienceMode: DiagnosisAudienceMode,
  retryWarning?: string,
  modelOverride?: string
) {
  const model = modelOverride || getDiagnosisModel();
  const reasoningEffort = getDiagnosisReasoningEffort();
  const maxOutputTokens = getDiagnosisMaxOutputTokens();

  const responseInput: Parameters<typeof client.responses.create>[0] = {
    model,
    ...(modelSupportsReasoning(model)
      ? {
          reasoning: {
            effort: reasoningEffort,
          },
        }
      : {}),
    max_output_tokens: maxOutputTokens,
    input: [
      {
        role: "system",
        content: buildSystemPrompt(
          engineContext,
          faultCodeContext,
          technicalSpecContext,
          torqueSpecContext,
          audienceMode,
          retryWarning
        ),
      },
      {
        role: "user",
        content: `
Bisheriger Diagnoseverlauf:
${formatHistory(messages) || "Noch kein Verlauf vorhanden."}

Aktuelle Eingabe / Folgefrage:
${input}
        `,
      },
    ],
  };

  let response: OpenAI.Responses.Response;

  try {
    response = (await client.responses.create(
      responseInput
    )) as OpenAI.Responses.Response;
  } catch (error) {
    if (shouldRetryWithFallbackModel(error, model)) {
      console.error(
        `Diagnosemodell ${model} nicht verfügbar, Fallback ${FALLBACK_DIAGNOSIS_MODEL} aktiv:`,
        error
      );

      return createDiagnosisAnswer(
        engineContext,
        faultCodeContext,
        technicalSpecContext,
        torqueSpecContext,
        messages,
        input,
        audienceMode,
        retryWarning,
        FALLBACK_DIAGNOSIS_MODEL
      );
    }

    throw error;
  }

  const answer = response.output_text?.trim();

  if (!answer) {
    throw new Error("Die KI hat keine auslesbare Diagnose-Antwort geliefert.");
  }

  return answer;
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY fehlt. Bitte in .env.local oder Vercel eintragen.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const input = sanitizeText(body.input, 2500);
    const messages = normalizeMessages(body.messages);
    const audienceMode = normalizeAudienceMode(body.audienceMode);
    const accessToken =
      typeof body.accessToken === "string" ? body.accessToken : "";

    if (!input) {
      return NextResponse.json(
        { error: "Keine gültige Diagnose-Eingabe erhalten." },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        {
          error:
            "Bitte zuerst einloggen. Auch Free-Diagnosen werden serverseitig gezählt, damit die Monatslimits fair bleiben.",
        },
        { status: 401 }
      );
    }

    const usageControl = await resolveUsageControl(accessToken);

    if (
      usageControl.enabled &&
      usageControl.countBefore >= usageControl.maxDailyDiagnoses
    ) {
      return NextResponse.json(
        {
          error: `Monatslimit erreicht. Dein aktueller Plan ${usageControl.planLabel} erlaubt ${usageControl.maxDailyDiagnoses} KI-Anfragen pro Monat. Folgefragen zählen mit.`,
          usageLimit: buildUsageLimitPayload(usageControl, null),
        },
        { status: 429 }
      );
    }

    const combinedContext = `${formatHistory(
      messages
    )}\n\nAktuelle Eingabe: ${input}`;
    const engineContext = detectEngineContext(combinedContext);
    const faultCodeContext = detectFaultCodeContext(combinedContext);
    const technicalSpecContext = detectTechnicalSpecContext(combinedContext);
    const torqueSpecContext = await loadApprovedTorqueSpecContext(
      usageControl.supabase,
      combinedContext
    );

    let result = await createDiagnosisAnswer(
      engineContext,
      faultCodeContext,
      technicalSpecContext,
      torqueSpecContext,
      messages,
      input,
      audienceMode
    );

    let qualityCheck = "Antwort ohne technischen Konflikt erstellt.";

    if (hasTechnicalConflict(engineContext.engineType, result)) {
      if (shouldAutoRetryDiagnosis()) {
        qualityCheck =
          "Technischer Konflikt erkannt. Antwort wurde automatisch neu generiert.";

        result = await createDiagnosisAnswer(
          engineContext,
          faultCodeContext,
          technicalSpecContext,
          torqueSpecContext,
          messages,
          input,
          audienceMode,
          `
ACHTUNG: Die vorherige Antwort enthielt ein Bauteil, das zum erkannten Motortyp nicht passt.
Erzeuge die Antwort neu und beachte den Motortyp zwingend.
Bei Diesel keine Zündkerzen, Zündspulen, Zündfunken oder Zündanlage als Ursache oder Prüfpunkt nennen.
Bei Benziner keine Glühkerzen oder Glühsteuergerät als Ursache oder Prüfpunkt nennen.
          `
        );
      } else {
        qualityCheck =
          "Technischer Konflikt erkannt. Automatische Neugenerierung ist deaktiviert, um Kosten zu sparen.";
      }
    }

    result = appendAutomaticTechnicalSpecBlock(result, technicalSpecContext);
    result = appendAutomaticTorqueSpecBlock(result, torqueSpecContext);

    let countAfter: number | null = null;
    let usageWarning: string | undefined;

    if (usageControl.enabled && usageControl.supabase && usageControl.user) {
      try {
        countAfter = await saveDiagnosisUsageCount(
          usageControl.supabase,
          usageControl.user,
          usageControl.todayKey,
          usageControl.countBefore + 1
        );
      } catch (error) {
        console.error(
          "Serverseitige Nutzung konnte nicht erhöht werden:",
          error
        );
        usageWarning =
          "Diagnose wurde erstellt, aber der serverseitige Nutzungszähler konnte nicht aktualisiert werden.";
      }
    }

    return NextResponse.json({
      result,
      engineContext,
      faultCodeContext,
      technicalSpecContext,
      torqueSpecContext,
      qualityCheck,
      diagnosisConfig: {
        model: getDiagnosisModel(),
        reasoningEffort: modelSupportsReasoning(getDiagnosisModel())
          ? getDiagnosisReasoningEffort()
          : "not_used",
        maxOutputTokens: getDiagnosisMaxOutputTokens(),
        autoRetry: shouldAutoRetryDiagnosis(),
        audienceMode,
      },
      usageLimit: buildUsageLimitPayload(
        usageControl,
        countAfter,
        usageWarning
      ),
    });
  } catch (error) {
    console.error("KI-Diagnosefehler:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Die KI-Diagnose konnte nicht erstellt werden.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
