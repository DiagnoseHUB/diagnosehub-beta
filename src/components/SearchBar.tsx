"use client";

import { useState } from "react";
import { getDiagnosis } from "@/services/diagnosisEngine";
import type { DiagnosisResult } from "@/services/diagnosisEngine";
import ResultCard from "./ResultCard";

function SearchBar() {
  const [search, setSearch] = useState("");
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);

  function startDiagnosis() {
    if (search.trim() === "") {
      alert("Bitte gib zuerst ein Fahrzeug, einen Fehlercode oder ein Symptom ein.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const result = getDiagnosis(search);
      setDiagnosis(result);
      setLoading(false);
    }, 1000);
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
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Diagnose starten
          </button>
        </div>
      </div>

      {loading && (
        <div className="mt-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-6 py-4 text-blue-300">
          Diagnose wird analysiert...
        </div>
      )}

      {diagnosis && !loading && (
        <div className="mt-8">
          <ResultCard diagnosis={diagnosis} />
        </div>
      )}
    </div>
  );
}

export default SearchBar;