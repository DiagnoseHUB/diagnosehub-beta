import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";

const featureCards = [
  {
    title: "KI-Diagnose",
    description:
      "Fehlerbild, Fehlercode und Symptome eingeben. DiagnoseHUB erstellt daraus eine strukturierte Werkstatt-Einschätzung.",
  },
  {
    title: "Fehlercode-Kontext",
    description:
      "Bekannte Fehlercodes werden erkannt und mit typischen Ursachen sowie passenden Prüfschritten ergänzt.",
  },
  {
    title: "Motorkontext",
    description:
      "Diesel, Benziner und bekannte Motorcodes werden berücksichtigt, damit unpassende Prüfpunkte vermieden werden.",
  },
  {
    title: "Prüfprotokoll",
    description:
      "Aus dem aktuellen Diagnosefall kann ein druckbares Prüfprotokoll für die Werkstatt erstellt werden.",
  },
];

const workflowSteps = [
  {
    title: "1. Fehlerfall eingeben",
    description:
      "Zum Beispiel Fahrzeug, Motorcode, Fehlercode, Symptom, Live-Daten oder Kundenbeanstandung.",
  },
  {
    title: "2. Diagnose erhalten",
    description:
      "DiagnoseHUB erstellt eine technische Einschätzung mit Ursachen, Prüfplan und benötigten Messwerten.",
  },
  {
    title: "3. Fall speichern",
    description:
      "Der Diagnoseverlauf kann gespeichert, später geöffnet und als Prüfprotokoll weiterverwendet werden.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
            <div className="max-w-4xl">
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-400">
                DiagnoseHUB
              </p>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-6xl">
                KI-Diagnose für Kfz-Werkstätten.
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-300">
                Strukturierte Fehlerdiagnose für Werkstattfälle: Fehlercode,
                Symptom, Motorcode oder Messwerte eingeben und einen
                praxisnahen Prüfplan erhalten.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#diagnose"
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500"
                >
                  Diagnose starten
                </a>

                <a
                  href="/dashboard"
                  className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Dashboard öffnen
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="diagnose" className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-400">
              Diagnose
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
              Fehlerfall analysieren
            </h2>

            <p className="mt-4 max-w-3xl leading-8 text-slate-400">
              Gib Fahrzeugdaten, Fehlercodes, Symptome oder Live-Daten ein.
              Folgefragen bleiben im selben Diagnoseverlauf.
            </p>
          </div>

          <SearchBar />
        </section>

        <section
          id="workflow"
          className="border-y border-slate-800 bg-slate-900/50"
        >
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-400">
                Ablauf
              </p>

              <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
                Vom Fehlerbild zum Prüfplan
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {workflowSteps.map((step) => (
                <div
                  key={step.title}
                  className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6"
                >
                  <h3 className="text-xl font-bold text-white">
                    {step.title}
                  </h3>

                  <p className="mt-4 leading-7 text-slate-400">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-400">
              Funktionen
            </p>

            <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
              Für den Werkstattalltag gebaut
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-blue-950/20"
              >
                <h3 className="text-xl font-bold text-white">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}