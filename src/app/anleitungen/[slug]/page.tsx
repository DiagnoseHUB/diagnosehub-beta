import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import PrintButton from "../../../components/PrintButton";
import { getInstructionBySlug, instructions } from "../../../data/instructions";

type InstructionDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return instructions.map((instruction) => ({
    slug: instruction.slug,
  }));
}

export default async function InstructionDetailPage({
  params,
}: InstructionDetailPageProps) {
  const { slug } = await params;
  const instruction = getInstructionBySlug(slug);

  if (!instruction) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
            <Link
              href="/anleitungen"
              className="text-sm font-bold text-blue-700 transition hover:text-blue-900"
            >
              ← Zurück zu den Anleitungen
            </Link>

            <PrintButton />
          </div>

          <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-4 flex flex-wrap gap-2">
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

            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {instruction.title}
            </h1>

            <p className="mt-4 text-base leading-7 text-slate-700">
              {instruction.subtitle}
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-950">
                Fahrzeug-Anwendbarkeit
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-700">
                {instruction.vehicleApplicability}
              </p>
            </div>
          </header>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <InfoBox title="Symptome" items={instruction.symptoms} />
            <InfoBox title="Werkzeuge" items={instruction.tools} />
            <InfoBox
              title="Sicherheit"
              items={instruction.safetyNotes}
              warning
            />
            <InfoBox title="Erstprüfung" items={instruction.initialChecks} />
          </section>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Schritt-für-Schritt-Ablauf
            </h2>

            <div className="mt-6 space-y-5">
              {instruction.steps.map((step, index) => (
                <div
                  key={`${step.title}-${index}`}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-black text-white">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-black text-slate-950">
                        {step.title}
                      </h3>

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

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <InfoBox
              title="Häufige Ursachen"
              items={instruction.commonCauses}
            />
            <InfoBox
              title="Nächste Maßnahmen"
              items={instruction.nextActions}
            />
          </section>

          {instruction.proHint && (
            <section className="mt-6 rounded-3xl border border-blue-300 bg-blue-50 p-6">
              <p className="text-sm font-black uppercase tracking-wide text-blue-800">
                DiagnoseHUB Pro-Hinweis
              </p>

              <p className="mt-3 text-sm leading-7 text-blue-950">
                {instruction.proHint}
              </p>
            </section>
          )}

          <footer className="mt-8 text-center text-xs leading-5 text-slate-500">
            Letzte Aktualisierung: {instruction.lastUpdated}. Herstellerdaten,
            Drehmomente und fahrzeugspezifische Reparaturvorgaben immer
            zusätzlich prüfen.
          </footer>
        </article>
      </main>
    </div>
  );
}

type InfoBoxProps = {
  title: string;
  items: string[];
  warning?: boolean;
};

function InfoBox({ title, items, warning = false }: InfoBoxProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-slate-950">{title}</h2>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
            <span
              className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                warning ? "bg-red-500" : "bg-blue-600"
              }`}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}