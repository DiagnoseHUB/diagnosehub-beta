"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type UserPlan = "free" | "werkstatt" | "pro";

type DemoAccount = {
  name: string;
  workshop: string;
  email: string;
  role: string;
  plan: UserPlan;
  updatedAt: string;
};

const DEMO_ACCOUNT_STORAGE_KEY = "diagnosehub-demo-account";
const USER_PLAN_STORAGE_KEY = "diagnosehub-user-plan";

const planOptions: Record<
  UserPlan,
  {
    label: string;
    badge: string;
    description: string;
    features: string[];
  }
> = {
  free: {
    label: "Free",
    badge: "Kostenlos",
    description: "Für Tests und einzelne Diagnosefälle.",
    features: [
      "3 KI-Diagnosen pro Tag",
      "3 lokal gespeicherte Fälle",
      "Standard-Prüfprotokoll",
      "Basis-Fallbericht als TXT",
    ],
  },
  werkstatt: {
    label: "Werkstatt Demo",
    badge: "Premium Demo",
    description: "Vorbereitung für den späteren Werkstatt-Zugang.",
    features: [
      "50 KI-Diagnosen pro Tag",
      "25 lokal gespeicherte Fälle",
      "Individuelle Prüfprotokolle",
      "Erweiterte Fehlercode-Logik",
    ],
  },
  pro: {
    label: "Werkstatt Pro Demo",
    badge: "Pro Demo",
    description: "Vorbereitung für größere Betriebe.",
    features: [
      "150 KI-Diagnosen pro Tag",
      "100 lokal gespeicherte Fälle",
      "Pro-Funktionen vorbereitet",
      "Mehrnutzer-Logik später möglich",
    ],
  },
};

function isValidUserPlan(value: string | null): value is UserPlan {
  return value === "free" || value === "werkstatt" || value === "pro";
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function LoginPage() {
  const [name, setName] = useState("");
  const [workshop, setWorkshop] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Inhaber / Werkstatt");
  const [plan, setPlan] = useState<UserPlan>("free");
  const [savedAccount, setSavedAccount] = useState<DemoAccount | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const currentPlan = planOptions[plan];

  const accountStatus = useMemo(() => {
    if (!savedAccount) {
      return "Nicht eingerichtet";
    }

    return `${savedAccount.workshop} · ${planOptions[savedAccount.plan].label}`;
  }, [savedAccount]);

  useEffect(() => {
    try {
      const savedPlan = localStorage.getItem(USER_PLAN_STORAGE_KEY);
      const savedAccountData = localStorage.getItem(DEMO_ACCOUNT_STORAGE_KEY);

      if (isValidUserPlan(savedPlan)) {
        setPlan(savedPlan);
      }

      if (savedAccountData) {
        const parsedAccount = JSON.parse(savedAccountData) as DemoAccount;

        setSavedAccount(parsedAccount);
        setName(parsedAccount.name || "");
        setWorkshop(parsedAccount.workshop || "");
        setEmail(parsedAccount.email || "");
        setRole(parsedAccount.role || "Inhaber / Werkstatt");

        if (isValidUserPlan(parsedAccount.plan)) {
          setPlan(parsedAccount.plan);
          localStorage.setItem(USER_PLAN_STORAGE_KEY, parsedAccount.plan);
        }
      }
    } catch (error) {
      console.error("Demo-Account konnte nicht geladen werden:", error);
    }
  }, []);

  function saveAccount() {
    setError("");
    setSuccess(false);

    const cleanName = name.trim();
    const cleanWorkshop = workshop.trim();
    const cleanEmail = email.trim();
    const cleanRole = role.trim();

    if (!cleanName) {
      setError("Bitte gib einen Namen ein.");
      return;
    }

    if (!cleanWorkshop) {
      setError("Bitte gib den Werkstattnamen ein.");
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }

    const nextAccount: DemoAccount = {
      name: cleanName,
      workshop: cleanWorkshop,
      email: cleanEmail,
      role: cleanRole || "Werkstatt",
      plan,
      updatedAt: new Date().toISOString(),
    };

    setSavedAccount(nextAccount);
    localStorage.setItem(DEMO_ACCOUNT_STORAGE_KEY, JSON.stringify(nextAccount));
    localStorage.setItem(USER_PLAN_STORAGE_KEY, plan);

    setSuccess(true);

    window.setTimeout(() => {
      setSuccess(false);
    }, 2500);
  }

  function clearAccount() {
    setName("");
    setWorkshop("");
    setEmail("");
    setRole("Inhaber / Werkstatt");
    setPlan("free");
    setSavedAccount(null);
    setSuccess(false);
    setError("");

    localStorage.removeItem(DEMO_ACCOUNT_STORAGE_KEY);
    localStorage.setItem(USER_PLAN_STORAGE_KEY, "free");
  }

  function changePlan(nextPlan: UserPlan) {
    setPlan(nextPlan);
    localStorage.setItem(USER_PLAN_STORAGE_KEY, nextPlan);

    if (savedAccount) {
      const updatedAccount: DemoAccount = {
        ...savedAccount,
        plan: nextPlan,
        updatedAt: new Date().toISOString(),
      };

      setSavedAccount(updatedAccount);
      localStorage.setItem(
        DEMO_ACCOUNT_STORAGE_KEY,
        JSON.stringify(updatedAccount)
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-14">
        <section className="grid gap-10 lg:grid-cols-[0.9fr_1fr] lg:items-start">
          <div>
            <div className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm font-semibold text-blue-300">
              DiagnoseHUB Account
            </div>

            <h1 className="mt-6 text-5xl font-black tracking-tight md:text-6xl">
              Login-Demo für den Prototyp.
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Diese Seite ist noch kein echter Benutzerlogin. Sie speichert
              Accountdaten lokal im Browser und synchronisiert den gewählten Plan
              mit der bestehenden Free/Premium-Logik.
            </p>

            <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">
                Aktueller Status
              </p>

              <h2 className="mt-3 text-2xl font-bold">{accountStatus}</h2>

              {savedAccount ? (
                <div className="mt-5 space-y-3 text-slate-400">
                  <p>
                    Name:{" "}
                    <span className="font-semibold text-white">
                      {savedAccount.name}
                    </span>
                  </p>
                  <p>
                    E-Mail:{" "}
                    <span className="font-semibold text-white">
                      {savedAccount.email}
                    </span>
                  </p>
                  <p>
                    Rolle:{" "}
                    <span className="font-semibold text-white">
                      {savedAccount.role}
                    </span>
                  </p>
                  <p>
                    Aktualisiert:{" "}
                    <span className="font-semibold text-white">
                      {formatDateTime(savedAccount.updatedAt)}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="mt-4 leading-7 text-slate-400">
                  Noch kein lokaler Demo-Account gespeichert.
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/#diagnose"
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
                >
                  Zur Diagnose
                </a>

                <a
                  href="/premium"
                  className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
                >
                  Premium vormerken
                </a>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6">
              <p className="font-bold text-yellow-300">
                Technischer Hinweis
              </p>

              <p className="mt-3 leading-7 text-slate-300">
                Diese Account-Seite ist nur ein Zwischenschritt. Für echte
                Kunden brauchen wir später Authentifizierung, Datenbank,
                serverseitige Rechteprüfung und Stripe-Webhooks.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-blue-950/30">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">
              Account einrichten
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Werkstattdaten speichern
            </h2>

            <div className="mt-8 grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Max Mustermann"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Werkstatt
                </label>
                <input
                  value={workshop}
                  onChange={(event) => setWorkshop(event.target.value)}
                  placeholder="KFZ Musterbetrieb"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  E-Mail
                </label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="mail@werkstatt.de"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Rolle
                </label>
                <input
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="Inhaber / Meister / Mechaniker"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-4 font-bold text-white">Plan auswählen</p>

              <div className="grid gap-4">
                {(["free", "werkstatt", "pro"] as UserPlan[]).map(
                  (planKey) => (
                    <button
                      key={planKey}
                      onClick={() => changePlan(planKey)}
                      className={
                        plan === planKey
                          ? "rounded-2xl border border-blue-500 bg-blue-500/10 p-5 text-left"
                          : "rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-left transition hover:border-blue-500/50"
                      }
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <span
                            className={
                              plan === planKey
                                ? "inline-flex rounded-full border border-blue-400/40 bg-blue-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-200"
                                : "inline-flex rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-400"
                            }
                          >
                            {planOptions[planKey].badge}
                          </span>

                          <h3 className="mt-3 text-xl font-bold text-white">
                            {planOptions[planKey].label}
                          </h3>

                          <p className="mt-2 leading-7 text-slate-400">
                            {planOptions[planKey].description}
                          </p>
                        </div>

                        {plan === planKey && (
                          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                            Aktiv
                          </span>
                        )}
                      </div>

                      <ul className="mt-4 grid gap-2 md:grid-cols-2">
                        {planOptions[planKey].features.map((feature) => (
                          <li
                            key={feature}
                            className="flex gap-3 text-sm text-slate-300"
                          >
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={saveAccount}
                className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-500"
              >
                Account lokal speichern
              </button>

              <button
                onClick={clearAccount}
                className="rounded-2xl border border-red-500/30 px-6 py-4 font-bold text-red-300 transition hover:bg-red-500/10"
              >
                Account löschen
              </button>
            </div>

            {success && (
              <div className="mt-5 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-green-300">
                Account wurde lokal gespeichert und der Plan synchronisiert.
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-300">
                {error}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}