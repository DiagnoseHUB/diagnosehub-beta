import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type EngineType = "Diesel" | "Benziner" | "Unbekannt";

type EngineInfo = {
  code: string;
  engineType: EngineType;
  label: string;
  notes?: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const ENGINE_CODE_DATABASE: Record<string, EngineInfo> = {
  CDHB: {
    code: "CDHB",
    engineType: "Benziner",
    label: "Audi/VW 1.8 TFSI Benziner",
    notes: "EA888 TFSI, Ottomotor mit Zündkerzen/Zündspulen.",
  },
  CBAB: {
    code: "CBAB",
    engineType: "Diesel",
    label: "VW/Audi 2.0 TDI Diesel",
    notes: "Common-Rail-Diesel, keine Zündkerzen/Zündspulen.",
  },
  DDAA: {
    code: "DDAA",
    engineType: "Diesel",
    label: "VW 2.0 TDI Diesel",
    notes: "Common-Rail-Diesel, keine Zündkerzen/Zündspulen.",
  },
};

function findEngineCode(input: string): EngineInfo | null {
  const upperText = input.toUpperCase();

  for (const code of Object.keys(ENGINE_CODE_DATABASE)) {
    if (upperText.includes(code)) {
      return ENGINE_CODE_DATABASE[code];
    }
  }

  return null;
}

function detectEngineContext(input: string) {
  const knownEngine = findEngineCode(input);

  if (knownEngine) {
    return {
      engineType: knownEngine.engineType,
      source: "Motorkennbuchstabe",
      label: knownEngine.label,
      code: knownEngine.code,
      notes: knownEngine.notes,
    };
  }

  const text = input.toLowerCase();

  const dieselTerms = [
    "diesel",
    "tdi",
    "cdi",
    "dci",
    "hdi",
    "tdci",
    "crdi",
    "jtd",
    "multijet",
    "bluehdi",
    "d-4d",
    "d4d",
    "dpf",
    "common rail",
    "raildruck",
    "glühkerze",
    "injektor",
  ];

  const petrolTerms = [
    "benzin",
    "benziner",
    "tfsi",
    "tsi",
    "fsi",
    "mpi",
    "gdi",
    "zündkerze",
    "zündspule",
  ];

  const isDiesel = dieselTerms.some((term) => text.includes(term));
  const isPetrol = petrolTerms.some((term) => text.includes(term));

  if (isDiesel && !isPetrol) {
    return {
      engineType: "Diesel" as EngineType,
      source: "Begriffe in der Eingabe",
      label: "Diesel erkannt",
      code: null,
      notes: "Diesel anhand von Begriffen erkannt.",
    };
  }

  if (isPetrol && !isDiesel) {
    return {
      engineType: "Benziner" as EngineType,
      source: "Begriffe in der Eingabe",
      label: "Benziner erkannt",
      code: null,
      notes: "Benziner anhand von Begriffen erkannt.",
    };
  }

  return {
    engineType: "Unbekannt" as EngineType,
    source: "Nicht eindeutig",
    label: "Motortyp unbekannt",
    code: null,
    notes: "Kraftstoffart/Motortyp nicht eindeutig erkannt.",
  };
}

function formatHistory(messages: ChatMessage[]) {
  return messages
    .map((message) => {
      const speaker = message.role === "user" ? "Nutzer" : "DiagnoseHUB";
      return `${speaker}: ${message.content}`;
    })
    .join("\n\n");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = body.input;
    const messages = Array.isArray(body.messages)
      ? (body.messages as ChatMessage[])
      : [];

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Keine gültige Diagnose-Eingabe erhalten." },
        { status: 400 }
      );
    }

    const combinedContext = `${formatHistory(messages)}\n\nAktuelle Eingabe: ${input}`;
    const engineContext = detectEngineContext(combinedContext);

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.15,
      input: [
        {
          role: "system",
          content: `
Du bist DiagnoseHUB, ein spezialisierter KI-Diagnoseassistent für professionelle Kfz-Werkstätten.

Antworte immer auf Deutsch.
Antworte praxisnah, technisch korrekt und strukturiert.
Keine langen allgemeinen Erklärungen.
Keine erfundenen Hersteller-TPIs nennen.
Keine Prioritätsangaben verwenden.
Keine Teile nennen, die zum erkannten Motortyp nicht passen.

Wichtig:
Der Nutzer kann Folgefragen stellen.
Kurze Folgefragen wie "Ladedruck Sollwert?", "Raildruck?", "Prüfwert?", "Wo messen?" oder "Was als nächstes?" beziehen sich auf den bisherigen Diagnoseverlauf.
Nutze dann den bisherigen Fall als Kontext und frage nicht unnötig erneut nach Fahrzeugdaten, wenn sie bereits im Verlauf stehen.

Erkannter Motortyp:
${engineContext.engineType}

Quelle der Erkennung:
${engineContext.source}

Erkannter Motor:
${engineContext.label}

Motorcode:
${engineContext.code ?? "nicht erkannt"}

Zusatzhinweis:
${engineContext.notes}

Technische Regeln:

1. Wenn Motortyp Diesel:
- Niemals Zündkerzen nennen.
- Niemals Zündspulen nennen.
- Bei Startproblemen/Kaltstart maximal Glühkerzen oder Glühsteuergerät nennen.
- Bei Ruckeln, schlechtem Lauf, Leistungsverlust oder Druckproblemen bevorzugt prüfen:
  - Injektoren / Rücklaufmenge
  - Raildruck Soll/Ist
  - Kraftstofffilter / Niederdruckversorgung
  - Luftmassenmesser
  - Ladedruckregelung
  - AGR-Ventil
  - DPF-Differenzdruck
  - Ansaugsystem / Ladeluftstrecke
  - Kompression / mechanischer Zustand

2. Wenn Motortyp Benziner:
- Zündkerzen und Zündspulen dürfen genannt werden.
- Bei TFSI/TSI/FSI außerdem berücksichtigen:
  - Falschluft / Kurbelgehäuseentlüftung
  - Injektoren
  - Hochdruckpumpe / Raildruck
  - Verkokte Einlassventile
  - Ladedruckregelung
  - Steuerzeiten / Kette

3. Wenn Motortyp unbekannt:
- Keine motortypspezifischen Bauteile blind nennen.
- Keine Zündkerzen oder Glühkerzen ohne passenden Kontext nennen.
- Wenn nötige Daten fehlen, kurz sagen, welche Angaben fehlen.

Antwortformat bei neuer Diagnose:
1. Kurze Einschätzung
2. Wahrscheinlichste Ursachen mit Prozentbereichen
3. Prüfplan
4. Benötigte Messwerte / Live-Daten
5. Hinweise

Antwortformat bei kurzer Folgefrage:
- Direkt auf die Folgefrage antworten.
- Bezug zum bisherigen Fahrzeug/Fall herstellen.
- Kurz und werkstattnah bleiben.
          `,
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
    });

    return NextResponse.json({
      result: response.output_text,
      engineContext,
    });
  } catch (error) {
    console.error("KI-Diagnosefehler:", error);

    return NextResponse.json(
      { error: "Die KI-Diagnose konnte nicht erstellt werden." },
      { status: 500 }
    );
  }
}