import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import StripeCheckoutButton from "@/components/StripeCheckoutButton";
import type { CheckoutPlan } from "@/config/plans";

export const metadata = {
  title: "Preise | DiagnoseHUB",
  description:
    "Wähle den passenden DiagnoseHUB-Tarif für Kfz-Diagnose, Lernen und private Fahrzeugpflege.",
};

type PricePlan =
  | {
      name: string;
      price: string;
      interval: string;
      description: string;
      features: string[];
      cta: string;
      href: string;
      bestFor: string;
      highlighted: boolean;
      type: "link";
    }
  | {
      name: string;
      price: string;
      interval: string;
      description: string;
      features: string[];
      cta: string;
      href?: string;
      bestFor: string;
      highlighted: boolean;
      type: "stripe";
      plan: CheckoutPlan;
    };

const plans: PricePlan[] = [
  {
    name: "Free",
    price: "0 €",
    interval: "",
    description: "Zum Testen und für den ersten Einstieg.",
    features: [
      "3 KI-Anfragen pro Monat",
      "3 gespeicherte Fälle",
      "Basis-Fallbericht",
      "Gut zum Ausprobieren",
    ],
    cta: "Kostenlos starten",
    href: "/lernen",
    bestFor: "Erster Eindruck",
    highlighted: false,
    type: "link",
  },
  {
    name: "Diagnose 150",
    price: "19,99 €",
    interval: "/ Monat",
    description:
      "Für Werkstatt und private Nutzer, die hauptsächlich KI-Diagnosefälle bearbeiten.",
    features: [
      "150 Diagnosefälle pro Monat",
      "Folgefragen zählen mit",
      "150 gespeicherte Fälle",
      "Technische Prüfpläne und Fallstruktur",
      "Kein Bauteilwissen und kein Lernportal",
    ],
    cta: "Diagnose 150 aktivieren",
    bestFor: "Fälle bearbeiten",
    highlighted: false,
    type: "stripe",
    plan: "diagnose_150",
  },
  {
    name: "Komplett 150",
    price: "29,99 €",
    interval: "/ Monat",
    description:
      "Der volle Funktionsumfang mit Diagnose, Lernen, Bauteilwissen und Service-Erinnerung.",
    features: [
      "150 Diagnosefälle pro Monat",
      "Lernportal und Prüfungsfragen",
      "Bauteilwissen inklusive",
      "Service-Erinnerung inklusive",
      "Für Werkstatt, Azubis und private Schrauber",
    ],
    cta: "Komplett 150 aktivieren",
    bestFor: "Diagnose + Lernen",
    highlighted: true,
    type: "stripe",
    plan: "complete_150",
  },
  {
    name: "Unlimited",
    price: "49,99 €",
    interval: "/ Monat",
    description:
      "Für hohe Nutzung: alles aus Komplett 150, aber Diagnosefälle unbegrenzt.",
    features: [
      "Unbegrenzte Diagnosefälle",
      "Lernportal und Bauteilwissen",
      "Service-Erinnerung inklusive",
      "Unbegrenzt gespeicherte Fälle",
      "Für intensive Nutzung im Alltag",
    ],
    cta: "Unlimited aktivieren",
    bestFor: "Hohe Nutzung",
    highlighted: false,
    type: "stripe",
    plan: "unlimited",
  },
  {
    name: "Service-Erinnerung",
    price: "9,99 €",
    interval: "/ Jahr",
    description:
      "Für private Fahrzeughalter, die nur HU, AU, Service und Wartung im Blick behalten möchten.",
    features: [
      "Eigene Fahrzeuge zentral speichern",
      "HU/AU-Fälligkeit berechnen",
      "Hersteller-Serviceintervall nach Datum und km berücksichtigen",
      "E-Mail-Erinnerungen vorbereitet",
      "Ideal als günstiger Privat-Einstieg",
    ],
    cta: "Service aktivieren",
    href: "/service-erinnerung",
    bestFor: "Private Fahrzeuge",
    highlighted: false,
    type: "stripe",
    plan: "service_reminder",
  },
];

const comparisonItems = [
  {
    title: "Nur Diagnose",
    text: "Diagnose 150 passt, wenn Fälle, Prüfpläne und eine saubere Fallstruktur im Mittelpunkt stehen.",
  },
  {
    title: "Alles in einem",
    text: "Komplett 150 kombiniert Diagnose, Lernportal, Bauteilwissen und Service-Erinnerung.",
  },
  {
    title: "Keine Fallgrenze",
    text: "Unlimited ist für intensive Nutzung gedacht, wenn 150 Fälle nicht reichen.",
  },
];

export default function PreisePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Header />

      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="mb-10 grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 lg:grid-cols-[1fr_0.8fr] lg:p-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-700 dark:text-blue-300">
                DiagnoseHUB Preise
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                Der passende Zugang für Diagnose, Lernen und Service.
              </h1>

              <p className="mt-4 max-w-3xl leading-7 text-slate-600 dark:text-slate-300">
                Für Werkstätten, Azubis, Schulen und private Fahrzeughalter:
                Starte klein und schalte genau die Funktionen frei, die du im
                Alltag brauchst.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {comparisonItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <p className="font-black text-slate-950 dark:text-white">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={
                  plan.highlighted
                    ? "relative flex flex-col rounded-3xl border-2 border-blue-500 bg-white p-6 shadow-lg shadow-blue-100 transition-colors dark:bg-slate-900 dark:shadow-blue-950/20"
                    : "flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900"
                }
              >
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                    {plan.bestFor}
                  </span>

                  {plan.highlighted && (
                    <span className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
                      Empfehlung
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                  {plan.name}
                </h2>

                <div className="mt-4 flex flex-wrap items-end gap-1">
                  <span className="text-3xl font-bold text-slate-950 dark:text-white">
                    {plan.price}
                  </span>

                  {plan.interval && (
                    <span className="pb-1 text-sm text-slate-500 dark:text-slate-400">
                      {plan.interval}
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {plan.description}
                </p>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex gap-3 text-sm leading-6 text-slate-700 dark:text-slate-300"
                    >
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  {plan.type === "stripe" ? (
                    <>
                    <StripeCheckoutButton
                      plan={plan.plan}
                      className={
                        plan.highlighted
                          ? "block w-full rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
                          : "block w-full rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                      }
                    >
                      {plan.cta}
                    </StripeCheckoutButton>

                    {plan.href && (
                      <Link
                        href={plan.href}
                        className="mt-3 block rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                      >
                        Details ansehen
                      </Link>
                    )}
                  </>
                  ) : (
                    <Link
                      href={plan.href}
                      className="block rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-center text-sm font-black text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                    >
                      {plan.cta}
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </section>

          <section className="mt-8 grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 md:grid-cols-3">
            <div>
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Sicher bezahlen
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Die Buchung läuft über Stripe. Nach erfolgreicher Zahlung wird
                dein Tarif zentral am Account gespeichert.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Fair starten
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Free bleibt zum Testen verfügbar. Lerninhalte und Bauteilwissen
                sind in den Komplett-Tarifen enthalten.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Kündigung
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Aktive Abos lassen sich im Account über das Stripe-Kundenportal
                verwalten oder kündigen.
              </p>
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-500/30 dark:bg-blue-500/10">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
              Für Schulen und Werkstätten
            </h2>

            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700 dark:text-slate-200">
              Einzelne Nutzer können direkt buchen. Für Schulklassen,
              Ausbildungsgruppen oder interne Werkstatt-Tests kann ein Account
              zusätzlich manuell freigeschaltet werden.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
