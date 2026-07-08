import { NextRequest, NextResponse } from "next/server";
import { requireComponentKnowledgeAccess } from "@/lib/planAccess";
import {
  COMPONENT_KNOWLEDGE_SYSTEM_PROMPT,
  buildComponentKnowledgeUserPrompt,
} from "@/services/componentKnowledgePrompt";
import {
  findComponentKnowledgeEntry,
  getComponentKnowledgeStorageWarning,
  saveGeneratedComponentKnowledgeEntry,
} from "@/services/componentKnowledgeStorage";

export const runtime = "nodejs";

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

    const cachedKnowledge = await findComponentKnowledgeEntry(
      access.supabase,
      query
    );

    if (cachedKnowledge.error) {
      console.error("Bauteilwissen-Datenbank konnte nicht gelesen werden:", cachedKnowledge.error);
    }

    if (cachedKnowledge.entry) {
      return NextResponse.json({
        query,
        answer: cachedKnowledge.entry.answer,
        model: cachedKnowledge.entry.model,
        source: "database",
        databaseEntryId: cachedKnowledge.entry.id,
        databaseStatus: cachedKnowledge.entry.status,
      });
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
            content: COMPONENT_KNOWLEDGE_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: buildComponentKnowledgeUserPrompt(query),
          },
        ],
        max_output_tokens: 2300,
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

    const savedKnowledge = await saveGeneratedComponentKnowledgeEntry(
      access.supabase,
      {
        userId: access.user.id,
        query,
        answer,
        model,
      }
    );
    const databaseWarning = getComponentKnowledgeStorageWarning(
      savedKnowledge.error
    );

    if (databaseWarning) {
      console.error("Bauteilwissen konnte nicht gespeichert werden:", savedKnowledge.error);
    }

    return NextResponse.json({
      query,
      answer,
      model,
      source: savedKnowledge.saved ? "generated_saved" : "generated",
      databaseEntryId: savedKnowledge.entry?.id ?? null,
      databaseStatus: savedKnowledge.entry?.status ?? "not_saved",
      databaseWarning,
    });
  } catch (error) {
    console.error("Bauteilwissen Fehler:", error);

    return NextResponse.json(
      { error: "Interner Fehler beim Bauteilwissen." },
      { status: 500 }
    );
  }
}
