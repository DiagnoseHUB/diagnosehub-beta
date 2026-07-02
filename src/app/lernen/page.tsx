import Link from "next/link";
import { loadPublishedLearningModules } from "@/lib/supabase/learningStorage";

export const metadata = {
  title: "Lernen | DiagnoseHUB",
  description:
    "Lerne Kfz-Diagnose, Elektrik, Diesel, Klima, Bremse, Fahrwerk und Werkstattpraxis mit DiagnoseHUB.",
};

export default async function LernenPage() {
  const modules = await loadPublishedLearningModules();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
            DiagnoseHUB Lernen
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Lernen & Kfz-Wissen
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Trainiere Diagnosewissen, prüfe dein Verständnis im Quiz oder lass
            dir einzelne Bauteile und Systeme praxisnah erklären.
          </p>
        </section>

        <section className="mb-10 grid gap-4 md:grid-cols-2">
          <Link
            href="/lernen/quiz"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl font-bold text-blue-700">
              ?
            </div>

            <h2 className="text-xl font-bold text-slate-950">Quiz starten</h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Trainiere mit Prüfungsfragen und Werkstattfällen. Ideal für
              Azubis, Gesellen und zur Wiederholung von Diagnosegrundlagen.
            </p>

            <p className="mt-4 text-sm font-semibold text-blue-700 group-hover:text-blue-800">
              Zum Quiz →
            </p>
          </Link>

          <Link
            href="/lernen/wissen"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl font-bold text-blue-700">
              i
            </div>

            <h2 className="text-xl font-bold text-slate-950">
              Bauteilwissen
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Lass dir Sensoren, Aktoren, Bauteile und Fahrzeugsysteme erklären
              – inklusive Aufgabe, Symptomen und sinnvoller Prüfstrategie.
            </p>

            <p className="mt-4 text-sm font-semibold text-blue-700 group-hover:text-blue-800">
              Bauteil erklären lassen →
            </p>
          </Link>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-950">Lernmodule</h2>

            <p className="mt-1 text-sm text-slate-600">
              Wähle ein Modul aus und starte mit den passenden Lerninhalten.
            </p>
          </div>

          {modules.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
              Es wurden noch keine veröffentlichten Lernmodule gefunden.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => (
                <Link
                  key={module.id}
                  href={`/lernen/${module.slug}`}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-base font-bold text-slate-700 transition group-hover:bg-blue-50 group-hover:text-blue-700">
                    {module.title?.slice(0, 1) || "L"}
                  </div>

                  <h3 className="text-lg font-bold text-slate-950">
                    {module.title}
                  </h3>

                  {module.description && (
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {module.description}
                    </p>
                  )}

                  <p className="mt-4 text-sm font-semibold text-blue-700 group-hover:text-blue-800">
                    Modul öffnen →
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}