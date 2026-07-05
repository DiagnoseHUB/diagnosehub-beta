import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";

const heroStats = [
  { label: "Diagnose", value: "P1-P5" },
  { label: "Lernen", value: "3 Stufen" },
  { label: "Tarife", value: "klar" },
];

const workflowSteps = [
  {
    label: "01",
    title: "Fall erfassen",
    description:
      "Fahrzeug, Fehlercode, Symptom, Motorcode, Live-Daten oder bisherige Prüfung eingeben.",
  },
  {
    label: "02",
    title: "Prüfplan erhalten",
    description:
      "DiagnoseHUB sortiert Ursachen, Messpunkte und sinnvolle Reihenfolge in einen nachvollziehbaren Ablauf.",
  },
  {
    label: "03",
    title: "Dokumentieren",
    description:
      "Fall speichern, Folgefragen stellen und bei Bedarf als Prüfprotokoll weiterverwenden.",
  },
];

const featureCards = [
  {
    title: "KI-Diagnose",
    description:
      "Strukturierte technische Einschätzung aus Fehlerbild, Fehlercode, Symptomen und Messwerten.",
  },
  {
    title: "Schema-Bilder",
    description:
      "Prüfpunktorientierte Werkstatt-Grafiken mit Markern, Messpunkten und Entscheidungspfad.",
  },
  {
    title: "Lernportal",
    description:
      "Module, Quiz, Bauteilwissen und Gesellenprüfungs-Training in klaren Lernstufen.",
  },
  {
    title: "Service-Erinnerung",
    description:
      "Fahrzeuge zentral speichern und HU, AU, Service sowie Wartungsintervalle im Blick behalten.",
  },
];

const audienceCards = [
  {
    title: "Azubis",
    description:
      "Diagnose verstehen, Prüfungsfragen üben und technische Zusammenhänge schneller greifen.",
    href: "/azubis",
  },
  {
    title: "Schulen",
    description:
      "Fallbasierter Unterricht mit Diagnosewegen, Fachgespräch und prüfungsnahen Aufgaben.",
    href: "/schulen",
  },
  {
    title: "Werkstätten",
    description:
      "Fehlerfälle schneller strukturieren, dokumentieren und mit klarer Prüfreihenfolge bearbeiten.",
    href: "/werkstaetten",
  },
];

function DiagnosticBoardPreview() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-700 dark:text-blue-300">
            Beispiel
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
            Passat B8 · P0299
          </h2>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
          Ladedruck
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {[
          "Fehlerspeicher und Freeze-Frame prüfen",
          "Ladeluftstrecke mit Druck/Rauch testen",
          "Soll-/Ist-Ladedruck vergleichen",
          "VTG/Wastegate und Sensorik bewerten",
        ].map((item, index) => (
          <div
            key={item}
            className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white dark:bg-slate-100 dark:text-slate-950">
              P{index + 1}
            </span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {item}
            </span>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              OK/NOK
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-yellow-300 bg-yellow-50 p-4 text-sm leading-6 text-yellow-950 dark:border-yellow-700/60 dark:bg-yellow-950/30 dark:text-yellow-100">
        DiagnoseHUB ersetzt keine Herstellerdaten. Messwerte, Sicherheit und
        Reparaturentscheidung bleiben fachliche Verantwortung.
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Header />

      <main>
        <section className="border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-20">
            <div>
              <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                DiagnoseHUB Beta 0.2
              </p>

              <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-slate-950 dark:text-white sm:text-6xl">
                KI-Diagnose für Werkstatt, Lernen und private Fahrzeuge.
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Eine Plattform für technische Fehlersuche: Diagnosefälle
                strukturieren, Prüfpunkte verstehen, Lernfortschritt sichern
                und Service-Termine im Blick behalten.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#diagnose"
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-500 dark:shadow-blue-950/40"
                >
                  Diagnose starten
                </a>
                <Link
                  href="/lernen"
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-black text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  Lernbereich öffnen
                </Link>
                <Link
                  href="/preise"
                  className="rounded-xl border border-blue-200 bg-blue-50 px-6 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
                >
                  Tarife ansehen
                </Link>
              </div>

              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                {heroStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <p className="text-2xl font-black text-slate-950 dark:text-white">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <DiagnosticBoardPreview />
          </div>
        </section>

        <section id="diagnose" className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-700 dark:text-blue-300">
                KI-Diagnose
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Fehlerfall analysieren
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600 dark:text-slate-300">
                Gib Fahrzeugdaten, Fehlercodes, Symptome oder Live-Daten ein.
                Folgefragen bleiben im selben Diagnoseverlauf.
              </p>
            </div>
          </div>

          <SearchBar />
        </section>

        <section id="workflow" className="border-y border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-8 max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-700 dark:text-blue-300">
                Ablauf
              </p>
              <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
                Vom Symptom zur prüfbaren Entscheidung
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {workflowSteps.map((step) => (
                <article
                  key={step.label}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white dark:bg-slate-100 dark:text-slate-950">
                    {step.label}
                  </span>
                  <h3 className="mt-5 text-xl font-black text-slate-950 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-700 dark:text-blue-300">
              Plattform
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
              Ein System für Diagnose, Wissen und Alltag
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-100 py-16 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-8 max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-700 dark:text-blue-300">
                Zielgruppen
              </p>
              <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
                Drei Einstiege, eine Plattform
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {audienceCards.map((group) => (
                <Link
                  key={group.href}
                  href={group.href}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
                >
                  <h3 className="text-xl font-black text-slate-950 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
                    {group.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {group.description}
                  </p>
                  <p className="mt-5 text-sm font-black text-blue-700 dark:text-blue-300">
                    Mehr erfahren
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="hinweis" className="mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-3xl border border-yellow-300 bg-yellow-50 p-8 dark:border-yellow-700/60 dark:bg-yellow-950/30">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-800 dark:text-yellow-300">
              Werkstatt-Hinweis
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
              Diagnosehilfe, keine Reparaturfreigabe
            </h2>
            <p className="mt-4 max-w-4xl leading-7 text-yellow-950 dark:text-yellow-100">
              DiagnoseHUB liefert technische Einschätzungen und strukturierte
              Prüfvorschläge. Die Verantwortung für Diagnose, Messung,
              Reparaturentscheidung, Herstellervorgaben und Arbeitssicherheit
              bleibt beim ausführenden Fachbetrieb.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
