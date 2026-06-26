"use client";

import { useEffect, useRef, useState } from "react";

type EngineContext = {
  engineType: string;
  source: string;
  label: string;
  code: string | null;
  notes?: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const quickQuestions = [
  "Ladedruck Sollwert?",
  "Welche Messwerte prüfen?",
  "Was prüfe ich als erstes?",
  "Häufigste Ursache eingrenzen",
];

export default function SearchBar() {
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [engineContext, setEngineContext] = useState<EngineContext | null>(null);
  const [qualityCheck, setQualityCheck] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  async function sendDiagnosis(questionOverride?: string) {
    const currentInput = (questionOverride ?? search).trim();

    if (currentInput === "") {
      alert("Bitte gib zuerst ein Fahrzeug, einen Fehlercode oder ein Symptom ein.");
      return;
    }

    if (loading) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: currentInput,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setSearch("");
    setLoading(true);
    setError("");
    setQualityCheck("");

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: currentInput,
          messages: messages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unbekannter Fehler bei der KI-Diagnose.");
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.result,
      };

      setMessages([...nextMessages, assistantMessage]);
      setEngineContext(data.engineContext);
      setQualityCheck(data.qualityCheck || "");
    } catch (error) {
      console.error(error);
      setError(
        "Die KI-Diagnose konnte nicht erstellt werden. Prüfe API-Key, Guthaben oder Server-Log."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetDiagnosis() {
    setSearch("");
    setMessages([]);
    setEngineContext(null);
    setQualityCheck("");
    setError("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendDiagnosis();
    }
  }

  return (
    <div className="w-full">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-blue-950/30">
        <textarea
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            messages.length === 0
              ? "Beschreibe den Fehlerfall, z. B. Audi A4 B8 CDHB ruckelt im Leerlauf..."
              : "Folgefrage stellen, z. B. Ladedruck Sollwert?"
          }
          rows={4}
          className="w-full resize-none rounded-2xl border border-slate-800 bg-slate-950 p-5 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
        />

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            {messages.length === 0
              ? "Enter zum Senden · Shift + Enter für neue Zeile"
              : "Folgefrage im gleichen Diagnosefall stellen"}
          </p>

          <div className="flex gap-3">
            {messages.length > 0 && (
              <button
                onClick={resetDiagnosis}
                className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Neuer Fall
              </button>
            )}

            <button
              onClick={() => sendDiagnosis()}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Analysiere..."
                : messages.length === 0
                  ? "Diagnose starten"
                  : "Frage senden"}
            </button>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-3">
          {quickQuestions.map((question) => (
            <button
              key={question}
              onClick={() => sendDiagnosis(question)}
              disabled={loading}
              className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:border-blue-500 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {question}
            </button>
          ))}
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
              <p className="mt-2 font-bold text-white">
                {engineContext.engineType}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-500">Erkennung</p>
              <p className="mt-2 font-bold text-white">
                {engineContext.source}
              </p>
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
            <p className="mt-4 text-sm text-slate-400">
              {engineContext.notes}
            </p>
          )}
        </section>
      )}

      {qualityCheck && (
        <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">
            Qualitätsprüfung
          </p>

          <p className="mt-2 text-slate-300">{qualityCheck}</p>
        </section>
      )}

      {messages.length > 0 && (
        <section className="mt-8 space-y-5 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-blue-950/30">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">
            Diagnoseverlauf
          </p>

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={
                message.role === "user"
                  ? "ml-auto max-w-3xl rounded-2xl bg-blue-600 px-5 py-4 text-white"
                  : "mr-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-950/70 px-5 py-4 text-slate-300"
              }
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-70">
                {message.role === "user" ? "Du" : "DiagnoseHUB"}
              </p>

              <div className="whitespace-pre-wrap leading-8">
                {message.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="mr-auto max-w-4xl rounded-2xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 text-blue-300">
              DiagnoseHUB analysiert...
            </div>
          )}

          <div ref={messageEndRef} />
        </section>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}