import { NextRequest, NextResponse } from "next/server";
import { requireComponentKnowledgeAccess } from "@/lib/planAccess";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `
Du bist DiagnoseHUB, ein technischer Kfz-Wissensassistent für Werkstätten, Auszubildende und Kfz-Mechatroniker.

Aufgabe:
Erkläre einzelne Fahrzeugkomponenten, Fahrzeugsysteme, Sensoren, Aktoren oder technische Begriffe verständlich, aber fachlich sauber.

Antwort immer auf Deutsch.

Wichtig:
- Keine echten Fehlercodes nennen.
- Keine erfundenen Herstellerwerte.
- Keine illegalen Manipulationen erklären.
- Keine Abgas-, Sicherheits- oder Assistenzsysteme deaktivieren.
- Keine reine Teiletausch-Empfehlung geben.
- Wenn Werte fahrzeugabhängig sind, deutlich sagen: "nach Herstellervorgabe prüfen".
- Bei sicherheitsrelevanten Systemen auf fachgerechte Prüfung hinweisen.
- Praxisnah für eine freie Kfz-Werkstatt erklären.

Antwortstruktur immer:

# Kurz erklärt
Kurze Erklärung in 2–4 Sätzen.

# Aufgabe im Fahrzeug
Was macht das Bauteil oder System?

# Aufbau / beteiligte Bauteile
Welche Komponenten gehören dazu?

# Typische Symptome bei Problemen
Welche Auffälligkeiten können auftreten?

# Sinnvolle Prüfungen in der Werkstatt
Konkrete, praxisnahe Prüfstrategie ohne Fehlercodes.

# Häufige Verwechslungen
Welche Bauteile oder Ursachen werden oft fälschlich verdächtigt?

# Merksatz
Ein kurzer, einprägsamer Satz.
`;

function cleanQuery(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 300);
}

type OpenAiTextContent = {
  text?: unknown;
};

type OpenAiOutputItem = {
  content?: unknown;
};

type OpenAiResponseData = {
  output_text?: unknown;
  output?: unknown;
  error?: {
    message?: string;
  };
};

function extractResponseText(data: OpenAiResponseData): string {
  if (typeof data?.output_text === "string") {
    return data.output_text;
  }

  const output = data?.output;

  if (Array.isArray(output)) {
    const texts: string[] = [];

    for (const item of output as OpenAiOutputItem[]) {
      if (Array.isArray(item?.content)) {
        for (const content of item.content as OpenAiTextContent[]) {
          if (typeof content?.text === "string") {
            texts.push(content.text);
          }
        }
      }
    }

    return texts.join("\n").trim();
  }

  return "";
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireComponentKnowledgeAccess(request);

    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: 403 });
    }

    const rawBody = await request.text();

    if (!rawBody) {
      return NextResponse.json(
        { error: "Leerer Request-Body." },
        { status: 400 }
      );
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Ungültiges JSON im Request-Body." },
        { status: 400 }
      );
    }

    const query = cleanQuery((body as { query?: unknown }).query);

    if (query.length < 2) {
      return NextResponse.json(
        { error: "Bitte gib mindestens 2 Zeichen ein." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY fehlt. Bitte in .env.local eintragen und den Server neu starten.",
        },
        { status: 500 }
      );
    }

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: `Erkläre folgendes Kfz-Bauteil, System oder Thema praxisnah für eine Werkstatt: ${query}`,
          },
        ],
        max_output_tokens: 1400,
      }),
    });

    const openAiText = await openAiResponse.text();

    let openAiData: OpenAiResponseData = {};

    if (openAiText) {
      try {
        openAiData = JSON.parse(openAiText);
      } catch {
        return NextResponse.json(
          {
            error:
              "OpenAI hat keine gültige JSON-Antwort geliefert: " +
              openAiText.slice(0, 300),
          },
          { status: 502 }
        );
      }
    }

    if (!openAiResponse.ok) {
      console.error("OpenAI API Fehler:", openAiData);

      return NextResponse.json(
        {
          error:
            openAiData?.error?.message ||
            `OpenAI API Fehler. Status: ${openAiResponse.status}`,
        },
        { status: openAiResponse.status }
      );
    }

    const answer = extractResponseText(openAiData);

    if (!answer) {
      console.error("Keine Antwort im OpenAI Response:", openAiData);

      return NextResponse.json(
        { error: "Es wurde keine Erklärung erzeugt." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      query,
      answer,
    });
  } catch (error) {
    console.error("Bauteilwissen Fehler:", error);

    return NextResponse.json(
      { error: "Interner Fehler beim Bauteilwissen." },
      { status: 500 }
    );
  }
}
