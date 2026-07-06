import AudienceLandingPage from "@/components/AudienceLandingPage";

export const metadata = {
  title: "DiagnoseHUB für Schulen",
  description:
    "Kfz-Diagnosefälle, Lernmodule und Prüfungsaufgaben für Berufsschulen und Unterricht.",
};

export default function SchulenLandingPage() {
  return (
    <AudienceLandingPage
      eyebrow="Für Berufsschulen"
      title="Diagnosefälle für Unterricht, Prüfung und Fachgespräch."
      intro="DiagnoseHUB unterstützt Lehrkräfte dabei, technische Fälle strukturiert zu zeigen: vom Symptom über Messwerte bis zur begründeten Reparaturentscheidung."
      primaryCta={{
        label: "Lernportal ansehen",
        href: "/lernen",
      }}
      secondaryCta={{
        label: "Preise prüfen",
        href: "/preise",
      }}
      accent="green"
      proofPoints={[
        "Fallbasiertes Lernen",
        "Prüfungsnahe Aufgaben",
        "Bauteilwissen für Unterrichtseinheiten",
      ]}
      useCases={[
        {
          title: "Unterricht vorbereiten",
          description:
            "Aus einem Thema wie DPF, ABS, Ladedruck oder Klimaanlage entsteht ein strukturierter Fall mit Prüfstrategie.",
        },
        {
          title: "Fachgespräche üben",
          description:
            "Schüler können freie Antworten formulieren und bekommen eine KI-gestützte Bewertung mit Punkten und Verbesserungshinweisen.",
        },
        {
          title: "Sichtbare Prüfpunkte",
          description:
            "Prüfpläne zeigen, wo geprüft wird und welche Reihenfolge fachlich sinnvoll ist.",
        },
      ]}
      workflow={[
        {
          step: "01",
          title: "Thema oder Fall auswählen",
          description:
            "Zum Beispiel Ladedruckregelung, Raddrehzahlsensor, Kühlsystem, DPF oder Zündaussetzer.",
        },
        {
          step: "02",
          title: "Diagnoseweg gemeinsam besprechen",
          description:
            "Die Klasse kann Ursachen sammeln, Messpunkte priorisieren und die Prüfstrategie vergleichen.",
        },
        {
          step: "03",
          title: "Antworten bewerten",
          description:
            "Fallaufgaben mit Textfeld eignen sich für Prüfungsvorbereitung, Fachgespräch und Lernerfolgskontrolle.",
        },
      ]}
      comparisonTitle="Für Schulen, die Diagnosekompetenz sichtbar machen wollen."
      comparisonItems={[
        "Hilft, technische Systeme nicht nur als Theorie, sondern als Diagnosekette zu erklären.",
        "Unterstützt praxisnahe Aufgaben mit Symptomen, Messwerten und Entscheidungspfaden.",
        "Eignet sich für Einzelarbeit, Gruppenarbeit und gemeinsame Besprechung am Bildschirm.",
        "Kann Unterrichtsmodule, Quizfragen und Gesellenprüfungs-Training miteinander verbinden.",
      ]}
      closingTitle="Mehr reale Diagnose im Unterricht."
      closingText="DiagnoseHUB kann Berufsschulen helfen, Fälle schneller vorzubereiten und Auszubildende stärker an echte Werkstattlogik heranzuführen."
    />
  );
}
