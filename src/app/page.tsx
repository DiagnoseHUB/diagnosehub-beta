import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-20">
        <section className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm font-medium text-blue-300">
              KI-Diagnose für moderne Werkstätten
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              Schneller von der{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Fehlersuche
              </span>{" "}
              zur Ursache.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              DiagnoseHUB kombiniert Motorkennbuchstaben, Fehlercodes, Symptome
              und KI-gestützte Analyse zu einer praxisnahen Diagnosehilfe für
              Werkstätten.
            </p>

            <div className="mt-10">
              <SearchBar />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-blue-950/40">
            <p className="mb-4 text-sm font-medium text-blue-400">
              DiagnoseHUB Workflow
            </p>

            <h2 className="text-2xl font-bold">
              Diagnose mit Fallkontext
            </h2>

            <p className="mt-3 text-slate-400">
              Starte mit Fahrzeug, Motorcode, Fehlercode oder Symptom. Danach
              kannst du Folgefragen im gleichen Diagnosefall stellen.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex items-center justify-between gap-4">
                  <span>Motorkontext erkennen</span>
                  <span className="font-bold text-green-400">aktiv</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex items-center justify-between gap-4">
                  <span>KI-Diagnose erstellen</span>
                  <span className="font-bold text-blue-400">aktiv</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex items-center justify-between gap-4">
                  <span>Folgefragen beantworten</span>
                  <span className="font-bold text-cyan-400">aktiv</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex items-center justify-between gap-4">
                  <span>Diesel/Benziner-Qualitätscheck</span>
                  <span className="font-bold text-yellow-400">aktiv</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-7">
            <h3 className="text-xl font-bold">Motorkontext</h3>
            <p className="mt-3 text-slate-400">
              Erkennt bekannte Motorkennbuchstaben und unterscheidet Diesel und
              Benziner.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-7">
            <h3 className="text-xl font-bold">Folgefragen</h3>
            <p className="mt-3 text-slate-400">
              Der Diagnoseverlauf bleibt erhalten, damit kurze Rückfragen im
              gleichen Fall beantwortet werden können.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-7">
            <h3 className="text-xl font-bold">Qualitätsprüfung</h3>
            <p className="mt-3 text-slate-400">
              Erkennt grobe technische Konflikte wie Zündkerzen bei Diesel und
              generiert die Antwort neu.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}