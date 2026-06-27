"use client";

import { useEffect, useMemo, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import {
  deletePremiumLeadFromSupabase,
  loadPremiumLeadsFromSupabase,
  migrateLocalPremiumLeadsToSupabase,
  savePremiumLeadToSupabase,
  type PremiumLead,
  type PremiumPlan,
} from "@/services/premiumLeadsSupabase";

type DemoAccount = {
  name: string;
  workshop: string;
  email: string;
  role: string;
  plan: "free" | "werkstatt" | "pro";
  updatedAt: string;
  supabaseUserId?: string;
};

const PREMIUM_LEADS_STORAGE_KEY = "diagnosehub-premium-leads";
const DEMO_ACCOUNT_STORAGE_KEY = "diagnosehub-demo-account";

const planOptions: Record<
  PremiumPlan,
  {
    label: string;
    price: string;
    description: string;
    features: string[];
  }
> = {
  werkstatt: {
    label: "Werkstatt",
    price: "29 € / Monat",
    description:
      "Für kleine Werkstätten, die DiagnoseHUB regelmäßig für Diagnosefälle nutzen wollen.",
    features: [
      "Mehr KI-Diagnosen pro Tag",
      "Individuelle Prüfprotokolle nach Fehlercode",
      "Erweiterte Fallhistorie",
      "Fallberichte für Kundenakte",
      "Erweiterte Fehlercode-Datenbank",
    ],
  },
  pro: {
    label: "Werkstatt Pro",
    price: "79 € / Monat",
    description:
      "Für Betriebe mit höherem Diagnosevolumen, mehreren Nutzern und mehr Dokumentation.",
    features: [
      "Höheres Diagnosekontingent",
      "Mehrere Benutzer geplant",
      "PDF-Berichte geplant",
      "Cloud-Fallhistorie geplant",
      "Werkstatt-Dashboard geplant",
    ],
  },
};

function getInitialPlan(): PremiumPlan {
  if (typeof window === "undefined") {
    return "werkstatt";
  }

  const params = new URLSearchParams(window.location.search);
  const plan = params.get("plan");

  if (plan === "pro") {
    return "pro";
  }

  return "werkstatt";
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unbekannter Fehler";
}

function loadLocalPremiumLeads() {
  try {
    const savedLeads = localStorage.getItem(PREMIUM_LEADS_STORAGE_KEY);

    if (!savedLeads) {
      return [];
    }

    const parsedLeads = JSON.parse(savedLeads);

    if (!Array.isArray(parsedLeads)) {
      return [];
    }

    return parsedLeads as PremiumLead[];
  } catch (error) {
    console.error("Lokale Premium-Vormerkungen konnten nicht geladen werden:", error);
    return [];
  }
}

function savePremiumLeadsToLocalStorage(leads: PremiumLead[]) {
  localStorage.setItem(PREMIUM_LEADS_STORAGE_KEY, JSON.stringify(leads));
}

function clearLocalPremiumLeads() {
  localStorage.removeItem(PREMIUM_LEADS_STORAGE_KEY);
}

function getLocalDemoAccount() {
  try {
    const savedAccount = localStorage.getItem(DEMO_ACCOUNT_STORAGE_KEY);

    if (!savedAccount) {
      return null;
    }

    return JSON.parse(savedAccount) as DemoAccount;
  } catch {
    return null;
  }
}

export default function PremiumPage() {
  const supabase = useMemo(() => createClient(), []);

  const [authChecked, setAuthChecked] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan>("werkstatt");
  const [name, setName] = useState("");
  const [workshop, setWorkshop] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const [leads, setLeads] = useState<PremiumLead[]>([]);
  const [localLeadsAvailable, setLocalLeadsAvailable] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const currentPlan = planOptions[selectedPlan];

  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [leads]);

  useEffect(() => {
    setSelectedPlan(getInitialPlan());
    void initializePremiumPage();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, nextSession: Session | null) => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);

        if (nextSession?.user) {
          prefillFromLocalAccount(nextSession.user);
          await loadLeadsForAuthenticatedUser(
            nextSession.user,
            loadLocalPremiumLeads()
          );
        } else {
          setLeads([]);
          setLocalLeadsAvailable(loadLocalPremiumLeads().length > 0);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function initializePremiumPage() {
    setError("");
    setSuccess("");

    try {
      const localLeads = loadLocalPremiumLeads();

      setLocalLeadsAvailable(localLeads.length > 0);

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setError(error.message);
        setAuthChecked(true);
        return;
      }

      setSession(data.session);
      setUser(data.session?.user ?? null);

      if (data.session?.user) {
        prefillFromLocalAccount(data.session.user);
        await loadLeadsForAuthenticatedUser(data.session.user, localLeads);
      } else {
        setLeads([]);
      }
    } catch (error) {
      console.error("Premium-Seite konnte nicht initialisiert werden:", error);
      setError(`Premium-Seite konnte nicht geladen werden: ${getErrorMessage(error)}`);
    } finally {
      setAuthChecked(true);
    }
  }

  function prefillFromLocalAccount(activeUser?: User) {
    const account = getLocalDemoAccount();

    if (account) {
      setName((currentValue) => currentValue || account.name || "");
      setWorkshop((currentValue) => currentValue || account.workshop || "");
      setEmail((currentValue) => currentValue || account.email || "");
      return;
    }

    if (activeUser?.email) {
      setEmail((currentValue) => currentValue || activeUser.email || "");
    }
  }

  async function loadLeadsForAuthenticatedUser(
    activeUser: User,
    localLeadsForMigration: PremiumLead[]
  ) {
    setLoading(true);
    setError("");

    try {
      if (localLeadsForMigration.length > 0) {
        await migrateLocalPremiumLeadsToSupabase(
          supabase,
          activeUser,
          localLeadsForMigration
        );

        clearLocalPremiumLeads();
        setLocalLeadsAvailable(false);
      }

      const remoteLeads = await loadPremiumLeadsFromSupabase(
        supabase,
        activeUser
      );

      setLeads(remoteLeads);
      savePremiumLeadsToLocalStorage(remoteLeads);

      if (localLeadsForMigration.length > 0) {
        showSuccess("Lokale Alt-Vormerkungen wurden nach Supabase migriert.");
      }
    } catch (error) {
      console.error("Supabase-Vormerkungen konnten nicht geladen werden:", error);
      setError(
        `Supabase-Vormerkungen konnten nicht geladen werden: ${getErrorMessage(error)}`
      );
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }

  function showSuccess(message: string) {
    setSuccess(message);
    setError("");

    window.setTimeout(() => {
      setSuccess("");
    }, 3000);
  }

  function clearForm() {
    setPhone("");
    setNote("");
  }

  async function saveLead() {
    setError("");
    setSuccess("");

    if (!user) {
      setError("Bitte zuerst einloggen. Vormerkungen werden nur noch in Supabase gespeichert.");
      return;
    }

    const cleanName = name.trim();
    const cleanWorkshop = workshop.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const cleanNote = note.trim();

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

    const newLead: PremiumLead = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      plan: selectedPlan,
      name: cleanName,
      workshop: cleanWorkshop,
      email: cleanEmail,
      phone: cleanPhone,
      note: cleanNote,
      userId: user.id,
    };

    setLoading(true);

    try {
      const persistedLead = await savePremiumLeadToSupabase(
        supabase,
        user,
        newLead
      );

      const updatedLeads = [
        persistedLead,
        ...leads.filter((lead) => lead.id !== persistedLead.id),
      ];

      setLeads(updatedLeads);
      savePremiumLeadsToLocalStorage(updatedLeads);
      clearForm();

      showSuccess("Vormerkung wurde in Supabase gespeichert.");
    } catch (error) {
      console.error("Vormerkung konnte nicht in Supabase gespeichert werden:", error);
      setError(
        `Vormerkung konnte nicht in Supabase gespeichert werden: ${getErrorMessage(error)}`
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteLead(leadId: string) {
    setError("");
    setSuccess("");

    if (!user) {
      setError("Zum Löschen musst du eingeloggt sein.");
      return;
    }

    setLoading(true);

    try {
      await deletePremiumLeadFromSupabase(supabase, user, leadId);

      const updatedLeads = leads.filter((lead) => lead.id !== leadId);

      setLeads(updatedLeads);
      savePremiumLeadsToLocalStorage(updatedLeads);

      showSuccess("Vormerkung wurde aus Supabase gelöscht.");
    } catch (error) {
      console.error("Vormerkung konnte nicht aus Supabase gelöscht werden:", error);
      setError(
        `Vormerkung konnte nicht aus Supabase gelöscht werden: ${getErrorMessage(error)}`
      );
    } finally {
      setLoading(false);
    }
  }

  async function reloadSupabaseLeads() {
    if (!user) {
      setError("Für Supabase-Vormerkungen zuerst einloggen.");
      return;
    }

    await loadLeadsForAuthenticatedUser(user, []);
    showSuccess("Supabase-Vormerkungen wurden neu geladen.");
  }

  async function migrateLocalLeadsNow() {
    if (!user) {
      setError("Für Migration zuerst einloggen.");
      return;
    }

    const localLeads = loadLocalPremiumLeads();

    if (localLeads.length === 0) {
      setError("Keine lokalen Alt-Vormerkungen gefunden.");
      return;
    }

    await loadLeadsForAuthenticatedUser(user, localLeads);
  }

  function exportLeads() {
    if (!user) {
      setError("Zum Exportieren musst du eingeloggt sein.");
      return;
    }

    if (leads.length === 0) {
      setError("Es gibt noch keine Vormerkungen zum Exportieren.");
      return;
    }

    const csvRows = [
      [
        "Datum",
        "Quelle",
        "Plan",
        "Name",
        "Werkstatt",
        "E-Mail",
        "Telefon",
        "Notiz",
      ],
      ...sortedLeads.map((lead) => [
        formatDateTime(lead.createdAt),
        "Supabase",
        planOptions[lead.plan].label,
        lead.name,
        lead.workshop,
        lead.email,
        lead.phone,
        lead.note,
      ]),
    ];

    const csvContent = csvRows
      .map((row) => {
        return row
          .map((cell) => `"${cell.replaceAll('"', '""')}"`)
          .join(";");
      })
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `diagnosehub-premium-vormerkungen-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setError("");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-14">
        <section className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div>
            <div className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm font-semibold text-blue-300">
              DiagnoseHUB Premium
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight md:text-6xl">
              Werkstatt-Zugang vormerken.
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Diese Seite ist die Vorbereitung für das spätere Bezahlsystem.
              Aktuell wird noch nichts abgerechnet. Vormerkungen werden nur mit
              Login direkt in Supabase gespeichert.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300">
                Supabase-Vormerkungen
              </span>

              {user ? (
                <span className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300">
                  Eingeloggt: {user.email}
                </span>
              ) : (
                <a
                  href="/login"
                  className="rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500 hover:text-white"
                >
                  Einloggen für Vormerkung
                </a>
              )}

              {localLeadsAvailable && user && (
                <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-300">
                  Lokale Alt-Vormerkungen gefunden
                </span>
              )}
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {(["werkstatt", "pro"] as PremiumPlan[]).map((plan) => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => setSelectedPlan(plan)}
                  className={
                    selectedPlan === plan
                      ? "rounded-3xl border border-blue-500 bg-blue-500/10 p-6 text-left shadow-2xl shadow-blue-950/40"
                      : "rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-left transition hover:border-blue-500/50"
                  }
                >
                  <p className="text-sm font-bold uppercase tracking-wide text-blue-300">
                    {planOptions[plan].label}
                  </p>

                  <p className="mt-3 text-4xl font-black">
                    {planOptions[plan].price}
                  </p>

                  <p className="mt-4 leading-7 text-slate-400">
                    {planOptions[plan].description}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {planOptions[plan].features.map((feature) => (
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
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6">
              <p className="font-bold text-yellow-300">
                Noch kein echtes Abo aktiv
              </p>

              <p className="mt-3 leading-7 text-slate-300">
                Für den echten Verkauf brauchen wir später Stripe Checkout,
                Stripe Webhooks, Rechnungslogik und eine serverseitige
                Premium-Prüfung. Diese Seite sammelt aktuell nur Vormerkungen.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-blue-950/30">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">
              Vormerkung
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {currentPlan.label} vormerken
            </h2>

            <p className="mt-3 leading-7 text-slate-400">
              Ausgewählter Plan:{" "}
              <span className="font-bold text-white">{currentPlan.price}</span>
            </p>

            {!authChecked && (
              <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                Supabase-Session wird geprüft...
              </div>
            )}

            {authChecked && !user && (
              <div className="mt-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5">
                <p className="font-bold text-yellow-300">
                  Login erforderlich
                </p>

                <p className="mt-3 leading-7 text-slate-300">
                  Vormerkungen werden nicht mehr lokal gespeichert. Melde dich
                  an, damit deine Vormerkung eindeutig deinem Supabase-Account
                  zugeordnet wird.
                </p>

                <a
                  href="/login"
                  className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
                >
                  Zum Login
                </a>
              </div>
            )}

            {authChecked && user && (
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
                    Telefon optional
                  </label>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+49 ..."
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Notiz optional
                  </label>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={4}
                    placeholder="z. B. Interesse an mehreren Nutzern, PDF-Berichten, bestimmter Fahrzeugmarke..."
                    className="w-full resize-none rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void saveLead()}
                  disabled={loading}
                  className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Speichert..."
                    : "Vormerkung in Supabase speichern"}
                </button>
              </div>
            )}

            {success && (
              <div className="mt-5 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-green-300">
                {success}
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-300">
                {error}
              </div>
            )}
          </div>
        </section>

        {user && (
          <section className="mt-12 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">
                  Supabase-Vormerkungen
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  Interessenten im Prototyp
                </h2>

                <p className="mt-2 text-slate-500">
                  Diese Vormerkungen wurden aus Supabase geladen und lokal
                  gespiegelt.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void reloadSupabaseLeads()}
                  disabled={loading}
                  className="rounded-xl border border-green-500/40 px-5 py-3 font-semibold text-green-300 transition hover:bg-green-500 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Supabase neu laden
                </button>

                <button
                  type="button"
                  onClick={() => void migrateLocalLeadsNow()}
                  disabled={loading || !localLeadsAvailable}
                  className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-5 py-3 font-semibold text-blue-300 transition hover:bg-blue-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Lokale Alt-Vormerkungen migrieren
                </button>

                <button
                  type="button"
                  onClick={exportLeads}
                  className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
                >
                  CSV exportieren
                </button>
              </div>
            </div>

            {sortedLeads.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-slate-500">
                Noch keine Vormerkungen gespeichert.
              </div>
            ) : (
              <div className="space-y-4">
                {sortedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-3">
                          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-300">
                            {planOptions[lead.plan].label}
                          </span>

                          <span className="text-sm text-slate-500">
                            {formatDateTime(lead.createdAt)}
                          </span>
                        </div>

                        <h3 className="mt-4 text-xl font-bold text-white">
                          {lead.workshop}
                        </h3>

                        <p className="mt-2 text-slate-300">{lead.name}</p>

                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                          <span>{lead.email}</span>
                          {lead.phone && <span>{lead.phone}</span>}
                        </div>

                        {lead.note && (
                          <p className="mt-4 leading-7 text-slate-400">
                            {lead.note}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => void deleteLead(lead.id)}
                        disabled={loading}
                        className="rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}