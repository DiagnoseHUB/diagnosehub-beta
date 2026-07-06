import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

type AudienceLandingPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  accent: "blue" | "green" | "amber";
  proofPoints: string[];
  useCases: Array<{
    title: string;
    description: string;
  }>;
  workflow: Array<{
    step: string;
    title: string;
    description: string;
  }>;
  comparisonTitle: string;
  comparisonItems: string[];
  closingTitle: string;
  closingText: string;
};

const accentClasses = {
  blue: {
    badge: "border-blue-400/40 bg-blue-500/10 text-blue-200",
    button: "bg-blue-600 hover:bg-blue-500",
    dot: "bg-blue-400",
    line: "border-blue-500/40",
    panel: "bg-blue-500/10 text-blue-100 border-blue-400/30",
  },
  green: {
    badge: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
    button: "bg-emerald-600 hover:bg-emerald-500",
    dot: "bg-emerald-400",
    line: "border-emerald-500/40",
    panel: "bg-emerald-500/10 text-emerald-100 border-emerald-400/30",
  },
  amber: {
    badge: "border-amber-400/40 bg-amber-500/10 text-amber-200",
    button: "bg-amber-500 text-slate-950 hover:bg-amber-400",
    dot: "bg-amber-300",
    line: "border-amber-400/40",
    panel: "bg-amber-500/10 text-amber-100 border-amber-400/30",
  },
};

function DiagnosticScene({
  accent,
  title,
}: {
  accent: AudienceLandingPageProps["accent"];
  title: string;
}) {
  const styles = accentClasses[accent];

  return (
    <div className="relative min-h-[25rem] overflow-hidden border-y border-slate-800 bg-slate-950 lg:min-h-[34rem]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-slate-700" />

      <div className="absolute left-[8%] top-[18%] h-28 w-28 rounded-full border-4 border-slate-600 bg-slate-900 shadow-2xl">
        <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-500" />
      </div>

      <div className="absolute left-[24%] top-[24%] h-20 w-20 rounded-full border-4 border-slate-600 bg-slate-900">
        <div className="absolute inset-4 rounded-full border border-slate-500" />
      </div>

      <div className="absolute left-[37%] top-[14%] h-24 w-24 rounded-full border-4 border-slate-600 bg-slate-900">
        <div className="absolute inset-5 rounded-full border border-slate-500" />
      </div>

      <div className="absolute left-[17%] top-[30%] h-24 w-[28%] rotate-[-9deg] rounded-full border-[14px] border-slate-300/80" />
      <div className="absolute left-[31%] top-[26%] h-28 w-[25%] rotate-[12deg] rounded-full border-[14px] border-slate-300/80" />

      {["P1", "P2", "P3", "P4", "P5"].map((marker, index) => (
        <div
          key={marker}
          className="absolute flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-slate-100 text-sm font-black text-slate-950 shadow-xl"
          style={{
            left: `${12 + index * 15}%`,
            top: `${58 + (index % 2) * 7}%`,
          }}
        >
          {marker}
        </div>
      ))}

      <div className="absolute bottom-[20%] left-[12%] right-[15%] h-px border-t border-dashed border-slate-400/60" />

      <div className="absolute right-[7%] top-[18%] w-[28rem] max-w-[42vw]">
        <div className={`rounded-3xl border p-5 backdrop-blur ${styles.panel}`}>
          <p className="text-xs font-black uppercase tracking-[0.3em]">
            DiagnoseHUB Ablauf
          </p>
          <p className="mt-3 text-2xl font-black text-white">{title}</p>
          <div className="mt-5 grid gap-3">
            {["Prüfpunkt", "Messwert", "Entscheidung"].map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
                <span className="text-sm font-bold text-slate-100">{item}</span>
                <span className="ml-auto text-xs font-black text-slate-400">
                  0{index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AudienceLandingPage({
  eyebrow,
  title,
  intro,
  primaryCta,
  secondaryCta,
  accent,
  proofPoints,
  useCases,
  workflow,
  comparisonTitle,
  comparisonItems,
  closingTitle,
  closingText,
}: AudienceLandingPageProps) {
  const styles = accentClasses[accent];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Header />

      <main>
        <section className="bg-slate-950 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-20">
            <div>
              <p
                className={`inline-flex rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.28em] ${styles.badge}`}
              >
                {eyebrow}
              </p>

              <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl">
                {title}
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                {intro}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={primaryCta.href}
                  className={`rounded-xl px-6 py-3 text-sm font-black text-white shadow-lg transition ${styles.button}`}
                >
                  {primaryCta.label}
                </Link>

                <Link
                  href={secondaryCta.href}
                  className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-black text-slate-200 transition hover:bg-slate-800"
                >
                  {secondaryCta.label}
                </Link>
              </div>
            </div>

            <div className="min-h-[18rem]">
              <DiagnosticScene accent={accent} title={eyebrow} />
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto grid max-w-7xl gap-3 px-6 md:grid-cols-3">
            {proofPoints.map((point) => (
              <div
                key={point}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950"
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${styles.dot}`} />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {point}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-700 dark:text-blue-300">
              Nutzen
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Wofür DiagnoseHUB in dieser Zielgruppe hilft
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {useCases.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900"
              >
                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-100 py-16 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                  Ablauf
                </p>
                <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
                  Vom Fall zur Entscheidung
                </h2>
                <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
                  Die Seiten sind für schnelle Orientierung gebaut: Fall
                  eingeben, Prüfschritte verstehen, Ergebnis dokumentieren.
                </p>
              </div>

              <div className="grid gap-4">
                {workflow.map((item) => (
                  <article
                    key={item.step}
                    className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:grid-cols-[5rem_1fr]"
                  >
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-sm font-black ${styles.panel}`}
                    >
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-950 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {item.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-700 dark:text-blue-300">
              Entscheidung
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
              {comparisonTitle}
            </h2>
            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
              DiagnoseHUB ist kein Ersatz für Fachwissen, sondern eine
              Strukturhilfe für bessere Fragen, bessere Reihenfolgen und
              nachvollziehbare Dokumentation.
            </p>
          </div>

          <div className="grid gap-3">
            {comparisonItems.map((item) => (
              <div
                key={item}
                className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${styles.dot}`} />
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-950 px-6 py-16 text-white dark:border-slate-800">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="max-w-3xl text-3xl font-black tracking-tight">
                {closingTitle}
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-slate-300">
                {closingText}
              </p>
            </div>

            <Link
              href={primaryCta.href}
              className={`shrink-0 rounded-xl px-6 py-3 text-sm font-black text-white transition ${styles.button}`}
            >
              {primaryCta.label}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
