"use client";

import { useState } from "react";

type EngineContext = {
  engineType: string;
  source: string;
  label: string;
  code: string | null;
  notes?: string;
};

function SearchBar() {
  const [search, setSearch] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [engineContext, setEngineContext] = useState<EngineContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startDiagnosis() {
    if (search.trim() === "") {
      alert("Bitte gib zuerst ein Fahrzeug, einen Fehlercode oder ein Symptom ein.");
      return;
    }

    setLoading(true);
    setError("");
    setAiResult("");
    setEngineContext(null);

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: search,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unbekannter Fehler bei der KI-Diagnose.");
      }

      setAiResult(data.result);
      setEngineContext(data.engineContext);
    } catch (error) {
      console.error(error);
      setError(
        "Die KI-Diagnose konnte nicht erstellt werden. Prüfe API-Key, Guthaben oder Server-Log."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-blue-950/30">
        <textarea
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Beschreibe den Fehlerfall, z. B. Audi A4 B8 CDHB ruckelt im Leerlauf..."
          rows={4}
          className="w-full resize-none rounded-2xl border border-slate-800 bg-slate-950 p-5 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
        />

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Fehlercode, Motorcode, Fahrzeug oder Symptom eingeben
          </p>

          <button
            onClick={startDiagnosis}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Analysiere..." : "Diagnose starten"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="mt-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-6 py-4 text-blue-300">
          KI-Diagnose wird erstellt...
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-300">
          {error}
        </div>
      )}

      {engineContext && (
        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-blue-950/20">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-400">
            Erkannter Motorkontext
          </p>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-500">Motortyp</p>
              <p className="mt-2 font-bold text-white">{engineContext.engineType}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-500">Erkennung</p>
              <p className="mt-2 font-bold text-white">{engineContext.source}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-500">Motorcode</p>
              <p className="mt-2 font-bold text-white">
                {engineContext.code ?? "nicht erkannt"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-500">Motor</p>
              <p className="mt-2 font-bold text-white">{engineContext.label}</p>
            </div>
          </div>

          {engineContext.notes && (
            <p className="mt-4 text-sm text-slate-400">{engineContext.notes}</p>
          )}
        </section>
      )}

      {aiResult && (
        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-blue-950/30">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-400">
            KI-Diagnose
          </p>

          <h2 className="mb-6 text-3xl font-bold text-white">
            Analyse-Ergebnis
          </h2>

          <div className="whitespace-pre-wrap leading-8 text-slate-300">
            {aiResult}
          </div>
        </section>
      )}
    </div>
  );
}

export default SearchBar;