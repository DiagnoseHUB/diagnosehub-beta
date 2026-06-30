"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/client";

type BillingMessageType = "success" | "warning" | "error" | "info";

type BillingMessage = {
  type: BillingMessageType;
  text: string;
};

type CheckoutResponse = {
  url?: string;
  error?: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unbekannter Fehler.";
}

function getMessageClassName(type: BillingMessageType) {
  if (type === "success") {
    return "border-green-300 bg-green-50 text-green-950 dark:border-green-700/60 dark:bg-green-950/40 dark:text-green-100";
  }

  if (type === "warning") {
    return "border-yellow-300 bg-yellow-50 text-yellow-950 dark:border-yellow-700/60 dark:bg-yellow-950/40 dark:text-yellow-100";
  }

  if (type === "error") {
    return "border-red-300 bg-red-50 text-red-950 dark:border-red-700/60 dark:bg-red-950/40 dark:text-red-100";
  }

  return "border-blue-300 bg-blue-50 text-blue-950 dark:border-blue-700/60 dark:bg-blue-950/40 dark:text-blue-100";
}

export default function BillingPage() {
  const supabase = useMemo(() => createClient(), []);

  const [accountEmail, setAccountEmail] = useState("");
  const [accountLoading, setAccountLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [message, setMessage] = useState<BillingMessage | null>(null);

  const isLoggedIn = accountEmail.length > 0;

  useEffect(() => {
    async function loadSession() {
      setAccountLoading(true);

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw new Error(error.message);
        }

        const session = data.session;

        if (!session?.user) {
          setAccountEmail("");
          return;
        }

        setAccountEmail(session.user.email || "E-Mail nicht hinterlegt");
      } catch (error) {
        setMessage({
          type: "error",
          text: `Session konnte nicht geladen werden: ${getErrorMessage(
            error
          )}`,
        });
      } finally {
        setAccountLoading(false);
      }
    }

    void loadSession();

    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const portal = params.get("portal");

    if (checkout === "success") {
      setMessage({
        type: "success",
        text: "Checkout abgeschlossen. Der Pro-Status wird nach Stripe-Webhook-Synchronisierung aktiviert.",
      });
    }

    if (checkout === "cancelled") {
      setMessage({
        type: "warning",
        text: "Checkout wurde abgebrochen. Es wurde kein Abo abgeschlossen.",
      });
    }

    if (portal === "returned") {
      setMessage({
        type: "info",
        text: "Du bist aus dem Stripe-Kundenportal zurückgekehrt.",
      });
    }
  }, [supabase]);

  async function getAccessToken() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    const accessToken = data.session?.access_token;

    if (!accessToken) {
      throw new Error("Bitte zuerst einloggen.");
    }

    return accessToken;
  }

  async function startCheckout() {
    setCheckoutLoading(true);
    setMessage(null);

    try {
      const accessToken = await getAccessToken();

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseText = await response.text();

      if (!responseText) {
        throw new Error(
          `Stripe Checkout hat leer geantwortet. Status: ${response.status}`
        );
      }

      let data: CheckoutResponse;

      try {
        data = JSON.parse(responseText) as CheckoutResponse;
      } catch {
        throw new Error(
          `Stripe Checkout hat keine gültige JSON-Antwort geliefert. Status: ${
            response.status
          }. Antwort: ${responseText.slice(0, 300)}`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Stripe Checkout konnte nicht starten.");
      }

      if (!data.url) {
        throw new Error("Stripe Checkout URL fehlt.");
      }

      window.location.href = data.url;
    } catch (error) {
      const messageText = getErrorMessage(error);

      if (messageText.includes("Bitte zuerst einloggen")) {
        setMessage({
          type: "warning",
          text: "Bitte zuerst einloggen. Danach kannst du DiagnoseHUB Pro aktivieren.",
        });
        return;
      }

      setMessage({
        type: "error",
        text: messageText,
      });
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function openCustomerPortal() {
    setPortalLoading(true);
    setMessage(null);

    try {
      const accessToken = await getAccessToken();

      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseText = await response.text();

      if (!responseText) {
        throw new Error(
          `Stripe Kundenportal hat leer geantwortet. Status: ${response.status}`
        );
      }

      let data: CheckoutResponse;

      try {
        data = JSON.parse(responseText) as CheckoutResponse;
      } catch {
        throw new Error(
          `Stripe Kundenportal hat keine gültige JSON-Antwort geliefert. Status: ${
            response.status
          }. Antwort: ${responseText.slice(0, 300)}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || "Stripe Kundenportal konnte nicht geöffnet werden."
        );
      }

      if (!data.url) {
        throw new Error("Stripe Kundenportal URL fehlt.");
      }

      window.location.href = data.url;
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error),
      });
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Header />

      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-6xl">
          <div className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 p-8 shadow-sm transition-colors dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
            <p className="text-sm font-black uppercase tracking-wide text-blue-700 dark:text-blue-400">
              DiagnoseHUB Pro
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100 sm:text-4xl">
              Pro-Abo aktivieren
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700 dark:text-slate-300">
              Aktiviere DiagnoseHUB Pro für Werkstatt-Diagnosen,
              KI-Anleitungen und erweiterte Funktionen. Der Checkout läuft über
              Stripe.
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 rounded-2xl border p-4 text-sm font-semibold leading-6 ${getMessageClassName(
                message.type
              )}`}
            >
              {message.text}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg transition-colors dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-2xl font-black text-slate-950 dark:text-slate-100">
                Was ist enthalten?
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "KI-Diagnosen",
                    description:
                      "Strukturierte technische Einschätzungen mit Prüfplan und möglichen Ursachen.",
                  },
                  {
                    title: "KI-Anleitungen",
                    description:
                      "Werkstattnahe Schritt-für-Schritt-Anleitungen für Reparatur- und Diagnoseabläufe.",
                  },
                  {
                    title: "Gespeicherte Inhalte",
                    description:
                      "Anleitungen und Diagnosefälle können gespeichert und später wieder geöffnet werden.",
                  },
                  {
                    title: "Pro-Funktionen",
                    description:
                      "Basis für erweiterte Limits, Historie und kommende Werkstattfunktionen.",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-colors dark:border-slate-800 dark:bg-slate-950"
                  >
                    <h3 className="font-black text-slate-950 dark:text-slate-100">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-yellow-300 bg-yellow-50 p-5 text-sm leading-6 text-yellow-950 dark:border-yellow-700/60 dark:bg-yellow-950/40 dark:text-yellow-100">
                <strong>Hinweis für Kleinunternehmer:</strong> Der Preis wird
                als Endpreis dargestellt. Gemäß § 19 UStG wird keine
                Umsatzsteuer berechnet.
              </div>
            </section>

            <aside className="rounded-3xl border border-blue-200 bg-white p-6 shadow-xl transition-colors dark:border-blue-900 dark:bg-slate-900">
              <p className="text-sm font-black uppercase tracking-wide text-blue-700 dark:text-blue-400">
                Pro
              </p>

              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-black tracking-tight text-slate-950 dark:text-slate-100">
                  49 €
                </span>

                <span className="pb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  / Monat
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Endpreis. Keine Umsatzsteuerberechnung gemäß § 19 UStG.
                Monatlich kündbar.
              </p>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                <p className="font-bold text-slate-950 dark:text-slate-100">
                  Account
                </p>

                <p className="mt-1">
                  {accountLoading
                    ? "Account wird geladen..."
                    : isLoggedIn
                      ? accountEmail
                      : "Nicht eingeloggt"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void startCheckout()}
                disabled={checkoutLoading || accountLoading}
                className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
              >
                {checkoutLoading
                  ? "Stripe Checkout wird geöffnet..."
                  : "Pro aktivieren"}
              </button>

              {!isLoggedIn && !accountLoading && (
                <a
                  href="/login"
                  className="mt-3 block w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-bold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  Erst einloggen
                </a>
              )}

              <button
                type="button"
                onClick={() => void openCustomerPortal()}
                disabled={portalLoading || accountLoading || !isLoggedIn}
                className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {portalLoading
                  ? "Kundenportal wird geöffnet..."
                  : "Abo verwalten"}
              </button>

              <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Das Kundenportal funktioniert erst, wenn für den Account bereits
                ein Stripe-Kunde existiert.
              </p>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}