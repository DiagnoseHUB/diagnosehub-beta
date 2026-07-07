export type TechnicalSpecValue = {
  label: string;
  value: string;
  condition: string;
  note?: string;
};

export type TechnicalSpec = {
  id: string;
  title: string;
  category: string;
  aliases: string[];
  summary: string;
  applicability: string;
  values: TechnicalSpecValue[];
  checks: string[];
  deviations: string[];
  warnings?: string[];
};

export type TechnicalSpecContext = {
  foundSpecs: TechnicalSpec[];
  summary: string;
};

const TECHNICAL_SPECS: TechnicalSpec[] = [
  {
    id: "halogen-headlamp-12v",
    title: "Halogenhauptscheinwerfer 12 V",
    category: "Beleuchtung",
    aliases: [
      "halogenhauptscheinwerfer",
      "halogen scheinwerfer",
      "hauptscheinwerfer halogen",
      "abblendlicht halogen",
      "fernlicht halogen",
      "h7",
      "h4",
      "h1",
      "h11",
      "12v scheinwerfer",
      "12 v scheinwerfer",
    ],
    summary:
      "Generische Richtwerte für 12-V-Halogenlicht. Exakte Sicherungen, Pinbelegung und Lampentyp bleiben fahrzeugabhängig.",
    applicability:
      "12-V-Bordnetz mit Halogen-Leuchtmittel, z. B. H7/H1 55 W oder H4 60/55 W.",
    values: [
      {
        label: "Nennspannung",
        value: "12 V",
        condition: "Leuchtmittelangabe / Bordnetzklasse",
      },
      {
        label: "Betriebsspannung",
        value: "ca. 13,5-14,8 V",
        condition: "Motor läuft, Generator lädt, direkt am Lampenstecker unter Last messen",
        note: "Fahrzeug und Ladestrategie können abweichen.",
      },
      {
        label: "Leistung H7/H1",
        value: "typisch 55 W",
        condition: "Abblend- oder Fernlicht je nach Scheinwerferausführung",
      },
      {
        label: "Leistung H4",
        value: "typisch 60/55 W",
        condition: "Fernlicht/Abblendlicht im kombinierten Leuchtmittel",
      },
      {
        label: "Stromaufnahme 55 W",
        value: "ca. 4,0-4,6 A",
        condition: "je nach realer Spannung ca. 13,8 V bis 12 V",
      },
      {
        label: "Spannungsfall Plus/Masse",
        value: "ideal klein, grob <0,2 V je Seite",
        condition: "unter Last zwischen Batterieplus/Pluspin und Batterieminus/Massepin messen",
        note: "Bei Lichtproblemen ist die Messung unter Last wichtiger als Leerlaufspannung.",
      },
      {
        label: "Gesamtverlust Leitung",
        value: "grob <0,5 V",
        condition: "Differenz zwischen Batteriespannung und Spannung am Leuchtmittel unter Last",
      },
    ],
    checks: [
      "Spannung direkt am Lampenstecker bei eingeschaltetem Licht messen.",
      "Plusseitigen Spannungsfall unter Last messen.",
      "Masseseitigen Spannungsfall unter Last messen.",
      "Stecker auf Hitze, lose Pins, Oxidation und verschmorte Kontakte prüfen.",
      "Sicherung, Relais oder Lichtsteuergerät nur fahrzeugbezogen bewerten.",
      "Leuchtmittel nicht nur optisch, sondern bei Bedarf testweise mit Last prüfen.",
    ],
    deviations: [
      "Nahe 0 V am Stecker: Versorgung, Sicherung, Relais, Steuergerät oder Leitung unterbrochen.",
      "12 V im Leerlauf, aber Lampe dunkel: unter Last messen, Kontaktproblem oder Masseproblem möglich.",
      "Spannung deutlich unter Batteriespannung: Leitungs-, Steck- oder Masseübergangswiderstand suchen.",
      "Stecker warm oder braun: Übergangswiderstand, Pinspannung und Reparatursatz prüfen.",
      "Lampe fällt wiederholt aus: Überspannung, Feuchtigkeit, Vibration oder falschen Lampentyp prüfen.",
    ],
    warnings: [
      "Halogenlampen nicht am Glaskolben anfassen.",
      "Scheinwerfereinstellung nach Arbeiten am Scheinwerfer prüfen.",
    ],
  },
  {
    id: "battery-12v",
    title: "12-V-Starterbatterie",
    category: "Bordnetz",
    aliases: [
      "batterie",
      "starterbatterie",
      "12v batterie",
      "12 v batterie",
      "ruhespannung",
      "startspannung",
    ],
    summary:
      "Generische Richtwerte für 12-V-Bleiakku/AGM/EFB. Bewertung immer mit Temperatur, Batterietyp und Lastzustand abgleichen.",
    applicability: "12-V-Starterbatterie in Pkw und leichten Nutzfahrzeugen.",
    values: [
      {
        label: "Ruhespannung voll",
        value: "ca. 12,6-12,8 V",
        condition: "nach Ruhezeit, keine nennenswerte Last",
      },
      {
        label: "Ruhespannung schwach",
        value: "<12,2 V",
        condition: "Hinweis auf geringe Ladung oder Batterieproblem",
      },
      {
        label: "Startspannung",
        value: "möglichst >9,6 V",
        condition: "beim Starten, temperatur- und fahrzeugabhängig",
      },
      {
        label: "Ladespannung",
        value: "typisch ca. 13,8-14,8 V",
        condition: "Motor läuft, Verbraucher und Ladestrategie beachten",
      },
    ],
    checks: [
      "Ruhespannung erst nach kurzer Ruhezeit bewerten.",
      "Spannung beim Starten direkt an den Batteriepolen messen.",
      "Polklemmen und Masseband unter Last auf Spannungsfall prüfen.",
      "Generator-Ladespannung mit Verbrauchern prüfen.",
      "Bei AGM/EFB Batterietyp und Batteriemanagement beachten.",
    ],
    deviations: [
      "Ruhespannung niedrig: Batterie laden und erneut prüfen.",
      "Startspannung bricht stark ein: Batterie, Starterstrom oder Leitungswiderstand prüfen.",
      "Ladespannung zu niedrig: Generator, Riemen, Masse, Plusleitung oder Ladestrategie prüfen.",
      "Ladespannung zu hoch: Regler/Generator und Batteriezustand prüfen.",
    ],
  },
  {
    id: "generator-12v",
    title: "Drehstromgenerator 12 V",
    category: "Bordnetz",
    aliases: [
      "drehstromgenerator",
      "generator",
      "lichtmaschine",
      "lima",
      "ladespannung",
      "ladestrom",
    ],
    summary:
      "Generische Richtwerte für 12-V-Generatoren. Moderne geregelte Ladesysteme können gezielt abweichen.",
    applicability: "12-V-Generator mit Regler, klassische und geregelte Ladesysteme.",
    values: [
      {
        label: "Ladespannung klassisch",
        value: "ca. 13,8-14,8 V",
        condition: "Motor läuft, Batterie nicht voll entladen",
      },
      {
        label: "B+ Spannungsfall",
        value: "grob <0,3 V",
        condition: "zwischen Generator B+ und Batterieplus unter Last",
      },
      {
        label: "Masse-Spannungsfall",
        value: "grob <0,2 V",
        condition: "zwischen Generatorgehäuse und Batterieminus unter Last",
      },
      {
        label: "Restwelligkeit",
        value: "möglichst klein",
        condition: "Oszilloskop/geeignetes Messgerät, Diodenfehler beachten",
      },
    ],
    checks: [
      "Batteriespannung vor Start und bei laufendem Motor vergleichen.",
      "Ladespannung mit Licht, Gebläse und Heckscheibenheizung prüfen.",
      "Riemen, Freilauf und Steckverbindung am Generator prüfen.",
      "Spannungsfall Plus und Masse unter Last messen.",
      "Bei geregelten Generatoren Sollwertanforderung und LIN/BSS/DFM je nach Fahrzeug prüfen.",
    ],
    deviations: [
      "Keine Ladeerhöhung: Generatorantrieb, Erregung/Kommunikation, Sicherung oder Generator prüfen.",
      "Ladespannung schwankt stark: Regler, Freilauf, Masse oder Batterie prüfen.",
      "Guter Generatorwert, schlechte Batteriespannung: Plusleitung/Masseleitung unter Last prüfen.",
    ],
  },
  {
    id: "changeover-relay-12v",
    title: "Wechslerrelais 12 V",
    category: "Elektrik",
    aliases: [
      "wechslerrelais",
      "relais wechsler",
      "arbeitsrelais",
      "klemme 30 87 87a",
      "klemme 85 86",
      "umschaltrelais",
    ],
    summary:
      "Generische Klemmenlogik für ein 12-V-Wechslerrelais. Kontaktbelegung am Relaisaufdruck prüfen.",
    applicability: "Kfz-Relais mit Spule und Umschaltkontakt.",
    values: [
      {
        label: "Klemme 30",
        value: "gemeinsamer Eingang",
        condition: "Versorgung oder Signal je nach Schaltung",
      },
      {
        label: "Klemme 87",
        value: "Schließer-Ausgang",
        condition: "mit 30 verbunden, wenn Relais angesteuert ist",
      },
      {
        label: "Klemme 87a",
        value: "Öffner-Ausgang",
        condition: "mit 30 verbunden, wenn Relais nicht angesteuert ist",
      },
      {
        label: "Klemme 85/86",
        value: "Relaisspule",
        condition: "Polarität nur bei Relais mit Diode/Widerstand relevant",
      },
      {
        label: "Spulenspannung",
        value: "12 V Nennspannung",
        condition: "Ansteuerung unter Last und Massebezug prüfen",
      },
    ],
    checks: [
      "Relaisaufdruck lesen und Klemmen nicht blind vertauschen.",
      "Spannung an 85/86 bei Ansteuerung messen.",
      "Klemme 30 Versorgung unter Last prüfen.",
      "Durchgang 30-87 und 30-87a je nach Schaltzustand prüfen.",
      "Bei Relais mit Diode Polarität beachten.",
    ],
    deviations: [
      "Relais klickt, aber Verbraucher geht nicht: Kontakt 30/87 unter Last prüfen.",
      "Relais klickt nicht: Spulenversorgung, Masse, Ansteuerung oder Relais prüfen.",
      "87a unerwartet aktiv: Ruhestellung des Wechslerkontakts beachten.",
    ],
    warnings: [
      "Relaiskontakte nicht durch zu hohe Prüflast beschädigen.",
      "Bei Airbag, ABS, Hochvolt oder sicherheitsrelevanten Systemen keine Brückenversuche ohne Schaltplan.",
    ],
  },
  {
    id: "spark-plug-tightening-torque",
    title: "Zündkerzen-Drehmoment",
    category: "Drehmoment",
    aliases: [
      "zündkerze",
      "zündkerzen",
      "zündkerze drehmoment",
      "zündkerzen drehmoment",
      "zündkerze anzugsmoment",
      "zündkerze anziehen",
      "kerzen drehmoment",
      "spark plug torque",
      "m10 zündkerze",
      "m12 zündkerze",
      "m14 zündkerze",
      "m18 zündkerze",
    ],
    summary:
      "Allgemeine Richtwerte für neue Zündkerzen nach Gewinde und Sitzform. Fahrzeug- und Kerzenherstellerangabe hat Vorrang.",
    applicability:
      "Neue Zündkerze, sauberes Gewinde, kalter Aluminium-Zylinderkopf, korrekter Gewindedurchmesser und korrekte Sitzform.",
    values: [
      {
        label: "M10 mit Dichtring",
        value: "ca. 10-15 Nm",
        condition: "neue Zündkerze mit flachem Sitz und Dichtring",
      },
      {
        label: "M12 mit Dichtring",
        value: "ca. 15-20 Nm",
        condition: "neue Zündkerze mit flachem Sitz und Dichtring",
      },
      {
        label: "M14 mit Dichtring",
        value: "ca. 25-30 Nm",
        condition: "neue Zündkerze mit flachem Sitz und Dichtring",
      },
      {
        label: "M18 mit Dichtring",
        value: "ca. 35-40 Nm",
        condition: "neue Zündkerze mit flachem Sitz und Dichtring",
      },
      {
        label: "Konussitz",
        value: "meist deutlich niedriger als Dichtring-Sitz",
        condition: "nur nach Kerzen-/Fahrzeugherstellerangabe verwenden",
        note: "Konussitz und Dichtring-Sitz dürfen nicht vertauscht werden.",
      },
    ],
    checks: [
      "Gewindedurchmesser, Gewindelänge und Sitzform der Zündkerze prüfen.",
      "Gewinde im Zylinderkopf sauber und leichtgängig prüfen.",
      "Zündkerze zuerst von Hand eindrehen, damit kein Gewinde verkantet.",
      "Drehmomentschlüssel verwenden und nicht über Keramik oder Stecker hebeln.",
      "Bei abweichender Herstellerangabe immer den fahrzeugspezifischen Wert verwenden.",
    ],
    deviations: [
      "Zu geringes Drehmoment: Undichtigkeit, schlechte Wärmeabfuhr oder gelöste Kerze möglich.",
      "Zu hohes Drehmoment: Gewindeschaden, Kerzenbruch oder beschädigter Dichtring möglich.",
      "Schweres Einschrauben: Gewinde nicht weiter belasten, Ursache prüfen.",
      "Alte Zündkerze mit bereits gequetschtem Dichtring: nicht pauschal nach Neuteil-Winkel anziehen.",
    ],
    warnings: [
      "Nicht fetten oder schmieren, wenn Kerzen-/Fahrzeughersteller das nicht vorgibt.",
      "Zündkerzen nie in heißen Aluminiumkopf hineinzwingen.",
      "Bei Direkteinspritzern und engen Kerzenschächten Werkzeug gerade führen.",
    ],
  },
  {
    id: "glow-plug-tightening-torque",
    title: "Glühkerzen-Drehmoment",
    category: "Drehmoment",
    aliases: [
      "glühkerze",
      "glühkerzen",
      "glühkerze drehmoment",
      "glühkerzen drehmoment",
      "glühkerze anzugsmoment",
      "glühkerze anziehen",
      "glühstiftkerze",
      "m8 glühkerze",
      "m9 glühkerze",
      "m10 glühkerze",
      "m12 glühkerze",
    ],
    summary:
      "Allgemeine Einbau-Richtwerte für Glühkerzen nach Gewindegröße. Exakte Herstellerangabe und Bruchrisiko haben Vorrang.",
    applicability:
      "Diesel-Glühkerze mit bekannter Gewindegröße, sauberes Gewinde, geeigneter Drehmomentschlüssel.",
    values: [
      {
        label: "M8 Glühkerze",
        value: "ca. 8-15 Nm",
        condition: "Einbaudrehmoment, Herstellerangabe prüfen",
      },
      {
        label: "M9 Glühkerze",
        value: "ca. 8-12 Nm",
        condition: "Einbaudrehmoment, Herstellerangabe prüfen",
      },
      {
        label: "M10 Glühkerze",
        value: "ca. 10-15 Nm",
        condition: "Einbaudrehmoment, Herstellerangabe prüfen",
      },
      {
        label: "M12 Glühkerze",
        value: "ca. 15-25 Nm",
        condition: "Einbaudrehmoment, Herstellerangabe prüfen",
      },
    ],
    checks: [
      "Gewindegröße und Glühkerzentyp vor dem Einbau prüfen.",
      "Vor Ausbau Motorzustand, Zugang und Bruchrisiko bewerten.",
      "Glühkerze beim Einbau zuerst von Hand eindrehen.",
      "Gewinde im Zylinderkopf reinigen, aber keine Späne in den Brennraum bringen.",
      "Elektrischen Anschluss nach Herstellervorgabe befestigen, nicht überdrehen.",
    ],
    deviations: [
      "Glühkerze sitzt fest: nicht mit Gewalt weiterdrehen, Lösemoment und Bruchrisiko beachten.",
      "Zu hohes Drehmoment: Glühkerze kann abreißen oder Gewinde beschädigen.",
      "Undichtigkeit oder Kompressionsspuren: Sitzfläche und Gewinde prüfen.",
      "Wiederkehrender Glühkerzenfehler: Versorgung, Steuergerät und Leitungen mitprüfen.",
    ],
    warnings: [
      "Glühkerzen können beim Ausbau abbrechen; bei hohem Widerstand Spezialverfahren nutzen.",
      "Keine pauschale Gewaltanwendung, besonders bei langen, dünnen Glühkerzen.",
      "Bei abweichender Herstellerangabe immer den fahrzeugspezifischen Wert verwenden.",
    ],
  },
  {
    id: "metric-fastener-tightening-torque",
    title: "Metrische Regelschrauben-Drehmomente",
    category: "Drehmoment",
    aliases: [
      "metrische schraube drehmoment",
      "regelschraube drehmoment",
      "schraube 8.8 drehmoment",
      "schraube 10.9 drehmoment",
      "m5 8.8",
      "m6 8.8",
      "m8 8.8",
      "m10 8.8",
      "m12 8.8",
      "m5 10.9",
      "m6 10.9",
      "m8 10.9",
      "m10 10.9",
      "m12 10.9",
      "standard schraube drehmoment",
    ],
    summary:
      "Grobe Richtwerte für metrische Regelschrauben nach Festigkeitsklasse. Nicht für fahrzeugspezifische Sicherheitsverschraubungen verwenden.",
    applicability:
      "Allgemeine metrische Regelschrauben mit bekanntem Gewinde und Festigkeitsklasse, nicht Dehnschrauben, nicht Rad/Bremse/Fahrwerk/Lenkung.",
    values: [
      {
        label: "M5 Klasse 8.8",
        value: "ca. 5-6 Nm",
        condition: "allgemeine Regelschraube, Reibwert und Schmierung beachten",
      },
      {
        label: "M6 Klasse 8.8",
        value: "ca. 9-10 Nm",
        condition: "allgemeine Regelschraube, Reibwert und Schmierung beachten",
      },
      {
        label: "M8 Klasse 8.8",
        value: "ca. 22-25 Nm",
        condition: "allgemeine Regelschraube, Reibwert und Schmierung beachten",
      },
      {
        label: "M10 Klasse 8.8",
        value: "ca. 44-49 Nm",
        condition: "allgemeine Regelschraube, Reibwert und Schmierung beachten",
      },
      {
        label: "M12 Klasse 8.8",
        value: "ca. 75-85 Nm",
        condition: "allgemeine Regelschraube, Reibwert und Schmierung beachten",
      },
      {
        label: "M5 Klasse 10.9",
        value: "ca. 8-9 Nm",
        condition: "allgemeine Regelschraube, Reibwert und Schmierung beachten",
      },
      {
        label: "M6 Klasse 10.9",
        value: "ca. 13-15 Nm",
        condition: "allgemeine Regelschraube, Reibwert und Schmierung beachten",
      },
      {
        label: "M8 Klasse 10.9",
        value: "ca. 32-35 Nm",
        condition: "allgemeine Regelschraube, Reibwert und Schmierung beachten",
      },
      {
        label: "M10 Klasse 10.9",
        value: "ca. 62-69 Nm",
        condition: "allgemeine Regelschraube, Reibwert und Schmierung beachten",
      },
      {
        label: "M12 Klasse 10.9",
        value: "ca. 105-120 Nm",
        condition: "allgemeine Regelschraube, Reibwert und Schmierung beachten",
      },
    ],
    checks: [
      "Gewindegröße, Steigung und Festigkeitsklasse auf Schraubenkopf/Unterlage prüfen.",
      "Prüfen, ob es sich um eine Dehnschraube, beschichtete Schraube oder fahrzeugspezifische Sondervorgabe handelt.",
      "Reibwert beachten: trocken, geölt, beschichtet oder Schraubensicherung verändert die Klemmkraft.",
      "Bei sicherheitsrelevanten Fahrzeugverschraubungen immer Herstellerdaten nutzen.",
      "Drehwinkelvorgaben nicht durch reine Nm-Werte ersetzen.",
    ],
    deviations: [
      "Unbekannte Festigkeitsklasse: keinen Tabellenwert verwenden.",
      "Alugewinde, Kunststoff, Blechmutter oder Gewindeeinsatz: Tabellenwert nicht pauschal übernehmen.",
      "Rad, Bremse, Fahrwerk, Lenkung, Airbag, Hochvolt, Gurt, Motorinnenteile: immer fahrzeugspezifische Vorgabe.",
      "Schraube mit Drehwinkel oder Neuschraubenpflicht: nicht wiederverwenden, wenn Hersteller das verbietet.",
    ],
    warnings: [
      "Diese Tabelle ist keine Freigabe für sicherheitsrelevante Fahrzeugverschraubungen.",
      "Drehmoment allein garantiert keine korrekte Klemmkraft, weil Reibung stark wirkt.",
      "Bei Zweifel keinen Wert ausgeben, sondern Herstellerdaten prüfen.",
    ],
  },
  {
    id: "ntc-temperature-sensor",
    title: "NTC-Temperatursensor",
    category: "Sensorik",
    aliases: [
      "ntc",
      "temperatursensor",
      "kühlmitteltemperatursensor",
      "ansauglufttemperatursensor",
      "außentemperatursensor",
      "thermistor",
    ],
    summary:
      "Bei einem NTC sinkt der Widerstand mit steigender Temperatur. Exakte Kennlinie ist sensortyp- und fahrzeugabhängig.",
    applicability: "Zweipoliger NTC-Sensor für Temperaturmessung im Fahrzeug.",
    values: [
      {
        label: "Grundverhalten",
        value: "warm = weniger Ohm, kalt = mehr Ohm",
        condition: "Sensor abgesteckt oder über Live-Daten plausibilisieren",
      },
      {
        label: "Signalspannung",
        value: "typisch 0,5-4,5 V",
        condition: "je nach Pull-up, Temperatur und Steuergerät",
      },
      {
        label: "Referenz/Pull-up",
        value: "typisch 5 V System",
        condition: "am Stecker/Schaltplan fahrzeugbezogen prüfen",
      },
    ],
    checks: [
      "Live-Daten bei kaltem Motor mit Umgebungstemperatur vergleichen.",
      "Sensorwert beim Warmlaufen auf gleichmäßige Änderung prüfen.",
      "Stecker auf Feuchtigkeit, Korrosion und Kabelbruch prüfen.",
      "5-V-Versorgung/Pull-up und Massebezug fahrzeugbezogen prüfen.",
      "Widerstand nur mit passender Kennlinie sicher bewerten.",
    ],
    deviations: [
      "Anzeige -40 Grad: Unterbrechung, Stecker ab, Leitungsbruch oder Sensor offen möglich.",
      "Anzeige sehr hoch: Kurzschluss gegen Masse oder Sensor kurzgeschlossen möglich.",
      "Sprunghafter Wert: Wackelkontakt, Feuchtigkeit oder interner Sensoraussetzer möglich.",
    ],
  },
];

function normalizeSpecSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/\u00e4/g, "ae")
    .replace(/\u00f6/g, "oe")
    .replace(/\u00fc/g, "ue")
    .replace(/\u00df/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSpecToken(value: string) {
  return normalizeSpecSearchText(value).replace(/\s+/g, "");
}

function scoreTechnicalSpec(spec: TechnicalSpec, input: string) {
  const compactInput = input.replace(/\s+/g, "");
  let score = 0;

  for (const alias of spec.aliases) {
    const normalizedAlias = normalizeSpecSearchText(alias);
    const compactAlias = normalizeSpecToken(alias);

    if (!normalizedAlias || !compactAlias) {
      continue;
    }

    if (input.includes(normalizedAlias) || compactInput.includes(compactAlias)) {
      score += compactAlias.length <= 3 ? 2 : 6;
    }
  }

  return score;
}

export function listTechnicalSpecs() {
  return TECHNICAL_SPECS;
}

export function detectTechnicalSpecContext(
  input: string,
  limit = 3
): TechnicalSpecContext {
  const normalizedInput = normalizeSpecSearchText(input);

  if (!normalizedInput) {
    return {
      foundSpecs: [],
      summary: "Keine Soll-/Richtwerte erkannt.",
    };
  }

  const foundSpecs = TECHNICAL_SPECS.map((spec) => ({
    spec,
    score: scoreTechnicalSpec(spec, normalizedInput),
  }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.spec);

  return {
    foundSpecs,
    summary: foundSpecs.length
      ? `Erkannte Soll-/Richtwerte: ${foundSpecs
          .map((spec) => spec.title)
          .join(", ")}.`
      : "Keine Soll-/Richtwerte erkannt.",
  };
}

export function formatTechnicalSpecContext(
  context: TechnicalSpecContext
) {
  if (context.foundSpecs.length === 0) {
    return "Keine passenden generischen Soll-/Richtwerte erkannt.";
  }

  return context.foundSpecs
    .map((spec) => {
      const values = spec.values
        .map((value) => {
          const note = value.note ? ` Hinweis: ${value.note}` : "";
          return `- ${value.label}: ${value.value} (${value.condition}).${note}`;
        })
        .join("\n");

      return `${spec.title}
Kategorie: ${spec.category}
Geltung: ${spec.applicability}
Einordnung: ${spec.summary}

Soll-/Richtwerte:
${values}

Prüfschritte:
${spec.checks.map((check) => `- ${check}`).join("\n")}

Wenn Werte abweichen:
${spec.deviations.map((deviation) => `- ${deviation}`).join("\n")}${
        spec.warnings?.length
          ? `\n\nWarnhinweise:\n${spec.warnings
              .map((warning) => `- ${warning}`)
              .join("\n")}`
          : ""
      }`;
    })
    .join("\n\n---\n\n");
}

export function formatTechnicalSpecContextForPrompt(
  context: TechnicalSpecContext
) {
  if (context.foundSpecs.length === 0) {
    return "";
  }

  return `Soll-/Richtwerte aus interner generischer Datenbank:
${formatTechnicalSpecContext(context)}

Wichtig: Diese Werte müssen sichtbar in der Antwort genannt werden, wenn sie zum Fall passen. Es sind generische Richtwerte. Exakte Herstellerdaten, Pinbelegung, Sicherungsnummern, Drehmomente oder Spezialvorgaben nur nennen, wenn sie sicher aus der Nutzereingabe stammen; sonst fahrzeugabhängig kennzeichnen.`;
}
