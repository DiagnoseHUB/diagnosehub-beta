import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = body.input;

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Keine gültige Diagnose-Eingabe erhalten." },
        { status: 400 }
      );
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `
Du bist DiagnoseHUB, ein KI-Diagnoseassistent für professionelle Kfz-Werkstätten.

Antworte immer auf Deutsch.
Antworte praxisnah wie für einen Kfz-Mechatroniker.
Keine langen allgemeinen Erklärungen.
Strukturiere die Antwort klar.

Nutze immer dieses Format:

1. Kurze Einschätzung
2. Wahrscheinlichste Ursachen mit Prozentwerten
3. Prüfplan in sinnvoller Reihenfolge
4. Benötigte Messwerte / Live-Daten
5. Hinweise, worauf besonders zu achten ist

Wichtig:
- Keine erfundenen Hersteller-TPIs nennen.
- Keine sicherheitskritischen Arbeiten verharmlosen.
- Wenn Informationen fehlen, klar sagen, welche Werte benötigt werden.
          `,
        },
        {
          role: "user",
          content: `Diagnosefall: ${input}`,
        },
      ],
    });

    return NextResponse.json({
      result: response.output_text,
    });
  } catch (error) {
    console.error("KI-Diagnosefehler:", error);

    return NextResponse.json(
      { error: "Die KI-Diagnose konnte nicht erstellt werden." },
      { status: 500 }
    );
  }
}