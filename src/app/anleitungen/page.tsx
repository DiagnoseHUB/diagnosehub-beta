"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import InstructionCard from "../../components/InstructionCard";
import { instructions } from "../../data/instructions";
import type {
  InstructionCategory,
  InstructionGuide,
} from "../../types/instruction";

const allCategoryLabel = "Alle";

type GenerateInstructionResponse = {
  guide?: InstructionGuide;
  error?: string;
};

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <Suspense
        fallback={
          <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
            <section className="mx-auto max-w-7xl">
              <p className="text-slate-600">Anleitungen werden geladen...</p>
            </section>
          </main>
        }
      >
        <InstructionsPageContent />
      </Suspense>
    </div>
  );
}

function InstructionsPageContent() {
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    InstructionCategory | typeof allCategoryLabel
  >(allCategoryLabel);

  const [generatedInstruction, setGeneratedInstruction] =
    useState<InstructionGuide | null>(null);
  const [generatingInstruction, setGeneratingInstruction] = useState(false);
  const [generationError, setGenerationError] = useState("");

  const autoGenerationStartedRef = useRef(false);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(instructions.map((instruction) => instruction.category))
    );

    return [allCategoryLabel, ...uniqueCategories];
  }, []);

  const filteredInstructions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return instructions.filter((instruction) => {
      const matchesCategory =
        selectedCategory === allCategoryLabel ||
        instruction.category === selectedCategory;

      const searchableText = [
        instruction.title,
        instruction.subtitle,
        instruction.category,
        instruction.vehicleApplicability,
        ...instruction.tags,
        ...instruction.symptoms,
        ...instruction.commonCauses,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedSearch.length === 0 ||
        searchableText.includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const canGenerateInstruction = searchTerm.trim().length >= 3;

  useEffect(() => {
    if (!searchParams) {
      return;
    }

    const queryFromDiagnosis = searchParams.get("ki") ?? "";
    const shouldAutoGenerate = searchParams.get("auto") === "1";

    if (!queryFromDiagnosis) {
      return;
    }

    setSearchTerm(queryFromDiagnosis);
    setSelectedCategory(allCategoryLabel);

    if (shouldAutoGenerate && !autoGenerationStartedRef.current) {
      autoGenerationStartedRef.current = true;
      void handleGenerateInstruction(queryFromDiagnosis, "diagnosis");
    }
  }, [searchParams]);

  async function handleGenerateInstruction(
    queryOverride?: string,
    source: "search" | "diagnosis" = "search"
  ) {
    const query = (queryOverride || searchTerm).trim();

    if (query.length < 3) {
      setGenerationError("Bitte mindestens 3 Zeichen eingeben.");
      return;
    }

    setGeneratingInstruction(true);
    setGenerationError("");
    setGeneratedInstruction(null);

    try {
      const response = await fetch("/api/anleitungen/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          source,
          diagnosisText: source === "diagnosis" ? query : "",
        }),
      });

      const responseText = await response.text();

      if (!responseText) {
        throw new Error(
          `Die API hat leer geantwortet. Status: ${response.status} ${response.statusText}`
        );
      }

      let data: GenerateInstructionResponse;

      try {
        data = JSON.parse(responseText) as GenerateInstructionResponse;
      } catch {
        throw new Error(
          `Die API hat keine gültige JSON-Antwort geliefert. Status: ${
            response.status
          }. Antwort: ${responseText.slice(0, 300)}`
        );
      }

      if (!response.ok || !data.guide) {
        throw new Error(
          data.error || "Die KI-Anleitung konnte nicht erstellt werden."
        );
      }

      setGeneratedInstruction(data.guide);
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Unbekannter Fehler bei der KI-Anleitung."
      );
    } finally {
      setGeneratingInstruction(false);
    }
  }

  function resetGeneratedInstruction() {
    setGeneratedInstruction(null);
    setGenerationError("");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 p-8 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-slate-950">
            DiagnoseHUB Anleitungen
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Reparatur- und Diagnoseabläufe
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
            Suche nach gespeicherten Werkstatt-Anleitungen. Wenn noch keine
            passende Anleitung vorhanden ist, kann DiagnoseHUB direkt hier eine
            KI-Anleitung erstellen.
          </p>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <div>
              <label
                htmlFor="instruction-search"
                className="mb-2 block text-sm font-bold text-slate-950"
              >
                Anleitung suchen oder neues Thema eingeben
              </label>

              <input
                id="instruction-search"
                type="search"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  resetGeneratedInstruction();
                }}
                placeholder="z. B. Volvo XC60 Klima sporadisch ohne Fehlercode..."
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none ring-blue-500 transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2"
              />
            </div>

            <div>
              <label
                htmlFor="instruction-category"
                className="mb-2 block text-sm font-bold text-slate-950"
              >
                Kategorie
              </label>

              <select
                id="instruction-category"
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(
                    event.target.value as
                      | InstructionCategory
                      | typeof allCategoryLabel
                  )
                }
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none ring-blue-500 transition focus:border-blue-500 focus:ring-2 lg:w-56"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-700">
              {filteredInstructions.length} gespeicherte Anleitung
              {filteredInstructions.length === 1 ? "" : "en"} gefunden
            </p>

            <button
              type="button"
              disabled={!canGenerateInstruction || generatingInstruction}
              onClick={() => void handleGenerateInstruction()}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generatingInstruction
                ? "KI-Anleitung wird erstellt..."
                : "KI-Anleitung erstellen"}
            </button>
          </div>

          {!canGenerateInstruction && (
            <p className="mt-3 text-xs text-slate-500">
              Gib mindestens 3 Zeichen ein, um eine KI-Anleitung zu erstellen.
            </p>
          )}

          {filteredInstructions.length === 0 && canGenerateInstruction && (
            <div className="mt-5 rounded-2xl border border-yellow-300 bg-yellow-50 p-4">
              <p className="text-sm font-black text-yellow-950">
                Keine gespeicherte Anleitung gefunden.
              </p>

              <p className="mt-2 text-sm leading-6 text-yellow-950">
                Du kannst für diesen Suchbegriff direkt eine KI-Anleitung
                erstellen. Die Anleitung wird zunächst nur angezeigt und noch
                nicht dauerhaft gespeichert.
              </p>
            </div>
          )}

          {generationError && (
            <div className="mt-5 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-950">
              {generationError}
            </div>
          )}
        </div>

        {generatedInstruction && (
          <GeneratedInstructionPanel instruction={generatedInstruction} />
        )}

        {filteredInstructions.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredInstructions.map((instruction) => (
              <InstructionCard
                key={instruction.id}
                instruction={instruction}
              />
            ))}
          </div>
        ) : !generatedInstruction ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Keine gespeicherte Anleitung gefunden
            </h2>
            <p className="mt-2 text-sm text-slate-700">
              Suche nach Bauteil, Symptom, Fahrzeugmodell oder Fehlerbereich —
              oder erstelle direkt eine KI-Anleitung.
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}

type GeneratedInstructionPanelProps = {
  instruction: InstructionGuide;
};

function GeneratedInstructionPanel({
  instruction,
}: GeneratedInstructionPanelProps) {
  return (
    <article className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
            KI-generierte Anleitung
          </p>

          <h2 className="mt-3 text-3xl font-black text-slate-950">
            {instruction.title}
          </h2>

          <p className="mt-3 max-w-4xl leading-7 text-slate-700">
            {instruction.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-100 print:hidden"
        >
          Drucken
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
          {instruction.category}
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          {instruction.difficulty}
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          {instruction.estimatedTime}
        </span>
      </div>

      <div className="mb-6 rounded-2xl border border-yellow-300 bg-yellow-50 p-4 text-sm leading-6 text-yellow-950">
        <strong>Hinweis:</strong> Diese Anleitung wurde automatisch erstellt und
        ist noch nicht dauerhaft gespeichert. Herstellerdaten,
        Sicherheitsvorgaben und fahrzeugspezifische Werte müssen zusätzlich
        geprüft werden.
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <GeneratedBox title="Symptome" items={instruction.symptoms} />
        <GeneratedBox title="Werkzeuge" items={instruction.tools} />
        <GeneratedBox title="Sicherheit" items={instruction.safetyNotes} />
        <GeneratedBox title="Erstprüfung" items={instruction.initialChecks} />
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-black text-slate-950">
          Schritt-für-Schritt-Ablauf
        </h3>

        <div className="mt-5 grid gap-4">
          {instruction.steps.map((step, index) => (
            <div
              key={`${step.title}-${index}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-lg font-black text-slate-950">
                    {step.title}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {step.description}
                  </p>

                  {step.check && (
                    <div className="mt-4 rounded-xl border border-blue-300 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
                      <strong className="font-black text-blue-900">
                        Prüfpunkt:
                      </strong>{" "}
                      {step.check}
                    </div>
                  )}

                  {step.warning && (
                    <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm leading-6 text-red-950">
                      <strong className="font-black text-red-900">
                        Achtung:
                      </strong>{" "}
                      {step.warning}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <GeneratedBox
          title="Häufige Ursachen"
          items={instruction.commonCauses}
        />

        <GeneratedBox
          title="Nächste Maßnahmen"
          items={instruction.nextActions}
        />
      </div>

      {instruction.proHint && (
        <section className="mt-6 rounded-3xl border border-blue-300 bg-blue-50 p-5">
          <p className="text-sm font-black uppercase tracking-wide text-blue-800">
            DiagnoseHUB Hinweis
          </p>

          <p className="mt-3 text-sm leading-7 text-blue-950">
            {instruction.proHint}
          </p>
        </section>
      )}
    </article>
  );
}

type GeneratedBoxProps = {
  title: string;
  items: string[];
};

function GeneratedBox({ title, items }: GeneratedBoxProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-xl font-black text-slate-950">{title}</h3>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}