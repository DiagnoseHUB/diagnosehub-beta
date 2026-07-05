import AudienceLandingPage from "@/components/AudienceLandingPage";

export const metadata = {
  title: "DiagnoseHUB für Azubis",
  description:
    "Lernen, Prüfungsfragen und technische Diagnosefälle für Kfz-Azubis mit DiagnoseHUB.",
};

export default function AzubisLandingPage() {
  return (
    <AudienceLandingPage
      eyebrow="Für Kfz-Azubis"
      title="Diagnose verstehen, nicht nur auswendig lernen."
      intro="DiagnoseHUB hilft Azubis, Fehlercodes, Symptome und Messwerte in eine sinnvolle Prüfstrategie zu bringen. Ideal zum Üben für Werkstattalltag, Berufsschule und Prüfungsvorbereitung."
      primaryCta={{
        label: "Lernen starten",
        href: "/lernen",
      }}
      secondaryCta={{
        label: "Tarife ansehen",
        href: "/preise",
      }}
      accent="blue"
      proofPoints={[
        "Prüfreihenfolge statt Rätselraten",
        "Gesellenprüfung Teil 1 und 2 üben",
        "Bauteile praxisnah verstehen",
      ]}
      useCases={[
        {
          title: "Fehlercode einordnen",
          description:
            "Aus einem Fehlercode wird ein verständlicher Prüfplan mit möglichen Ursachen, sinnvollen Messpunkten und nächsten Schritten.",
        },
        {
          title: "Fallaufgaben trainieren",
          description:
            "Realistische Kfz-Fälle helfen dabei, Diagnosewege zu formulieren und die eigene Antwort fachlich zu verbessern.",
        },
        {
          title: "Bauteile begreifen",
          description:
            "Sensoren, Aktoren und Systeme werden mit Aufgabe, Symptomen und typischen Prüfungen erklärt.",
        },
      ]}
      workflow={[
        {
          step: "01",
          title: "Symptom oder Fehlercode eingeben",
          description:
            "Zum Beispiel P0299, Zündaussetzer, ABS-Fehler oder Klimaanlage ohne Leistung.",
        },
        {
          step: "02",
          title: "Prüfstrategie nachvollziehen",
          description:
            "DiagnoseHUB sortiert den Fall nach Sichtprüfung, Versorgung, Signal, Funktion und Abschlussprüfung.",
        },
        {
          step: "03",
          title: "Wissen festigen",
          description:
            "Quiz, Lernmodule und Fallaufgaben helfen, aus dem einzelnen Fall echtes Diagnoseverständnis zu machen.",
        },
      ]}
      comparisonTitle="Für Azubis, die in der Werkstatt schneller mitdenken wollen."
      comparisonItems={[
        "Hilft beim Formulieren von fachlichen Antworten in Prüfungs- und Fallaufgaben.",
        "Verbindet Theorie aus der Schule mit realen Symptomen und Messwerten.",
        "Zeigt typische Denkfehler, zum Beispiel Teiletausch ohne vorherige Prüfung.",
        "Macht technische Schemabilder und Marker nutzbar, damit Prüfpunkte leichter hängen bleiben.",
      ]}
      closingTitle="Starte mit echten Fällen statt trockenen Stichwortlisten."
      closingText="Für Azubis ist vor allem der Komplett-Zugang sinnvoll, weil Diagnose, Lernportal, Bauteilwissen und Prüfungsmodus zusammenkommen."
    />
  );
}
