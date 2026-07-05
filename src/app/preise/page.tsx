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
      "Technische Prüfpläne und Diagnosebilder",
      "Kein Bauteilwissen und kein Lernportal",
    ],
    cta: "Diagnose 150 aktivieren",
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
    highlighted: false,
    type: "stripe",
    plan: "service_reminder",
  },
];

export default function PreisePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Header />

      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="mb-10">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              DiagnoseHUB Preise
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Wähle deinen Zugang
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
              Für Werkstätten, Azubis und private Fahrzeughalter: Starte klein
              und schalte genau die Funktionen frei, die du wirklich brauchst.
            </p>
          </section>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={
                  plan.highlighted
                    ? "relative rounded-3xl border-2 border-blue-500 bg-white p-6 shadow-md transition-colors dark:bg-slate-900"
                    : "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900"
                }
              >
                {plan.highlighted && (
                  <div className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    Empfehlung
                  </div>
                )}

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

                {plan.type === "stripe" ? (
                  <>
                    <StripeCheckoutButton
                      plan={plan.plan}
                      className="block w-full rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
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
                    className="mt-6 block rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                  >
                    {plan.cta}
                  </Link>
                )}
              </article>
            ))}
          </section>

          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">
              Hinweis zu Stripe
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Für die neuen Monatstarife müssen in Stripe eigene Price-IDs
              hinterlegt werden. Danach funktionieren die Buttons direkt über
              den bestehenden Checkout.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
