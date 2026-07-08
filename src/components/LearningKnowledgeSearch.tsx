"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const EXAMPLES = [
  "AGR-Ventil mit Stellmotor",
  "Differenzdrucksensor mit Schlauchanschlüssen",
  "CAN-Bus und Abschlusswiderstände",
  "Ladedruckregelung mit VTG-Verstellung",
  "Regelventil im Klimakompressor",
  "ABS-Raddrehzahlsensor und Magnetring",
  "Nockenwellensensor und Kurbelwellensensor",
  "Batteriesensor am Minuspol",
];

async function readJsonSafely(response: Response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      error: text,
    };
  }
}

function getKnowledgeSourceLabel(source?: string) {
  if (source === "database") {
    return "Aus Bauteilwissen-Datenbank";
  }

  if (source === "generated_saved") {
    return "Neu erzeugt und gespeichert";
  }

  if (source === "generated") {
    return "Neu erzeugt";
  }

  return "";
}

export default function LearningKnowledgeSearch() {
  const supabase = useMemo(() => createClient(), []);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [databaseWarning, setDatabaseWarning] = useState("");

  async function handleSubmit(event?: FormEvent) {
    event?.preventDefault();

    const cleanedQuery = query.trim();

    if (cleanedQuery.length < 2) {
      setError("Bitte gib ein Bauteil, System oder Thema ein.");
      return;
    }

    setIsLoading(true);
    setError("");
    setAnswer("");
    setLastQuery(cleanedQuery);
    setSourceLabel("");
    setDatabaseWarning("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch("/api/lernen/wissen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          query: cleanedQuery,
        }),
      });

      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Erklärung fehlgeschlagen. Status: ${response.status}`
        );
      }

      if (!data?.answer) {
        throw new Error("Die API hat keine Erklärung zurückgegeben.");
      }

      setAnswer(data.answer);
      setSourceLabel(getKnowledgeSourceLabel(data?.source));
      setDatabaseWarning(
        typeof data?.databaseWarning === "string" ? data.databaseWarning : ""
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Die Erklärung konnte nicht erstellt werden."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function selectExample(value: string) {
    setQuery(value);
    setError("");
    setAnswer("");
    setLastQuery("");
    setSourceLabel("");
    setDatabaseWarning("");
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
            DiagnoseHUB Lernen
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Bauteilwissen
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Lass dir Bauteile, Sensoren, Aktoren und Fahrzeugsysteme praxisnah
            erklären: innerer Aufbau, Unterbauteile, Zusammenspiel, Prüfung und
            Austauschentscheidung.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="z. B. Regelventil im Klimakompressor, VTG-Verstellung ..."
            className="min-h-12 flex-1 rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="min-h-12 rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Erklärung läuft ..." : "Erklären lassen"}
          </button>
        </form>

        <div className="mt-5 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => selectExample(example)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              {example}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {(isLoading || answer) && (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-1 border-b border-slate-100 pb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Technische Erklärung
            </p>

            <h2 className="text-xl font-bold text-slate-950">
              {lastQuery || query}
            </h2>

            {sourceLabel && (
              <span className="mt-2 w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                {sourceLabel}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
              {answer}
            </div>
          )}

          {databaseWarning && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              {databaseWarning}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
