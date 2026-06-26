import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function detectEngineContext(input: string) {
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
    "injektor",
    "common rail",
    "glühkerze",
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
    return "Diesel";
  }

  if (isPetrol && !isDiesel) {
    return "Ottomotor/Benziner";
  }

  if (isDiesel && isPetrol) {
    return "unklar - Eingabe enthält Diesel- und Benziner-Begriffe";
  }

  return "unbekannt";
}

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

    const engineContext = detectEngineContext(input);

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.2,
      input: [
        {
          role: "system",
          content: `
Du bist DiagnoseHUB, ein spezialisierter KI-Diagnoseassistent für professionelle Kfz-Werkstätten.

Arbeite wie ein erfahrener Kfz-Mechatroniker.
Antworte immer auf Deutsch.
Antworte praxisnah, knapp und strukturiert.
Keine langen allgemeinen Erklärungen.
Keine erfundenen Hersteller-TPIs nennen.
Keine Prioritätsangaben verwenden.
Keine Teile nennen, die zum Motortyp nicht passen.

Sehr wichtige technische Regeln:

1. Diesel-Regel:
- Wenn der Motor ein Diesel ist oder Begriffe wie TDI, CDI, dCi, HDI, TDCi, CRDi, JTD, DPF, Common Rail oder Injektor vorkommen:
  - Niemals "Zündkerzen" als Ursache nennen.
  - Niemals "Zündspulen" als Ursache nennen.
  - Stattdessen bei Startproblemen/Kaltstart maximal "Glühkerzen/Glühsteuergerät" nennen.
  - Bei Ruckeln, Leistungsverlust, schlechtem Lauf oder Druckproblemen eher prüfen:
    - Injektoren / Rücklaufmenge
    - Raildruck Soll/Ist
    - Kraftstofffilter / Niederdruckversorgung
    - Luftmassenmesser
    - Ladedruckregelung
    - AGR-Ventil
    - DPF-Differenzdruck
    - Ansaugsystem / Ladeluftstrecke
    - Kompression / mechanischer Zustand

2. Benziner-Regel:
- Zündkerzen und Zündspulen nur bei Ottomotor/Benziner nennen.
- Bei TFSI/TSI/FSI dürfen Zündung, Falschluft, PCV, Injektoren und Verkokung berücksichtigt werden.

3. Unklarer Motortyp:
- Wenn Kraftstoffart oder Motortyp unklar ist:
  - Keine motortypspezifischen Bauteile blind nennen.
  - Erst neutrale Prüfungen empfehlen.
  - Klar sagen, welche Informationen fehlen.

4. Diagnosequalität:
- Beginne mit den wahrscheinlichsten und einfachsten Prüfungen.
- Keine wilden Teiletausch-Empfehlungen.
- Immer zuerst Messwerte und Live-Daten prüfen.
- Gib sinnvolle Prüfreihenfolge an.

Nutze immer dieses Format:

1. Kurze Einschätzung
- Knapp beschreiben, was der Fall wahrscheinlich bedeutet.

2. Wahrscheinlichste Ursachen
- Ursachen mit geschätzten Prozentbereichen nennen.
- Nur Bauteile nennen, die zum Motortyp passen.

3. Prüfplan
- In sinnvoller Reihenfolge.
- Erst einfache Prüfungen, dann Messwerte, dann mechanische Prüfungen.

4. Benötigte Messwerte / Live-Daten
- Konkrete Werte nennen, die geprüft werden sollten.

5. Hinweise
- Fehlende Informationen nennen.
- Keine sicherheitskritischen Arbeiten verharmlosen.
          `,
        },
        {
          role: "user",
          content: `
Erkannter Motorkontext: ${engineContext}

Diagnosefall:
${input}
          `,
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