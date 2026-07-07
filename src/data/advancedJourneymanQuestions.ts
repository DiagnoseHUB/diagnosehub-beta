import type { ExamQuestion, ExamPartId } from "@/data/journeymanExams";

type AdvancedQuestionSeed = {
  area: string;
  system: string;
  symptom: string;
  measured: string;
  correctConclusion: string;
  firstCheck: string;
  confirmationCheck: string;
  documentation: string;
  trap: string;
  unsafe: string;
  unrelated: string;
  finalCheck: string;
  explanation: string;
  points?: number;
};

function buildAdvancedQuestions(
  partId: ExamPartId,
  prefix: string,
  seeds: readonly AdvancedQuestionSeed[],
): ExamQuestion[] {
  return seeds.flatMap((seed, seedIndex) => {
    const idBase = `${prefix}-adv-${String(seedIndex + 1).padStart(2, "0")}`;
    const points = seed.points ?? (partId === "teil-2" ? 9 : 8);

    return [
      {
        id: `${idBase}-befund`,
        type: "single_choice",
        area: seed.area,
        question: `${seed.system}: ${seed.symptom} ${seed.measured} Welche Aussage ist fachlich am belastbarsten?`,
        answers: [
          seed.correctConclusion,
          seed.trap,
          seed.unrelated,
          "Ohne weitere Prüfung sollte der Fehler gelöscht und das Fahrzeug ausgeliefert werden.",
        ],
        correctAnswerIndexes: [0],
        explanation: seed.explanation,
        points,
      },
      {
        id: `${idBase}-prüfweg`,
        type: "multiple_choice",
        area: seed.area,
        question: `${seed.system}: Welche drei Punkte gehören zu einem fachlich sauberen Prüfweg?`,
        answers: [
          seed.firstCheck,
          seed.confirmationCheck,
          seed.documentation,
          seed.unsafe,
        ],
        correctAnswerIndexes: [0, 1, 2],
        explanation:
          "Ein belastbarer Prüfweg beginnt mit einfachen Kontrollen, bestätigt den Befund mit Messwerten und dokumentiert Bedingungen sowie Ergebnis.",
        points,
      },
      {
        id: `${idBase}-fehler`,
        type: "single_choice",
        area: seed.area,
        question: `${seed.system}: Welche Aussage wäre ein typischer Diagnosefehler?`,
        answers: [
          `Die Messbedingungen müssen zur Beanstandung passen, bevor ein Bauteil ersetzt wird.`,
          seed.trap,
          `Die Abschlussprüfung umfasst: ${seed.finalCheck}`,
          `Der Befund wird mit Kundenbeanstandung und Messwerten dokumentiert.`,
        ],
        correctAnswerIndexes: [1],
        explanation:
          "Der typische Fehler ist eine zu frühe oder unplausible Schlussfolgerung ohne vollständige Befundkette.",
        points,
      },
      {
        id: `${idBase}-info`,
        type: "single_choice",
        area: seed.area,
        question: `${seed.system}: Welche Zusatzinformation erhöht die Aussagekraft der Diagnose am meisten?`,
        answers: [
          seed.documentation,
          "Die Farbe des Schlüsselanhängers.",
          "Ob das Radio zuletzt sehr laut eingestellt war.",
          "Ob der Kunde das Fahrzeug immer an derselben Zapfsäule betankt.",
        ],
        correctAnswerIndexes: [0],
        explanation:
          "Prüfbedingungen, Messwerte und nachvollziehbare Dokumentation machen die Diagnose überprüfbar.",
        points: Math.max(6, points - 1),
      },
      {
        id: `${idBase}-abschluss`,
        type: "single_choice",
        area: seed.area,
        question: `${seed.system}: Welche Abschlussprüfung passt nach einer fachgerechten Instandsetzung?`,
        answers: [
          seed.finalCheck,
          "Nur die Warnlampe im Kombiinstrument ansehen und den Auftrag schließen.",
          "Fehlerspeicher löschen, ohne die ursprüngliche Beanstandung erneut zu prüfen.",
          "Das Fahrzeug ohne Dokumentation abstellen, wenn keine Geräusche hörbar sind.",
        ],
        correctAnswerIndexes: [0],
        explanation:
          "Die Abschlussprüfung muss zeigen, dass die Beanstandung unter passenden Bedingungen behoben ist.",
        points: Math.max(6, points - 1),
      },
    ];
  });
}

const teil1Seeds: AdvancedQuestionSeed[] = [
  {
    area: "12-V-Bordnetz",
    system: "Batterie und Ruhestrom",
    symptom:
      "Nach zwei Tagen Standzeit ist die Batterie leer, beim Messen bleiben einzelne Steuergeräte wach.",
    measured:
      "Der Ruhestrom fällt erst nach 35 Minuten von 620 mA auf 38 mA.",
    correctConclusion:
      "Die Einschlafzeit muss berücksichtigt werden; erst der stabile Ruhestrom nach dem Einschlafen ist bewertbar.",
    firstCheck:
      "Fahrzeug verriegeln, Messadapter verwenden und Einschlafzeit der Steuergeräte abwarten.",
    confirmationCheck:
      "Ruhestrom nach dem Einschlafen messen und auffällige Stromkreise über Spannungsfall an Sicherungen eingrenzen.",
    documentation:
      "Messzeitpunkt, Verriegelungszustand, Ruhestrom vor/nach Einschlafen und Batterie-Ladezustand notieren.",
    trap:
      "Der erste Messwert direkt nach dem Abschließen beweist sicher einen defekten Verbraucher.",
    unsafe:
      "Messgerät ungesichert in Reihe anschließen und während des Aufwachstroms Türen öffnen.",
    unrelated:
      "Die Reifen müssen gewuchtet werden, weil Standzeit immer Unwucht verursacht.",
    finalCheck:
      "Ruhestrom nach Reparatur erneut mit Einschlafzeit prüfen und Batteriezustand bewerten.",
    explanation:
      "Moderne Steuergeräte brauchen Einschlafzeit. Ein zu früher Messwert führt schnell zu einer Fehldiagnose.",
  },
  {
    area: "Ladesystem",
    system: "Drehstromgenerator",
    symptom:
      "Die Ladekontrollleuchte flackert bei eingeschaltetem Licht und Gebläse.",
    measured:
      "An der Batterie liegen 13,1 V an, am Generator B+ aber 14,2 V.",
    correctConclusion:
      "Der Generator kann laden, aber zwischen Generator und Batterie liegt ein zu hoher Spannungsabfall vor.",
    firstCheck:
      "Spannungsfall an Plusleitung, Masseband und Batterieklemmen unter Last messen.",
    confirmationCheck:
      "Generatorregelung, Riemenantrieb und Batteriezustand erst nach der Leitungsprüfung plausibilisieren.",
    documentation:
      "Spannung an B+, Batteriespannung, Lastzustand, Drehzahl und gemessene Spannungsfälle notieren.",
    trap:
      "Der Generator ist zwingend defekt, weil an der Batterie nur 13,1 V anliegen.",
    unsafe:
      "B+ Leitung bei laufendem Motor lösen, um die Generatorleistung zu prüfen.",
    unrelated:
      "Das Abblendlicht muss neu eingestellt werden, weil Ladespannung die Leuchtweite verändert.",
    finalCheck:
      "Ladespannung und Spannungsfall mit elektrischer Last und erhöhter Leerlaufdrehzahl erneut prüfen.",
    explanation:
      "Unterschiedliche Spannungen an Generator und Batterie weisen auf Übergangswiderstand im Ladepfad hin.",
  },
  {
    area: "Beleuchtung",
    system: "Halogenhauptscheinwerfer 12 V",
    symptom:
      "Ein Abblendlicht ist dunkel, das Leuchtmittel ist neu und die Sicherung ist in Ordnung.",
    measured:
      "Unter Last liegen an der Lampe 10,6 V an, an der Batterie 12,5 V.",
    correctConclusion:
      "Der Spannungsabfall im Plus- oder Massepfad ist zu hoch und muss unter Last eingegrenzt werden.",
    firstCheck:
      "Plus- und Masse-Spannungsfall direkt am belasteten Scheinwerfer messen.",
    confirmationCheck:
      "Stecker, Massepunkt, Sicherungskontakt und Leitung auf Erwärmung, Korrosion und festen Sitz prüfen.",
    documentation:
      "Batteriespannung, Lampenspannung, Spannungsfall Plus/Masse und Sichtbefund festhalten.",
    trap:
      "Ein neues Leuchtmittel schließt einen elektrischen Fehler vollständig aus.",
    unsafe:
      "Den Lampenstecker überbrücken, ohne Absicherung und Leitungsschutz zu beachten.",
    unrelated:
      "Die Bremsflüssigkeit muss ersetzt werden, weil das Licht dunkler ist.",
    finalCheck:
      "Nach Reparatur Spannungsfall und Lichtbild prüfen sowie Scheinwerfereinstellung kontrollieren.",
    explanation:
      "Eine deutliche Differenz zwischen Batterie und Verbraucher entsteht meist durch Übergangswiderstände.",
  },
  {
    area: "Masseverbindungen",
    system: "Massepunkt Karosserie",
    symptom:
      "Beim Bremsen glimmen Rücklicht und Blinker gegenseitig mit.",
    measured:
      "Zwischen Lampenmasse und Batterie-Minus fallen unter Last 1,4 V ab.",
    correctConclusion:
      "Die Masseverbindung ist unter Last hochohmig und verursacht Rückspeisungen über andere Leuchten.",
    firstCheck:
      "Massepunkt, Steckverbindung und Leitung unter Last auf Spannungsfall prüfen.",
    confirmationCheck:
      "Masseverbindung reinigen, befestigen und anschließend den Spannungsfall erneut messen.",
    documentation:
      "Betroffene Funktionen, Spannungsfall an Masse und Zustand des Massepunktes dokumentieren.",
    trap:
      "Mehrere gleichzeitig glimmende Leuchten beweisen immer ein defektes Lichtsteuergerät.",
    unsafe:
      "Eine zusätzliche Masseleitung ohne Absicherung und ohne fachgerechte Befestigung lose einlegen.",
    unrelated:
      "Der Luftfilter ist verschmutzt und beeinflusst deshalb die Rückleuchten.",
    finalCheck:
      "Alle Heckleuchtenfunktionen gleichzeitig prüfen und Spannungsfall an Masse erneut messen.",
    explanation:
      "Rückspeisungen sind ein klassischer Hinweis auf Masseprobleme bei gemeinsam genutzten Massepunkten.",
  },
  {
    area: "Datenbus",
    system: "CAN-Bus Grundprüfung",
    symptom:
      "Mehrere Steuergeräte sind sporadisch nicht erreichbar, das Fahrzeug startet aber meist normal.",
    measured:
      "Bei ausgeschalteter Zündung werden am Diagnoseanschluss etwa 120 Ohm statt etwa 60 Ohm gemessen.",
    correctConclusion:
      "Eine Abschlusswiderstandsseite oder deren Leitung ist vermutlich unterbrochen.",
    firstCheck:
      "Widerstandsmessung spannungsfrei durchführen und Busabschluss sowie Leitungsstrang abschnittsweise prüfen.",
    confirmationCheck:
      "CAN-H/CAN-L Signalbild und Steckverbindungen auf Unterbrechung, Korrosion und Feuchtigkeit prüfen.",
    documentation:
      "Messort, Widerstandswert, Spannungsfreiheit und erreichbare Steuergeräte dokumentieren.",
    trap:
      "120 Ohm am Bus sind bei allen Fahrzeugen normal und schließen einen Leitungsfehler aus.",
    unsafe:
      "Mit einer Prüflampe direkt zwischen CAN-H und CAN-L testen.",
    unrelated:
      "Der Motorölstand erklärt den erhöhten Buswiderstand.",
    finalCheck:
      "Nach Reparatur Buswiderstand, Kommunikation und Fehlerspeicher aller betroffenen Steuergeräte prüfen.",
    explanation:
      "Ein High-Speed-CAN mit zwei 120-Ohm-Abschlüssen zeigt parallel ungefähr 60 Ohm.",
  },
  {
    area: "Relais und Sicherungen",
    system: "Wechslerrelais",
    symptom:
      "Ein Verbraucher läuft nur, wenn das Relais überbrückt wird.",
    measured:
      "Klemme 30 hat Spannung, Klemme 87 bleibt spannungslos, an 85/86 fehlt zeitweise die Ansteuerung.",
    correctConclusion:
      "Neben dem Relaiskontakt muss die Spulenansteuerung mit Versorgung, Masse und Steuergerätelogik geprüft werden.",
    firstCheck:
      "Klemmen 30, 87, 85 und 86 nach Schaltplan unter Last prüfen.",
    confirmationCheck:
      "Relais gezielt ansteuern und Spannungsfall über Kontakt sowie Spulenstrom plausibilisieren.",
    documentation:
      "Klemmenbelegung, Ansteuerzustand, Spannungen und Schaltplanstand notieren.",
    trap:
      "Wenn Überbrücken funktioniert, ist immer nur das Relais defekt.",
    unsafe:
      "Relais dauerhaft mit ungesichertem Draht überbrücken und so an den Kunden übergeben.",
    unrelated:
      "Der Reifendruck vorne beeinflusst die Relais-Spulenansteuerung.",
    finalCheck:
      "Verbraucherfunktion in allen Betriebszuständen prüfen und Relaiskontakt unter Last beurteilen.",
    explanation:
      "Ein Relaisfehler kann am Kontakt, an der Spule, an der Versorgung oder an der Ansteuerlogik liegen.",
  },
  {
    area: "Bremsanlage",
    system: "Scheibenbremse vorne",
    symptom:
      "Das Fahrzeug zieht beim Bremsen leicht nach rechts, links ist die Bremsscheibe kälter.",
    measured:
      "Belag innen links ist deutlich stärker als außen verschlissen.",
    correctConclusion:
      "Die Führung oder Rückstellung des linken Bremssattels ist verdächtig und muss mechanisch geprüft werden.",
    firstCheck:
      "Beläge, Führungsbolzen, Manschetten, Kolbenrückstellung und Bremsschlauch links prüfen.",
    confirmationCheck:
      "Bremskraft, Temperaturbild und Freigängigkeit nach Herstellervorgabe plausibilisieren.",
    documentation:
      "Belagstärken innen/außen, Scheibenzustand, Temperaturbefund und mechanischen Befund dokumentieren.",
    trap:
      "Einseitiger Belagverschleiß wird immer allein durch falschen Reifendruck verursacht.",
    unsafe:
      "Bremsbeläge einseitig anschleifen und ohne Ursachenprüfung wieder montieren.",
    unrelated:
      "Der Innenraumfilter muss ersetzt werden, weil die Bremsscheibe kälter ist.",
    finalCheck:
      "Bremsenprüfstand, Probefahrt und Sichtprüfung auf Freigängigkeit nach der Instandsetzung durchführen.",
    explanation:
      "Ungleichmäßige Temperatur und Belagabnutzung deuten auf mechanische Probleme am Sattel oder Schlauch hin.",
  },
  {
    area: "Bremsflüssigkeit",
    system: "Hydraulische Bremse",
    symptom:
      "Das Bremspedal fühlt sich nach langer Bergabfahrt weich an.",
    measured:
      "Der Wassergehalt der Bremsflüssigkeit ist erhöht.",
    correctConclusion:
      "Ein zu niedriger Nasssiedepunkt kann Dampfblasenbildung begünstigen und muss sicherheitsrelevant bewertet werden.",
    firstCheck:
      "Bremsflüssigkeit nach Herstellervorgabe prüfen und Wechselintervall beachten.",
    confirmationCheck:
      "Bremssystem auf Dichtheit, korrekte Entlüftung und Bremswirkung prüfen.",
    documentation:
      "Messwert, Prüfmethode, Wechselintervall und Kundenhinweis zur Sicherheit dokumentieren.",
    trap:
      "Bremsflüssigkeit altert nicht, solange der Vorratsbehälter voll ist.",
    unsafe:
      "Bremsflüssigkeiten beliebiger Spezifikation mischen und ohne Entlüftung fahren.",
    unrelated:
      "Die Scheibenwaschflüssigkeit bestimmt den Nasssiedepunkt.",
    finalCheck:
      "Nach Wechsel Bremspedalgefühl, Dichtheit und Bremswirkung auf dem Prüfstand kontrollieren.",
    explanation:
      "Bremsflüssigkeit ist hygroskopisch. Wasser senkt den Siedepunkt und kann die Bremswirkung gefährden.",
  },
  {
    area: "Radlager",
    system: "Radlager mit integriertem Impulsgeber",
    symptom:
      "Nach Radlagerwechsel leuchtet ABS, vorher war kein ABS-Fehler vorhanden.",
    measured:
      "Das Raddrehzahlsignal an dem erneuerten Rad ist unplausibel.",
    correctConclusion:
      "Ein falsch eingebautes Radlager oder beschädigter Magnetring kann das Raddrehzahlsignal stören.",
    firstCheck:
      "Einbaulage des Radlagers, Sensorabstand und Magnetring mit geeignetem Prüfmittel kontrollieren.",
    confirmationCheck:
      "Raddrehzahlistwerte bei langsamer Fahrt mit den anderen Rädern vergleichen.",
    documentation:
      "Einbaurichtung, Sensorzustand, Istwerte und Fehlercode mit Umgebungsdaten festhalten.",
    trap:
      "Nach jedem Radlagerwechsel muss grundsätzlich das ABS-Steuergerät ersetzt werden.",
    unsafe:
      "ABS-Sensor mit Gewalt näher an den Magnetring biegen.",
    unrelated:
      "Der Ölfilterwechsel erklärt den Ausfall des Raddrehzahlsignals.",
    finalCheck:
      "Istwerte bei Probefahrt prüfen und Fehlerspeicher nach erfolgreicher Reparatur kontrollieren.",
    explanation:
      "Viele Radlager enthalten magnetische Geber. Ein falscher Einbau erzeugt sofort unplausible Signale.",
  },
  {
    area: "Reifen und Achse",
    system: "Achsgeometrie",
    symptom:
      "Beide Vorderreifen sind innen stark abgefahren, das Lenkrad steht leicht schief.",
    measured:
      "Der Luftdruck ist korrekt, an den Spurstangenköpfen ist Spiel spürbar.",
    correctConclusion:
      "Vor einer Achsvermessung müssen ausgeschlagene Bauteile instandgesetzt werden.",
    firstCheck:
      "Fahrwerksgelenke, Lager, Reifen, Felgen und Luftdruck vor der Vermessung prüfen.",
    confirmationCheck:
      "Nach Bauteilersatz Achsgeometrie nach Herstellervorgabe einstellen.",
    documentation:
      "Reifenbild, Profiltiefen, Luftdruck, Spielbefund und Vermessungswerte dokumentieren.",
    trap:
      "Eine Achsvermessung ist trotz ausgeschlagener Spurstangen fachlich aussagekräftig.",
    unsafe:
      "Spurstangen ohne Sicherung lösen und ohne Vermessung an den Kunden ausliefern.",
    unrelated:
      "Der Kühlmittelstand verursacht innen abgefahrene Vorderreifen.",
    finalCheck:
      "Probefahrt mit Lenkradmittelstellung und dokumentierten Vermessungswerten durchführen.",
    explanation:
      "Achsgeometrie ist nur belastbar, wenn die mechanischen Bauteile spielfrei sind.",
  },
  {
    area: "Fahrwerk",
    system: "Querlenkerlager",
    symptom:
      "Beim Bremsen knackt es vorne, das Fahrzeug versetzt leicht.",
    measured:
      "Das hintere Querlenkerlager zeigt sichtbare Risse und Bewegung unter Last.",
    correctConclusion:
      "Das beschädigte Lager kann Spuränderung unter Last verursachen und muss sicherheitsrelevant bewertet werden.",
    firstCheck:
      "Lager, Traggelenk, Spurstange und Befestigungsschrauben auf Spiel und Risse prüfen.",
    confirmationCheck:
      "Nach Ersatz Schrauben in vorgeschriebener Fahrzeuglage mit Herstellervorgabe anziehen.",
    documentation:
      "Sichtbefund, Spielprüfung, betroffene Seite und verwendete Drehmomentvorgabe dokumentieren.",
    trap:
      "Gummilager dürfen immer im ausgefederten Zustand endgültig angezogen werden.",
    unsafe:
      "Beschädigte Lager weiterverwenden, wenn das Geräusch nur selten auftritt.",
    unrelated:
      "Der Klimadruck beeinflusst die Querlenkerlager unter Bremslast.",
    finalCheck:
      "Geräuschprüfung, Fahrverhalten und Achsgeometrie nach Herstellervorgabe kontrollieren.",
    explanation:
      "Elastokinematische Lager beeinflussen Spur und Fahrstabilität besonders beim Bremsen.",
  },
  {
    area: "Kühlsystem",
    system: "Thermostat und Kühlmittelkreislauf",
    symptom:
      "Der Motor erreicht die Betriebstemperatur sehr spät, die Heizung bleibt schwach.",
    measured:
      "Der große Kühlmittelschlauch wird kurz nach dem Kaltstart bereits warm.",
    correctConclusion:
      "Das Thermostat hängt wahrscheinlich offen und gibt den großen Kreislauf zu früh frei.",
    firstCheck:
      "Kühlmittelstand, Temperaturverlauf und Schlauchtemperaturen beim Warmlauf prüfen.",
    confirmationCheck:
      "Istwerte Kühlmitteltemperatur mit Diagnosegerät und Infrarotmessung plausibilisieren.",
    documentation:
      "Außentemperatur, Warmlaufzeit, Istwerte und Schlauchtemperaturen notieren.",
    trap:
      "Ein offen hängendes Thermostat führt immer sofort zu Überhitzung.",
    unsafe:
      "Kühlsystem heiß öffnen, um schneller den Thermostat zu prüfen.",
    unrelated:
      "Das Wischerblatt verursacht die geringe Heizleistung.",
    finalCheck:
      "Nach Reparatur Warmlauf, Heizleistung und Dichtheit des Kühlsystems prüfen.",
    explanation:
      "Ein offen hängendes Thermostat verhindert schnellen Temperaturaufbau und verschlechtert die Heizleistung.",
  },
  {
    area: "Klimaanlage",
    system: "Kältemittelkreislauf",
    symptom:
      "Die Klimaanlage kühlt schlecht, der Kompressor wird zeitweise abgeschaltet.",
    measured:
      "Der Drucksensorwert springt kurzzeitig unplausibel, Sichtprüfung zeigt Scheuerstelle am Kabel.",
    correctConclusion:
      "Vor Arbeiten am Kältemittelkreislauf ist die elektrische Messkette des Drucksensors zu prüfen.",
    firstCheck:
      "Drucksensorversorgung, Masse, Signal und Leitungsscheuerstelle nach Schaltplan prüfen.",
    confirmationCheck:
      "Klimadruck-Istwert mit Anlagenzustand und Herstellerangaben plausibilisieren.",
    documentation:
      "Istwertsprünge, Leitungsbefund, Umgebungstemperatur und Ansteuerzustand dokumentieren.",
    trap:
      "Schlechte Kühlung bedeutet immer, dass der Kompressor mechanisch defekt ist.",
    unsafe:
      "Kältemittelleitungen ohne Absauggerät öffnen.",
    unrelated:
      "Die Glühkerzen bestimmen den Drucksensorwert der Klimaanlage.",
    finalCheck:
      "Kühlleistung, Druckwerte und Kompressorfreigabe nach Reparatur erneut prüfen.",
    explanation:
      "Ein unplausibler Drucksensor kann die Kompressorfreigabe verhindern, ohne dass der Kompressor defekt ist.",
  },
  {
    area: "Motorschmierung",
    system: "Öldruckwarnung",
    symptom:
      "Die Öldruckwarnung flackert im warmen Leerlauf.",
    measured:
      "Ölstand ist korrekt, das Öl ist stark verdünnt und riecht nach Kraftstoff.",
    correctConclusion:
      "Die Ölqualität kann den Öldruck beeinflussen; Warnungen dürfen nicht nur elektrisch bewertet werden.",
    firstCheck:
      "Ölstand, Ölqualität, Ölfilter, Wartungshistorie und Öldruck mechanisch prüfen.",
    confirmationCheck:
      "Öldruck mit geeignetem Manometer bei Temperatur und Drehzahl nach Herstellervorgabe messen.",
    documentation:
      "Ölzustand, Temperatur, Drehzahl, mechanischen Öldruck und Warnlampenzustand notieren.",
    trap:
      "Bei Öldruckwarnung wird grundsätzlich zuerst der Schalter blind ersetzt.",
    unsafe:
      "Mit aktiver Öldruckwarnung eine lange Probefahrt unter hoher Last durchführen.",
    unrelated:
      "Die Heckscheibenheizung verursacht Kraftstoffgeruch im Motoröl.",
    finalCheck:
      "Nach Ursache und Ölwechsel Öldruck warm prüfen und Warnlampe unter Betriebsbedingungen beobachten.",
    explanation:
      "Öldruck ist sicherheitskritisch für den Motor. Sensor, Ölqualität und mechanischer Druck müssen zusammenpassen.",
  },
  {
    area: "Zündanlage",
    system: "Zündkerzenbild",
    symptom:
      "Der Motor ruckelt im Leerlauf, eine Zündkerze ist nass und dunkel.",
    measured:
      "Kompression ist gleichmäßig, Zündfunke an dem Zylinder ist schwach.",
    correctConclusion:
      "Die Zündanlage des betroffenen Zylinders ist gezielt zu prüfen, bevor Kraftstoffsystem oder Mechanik ersetzt werden.",
    firstCheck:
      "Zündkerze, Spule, Steckverbindung und Ansteuerung zylinderbezogen prüfen.",
    confirmationCheck:
      "Bauteile kontrolliert quertauschen und Aussetzerzähler beobachten.",
    documentation:
      "Kerzenbild, betroffener Zylinder, Kompression und Ergebnis des Quertauschs dokumentieren.",
    trap:
      "Eine nasse Kerze beweist immer einen mechanischen Motorschaden.",
    unsafe:
      "Zündfunken mit bloßer Hand bei laufendem Motor prüfen.",
    unrelated:
      "Die Achsvermessung beseitigt den schwachen Zündfunken.",
    finalCheck:
      "Leerlaufqualität, Aussetzerzähler und Probefahrt nach Reparatur prüfen.",
    explanation:
      "Gleiche Kompression und schwacher Funke lenken die Diagnose zuerst auf Zündung und Ansteuerung.",
  },
  {
    area: "Dieselstart",
    system: "Glühkerzenanlage",
    symptom:
      "Der Dieselmotor startet kalt schlecht und raucht kurz weiß.",
    measured:
      "Eine Glühkerze hat deutlich höheren Widerstand als die anderen.",
    correctConclusion:
      "Die Glühkerze oder deren Leitung ist verdächtig, zusätzlich muss die Ansteuerung geprüft werden.",
    firstCheck:
      "Widerstand, Stromaufnahme und Versorgung der Glühkerzen zylinderweise prüfen.",
    confirmationCheck:
      "Glühsteuergerät, Steckkontakte und Fehlercode-Umgebungsdaten plausibilisieren.",
    documentation:
      "Außentemperatur, Startverhalten, Widerstände, Stromaufnahme und Fehlercodes dokumentieren.",
    trap:
      "Weißer Rauch beim Kaltstart bedeutet immer defekte Injektoren.",
    unsafe:
      "Glühkerzen bei heißem Motor ohne Herstellervorgabe mit Gewalt lösen.",
    unrelated:
      "Die Scheinwerfereinstellung beeinflusst die Glühkerzenwiderstände.",
    finalCheck:
      "Kaltstartverhalten nach Reparatur prüfen und Fehlerspeicher kontrollieren.",
    explanation:
      "Glühkerzenfehler zeigen sich besonders kalt. Widerstand allein reicht nicht, Strom und Ansteuerung gehören dazu.",
  },
  {
    area: "Startsystem",
    system: "Starter und Spannungsfall",
    symptom:
      "Der Starter dreht langsam, die Batterie wurde bereits geladen.",
    measured:
      "Beim Starten fallen zwischen Batterie-Minus und Motorblock 0,9 V ab.",
    correctConclusion:
      "Der Massepfad zum Motor hat unter Starterlast einen zu hohen Spannungsabfall.",
    firstCheck:
      "Spannungsfall an Plus- und Masseleitung beim Starten unter Last messen.",
    confirmationCheck:
      "Masseband, Batterieklemmen und Starteranschlüsse auf Korrosion und festen Sitz prüfen.",
    documentation:
      "Batteriespannung beim Starten, Spannungsfall Plus/Masse und Startdrehzahl dokumentieren.",
    trap:
      "Ein langsam drehender Starter beweist immer einen defekten Startermotor.",
    unsafe:
      "Starterleitung bei eingelegtem Gang überbrücken.",
    unrelated:
      "Der Innenraumfilter erhöht den Spannungsfall zwischen Motor und Batterie.",
    finalCheck:
      "Startverhalten und Spannungsfälle nach Instandsetzung erneut messen.",
    explanation:
      "Starterströme sind hoch. Kleine Übergangswiderstände erzeugen dabei große Spannungsabfälle.",
  },
  {
    area: "Batteriemanagement",
    system: "Batteriesensor",
    symptom:
      "Nach Batteriewechsel funktioniert Start-Stopp nicht, obwohl die Batterie neu ist.",
    measured:
      "Im Steuergerät ist weiterhin die alte Batteriekapazität hinterlegt.",
    correctConclusion:
      "Die neue Batterie muss je nach Fahrzeug registriert oder angelernt werden.",
    firstCheck:
      "Batterietyp, Kapazität, Ladezustand und Herstellervorgabe zum Anlernen prüfen.",
    confirmationCheck:
      "Batteriesensor-Istwerte und Energiemanagement-Status mit Diagnosegerät kontrollieren.",
    documentation:
      "Batterietyp, Kapazität, Einbaudatum, Anlernstatus und Ladezustand dokumentieren.",
    trap:
      "Start-Stopp muss nach jedem Batteriewechsel sofort ohne Anlernen funktionieren.",
    unsafe:
      "Batteriepole bei eingeschalteter Zündung mehrfach lösen, um das System zurückzusetzen.",
    unrelated:
      "Die Reifenprofiltiefe speichert die Batteriekapazität im Steuergerät.",
    finalCheck:
      "Energiemanagement-Status und Start-Stopp-Freigabebedingungen nach Ladezustandsstabilisierung prüfen.",
    explanation:
      "Viele Fahrzeuge berechnen Batteriezustand und Alter. Falsche Stammdaten verhindern Freigaben.",
  },
  {
    area: "Abgasanlage",
    system: "Undichtigkeit vor Lambdasonde",
    symptom:
      "Der Ottomotor hat erhöhten Lambdawert bei der Abgasprüfung.",
    measured:
      "Vor der Regelsonde ist ein kleines Leck am Flexrohr hörbar.",
    correctConclusion:
      "Falschluft im Abgas vor der Sonde kann Messung und Regelung verfälschen.",
    firstCheck:
      "Abgasanlage vor der Lambdasonde auf Undichtigkeit, Risse und lockere Flansche prüfen.",
    confirmationCheck:
      "Abgaswerte nach Abdichtung bei betriebswarmem Motor erneut messen.",
    documentation:
      "Leckstelle, Abgaswerte vor/nach Reparatur und Motortemperatur dokumentieren.",
    trap:
      "Ein hoher Lambdawert beweist immer eine defekte Lambdasonde.",
    unsafe:
      "Heiße Abgasanlage ohne Schutz anfassen, um ein Leck zu suchen.",
    unrelated:
      "Der Heckwischer verändert den Lambdawert der Abgasprüfung.",
    finalCheck:
      "Dichtheit und Abgaswerte im Prüfmodus erneut kontrollieren.",
    explanation:
      "Undichtigkeiten vor der Sonde ziehen Sauerstoff in den Abgasstrom und verfälschen den Lambdawert.",
  },
  {
    area: "Abgasprüfung",
    system: "Ottomotor mit Katalysator",
    symptom:
      "CO ist erhöht, Lambda liegt nahe 1, der Motor ist nicht vollständig warm.",
    measured:
      "Kühlmitteltemperatur beträgt nur 62 Grad C.",
    correctConclusion:
      "Die Abgasbewertung ist erst bei korrekter Betriebstemperatur belastbar.",
    firstCheck:
      "Motortemperatur, Warmlauf, Regelbereitschaft und Abgasanlage vor der Bewertung prüfen.",
    confirmationCheck:
      "Abgaswerte bei betriebswarmem Motor und aktiver Lambdaregelung wiederholen.",
    documentation:
      "Temperatur, Drehzahl, CO, CO2, HC, O2 und Lambdawert mit Prüfbedingungen notieren.",
    trap:
      "Ein erhöhter CO-Wert bei kaltem Motor beweist sicher einen defekten Katalysator.",
    unsafe:
      "Motor in geschlossener Halle ohne Abgasabsaugung warmlaufen lassen.",
    unrelated:
      "Der Scheibenwischerzustand bestimmt den CO-Wert.",
    finalCheck:
      "Abgasprüfung nach Warmlauf unter vorgeschriebenen Bedingungen wiederholen.",
    explanation:
      "Katalysator und Regelung arbeiten temperaturabhängig. Kalte Messungen sind nur eingeschränkt aussagekräftig.",
  },
  {
    area: "Kraftstoffsystem",
    system: "Benzin-Niederdruck",
    symptom:
      "Der Motor startet schlecht und stirbt bei Lastanforderung ab.",
    measured:
      "Der Kraftstoffdruck fällt beim Beschleunigen deutlich unter Vorgabe.",
    correctConclusion:
      "Kraftstoffversorgung, Filter, Pumpe, Spannungsversorgung und Druckregelung müssen unter Last geprüft werden.",
    firstCheck:
      "Kraftstoffdruck und Fördermenge unter Last nach Herstellervorgabe messen.",
    confirmationCheck:
      "Spannungsversorgung und Masse der Pumpe sowie Filterzustand prüfen.",
    documentation:
      "Druckverlauf, Fördermenge, Lastzustand, Pumpenspannung und Tankfüllstand dokumentieren.",
    trap:
      "Kraftstoffdruck im Leerlauf reicht aus, um die Versorgung unter Last zu beurteilen.",
    unsafe:
      "Kraftstoffleitung ohne Druckabbau und Brandschutz öffnen.",
    unrelated:
      "Eine Achsvermessung stabilisiert den Kraftstoffdruck.",
    finalCheck:
      "Druckverlauf und Fahrverhalten unter Last nach Reparatur prüfen.",
    explanation:
      "Viele Kraftstofffehler zeigen sich erst bei Förderbedarf. Leerlaufwerte können täuschen.",
  },
  {
    area: "Einspritzung",
    system: "Einspritzventil Ottomotor",
    symptom:
      "Ein Zylinder läuft mager, Zündung und Kompression sind unauffällig.",
    measured:
      "Am Einspritzventil liegt Versorgung an, das Ansteuersignal fehlt zeitweise.",
    correctConclusion:
      "Die elektrische Ansteuerung, Leitung und Steuergerätetreiberausgabe müssen geprüft werden.",
    firstCheck:
      "Versorgung, Massebezug und Ansteuersignal mit geeignetem Messgerät prüfen.",
    confirmationCheck:
      "Leitung zwischen Steuergerät und Einspritzventil auf Unterbrechung, Kurzschluss und Wackelkontakt prüfen.",
    documentation:
      "Zylinderzuordnung, Signalbild, Versorgung und Leitungsprüfung dokumentieren.",
    trap:
      "Ein mager laufender Zylinder bedeutet immer ein verstopftes Einspritzventil.",
    unsafe:
      "Einspritzventil im ausgebauten Zustand ohne geeigneten Brandschutz ansteuern.",
    unrelated:
      "Der Reifendruck hinten verändert die Einspritzansteuerung.",
    finalCheck:
      "Laufruhe, Kraftstoffkorrektur und Aussetzerzähler nach Reparatur prüfen.",
    explanation:
      "Wenn Versorgung vorhanden ist, aber Ansteuerung fehlt, liegt der Fokus auf Signalweg und Treiber.",
  },
  {
    area: "Sensorik",
    system: "NTC-Kühlmitteltemperatursensor",
    symptom:
      "Der Kaltstart ist schlecht, der Lüfter läuft sofort nach Zündung ein.",
    measured:
      "Der Istwert zeigt bei kaltem Motor 135 Grad C.",
    correctConclusion:
      "Sensorwert, Steckverbindung, Leitungswiderstand und Referenzspannung sind unplausibel und müssen geprüft werden.",
    firstCheck:
      "Istwert mit Umgebungstemperatur vergleichen und Sensorstecker/Leitung sichtprüfen.",
    confirmationCheck:
      "Widerstand des NTC und Spannung am Steuergerät nach Kennlinie plausibilisieren.",
    documentation:
      "Umgebungstemperatur, Istwert, Widerstand, Spannung und Steckerkontakt dokumentieren.",
    trap:
      "Ein hoher Temperatur-Istwert bei kaltem Motor beweist immer einen überhitzten Motor.",
    unsafe:
      "Kühlsystem bei heiß angezeigtem Wert ohne Prüfung öffnen.",
    unrelated:
      "Der Blinkerhebel verändert die NTC-Kennlinie.",
    finalCheck:
      "Kaltstart, Temperaturverlauf und Lüfterfreigabe nach Reparatur prüfen.",
    explanation:
      "Ein unrealistischer Istwert muss mit realer Temperatur, Sensor und Leitung abgeglichen werden.",
  },
  {
    area: "Drosselklappe",
    system: "Elektronische Drosselklappe",
    symptom:
      "Nach Reinigung der Drosselklappe ist der Leerlauf zu hoch.",
    measured:
      "Der Lernwert ist außerhalb des Sollbereichs, mechanisch klemmt nichts.",
    correctConclusion:
      "Je nach Fahrzeug muss die Drosselklappe adaptiert und auf Falschluft geprüft werden.",
    firstCheck:
      "Mechanische Freigängigkeit, Ansaugleckage und Adaptionsvorgabe prüfen.",
    confirmationCheck:
      "Drosselklappenwinkel, Leerlaufregelung und Lernwerte mit Diagnosegerät kontrollieren.",
    documentation:
      "Reinigungsarbeit, Lernwerte vor/nach Adaption und Leerlaufdrehzahl dokumentieren.",
    trap:
      "Ein hoher Leerlauf nach Reinigung beweist immer ein defektes Motorsteuergerät.",
    unsafe:
      "Bei eingeschalteter Zündung mit Werkzeug in die Drosselklappe greifen.",
    unrelated:
      "Die Anhängersteckdose bestimmt den Drosselklappen-Lernwert.",
    finalCheck:
      "Leerlauf warm/kalt und Lastwechsel nach Adaption prüfen.",
    explanation:
      "Reinigung verändert Luftdurchsatz und Anschläge. Viele Systeme benötigen danach neue Lernwerte.",
  },
  {
    area: "Ansaugsystem",
    system: "Falschluft",
    symptom:
      "Der Ottomotor sägt im Leerlauf und hat positive Kraftstoffkorrektur.",
    measured:
      "Beim Besprühen einer Ansaugdichtung ändert sich die Drehzahl deutlich.",
    correctConclusion:
      "Eine Undichtigkeit im Ansaugbereich ist wahrscheinlich und muss fachgerecht bestätigt werden.",
    firstCheck:
      "Ansaugsystem mit Rauchtest oder geeigneter Methode auf Dichtheit prüfen.",
    confirmationCheck:
      "Kraftstoffkorrekturen vor und nach Abdichtung im warmen Leerlauf vergleichen.",
    documentation:
      "Leckstelle, Korrekturwerte, Drehzahlverhalten und Motortemperatur dokumentieren.",
    trap:
      "Positive Kraftstoffkorrektur bedeutet immer einen zu hohen Kraftstoffdruck.",
    unsafe:
      "Brennbare Sprays unkontrolliert auf heiße Bauteile sprühen.",
    unrelated:
      "Der Sturz der Vorderachse verursacht Falschluft.",
    finalCheck:
      "Leerlauf, Korrekturwerte und Fehlerspeicher nach Reparatur prüfen.",
    explanation:
      "Falschluft führt zu magerem Gemisch. Positive Korrekturwerte und Drehzahlreaktion passen dazu.",
  },
  {
    area: "Sensorversorgung",
    system: "5-V-Referenz",
    symptom:
      "Mehrere Sensorwerte fallen gleichzeitig aus.",
    measured:
      "Die 5-V-Referenz liegt nur bei 1,2 V, nach Abstecken eines Sensors steigt sie wieder auf 5 V.",
    correctConclusion:
      "Ein Sensor oder dessen Leitung zieht die Referenzspannung herunter.",
    firstCheck:
      "Sensoren am gemeinsamen 5-V-Kreis einzeln trennen und Leitung auf Kurzschluss prüfen.",
    confirmationCheck:
      "Schaltplan nutzen und Referenzspannung am Steuergerät sowie an Sensoren vergleichen.",
    documentation:
      "Betroffene Sensoren, Referenzspannung, abgesteckter Sensor und Fehlercodes dokumentieren.",
    trap:
      "Wenn mehrere Sensoren ausfallen, sind alle Sensoren gleichzeitig defekt.",
    unsafe:
      "12 V auf die 5-V-Referenz geben, um die Leitung zu testen.",
    unrelated:
      "Der Ölfilterzustand senkt die 5-V-Referenzspannung.",
    finalCheck:
      "Alle Sensor-Istwerte und Referenzspannung nach Reparatur mit angeschlossenen Sensoren prüfen.",
    explanation:
      "Kurzschluss auf einem gemeinsamen Referenzkreis kann mehrere Sensorwerte gleichzeitig verfälschen.",
  },
  {
    area: "Lichtsteuerung",
    system: "PWM-Leuchtmittelansteuerung",
    symptom:
      "Ein Tagfahrlicht flackert, die Versorgung wirkt mit Multimeter wechselhaft.",
    measured:
      "Das Oszilloskop zeigt ein PWM-Signal mit Aussetzern.",
    correctConclusion:
      "Bei getakteter Ansteuerung ist das Signalbild unter Last aussagekräftiger als ein gemittelter Multimeterwert.",
    firstCheck:
      "PWM-Signal, Masse und Steckverbindung unter Last mit geeignetem Messgerät prüfen.",
    confirmationCheck:
      "Signal am Steuergerät und am Leuchtmittel vergleichen, um Leitung oder Ausgang einzugrenzen.",
    documentation:
      "Tastverhältnis, Spannung, Lastzustand und Steckbefund dokumentieren.",
    trap:
      "Ein schwankender Multimeterwert beweist bei PWM immer einen defekten Generator.",
    unsafe:
      "Steuergeräteausgänge mit Prüflampe überlasten.",
    unrelated:
      "Die Kühlmitteltemperatur bestimmt das PWM-Tastverhältnis des Tagfahrlichts grundsätzlich.",
    finalCheck:
      "Flackerfreiheit, Signalbild und Fehlerspeicher nach Reparatur prüfen.",
    explanation:
      "PWM wird vom Multimeter oft nur gemittelt dargestellt. Das Oszilloskop zeigt Aussetzer besser.",
  },
  {
    area: "Komfortelektrik",
    system: "Scheibenwischer Intervall",
    symptom:
      "Der Intervallwischer arbeitet sporadisch nicht, Dauerwischen funktioniert.",
    measured:
      "Der Regensensor-Istwert bleibt plausibel, das Relais wird im Intervall nicht angesteuert.",
    correctConclusion:
      "Schalterlogik, Steuergerätfreigabe und Ansteuerpfad müssen getrennt vom Wischermotor geprüft werden.",
    firstCheck:
      "Schalterstellung, Regensensor, Wischerrelais und Ansteuerung nach Schaltplan prüfen.",
    confirmationCheck:
      "Istwerte im Komfortsteuergerät mit tatsächlicher Bedienung vergleichen.",
    documentation:
      "Betriebsart, Istwerte, Relaisansteuerung und Fehlercodeumgebung dokumentieren.",
    trap:
      "Wenn Dauerwischen funktioniert, kann kein elektrischer Fehler vorliegen.",
    unsafe:
      "Wischergestänge bei aktiver Zündung ohne Sicherung anfassen.",
    unrelated:
      "Ein verstopfter Kraftstofffilter verhindert den Intervallwischer.",
    finalCheck:
      "Alle Wischerstufen inklusive Intervall und Waschfunktion nach Reparatur prüfen.",
    explanation:
      "Intervallbetrieb nutzt andere Eingänge und Freigaben als Dauerwischen, obwohl derselbe Motor arbeitet.",
  },
  {
    area: "Anhängerbetrieb",
    system: "13-polige Anhängersteckdose",
    symptom:
      "Am Anhänger fällt die Nebelschlussleuchte aus, am Zugfahrzeug funktioniert sie.",
    measured:
      "Am entsprechenden Pin der Steckdose liegt unter Last keine Spannung an.",
    correctConclusion:
      "Steckdose, Anhängermodul, Codierung und Leitung müssen unter Last geprüft werden.",
    firstCheck:
      "Pinbelegung, Masse, Sicherung und Ausgang des Anhängermoduls mit Last prüfen.",
    confirmationCheck:
      "Codierung/Freigabe des Anhängermoduls und Korrosion in der Steckdose prüfen.",
    documentation:
      "Pin, Last, Spannung, Massezustand und Modulfreigabe dokumentieren.",
    trap:
      "Wenn die Leuchte am Fahrzeug funktioniert, muss die Anhängerlampe immer defekt sein.",
    unsafe:
      "Steckdosenpins mit ungesichertem Draht direkt an Batterie-Plus legen.",
    unrelated:
      "Die Motorölviskosität bestimmt den Steckdosenpin der Nebelschlussleuchte.",
    finalCheck:
      "Anhänger-Lichtfunktionen mit Prüfkoffer oder Anhänger unter Last vollständig prüfen.",
    explanation:
      "Anhängerfunktionen laufen oft über eigene Module und Freigaben, nicht direkt über die Fahrzeugleuchte.",
  },
  {
    area: "Arbeitssicherheit",
    system: "Hebebühne und Bremsenreiniger",
    symptom:
      "Für eine Bremsenprüfung soll das Fahrzeug angehoben und gereinigt werden.",
    measured:
      "Die Aufnahmepunkte sind teilweise verdeckt, in der Nähe steht ein Heizstrahler.",
    correctConclusion:
      "Fahrzeugaufnahme und Gefahrstoffe müssen vor Arbeitsbeginn sicher organisiert werden.",
    firstCheck:
      "Tragpunkte freilegen, Bühne verriegeln, Fahrzeug sichern und Sicherheitsdatenblatt beachten.",
    confirmationCheck:
      "Brennbare Reiniger von Zündquellen fernhalten und für Belüftung sorgen.",
    documentation:
      "Sicherheitsrelevante Mängel, Bremsbefund und verwendete Arbeitsmittel dokumentieren.",
    trap:
      "Wenn die Arbeit nur kurz dauert, dürfen Tragpunkte und Brandgefahr ignoriert werden.",
    unsafe:
      "Bremsenreiniger direkt neben Zündquellen versprühen und unter ungesichertem Fahrzeug arbeiten.",
    unrelated:
      "Der Radiosender beeinflusst die Tragfähigkeit der Hebebühne.",
    finalCheck:
      "Nach der Arbeit Bremsfunktion, Dichtheit und sichere Montage kontrollieren.",
    explanation:
      "Sichere Fahrzeugaufnahme und Gefahrstoffumgang sind Grundlagen jeder fachgerechten Werkstattarbeit.",
  },
  {
    area: "Lenkung",
    system: "Elektrische Servolenkung",
    symptom:
      "Die Servounterstützung fällt beim Rangieren kurz aus.",
    measured:
      "Während des Rangierens fällt die Bordspannung auf 10,9 V.",
    correctConclusion:
      "Die Stromversorgung der Servolenkung und der Ladezustand müssen unter hoher Last geprüft werden.",
    firstCheck:
      "Batterie, Generator, Massepunkte und Versorgung der Lenkung unter Rangierlast messen.",
    confirmationCheck:
      "Fehlercodes und Istwerte der Lenkwinkel- und Drehmomentsensorik plausibilisieren.",
    documentation:
      "Spannungsverlauf, Lastzustand, Fehlercodes und Kundenbeanstandung dokumentieren.",
    trap:
      "Ein Aussetzer der Servolenkung bedeutet immer, dass das Lenkgetriebe mechanisch defekt ist.",
    unsafe:
      "Probefahrt im öffentlichen Verkehr durchführen, obwohl die Lenkunterstützung unkontrolliert ausfällt.",
    unrelated:
      "Die Klimaanlagenfüllmenge bestimmt die elektrische Lenkkraftunterstützung.",
    finalCheck:
      "Rangierprüfung mit stabiler Bordspannung und Fehlerspeicherkontrolle durchführen.",
    explanation:
      "Elektrische Lenkungen brauchen hohe Ströme. Unterspannung kann zu Aussetzern führen.",
  },
  {
    area: "Kühlmittelqualität",
    system: "Kühlmittel und Korrosionsschutz",
    symptom:
      "Im Ausgleichsbehälter sind braune Ablagerungen sichtbar.",
    measured:
      "Frostschutz und pH-Wert sind außerhalb der Herstellervorgabe.",
    correctConclusion:
      "Kühlmittelqualität, Mischungsverhältnis und mögliche Fremdbefüllung müssen geprüft werden.",
    firstCheck:
      "Kühlmitteltyp, Konzentration, pH-Wert und Herstellerfreigabe prüfen.",
    confirmationCheck:
      "Kühlsystem auf Korrosion, Dichtmittelreste und Öl-/Abgaseintrag prüfen.",
    documentation:
      "Kühlmitteltyp, Messwerte, Sichtbefund und Kundenhinweis dokumentieren.",
    trap:
      "Alle Kühlmittel dürfen gemischt werden, wenn die Farbe ähnlich aussieht.",
    unsafe:
      "Heißes Kühlsystem öffnen und Kühlmittel ohne Schutz ablassen.",
    unrelated:
      "Die Spurwerte erklären den pH-Wert des Kühlmittels.",
    finalCheck:
      "Nach Spülung und Befüllung Dichtheit, Frostschutz und Warmlauf prüfen.",
    explanation:
      "Kühlmittel schützt vor Frost, Korrosion und Überhitzung. Farbe allein ist keine Freigabe.",
  },
  {
    area: "Mechanik",
    system: "Keilrippenriemen",
    symptom:
      "Nach Kaltstart quietscht der Riementrieb, bei elektrischer Last stärker.",
    measured:
      "Der Riemenspanner schwingt stark, die Generatorfreilaufrolle blockiert.",
    correctConclusion:
      "Eine blockierte Freilaufrolle kann Schwingungen im Riementrieb verursachen.",
    firstCheck:
      "Riemen, Spanner, Umlenkrollen und Generatorfreilauf nach Herstellervorgabe prüfen.",
    confirmationCheck:
      "Schwingungsverhalten bei Lastwechsel und Zustand der Riemenscheiben plausibilisieren.",
    documentation:
      "Sichtbefund, Laufgeräusch, Freilaufprüfung und Lastzustand dokumentieren.",
    trap:
      "Riemengeräusche werden immer durch zu wenig Motoröl verursacht.",
    unsafe:
      "Bei laufendem Motor mit Werkzeug am Riementrieb prüfen.",
    unrelated:
      "Der Bremslichtschalter blockiert die Generatorfreilaufrolle.",
    finalCheck:
      "Nach Reparatur Riemenlauf, Geräusch und Ladespannung bei Last prüfen.",
    explanation:
      "Die Freilaufrolle entkoppelt Drehschwingungen. Wenn sie blockiert, wird der Riementrieb unruhig.",
  },
  {
    area: "Wartungsplanung",
    system: "Service nach Herstellervorgabe",
    symptom:
      "Das Fahrzeug hat Longlife-Service, wird aber überwiegend Kurzstrecke gefahren.",
    measured:
      "Ölqualität ist schlecht, der Ölwechsel wurde laut Anzeige noch nicht angefordert.",
    correctConclusion:
      "Nutzungsprofil und Herstellerfreigaben müssen bei der Wartung zusätzlich zur Anzeige bewertet werden.",
    firstCheck:
      "Servicehistorie, Ölstandard, Nutzungsprofil und Wartungsintervall nach Herstellervorgabe prüfen.",
    confirmationCheck:
      "Kundenhinweis zu Kurzstrecke, Ölverdünnung und angepasster Wartungsstrategie geben.",
    documentation:
      "Laufleistung, Datum, Ölqualität, Freigabe und Kundenprofil dokumentieren.",
    trap:
      "Die Serviceanzeige ersetzt immer jede fachliche Bewertung des Nutzungsprofils.",
    unsafe:
      "Öl beliebiger Spezifikation einfüllen, wenn die Viskosität ähnlich klingt.",
    unrelated:
      "Die Einstellung der Scheinwerfer bestimmt das Ölwechselintervall.",
    finalCheck:
      "Nach Service Ölstand, Dichtheit, Serviceeintrag und Kundenhinweis prüfen.",
    explanation:
      "Kurzstreckenbetrieb kann Ölalterung und Verdünnung beschleunigen, auch wenn die Anzeige noch nicht meldet.",
  },
  {
    area: "Kommunikation",
    system: "Kundenauftrag und Diagnosefreigabe",
    symptom:
      "Der Kunde meldet ein sporadisches Geräusch, die Werkstatt kann es zunächst nicht reproduzieren.",
    measured:
      "Keine Fehlercodes, Sichtprüfung unauffällig, Geräusch tritt laut Kunde nur bei Nässe auf.",
    correctConclusion:
      "Prüfbedingungen und Kundenangaben müssen präzisiert werden, bevor Teile auf Verdacht ersetzt werden.",
    firstCheck:
      "Kundeninterview zu Temperatur, Nässe, Geschwindigkeit, Last und Fahrbahn führen.",
    confirmationCheck:
      "Probefahrt unter passenden Bedingungen planen und Geräuschquelle systematisch eingrenzen.",
    documentation:
      "Kundenangabe, Reproduktionsversuch, Bedingungen und vereinbarte weitere Diagnose dokumentieren.",
    trap:
      "Wenn der Fehler nicht sofort auftritt, ist die Beanstandung sicher unbegründet.",
    unsafe:
      "Ohne Freigabe umfangreich Teile ersetzen und dem Kunden nachträglich berechnen.",
    unrelated:
      "Die Farbe des Fahrzeugs entscheidet, ob ein Geräusch bei Nässe auftreten kann.",
    finalCheck:
      "Nach Eingrenzung und Reparatur Probefahrt unter den beschriebenen Bedingungen durchführen.",
    explanation:
      "Sporadische Fehler brauchen genaue Bedingungen, sonst werden Diagnosezeit und Teile unnötig verbraucht.",
  },
  {
    area: "Dokumentation",
    system: "Messprotokoll",
    symptom:
      "Ein Kollege soll eine begonnene Diagnose übernehmen.",
    measured:
      "Es liegen nur die Notizen 'geht nicht' und 'Sensor vielleicht defekt' vor.",
    correctConclusion:
      "Die Diagnose ist nicht nachvollziehbar; Messwerte, Bedingungen und Prüfschritte fehlen.",
    firstCheck:
      "Beanstandung, Messwerte, Prüfmittel, Bedingungen und Ergebnis je Prüfschritt erfassen.",
    confirmationCheck:
      "Offene Hypothesen klar von bestätigten Befunden trennen.",
    documentation:
      "Datum, Fahrzeugdaten, Fehlercodes, Istwerte, Prüfschritte und Schlussfolgerung notieren.",
    trap:
      "Kurze Vermutungen reichen aus, wenn der Mechaniker Erfahrung hat.",
    unsafe:
      "Sicherheitsrelevante Befunde mündlich weitergeben, ohne sie zu dokumentieren.",
    unrelated:
      "Die Musik im Radio ersetzt eine schriftliche Diagnoseübergabe.",
    finalCheck:
      "Abschlussbefund und Kundeninformation nach Reparatur vollständig dokumentieren.",
    explanation:
      "Saubere Dokumentation verhindert doppelte Arbeit, Missverständnisse und unbegründeten Teiletausch.",
  },
  {
    area: "Werkzeugkunde",
    system: "Drehmomentschlüssel",
    symptom:
      "Eine sicherheitsrelevante Schraubverbindung soll nach Reparatur angezogen werden.",
    measured:
      "Die Herstellervorgabe nennt Drehmoment plus Drehwinkel und neue Schrauben.",
    correctConclusion:
      "Drehmoment, Drehwinkel, Schraubenzustand und Anziehbedingungen müssen exakt nach Vorgabe umgesetzt werden.",
    firstCheck:
      "Vorgabe für neue Schrauben, trockene/geölte Gewinde und Anziehreihenfolge prüfen.",
    confirmationCheck:
      "Geeigneten kalibrierten Drehmomentschlüssel und Drehwinkelwerkzeug verwenden.",
    documentation:
      "Drehmoment, Drehwinkel, Schraubenersatz und Quelle der Herstellervorgabe dokumentieren.",
    trap:
      "Drehmomentwerte können bei sicherheitsrelevanten Schrauben frei geschätzt werden.",
    unsafe:
      "Dehnschrauben wiederverwenden, obwohl neue Schrauben vorgeschrieben sind.",
    unrelated:
      "Der Luftdruck im Ersatzrad ersetzt den Drehwinkel.",
    finalCheck:
      "Montage, Markierung und ggf. Probefahrt nach Herstellervorgabe kontrollieren.",
    explanation:
      "Schraubverbindungen sind sicherheitsrelevant. Falsche Anziehbedingungen verändern die Klemmkraft.",
  },
  {
    area: "Prüfmittel",
    system: "Multimeter und Messbereich",
    symptom:
      "Bei einer Spannungsmessung brennt die Gerätesicherung durch.",
    measured:
      "Das Messgerät war im Strommessbereich parallel zur Batterie angeschlossen.",
    correctConclusion:
      "Der falsche Messbereich und Anschluss haben einen Kurzschluss über das Messgerät erzeugt.",
    firstCheck:
      "Vor jeder Messung Messgröße, Messbereich, Buchsenbelegung und Absicherung kontrollieren.",
    confirmationCheck:
      "Strommessung nur in Reihe oder mit geeigneter Stromzange durchführen.",
    documentation:
      "Messaufbau, Messbereich, Messwert und verwendetes Prüfmittel dokumentieren.",
    trap:
      "Strom kann wie Spannung immer parallel gemessen werden.",
    unsafe:
      "Nach defekter Sicherung eine größere Sicherung in das Messgerät einsetzen.",
    unrelated:
      "Das Motorlager verursacht die ausgelöste Gerätesicherung.",
    finalCheck:
      "Messgerät prüfen, richtigen Messaufbau wiederholen und Ergebnis plausibilisieren.",
    explanation:
      "Strommessung in falscher Buchse parallel zur Spannungsquelle kann Messgerät und Leitung beschädigen.",
  },
  {
    area: "Diagnosegrundlagen",
    system: "Plausibilitätsprüfung",
    symptom:
      "Ein Fehlercode nennt den Luftmassenmesser, das Fahrzeug hat aber auch einen gerissenen Ansaugschlauch.",
    measured:
      "Luftmasse und Lambdaregelung sind im Leerlauf unplausibel.",
    correctConclusion:
      "Der Fehlercode nennt einen betroffenen Messwert, nicht automatisch das defekte Bauteil.",
    firstCheck:
      "Sichtprüfung, Dichtheitsprüfung und Istwerte vor Bauteiltausch durchführen.",
    confirmationCheck:
      "Messwerte nach provisorischer Abdichtung oder Reparatur erneut vergleichen.",
    documentation:
      "Fehlercode, Umgebungsdaten, Leckstelle und Istwerte vor/nach Reparatur dokumentieren.",
    trap:
      "Der im Fehlercode genannte Sensor muss immer zuerst ersetzt werden.",
    unsafe:
      "Mit abgestecktem Sensor dauerhaft weiterfahren, um den Fehler zu umgehen.",
    unrelated:
      "Der Reifendrucksensor erzeugt die Luftmassenabweichung im Leerlauf.",
    finalCheck:
      "Fehlerspeicher, Luftmasse und Gemischkorrektur nach Reparatur prüfen.",
    explanation:
      "Fehlercodes sind Startpunkte. Die Ursache kann in Mechanik, Luftführung oder Elektrik liegen.",
  },
];

const teil2Seeds: AdvancedQuestionSeed[] = [
  {
    area: "Aufladung",
    system: "Ladedruckregelung P0299/P0101",
    symptom:
      "Der Diesel geht unter Last in den Notlauf, Ladedruck-Soll steigt deutlich.",
    measured:
      "Ist-Ladedruck und Luftmasse bleiben zu niedrig, Rauchtest zeigt zunächst kein großes Leck.",
    correctConclusion:
      "Neben Dichtheit müssen Ansteuerung, VTG/Wastegate, Unterdruckversorgung und Sensorplausibilität geprüft werden.",
    firstCheck:
      "Freeze-Frame sichern und Ladedruck-Soll/Ist, Luftmasse, AGR und Ansteuerung unter Last vergleichen.",
    confirmationCheck:
      "Unterdruck/Drucksteller, VTG-Beweglichkeit und Ladeluftstrecke mit geeigneter Prüfmethode testen.",
    documentation:
      "Fehlercodes, Lastzustand, Soll-/Istwerte, Ansteuerung und Dichtheitsbefund dokumentieren.",
    trap:
      "P0299 bedeutet immer, dass der Turbolader ohne weitere Prüfung ersetzt werden muss.",
    unsafe:
      "Notlauf auf der Straße mehrfach provozieren, ohne sichere Probefahrtstrecke und Diagnoseplan.",
    unrelated:
      "Der Reifenluftdruck hinten erzeugt den Fehlercode P0101.",
    finalCheck:
      "Probefahrt mit Lastprofil, Soll-/Istwerten und Fehlerspeicherkontrolle durchführen.",
    explanation:
      "Ladedruck und Luftmasse hängen von Luftstrecke, Stellglied, Mechanik, Sensorik und Regelung zusammen.",
    points: 10,
  },
  {
    area: "Turbolader",
    system: "VTG-Verstellung",
    symptom:
      "Der Ladedruck überschießt kurz und fällt danach in den Notlauf.",
    measured:
      "Die VTG-Stange bewegt sich ruckartig, Unterdruck ist stabil.",
    correctConclusion:
      "Eine mechanisch schwergängige VTG-Verstellung ist wahrscheinlich und muss ohne Teiletausch bestätigt werden.",
    firstCheck:
      "VTG-Beweglichkeit, Anschläge und Unterdruckdose nach Herstellervorgabe prüfen.",
    confirmationCheck:
      "Stellgliedtest, Ladedruckverlauf und Ansteuerung bei definierter Last vergleichen.",
    documentation:
      "Bewegungsverlauf, Unterdruckwert, Ansteuerung und Ladedruckverlauf dokumentieren.",
    trap:
      "Stabiler Unterdruck beweist, dass die Turboladermechanik fehlerfrei ist.",
    unsafe:
      "VTG-Gestänge unkontrolliert verstellen und die Grundeinstellung verändern.",
    unrelated:
      "Eine defekte Innenraumbeleuchtung verursacht Ladedrucküberschwingen.",
    finalCheck:
      "Ladedruckregelung nach Reparatur über mehrere Lastwechsel auf Überschwingen prüfen.",
    explanation:
      "Stabile Ansteuerung schließt mechanisches Klemmen nicht aus. Der Bewegungsverlauf ist entscheidend.",
    points: 10,
  },
  {
    area: "AGR-System",
    system: "AGR-Plausibilität",
    symptom:
      "Der Motor ruckelt im Teillastbereich und hat erhöhte NOx-Werte.",
    measured:
      "AGR-Soll öffnet, Luftmasse ändert sich jedoch kaum.",
    correctConclusion:
      "AGR-Durchsatz, Ventilbewegung, Kanäle und Luftmassenreaktion müssen plausibilisiert werden.",
    firstCheck:
      "AGR-Soll/Ist, Luftmasse und Motordrehzahl bei Stellgliedtest vergleichen.",
    confirmationCheck:
      "AGR-Ventil, Kühler und Kanäle auf Verkokung, Undichtigkeit oder Klemmen prüfen.",
    documentation:
      "AGR-Ansteuerung, Luftmassenänderung, NOx-Befund und Betriebszustand dokumentieren.",
    trap:
      "Wenn das AGR-Sollsignal vorhanden ist, muss der tatsächliche Abgasdurchsatz stimmen.",
    unsafe:
      "AGR-System dauerhaft stilllegen, um die Beanstandung zu umgehen.",
    unrelated:
      "Die Radlagerluft verändert die AGR-Luftmassenreaktion.",
    finalCheck:
      "Teillastfahrt mit AGR-Istwerten, Luftmasse und Emissionsrelevanz prüfen.",
    explanation:
      "Die AGR-Funktion zeigt sich an Durchsatz und Reaktion der Luftmasse, nicht nur an der elektrischen Ansteuerung.",
  },
  {
    area: "Partikelfilter",
    system: "DPF-Differenzdruck",
    symptom:
      "DPF-Beladung wird hoch angezeigt, Regenerationen brechen wiederholt ab.",
    measured:
      "Differenzdruck bleibt schon bei stehendem Motor bei 18 mbar.",
    correctConclusion:
      "Der Nullpunkt der Messkette ist unplausibel; Sensor, Schläuche und Verkabelung sind vor dem DPF zu prüfen.",
    firstCheck:
      "Differenzdruck bei Motor aus, Leerlauf und erhöhter Drehzahl vergleichen.",
    confirmationCheck:
      "Schläuche auf Verstopfung, Risse, Vertauschung und Kondensat prüfen.",
    documentation:
      "Differenzdruckwerte, Drehzahl, Temperatur, Asche-/Rußbeladung und Schlauchbefund dokumentieren.",
    trap:
      "Ein hoher Differenzdruckwert bedeutet immer, dass der Partikelfilter mechanisch voll ist.",
    unsafe:
      "Zwangsregeneration starten, obwohl Sensorwert und Betriebsbedingungen unplausibel sind.",
    unrelated:
      "Die Scheinwerferhöhe beeinflusst den DPF-Differenzdruck.",
    finalCheck:
      "Differenzdruck nach Reparatur in mehreren Drehzahlbereichen und Regenerationsfreigabe prüfen.",
    explanation:
      "Ein Offset bei stehendem Motor macht die Beladungsbewertung unsicher und kann falsche Reparaturen auslösen.",
    points: 10,
  },
  {
    area: "SCR-System",
    system: "NOx-Sensor und AdBlue-Dosierung",
    symptom:
      "SCR-Wirkungsgrad zu niedrig, nach längerer Fahrt erscheint eine Restreichweitenwarnung.",
    measured:
      "NOx vor SCR ist plausibel, NOx nach SCR bleibt fast gleich; AdBlue-Druck baut sich verzögert auf.",
    correctConclusion:
      "Dosierdruck, Dosiermenge, NOx-Sensorik und Abgastemperatur müssen zusammen bewertet werden.",
    firstCheck:
      "Fehlerumgebung, AdBlue-Qualität, Füllstand, Druckaufbau und Temperaturen prüfen.",
    confirmationCheck:
      "Dosiermengenprüfung und NOx-Werte vor/nach SCR unter geeigneter Last vergleichen.",
    documentation:
      "NOx-Werte, AdBlue-Druck, Temperaturfenster, Qualität und Restreichweite dokumentieren.",
    trap:
      "Ein SCR-Wirkungsgradfehler beweist immer einen defekten SCR-Katalysator.",
    unsafe:
      "AdBlue-System manipulieren oder Warnlogik deaktivieren.",
    unrelated:
      "Die Spurvermessung korrigiert die NOx-Werte nach SCR.",
    finalCheck:
      "SCR-Wirkungsgrad nach Reparatur im passenden Temperatur- und Lastfenster prüfen.",
    explanation:
      "SCR-Diagnose ist nur mit Sensorik, Dosierung, Temperatur und Abgaslast zusammen belastbar.",
    points: 10,
  },
  {
    area: "Common Rail",
    system: "Raildruckaufbau",
    symptom:
      "Der Dieselmotor startet warm schlecht, kalt unauffällig.",
    measured:
      "Beim Starten warm steigt der Raildruck verzögert, Rücklaufmenge eines Injektors ist erhöht.",
    correctConclusion:
      "Ein interner Leckverlust kann den Raildruckaufbau warm verhindern.",
    firstCheck:
      "Raildruck-Soll/Ist beim Starten warm und kalt aufzeichnen.",
    confirmationCheck:
      "Injektor-Rücklaufmengen, Druckregelventil und Niederdruckversorgung nach Vorgabe prüfen.",
    documentation:
      "Starttemperatur, Raildruckverlauf, Drehzahl, Rücklaufmengen und Kraftstofftemperatur notieren.",
    trap:
      "Warmstartprobleme beim Diesel werden immer durch Glühkerzen verursacht.",
    unsafe:
      "Hochdruckleitungen bei laufendem Motor lösen.",
    unrelated:
      "Der Heckscheibenwischer bestimmt den Raildruckaufbau.",
    finalCheck:
      "Warmstart nach Reparatur mit Raildruckverlauf und Fehlerspeicher prüfen.",
    explanation:
      "Erhöhter Leckverlust kann besonders warm den nötigen Raildruck beim Start verzögern.",
    points: 10,
  },
  {
    area: "Injektoren",
    system: "Diesel-Injektor Rücklauf",
    symptom:
      "Der Motor nagelt und hat zylinderbezogene Laufruheabweichung.",
    measured:
      "Ein Injektor hat hohe Rücklaufmenge, die Kompression ist unauffällig.",
    correctConclusion:
      "Der Injektor ist verdächtig, aber Kraftstoffqualität, Ansteuerung und mechanische Grunddaten bleiben zu prüfen.",
    firstCheck:
      "Rücklaufmengenprüfung nach Temperatur, Dauer und Herstellervorgabe durchführen.",
    confirmationCheck:
      "Laufruhekorrektur, Injektorcodierung, Kompression und Ansteuerung plausibilisieren.",
    documentation:
      "Rücklaufmengen je Zylinder, Temperatur, Prüfdauer und Korrekturwerte dokumentieren.",
    trap:
      "Eine hohe Rücklaufmenge erlaubt den Austausch aller Injektoren ohne weitere Prüfung.",
    unsafe:
      "Injektorleitungen bei laufendem Hochdrucksystem öffnen.",
    unrelated:
      "Die Klimaanlagenbefüllung erklärt die Laufruhekorrektur.",
    finalCheck:
      "Laufruhe, Rücklaufmenge und Lernwerte nach Reparatur prüfen.",
    explanation:
      "Injektoren werden nicht nur nach einem Einzelwert beurteilt, sondern im Kontext der gesamten Befundkette.",
    points: 10,
  },
  {
    area: "Dieselregelung",
    system: "Druckregelventil und Mengenregelventil",
    symptom:
      "Raildruck schwankt im Leerlauf, unter Last gibt es kurze Aussetzer.",
    measured:
      "Sollwert ist stabil, Istwert pendelt stark; Niederdruckversorgung ist unauffällig.",
    correctConclusion:
      "Regelventil, Sensor, Leitungen und Injektorleckage müssen als Regelkreis betrachtet werden.",
    firstCheck:
      "Raildruck-Soll/Ist, Stellgröße und Niederdruck unter verschiedenen Lastzuständen aufzeichnen.",
    confirmationCheck:
      "Regelventil-Ansteuerung, Raildrucksensor und Rücklaufmengen mit Schaltplan und Vorgabe prüfen.",
    documentation:
      "Druckverlauf, Stellgröße, Last, Temperatur und geprüfte Bauteile dokumentieren.",
    trap:
      "Ein schwankender Raildruck beweist immer einen defekten Hochdruckpumpenkolben.",
    unsafe:
      "Hochdrucksystem ohne Druckabbau öffnen.",
    unrelated:
      "Die Nebelschlussleuchte beeinflusst die Raildruckregelung.",
    finalCheck:
      "Raildruckstabilität bei Leerlauf, Beschleunigung und Schub nach Reparatur prüfen.",
    explanation:
      "Raildruckregelung ist ein geschlossener Regelkreis. Sensor, Stellglieder und Leckagen wirken zusammen.",
    points: 10,
  },
  {
    area: "Zündaussetzer",
    system: "Zylinderbezogene Aussetzer",
    symptom:
      "Der Ottomotor setzt auf Zylinder 3 unter Last aus.",
    measured:
      "Quertausch der Zündspule verlagert den Fehler nicht, Kompression ist 4 bar niedriger.",
    correctConclusion:
      "Die mechanische Ursache muss mit Druckverlustprüfung oder Endoskopie weiter eingegrenzt werden.",
    firstCheck:
      "Aussetzerzähler, Kompression und Druckverlust zylinderweise prüfen.",
    confirmationCheck:
      "Ventiltrieb, Kolbenringe, Zylinderwand und Steuerzeiten bei Bedarf weiter prüfen.",
    documentation:
      "Zylinder, Lastzustand, Quertausch, Kompressionswerte und Druckverlustbefund dokumentieren.",
    trap:
      "Wenn ein Aussetzerfehler gespeichert ist, müssen immer zuerst alle Zündspulen ersetzt werden.",
    unsafe:
      "Mit starkem Aussetzer weiter unter Volllast fahren und den Katalysator gefährden.",
    unrelated:
      "Die Anhängersteckdose senkt die Kompression von Zylinder 3.",
    finalCheck:
      "Aussetzerzähler, Leistung und Abgasrelevanz nach Reparatur unter Last prüfen.",
    explanation:
      "Wenn elektrische Quertausche den Fehler nicht verlagern und Kompression abweicht, rückt Mechanik in den Fokus.",
    points: 10,
  },
  {
    area: "Benzin-Direkteinspritzung",
    system: "Hochdruckpumpe Ottomotor",
    symptom:
      "Unter starker Beschleunigung ruckelt der Motor, im Leerlauf unauffällig.",
    measured:
      "Hochdruck-Soll steigt, Istwert bricht ein; Niederdruck ist stabil.",
    correctConclusion:
      "Die Hochdruckseite mit Pumpe, Regelventil und Sensor ist unter Last zu prüfen.",
    firstCheck:
      "Niederdruck und Hochdruck-Soll/Ist parallel unter Last aufzeichnen.",
    confirmationCheck:
      "Hochdruckpumpenantrieb, Mengenregelventil und Drucksensor plausibilisieren.",
    documentation:
      "Lastzustand, Niederdruck, Hochdruck-Soll/Ist und Stellgröße dokumentieren.",
    trap:
      "Wenn der Leerlauf sauber ist, kann die Kraftstoffversorgung unter Last nicht fehlerhaft sein.",
    unsafe:
      "Hochdruckleitung direkt nach Motorlauf ohne Druckabbau öffnen.",
    unrelated:
      "Ein defekter Heckwischer verursacht den Hochdruckeinbruch.",
    finalCheck:
      "Beschleunigungsfahrt mit Druckkurven und Fehlerspeicherkontrolle durchführen.",
    explanation:
      "Lastfehler der Kraftstoffversorgung zeigen sich oft erst bei hohem Förderbedarf.",
    points: 10,
  },
  {
    area: "Lambdaregelung",
    system: "Breitband-Lambdasonde",
    symptom:
      "Der Motor hat erhöhten Verbrauch, keine Aussetzer, Lambdaregelung wirkt träge.",
    measured:
      "Sondenheizung ist zeitweise ohne Versorgung, Signal reagiert verzögert.",
    correctConclusion:
      "Heizkreis, Versorgung, Masse und Signal der Sonde müssen geprüft werden, bevor die Sonde ersetzt wird.",
    firstCheck:
      "Heizung, Sicherung, Relais/Steuergerätansteuerung und Masse nach Schaltplan prüfen.",
    confirmationCheck:
      "Signalreaktion bei definierten Gemischänderungen und Betriebstemperatur beurteilen.",
    documentation:
      "Sondenstatus, Heizstrom, Signalverlauf, Temperatur und Kraftstoffkorrekturen dokumentieren.",
    trap:
      "Eine träge Sonde ist immer mechanisch defekt, Versorgung und Heizung sind unwichtig.",
    unsafe:
      "Sondenleitungen mit ungeeigneten Verbindern reparieren und Signalabschirmung ignorieren.",
    unrelated:
      "Der Luftdruck der Reifen verändert die Sondenheizung.",
    finalCheck:
      "Regelgeschwindigkeit und Kraftstoffkorrekturen nach Reparatur im warmen Betrieb prüfen.",
    explanation:
      "Breitbandsonden brauchen korrekte Heizung und Versorgung. Sonde und Umfeld müssen zusammen bewertet werden.",
  },
  {
    area: "Katalysator",
    system: "Katalysator-Wirkungsgrad",
    symptom:
      "Der Fehler Katalysatorwirkung zu gering tritt nach Zündaussetzern wieder auf.",
    measured:
      "Vorkat-Sonde regelt normal, Nachkat-Sonde schwingt ähnlich stark mit.",
    correctConclusion:
      "Vor einer Kat-Entscheidung müssen Aussetzer, Undichtigkeiten und Sondenplausibilität ausgeschlossen werden.",
    firstCheck:
      "Aussetzerhistorie, Abgasleckagen und Sondenaktivität vor/nach Kat prüfen.",
    confirmationCheck:
      "Temperaturverhalten, Abgaswerte und Monitordaten nach Herstellervorgabe plausibilisieren.",
    documentation:
      "Aussetzerzähler, Sondenkurven, Abgasleckage und Monitorauswertung dokumentieren.",
    trap:
      "Ein Wirkungsgradfehler erlaubt immer sofort den Katalysatortausch ohne Ursachenprüfung.",
    unsafe:
      "Mit aktiven Aussetzern weiterfahren und unverbrannten Kraftstoff in den Kat bringen.",
    unrelated:
      "Die Spurwerte erklären die Nachkat-Sondenaktivität.",
    finalCheck:
      "Nach Ursachenbehebung Monitore, Sondenkurven und Probefahrt im Prüfzyklus kontrollieren.",
    explanation:
      "Ein Kat kann Folgefehler von Aussetzern oder Lecks zeigen. Ursache und Folgeschaden sind zu trennen.",
    points: 10,
  },
  {
    area: "Tankentlüftung",
    system: "EVAP-System",
    symptom:
      "Der Motor läuft nach dem Tanken kurz unrund.",
    measured:
      "Das Tankentlüftungsventil bleibt mechanisch offen und erzeugt im Leerlauf Falschluft.",
    correctConclusion:
      "Ein offen klemmendes Ventil kann Gemischabweichungen und Startprobleme nach dem Tanken verursachen.",
    firstCheck:
      "Ventil auf Dichtheit, Ansteuerung und Durchflussrichtung prüfen.",
    confirmationCheck:
      "Kraftstoffkorrekturen und Tankdruck-/EVAP-Istwerte während der Ansteuerung beobachten.",
    documentation:
      "Betriebszustand nach Tanken, Ventilprüfung, Korrekturwerte und Fehlercodes dokumentieren.",
    trap:
      "Tankentlüftung hat keinen Einfluss auf Gemischbildung.",
    unsafe:
      "Kraftstoffdämpfe ohne Belüftung und Brandschutz prüfen.",
    unrelated:
      "Das Radlager erzeugt Falschluft über die Tankentlüftung.",
    finalCheck:
      "Startverhalten nach Tanken und EVAP-Monitor nach Reparatur prüfen.",
    explanation:
      "Ein offenes EVAP-Ventil kann zusätzliche Dämpfe oder Falschluft in den Ansaugtrakt bringen.",
  },
  {
    area: "Motorsynchronisation",
    system: "Kurbelwellen- und Nockenwellensignal",
    symptom:
      "Der Motor startet sporadisch nicht, Drehzahlsignal ist vorhanden.",
    measured:
      "Das Nockenwellensignal setzt warm zeitweise aus.",
    correctConclusion:
      "Synchronisation, Sensorversorgung, Signalbild und Temperaturabhängigkeit müssen geprüft werden.",
    firstCheck:
      "Kurbel- und Nockenwellensignal mit Oszilloskop bei Start warm/kalt vergleichen.",
    confirmationCheck:
      "Sensorversorgung, Masse, Leitung und Signalabstand prüfen.",
    documentation:
      "Signalbild, Temperatur, Startdrehzahl, Fehlercodeumgebung und Spannungsversorgung dokumentieren.",
    trap:
      "Ein vorhandenes Drehzahlsignal schließt alle Synchronisationsprobleme aus.",
    unsafe:
      "Sensorleitung auf Verdacht direkt mit Batterie-Plus beaufschlagen.",
    unrelated:
      "Der Klimafilter verursacht das fehlende Nockenwellensignal.",
    finalCheck:
      "Warmstart mehrfach prüfen und Synchronisationsstatus mit Diagnosegerät kontrollieren.",
    explanation:
      "Für Startfreigabe reicht oft nicht nur Drehzahl; die Phasenlage muss plausibel sein.",
    points: 10,
  },
  {
    area: "Steuerzeiten",
    system: "Mechanische Steuerzeiten",
    symptom:
      "Der Motor hat wenig Leistung und unruhigen Leerlauf nach Zahnriemenarbeit.",
    measured:
      "Saugrohrdruck ist im Leerlauf erhöht, Nockenwellenadaption am Grenzwert.",
    correctConclusion:
      "Die mechanischen Steuerzeiten müssen mit Spezialwerkzeug nach Herstellervorgabe geprüft werden.",
    firstCheck:
      "Steuerzeiten mechanisch arretieren und Markierungen nicht allein als Beweis nutzen.",
    confirmationCheck:
      "Kompression, Saugrohrdruck und Nockenwellen-Korrelation nach Einstellung prüfen.",
    documentation:
      "Arretierwerkzeug, Kurbel-/Nockenwellenstellung, Adaptionswerte und Messwerte dokumentieren.",
    trap:
      "Wenn Markierungen ungefähr passen, sind Steuerzeiten immer korrekt.",
    unsafe:
      "Motor trotz vermuteter Steuerzeitenabweichung unter hoher Last betreiben.",
    unrelated:
      "Der Tankdeckel verstellt die mechanischen Steuerzeiten.",
    finalCheck:
      "Leerlauf, Leistung, Adaptionswerte und Fehlerspeicher nach Einstellung prüfen.",
    explanation:
      "Kleine Steuerzeitenabweichungen können Leistung, Leerlauf und Adaptionswerte deutlich beeinflussen.",
    points: 10,
  },
  {
    area: "Motormechanik",
    system: "Druckverlustprüfung",
    symptom:
      "Ein Zylinder hat niedrige Kompression, Ölzugabe verbessert den Wert kaum.",
    measured:
      "Beim Druckverlusttest ist Luft am Auspuff hörbar.",
    correctConclusion:
      "Ein undichtes Auslassventil ist wahrscheinlich und muss mechanisch weiter geprüft werden.",
    firstCheck:
      "Druckverlustprüfung bei korrekt positioniertem Kolben durchführen.",
    confirmationCheck:
      "Ventilspiel, Steuerzeiten, Endoskopiebild und Zylinderkopfbefund prüfen.",
    documentation:
      "Kompressionswerte, Druckverlustanteil, Luftaustrittsstelle und Motortemperatur dokumentieren.",
    trap:
      "Wenn Ölzugabe den Wert kaum ändert, sind immer die Kolbenringe defekt.",
    unsafe:
      "Druckluftprüfung ohne Sicherung der Kurbelwelle durchführen.",
    unrelated:
      "Die Anhängerbeleuchtung verursacht Luftaustritt am Auspuff.",
    finalCheck:
      "Nach Reparatur Kompression, Laufkultur und Aussetzerzähler prüfen.",
    explanation:
      "Luft am Auspuff während Druckverlustprüfung spricht für Undichtigkeit am Auslassventil.",
    points: 10,
  },
  {
    area: "Automatikgetriebe",
    system: "Wandlerüberbrückung",
    symptom:
      "Bei konstanter Fahrt schwankt die Drehzahl leicht, kein Motoraussetzer gespeichert.",
    measured:
      "Schlupf der Wandlerüberbrückung pendelt, Getriebeöl ist dunkel und riecht verbrannt.",
    correctConclusion:
      "Getriebeölzustand, Schlupfregelung und Adaptionswerte müssen vor mechanischer Entscheidung bewertet werden.",
    firstCheck:
      "Getriebeölstand/-temperatur, Ölzustand und Fehlerspeicher nach Vorgabe prüfen.",
    confirmationCheck:
      "Wandlerkupplungs-Soll/Ist, Schlupf und Adaptionswerte während Probefahrt aufzeichnen.",
    documentation:
      "Öltemperatur, Schlupfwerte, Fahrzustand, Geruch/Farbe und Fehlercodes dokumentieren.",
    trap:
      "Drehzahlschwanken bei konstanter Fahrt ist immer ein Motorzündproblem.",
    unsafe:
      "Falsches Getriebeöl einfüllen, weil die Farbe ähnlich ist.",
    unrelated:
      "Der Regensensor regelt den Wandlerkupplungsschlupf.",
    finalCheck:
      "Nach Maßnahme Schlupf, Schaltqualität und Öltemperatur im Fahrprofil prüfen.",
    explanation:
      "Getriebeschlupf muss mit Ölzustand, Temperatur und Regelwerten zusammen beurteilt werden.",
    points: 10,
  },
  {
    area: "Doppelkupplungsgetriebe",
    system: "Kupplungsadaption",
    symptom:
      "Beim Anfahren ruckelt das Fahrzeug nach Kupplungsarbeit.",
    measured:
      "Kupplungsadaptionswerte wurden nicht zurückgesetzt, keine mechanischen Fehler sichtbar.",
    correctConclusion:
      "Nach bestimmten Arbeiten sind Grundeinstellung und Lernfahrt nach Herstellervorgabe erforderlich.",
    firstCheck:
      "Fehlerspeicher, Ölstand/Temperatur und Voraussetzungen für Grundeinstellung prüfen.",
    confirmationCheck:
      "Grundeinstellung durchführen und Kupplungsdruck-/Wegwerte plausibilisieren.",
    documentation:
      "Adaptionswerte, Temperatur, Softwarestand und Lernfahrtbedingungen dokumentieren.",
    trap:
      "Ruckeln nach Kupplungsarbeit bedeutet immer einen falsch montierten Motor.",
    unsafe:
      "Grundeinstellung abbrechen und trotzdem Probefahrt im Verkehr erzwingen.",
    unrelated:
      "Die Nebelschlussleuchte setzt Kupplungsadaptionswerte zurück.",
    finalCheck:
      "Anfahrverhalten und Schaltqualität nach Grundeinstellung in definiertem Fahrprofil prüfen.",
    explanation:
      "Doppelkupplungsgetriebe benötigen nach Arbeiten oft definierte Grundeinstellungen und Lernbedingungen.",
  },
  {
    area: "ABS/ESP",
    system: "Aktiver Raddrehzahlsensor",
    symptom:
      "ABS regelt kurz vor Stillstand ohne Bremsnotwendigkeit.",
    measured:
      "Ein Rad zeigt bei niedriger Geschwindigkeit kurz 0 km/h, Magnetring ist verschmutzt.",
    correctConclusion:
      "Sensor, Magnetring, Lagerluft und Signalqualität bei niedriger Geschwindigkeit sind zu prüfen.",
    firstCheck:
      "Raddrehzahlistwerte aller Räder bei langsamer Fahrt vergleichen.",
    confirmationCheck:
      "Sensorabstand, Magnetring, Radlager und Leitung mit Oszilloskop oder Diagnosegerät prüfen.",
    documentation:
      "Geschwindigkeit, betroffene Radposition, Signalabfall und mechanischen Befund dokumentieren.",
    trap:
      "ABS-Eingriffe kurz vor Stillstand sind immer normal und nicht prüfbar.",
    unsafe:
      "ABS-Sensorleitung mit Prüflampe belasten.",
    unrelated:
      "Der Luftmassenmesser erzeugt das 0-km/h-Signal am Rad.",
    finalCheck:
      "Langsamfahrt und Bremsung bis Stillstand mit Istwerten nach Reparatur prüfen.",
    explanation:
      "Bei niedriger Geschwindigkeit wirken kleine Signalfehler stark auf die ABS-Regelung.",
    points: 10,
  },
  {
    area: "Fahrdynamik",
    system: "Lenkwinkel- und Gierratensensor",
    symptom:
      "ESP-Leuchte nach Achsvermessung, Lenkrad steht jetzt gerade.",
    measured:
      "Lenkwinkel-Istwert zeigt bei Geradeausfahrt 8 Grad.",
    correctConclusion:
      "Lenkwinkelsensor muss nach mechanischer Einstellung kalibriert oder Grundeinstellung geprüft werden.",
    firstCheck:
      "Achsgeometrie, Lenkradmittelstellung und Lenkwinkel-Istwert vergleichen.",
    confirmationCheck:
      "Grundeinstellung/Kalibrierung nach Herstellervorgabe durchführen und Gierrate prüfen.",
    documentation:
      "Vermessungswerte, Lenkwinkel vor/nach Kalibrierung und Fehlerspeicher dokumentieren.",
    trap:
      "Wenn das Lenkrad gerade steht, muss der Lenkwinkel-Istwert automatisch 0 Grad sein.",
    unsafe:
      "ESP-Warnung ignorieren und Fahrzeug ohne Abschlussprüfung ausliefern.",
    unrelated:
      "Der Kraftstofffilter bestimmt den Lenkwinkel-Nullpunkt.",
    finalCheck:
      "Geradeausfahrt, Lenkwinkel-Istwert und ESP-Fehlerspeicher nach Kalibrierung prüfen.",
    explanation:
      "Mechanische Einstellung und Sensorsignal müssen zueinander passen, sonst arbeitet ESP fehlerhaft.",
    points: 10,
  },
  {
    area: "ADAS",
    system: "Frontkamera-Kalibrierung",
    symptom:
      "Nach Frontscheibentausch meldet der Spurhalteassistent eingeschränkte Funktion.",
    measured:
      "Kalibrierstatus ist nicht abgeschlossen, Fahrwerk hat ungleichen Reifendruck.",
    correctConclusion:
      "Kalibrierbedingungen inklusive Reifendruck, Fahrhöhe und Zieltafel/Vorgabe müssen erfüllt sein.",
    firstCheck:
      "Herstellervorgaben zu Kalibrierart, Reifendruck, Beladung und Fahrwerkszustand prüfen.",
    confirmationCheck:
      "Kalibrierung mit geeigneter Ausrüstung oder definierter Lernfahrt durchführen.",
    documentation:
      "Kalibrierbedingungen, Reifendruck, Softwarestatus und Ergebnisprotokoll dokumentieren.",
    trap:
      "Nach Scheibentausch kalibrieren sich alle Kameras immer sofort selbst.",
    unsafe:
      "ADAS-Funktion als geprüft markieren, obwohl Kalibrierstatus offen ist.",
    unrelated:
      "Der Ölstand ersetzt die Kamerakalibrierung.",
    finalCheck:
      "Kalibrierstatus, Fehlerspeicher und Funktionsprüfung nach Vorgabe kontrollieren.",
    explanation:
      "ADAS-Systeme sind empfindlich auf Geometrie, Beladung und definierte Kalibrierbedingungen.",
    points: 10,
  },
  {
    area: "Klimaregelung",
    system: "Elektrisches Regelventil Kompressor",
    symptom:
      "Klimaanlage kühlt nur bei höherer Drehzahl.",
    measured:
      "Kompressorfreigabe ist vorhanden, Regelventilstrom bleibt niedrig, Druckdifferenz baut sich kaum auf.",
    correctConclusion:
      "Regelventilansteuerung, Drucksensorik und Kältemittelfüllung müssen zusammen geprüft werden.",
    firstCheck:
      "Hoch-/Niederdruck, Regelventilstrom und Freigabebedingungen bei definierter Drehzahl prüfen.",
    confirmationCheck:
      "Füllmenge, Drucksensor, Lüfterfunktion und Kompressorregelventil nach Vorgabe plausibilisieren.",
    documentation:
      "Umgebungstemperatur, Drücke, Regelstrom, Freigabe und Füllmenge dokumentieren.",
    trap:
      "Wenn der Kompressor freigegeben ist, muss die Kältemittelfüllung immer korrekt sein.",
    unsafe:
      "Kältemittel ohne Sachkunde und Absauggerät ablassen.",
    unrelated:
      "Der Nockenwellensensor bestimmt den Kältemitteldruck.",
    finalCheck:
      "Ausblastemperatur, Druckwerte und Regelstrom nach Reparatur bei mehreren Drehzahlen prüfen.",
    explanation:
      "Variable Kompressoren benötigen korrekte Füllung, Sensorik und Regelventilansteuerung.",
  },
  {
    area: "Hochvolt",
    system: "HV-Isolationsüberwachung",
    symptom:
      "Ein Elektrofahrzeug meldet Isolationsfehler nach Regenfahrt.",
    measured:
      "Der Isolationswert sinkt bei feuchtem Unterboden, HV-Arbeiten sind erforderlich.",
    correctConclusion:
      "Nur qualifizierte Personen dürfen nach Herstellervorgabe freischalten, sichern und messen.",
    firstCheck:
      "Qualifikation, persönliche Schutzausrüstung und Herstellervorgabe vor Arbeitsbeginn sicherstellen.",
    confirmationCheck:
      "HV-System spannungsfrei schalten, gegen Wiedereinschalten sichern und Spannungsfreiheit prüfen.",
    documentation:
      "Freischaltprotokoll, Isolationswerte, Witterungsbedingungen und betroffene Komponenten dokumentieren.",
    trap:
      "Bei ausgeschalteter Zündung sind HV-Leitungen grundsätzlich ungefährlich.",
    unsafe:
      "Orange HV-Leitungen zur Fehlersuche beliebig trennen.",
    unrelated:
      "Der Innenraumfilter erklärt den Isolationswert des HV-Systems.",
    finalCheck:
      "Isolationswert und Fehlerspeicher nach Reparatur sowie Dichtheit betroffener Komponenten prüfen.",
    explanation:
      "HV-Isolationsfehler sind sicherheitskritisch. Freischaltung und Qualifikation sind zwingend.",
    points: 10,
  },
  {
    area: "Hochvolt",
    system: "HV-Interlock",
    symptom:
      "Das Fahrzeug schaltet nicht fahrbereit, HV-System bleibt gesperrt.",
    measured:
      "Interlock-Kreis ist an einem Service-Stecker unterbrochen.",
    correctConclusion:
      "Der Interlock-Kreis überwacht Steck- und Deckelzustände und darf nicht überbrückt werden.",
    firstCheck:
      "Service-Stecker, Verriegelungen und Interlock-Leitung nach Herstellervorgabe prüfen.",
    confirmationCheck:
      "Interlock-Status im Diagnosegerät mit tatsächlichem Verriegelungszustand vergleichen.",
    documentation:
      "Interlock-Status, Steckzustand, Freischaltzustand und Fehlerspeicher dokumentieren.",
    trap:
      "Der Interlock-Kreis ist nur Komfortelektrik und kann dauerhaft gebrückt werden.",
    unsafe:
      "Interlock überbrücken, um das HV-System trotz offener Verriegelung zu aktivieren.",
    unrelated:
      "Die Scheibenwaschpumpe sperrt den HV-Interlock-Kreis.",
    finalCheck:
      "Fahrbereitschaft, Interlock-Status und HV-Fehlerspeicher nach Reparatur prüfen.",
    explanation:
      "Der Interlock ist eine Sicherheitskette. Manipulation kann gefährliche Zustände erzeugen.",
    points: 10,
  },
  {
    area: "Hybridtechnik",
    system: "DC/DC-Wandler",
    symptom:
      "Die 12-V-Batterie entlädt sich im Hybridfahrzeug trotz fahrbereitem Zustand.",
    measured:
      "Bei Ready liegen nur 12,1 V an der 12-V-Batterie an, HV-System ist aktiv.",
    correctConclusion:
      "Der DC/DC-Wandler oder seine Freigabe/Leitung muss geprüft werden.",
    firstCheck:
      "12-V-Spannung, DC/DC-Freigabe, Sicherungen und Massepunkte im Ready-Zustand prüfen.",
    confirmationCheck:
      "HV-seitige Freigaben, Fehlercodes und Temperaturbedingungen nach Herstellervorgabe plausibilisieren.",
    documentation:
      "Ready-Status, 12-V-Spannung, Lastzustand, Freigaben und Fehlercodes dokumentieren.",
    trap:
      "Ein Hybridfahrzeug lädt die 12-V-Batterie immer über einen klassischen Riemengenerator.",
    unsafe:
      "HV-Komponenten ohne Qualifikation öffnen, um den Wandler direkt zu prüfen.",
    unrelated:
      "Der Reifenverschleiß bestimmt die DC/DC-Ladespannung.",
    finalCheck:
      "12-V-Ladespannung bei Ready und elektrischer Last nach Reparatur prüfen.",
    explanation:
      "Viele Hybrid- und Elektrofahrzeuge versorgen 12 V über DC/DC statt über einen Generator.",
    points: 10,
  },
  {
    area: "Start-Stopp",
    system: "Batteriesensor und Freigabebedingungen",
    symptom:
      "Start-Stopp ist dauerhaft nicht verfügbar, keine Motorkontrollleuchte.",
    measured:
      "Batterieladezustand wird mit 52 Prozent angezeigt, Innenraumheizung fordert hohe Leistung.",
    correctConclusion:
      "Nichtverfügbarkeit kann durch normale Freigabebedingungen entstehen und ist nicht automatisch ein Fehler.",
    firstCheck:
      "Freigabebedingungen wie Ladezustand, Temperatur, Verbraucherlast und Gurt-/Türstatus prüfen.",
    confirmationCheck:
      "Batteriesensor-Istwerte, Batterietyp und Ladebilanz plausibilisieren.",
    documentation:
      "Start-Stopp-Statusgrund, Ladezustand, Temperatur und Verbraucherlast dokumentieren.",
    trap:
      "Wenn Start-Stopp nicht arbeitet, ist immer der Anlasser defekt.",
    unsafe:
      "Batteriesensor abstecken, damit Start-Stopp erzwungen wird.",
    unrelated:
      "Das Auspuffendrohr bestimmt die Start-Stopp-Freigabe.",
    finalCheck:
      "Nach Laden oder Reparatur Freigabestatus und Start-Stopp-Funktion unter passenden Bedingungen prüfen.",
    explanation:
      "Start-Stopp-Systeme sperren sich bei ungünstigen Bedingungen oft bewusst zum Schutz von Komfort und Batterie.",
  },
  {
    area: "Datenbus",
    system: "CAN-Kommunikationsfehler",
    symptom:
      "Mehrere Steuergeräte melden Kommunikation zum Getriebesteuergerät verloren.",
    measured:
      "Am betroffenen Steuergerät fehlt Klemme 15, Buswiderstand ist korrekt.",
    correctConclusion:
      "Vor Busreparatur muss die Spannungsversorgung des nicht kommunizierenden Steuergeräts geprüft werden.",
    firstCheck:
      "Versorgung, Masse und Wake-up/Klemme 15 des betroffenen Steuergeräts prüfen.",
    confirmationCheck:
      "Busspannung und Kommunikation erst nach stabiler Versorgung bewerten.",
    documentation:
      "Versorgung, Masse, Klemme 15, erreichbare Steuergeräte und Fehlerumgebung dokumentieren.",
    trap:
      "Jeder Kommunikationsfehler ist automatisch ein defekter CAN-Bus.",
    unsafe:
      "CAN-Leitungen mit 12 V beaufschlagen, um Kommunikation zu erzwingen.",
    unrelated:
      "Die Bremsbelagstärke versorgt das Getriebesteuergerät mit Klemme 15.",
    finalCheck:
      "Kommunikation, Versorgung und Fehlerspeicher nach Reparatur aller betroffenen Steuergeräte prüfen.",
    explanation:
      "Ein Steuergerät ohne Versorgung kann nicht kommunizieren und erzeugt Busfehler in anderen Steuergeräten.",
    points: 10,
  },
  {
    area: "LIN-Bus",
    system: "Generator über LIN",
    symptom:
      "Ladespannung bleibt konstant niedrig, Fehler Kommunikation Generator gespeichert.",
    measured:
      "B+ und Masse sind in Ordnung, LIN-Signal fehlt am Generator.",
    correctConclusion:
      "Die Generatorleistung kann durch fehlende LIN-Kommunikation begrenzt sein.",
    firstCheck:
      "B+, Masse, LIN-Leitung und Steuergerätfreigabe nach Schaltplan prüfen.",
    confirmationCheck:
      "LIN-Signalbild, Fehlercodeumgebung und Generator-Istwerte vergleichen.",
    documentation:
      "Ladespannung, Last, B+/Masse, LIN-Signal und Fehlercodes dokumentieren.",
    trap:
      "Ein moderner Generator braucht niemals Kommunikation, nur B+ und Masse.",
    unsafe:
      "LIN-Leitung mit Batterie-Plus überbrücken.",
    unrelated:
      "Die DPF-Beladung erzeugt das fehlende LIN-Signal direkt am Generator.",
    finalCheck:
      "Ladestrategie bei verschiedenen Lasten und Kommunikation nach Reparatur prüfen.",
    explanation:
      "Geregelte Generatoren werden oft per LIN angesteuert. Versorgung und Kommunikation sind getrennt zu prüfen.",
  },
  {
    area: "Diagnoseprotokoll",
    system: "Freeze-Frame und Umgebungsdaten",
    symptom:
      "Ein sporadischer Fehler tritt nur bei hoher Last auf.",
    measured:
      "Fehlerspeicher wurde vor dem Sichern der Umgebungsdaten gelöscht.",
    correctConclusion:
      "Wichtige Diagnoseinformationen wurden verloren; künftig müssen Freeze-Frame-Daten zuerst gesichert werden.",
    firstCheck:
      "Vor dem Löschen Fehlercodes, Status, Häufigkeit und Umgebungsdaten sichern.",
    confirmationCheck:
      "Fehler unter ähnlichen Bedingungen reproduzieren und Messwerte live aufzeichnen.",
    documentation:
      "Drehzahl, Last, Temperatur, Geschwindigkeit und Fehlerstatus dokumentieren.",
    trap:
      "Fehlerspeicherlöschen ist immer der erste sinnvolle Diagnoseschritt.",
    unsafe:
      "Hochlast-Probefahrt ohne sichere Strecke und ohne zweiten Blick auf relevante Messwerte durchführen.",
    unrelated:
      "Die Farbe der Fußmatten ersetzt Freeze-Frame-Daten.",
    finalCheck:
      "Nach Reparatur Fehlerstatus, Readiness und relevante Istwerte unter Fehlerbedingungen prüfen.",
    explanation:
      "Umgebungsdaten zeigen, wann ein Fehler gesetzt wurde. Löschen vor dem Sichern erschwert die Diagnose.",
    points: 10,
  },
  {
    area: "Technische Informationen",
    system: "TSB und Softwarestand",
    symptom:
      "Ein bekannter sporadischer Fehler tritt nach Sensorersatz weiter auf.",
    measured:
      "Herstellerinformation beschreibt Softwareupdate mit geänderter Diagnosegrenze.",
    correctConclusion:
      "Technische Serviceinformationen und Softwarestand müssen in die Diagnoseentscheidung einbezogen werden.",
    firstCheck:
      "Fahrzeugdaten, Softwarestand, Fehlercode und passende Serviceinformation prüfen.",
    confirmationCheck:
      "Vor Update mechanische und elektrische Grundprüfung abschließen und Freigabe beachten.",
    documentation:
      "TSB-Nummer, Softwarestand, Kundenbeanstandung und durchgeführte Grundprüfungen dokumentieren.",
    trap:
      "Bei bekannter Serviceinformation sind alle Messungen grundsätzlich überflüssig.",
    unsafe:
      "Software ohne stabile Spannungsversorgung und ohne Freigabe aktualisieren.",
    unrelated:
      "Die Radmutterkappe entscheidet über den Softwarestand.",
    finalCheck:
      "Nach Update Fehlerbedingungen, Fehlerspeicher und Kundenbeanstandung erneut prüfen.",
    explanation:
      "Serviceinformationen helfen, ersetzen aber nicht die Grunddiagnose und sichere Updatebedingungen.",
    points: 10,
  },
  {
    area: "Bremsregelsystem",
    system: "Elektrische Parkbremse",
    symptom:
      "Nach Belagwechsel hinten meldet die Parkbremse einen Stellwegfehler.",
    measured:
      "Serviceposition wurde nicht aktiviert, Stellmotor läuft an Anschlag.",
    correctConclusion:
      "Bei elektrischer Parkbremse müssen Serviceposition, Rückstellung und Grundeinstellung nach Vorgabe erfolgen.",
    firstCheck:
      "Serviceposition aktivieren, mechanische Rückstellung und Belagmontage prüfen.",
    confirmationCheck:
      "Grundeinstellung, Stellweg und Fehlerstatus mit Diagnosegerät kontrollieren.",
    documentation:
      "Serviceposition, Belagstärke, Stellwegwerte und Grundeinstellung dokumentieren.",
    trap:
      "Elektrische Parkbremsen können wie mechanische Sättel immer ohne Diagnosegerät zurückgedrückt werden.",
    unsafe:
      "Kolben mit Gewalt zurückdrücken, während der Stellmotor aktiv ist.",
    unrelated:
      "Der Luftmassenmesser begrenzt den Parkbrems-Stellweg.",
    finalCheck:
      "Parkbremsfunktion, Bremsenprüfstand und Fehlerspeicher nach Grundeinstellung prüfen.",
    explanation:
      "Elektrische Parkbremsen benötigen definierte Serviceabläufe, sonst entstehen Stellweg- oder Motorschäden.",
    points: 10,
  },
  {
    area: "Fahrerassistenz",
    system: "Radar nach Stoßfängerarbeit",
    symptom:
      "Abstandsregeltempomat fällt nach Stoßfängerreparatur aus.",
    measured:
      "Radarhalter ist leicht verdreht, Kalibrierwert außerhalb Toleranz.",
    correctConclusion:
      "Radarhalter, Einbauposition und Kalibrierung müssen nach Herstellervorgabe geprüft werden.",
    firstCheck:
      "Stoßfänger, Halter, Sensorposition und Befestigung auf Verformung prüfen.",
    confirmationCheck:
      "Statische oder dynamische Kalibrierung mit vorgeschriebenen Bedingungen durchführen.",
    documentation:
      "Reparaturbereich, Halterbefund, Kalibrierbedingungen und Ergebnisprotokoll dokumentieren.",
    trap:
      "Radar funktioniert nach Stoßfängerarbeiten immer ohne Kalibrierung weiter.",
    unsafe:
      "Assistenzsystem als funktionsfähig ausliefern, obwohl Kalibrierung fehlgeschlagen ist.",
    unrelated:
      "Der Kühlmittel-Frostschutz verstellt den Radarhalter.",
    finalCheck:
      "Kalibrierstatus, Fehlerspeicher und Funktionsprüfung nach Vorgabe kontrollieren.",
    explanation:
      "Radarwinkel und Halterposition sind sicherheitsrelevant für Assistenzfunktionen.",
    points: 10,
  },
  {
    area: "Thermomanagement",
    system: "Elektrische Kühlmittelpumpe",
    symptom:
      "Der Motor überhitzt im Stau, bei Fahrt sinkt die Temperatur.",
    measured:
      "Ansteuerung der elektrischen Pumpe ist vorhanden, Stromaufnahme bleibt 0 A.",
    correctConclusion:
      "Pumpe, Versorgung, Masse und Blockierung müssen geprüft werden.",
    firstCheck:
      "Ansteuerung, Versorgung, Masse und Stromaufnahme der Pumpe nach Schaltplan prüfen.",
    confirmationCheck:
      "Kühlmitteldurchfluss, Entlüftung und Thermostatfunktion plausibilisieren.",
    documentation:
      "Temperaturverlauf, Pumpenansteuerung, Stromaufnahme und Durchflussbefund dokumentieren.",
    trap:
      "Bei Überhitzung im Stau ist immer nur der Kühlerlüfter defekt.",
    unsafe:
      "Mit überhitzendem Motor weiterfahren, um den Fehler länger zu beobachten.",
    unrelated:
      "Der NOx-Sensor steuert die Kühlmittelpumpe direkt mechanisch an.",
    finalCheck:
      "Warmlauf, Lüfter-/Pumpenfunktion und Temperaturstabilität im Stand prüfen.",
    explanation:
      "Elektrische Pumpen können trotz Ansteuerung nicht fördern, wenn Versorgung, Masse oder Pumpe fehlerhaft sind.",
    points: 10,
  },
  {
    area: "Thermomanagement",
    system: "Kennfeldthermostat",
    symptom:
      "Der Motor wird unter Teillast zu warm, Lüfter läuft häufig nach.",
    measured:
      "Heizelement des Kennfeldthermostats hat Unterbrechung.",
    correctConclusion:
      "Das Thermostat kann mechanisch arbeiten, aber die kennfeldabhängige Öffnung ist gestört.",
    firstCheck:
      "Heizelement, Versorgung, Ansteuerung und mechanische Thermostatfunktion prüfen.",
    confirmationCheck:
      "Temperaturverlauf bei Last und Stellgliedtest mit Vorgaben vergleichen.",
    documentation:
      "Temperatur, Ansteuerung, Widerstand des Heizelements und Fahrzustand dokumentieren.",
    trap:
      "Wenn Kühlmittel zirkuliert, kann ein Kennfeldthermostat elektrisch nicht fehlerhaft sein.",
    unsafe:
      "Thermostatstecker dauerhaft überbrücken, um die Warnung zu vermeiden.",
    unrelated:
      "Der Türkontaktschalter öffnet das Thermostat mechanisch.",
    finalCheck:
      "Temperaturverlauf nach Reparatur in Stadtfahrt und unter Last prüfen.",
    explanation:
      "Kennfeldthermostate kombinieren mechanische und elektrische Funktion.",
  },
  {
    area: "Luftpfad",
    system: "Saugrohrklappen",
    symptom:
      "Der Motor hat im unteren Drehzahlbereich wenig Drehmoment.",
    measured:
      "Saugrohrklappen-Soll ändert sich, Istwert bleibt auf offen stehen.",
    correctConclusion:
      "Klappenmechanik, Stellmotor, Rückmeldung und Verkabelung müssen geprüft werden.",
    firstCheck:
      "Stellgliedtest durchführen und Klappenbewegung mechanisch sowie elektrisch beobachten.",
    confirmationCheck:
      "Versorgung, Masse, Rückmeldesignal und Verkokung der Klappen prüfen.",
    documentation:
      "Soll-/Iststellung, Stellgliedtest, mechanischen Befund und Fehlercodes dokumentieren.",
    trap:
      "Wenn der Stellmotor angesteuert wird, bewegen sich die Klappen zwangsläufig korrekt.",
    unsafe:
      "Klappengestänge dauerhaft fixieren, ohne Emissions- und Funktionsfolgen zu beachten.",
    unrelated:
      "Die Parkbremse bestimmt die Saugrohrklappenstellung.",
    finalCheck:
      "Drehmomentverhalten, Soll-/Iststellung und Fehlerspeicher nach Reparatur prüfen.",
    explanation:
      "Saugrohrklappen beeinflussen Luftführung und Füllung. Elektrische Ansteuerung allein genügt nicht.",
  },
  {
    area: "Kraftstoffkorrektur",
    system: "Langzeit- und Kurzzeittrims",
    symptom:
      "Der Ottomotor zeigt im Leerlauf +22 Prozent, bei 2500 U/min nur +4 Prozent Kraftstoffkorrektur.",
    measured:
      "Rauchtest zeigt kleine Undichtigkeit hinter der Drosselklappe.",
    correctConclusion:
      "Der Befund passt zu Falschluft, die im Leerlauf prozentual stärker wirkt.",
    firstCheck:
      "Korrekturwerte bei Leerlauf und erhöhter Drehzahl vergleichen.",
    confirmationCheck:
      "Ansaugsystem mit Rauchtest prüfen und Werte nach Abdichtung erneut messen.",
    documentation:
      "Kurzzeit-/Langzeittrim, Drehzahl, Last, Leckstelle und Reparaturergebnis dokumentieren.",
    trap:
      "Positive Trims im Leerlauf und normale Werte bei Drehzahl beweisen zu hohen Kraftstoffdruck.",
    unsafe:
      "Mit stark magerem Gemisch und Fehlzündungen längere Volllastfahrt durchführen.",
    unrelated:
      "Der Lenkwinkelsensor erzeugt Falschluft hinter der Drosselklappe.",
    finalCheck:
      "Korrekturwerte und Leerlaufqualität nach Abdichtung warm prüfen.",
    explanation:
      "Ein konstantes Luftleck wirkt bei geringer Luftmasse prozentual größer als bei höherer Drehzahl.",
    points: 10,
  },
  {
    area: "Klopfregelung",
    system: "Klopfsensor",
    symptom:
      "Der Motor nimmt Zündung stark zurück, Leistung fehlt unter Last.",
    measured:
      "Klopfsensorleitung ist am Halter eingescheuert, Signal zeigt Störungen.",
    correctConclusion:
      "Signalstörung, Sensorbefestigung und Leitungsabschirmung müssen geprüft werden.",
    firstCheck:
      "Sensorbefestigung mit Drehmoment, Leitung und Steckverbindung prüfen.",
    confirmationCheck:
      "Klopfsignal, Zündwinkelrücknahme und Kraftstoffqualität unter Last plausibilisieren.",
    documentation:
      "Signalbild, Zündwinkel, Lastzustand, Kraftstoffangabe und Leitungsbefund dokumentieren.",
    trap:
      "Zündwinkelrücknahme bedeutet immer minderwertigen Kraftstoff und nie ein Signalproblem.",
    unsafe:
      "Klopfsensor ohne Drehmomentvorgabe festziehen.",
    unrelated:
      "Das Wischerrelais beeinflusst direkt die Klopferkennung.",
    finalCheck:
      "Zündwinkel, Leistung und Fehlerspeicher nach Reparatur unter Last prüfen.",
    explanation:
      "Klopfsensoren reagieren auf Körperschall und brauchen korrekte Befestigung sowie störungsfreie Leitung.",
  },
  {
    area: "Abgasrückführung",
    system: "AGR-Kühler Undichtigkeit",
    symptom:
      "Kühlmittelverlust ohne äußere Leckage, weißer Dampf im Abgas nach Kaltstart.",
    measured:
      "AGR-Kühler-Dichtheitsprüfung zeigt Druckverlust.",
    correctConclusion:
      "Ein undichter AGR-Kühler kann Kühlmittel in den Abgastrakt bringen.",
    firstCheck:
      "Kühlsystemdruck, AGR-Kühler und Abgastrakt auf Kühlmittelspuren prüfen.",
    confirmationCheck:
      "Zylinderkopfdichtung, Öl/Kühlmittelvermischung und Abgasnachbehandlung differenzialdiagnostisch ausschließen.",
    documentation:
      "Druckverlust, Kühlmittelverbrauch, Abgasbefund und ausgeschlossene Ursachen dokumentieren.",
    trap:
      "Kühlmittelverlust ohne äußere Leckage ist immer eine defekte Zylinderkopfdichtung.",
    unsafe:
      "Mit unbekanntem Kühlmittelverlust weiterfahren und Überhitzung riskieren.",
    unrelated:
      "Die Sitzheizung verursacht Kühlmittel im Abgastrakt.",
    finalCheck:
      "Dichtheit, Kühlmittelstand und Abgasbild nach Reparatur über Warmlauf prüfen.",
    explanation:
      "AGR-Kühler liegen zwischen Kühlmittel und Abgas. Undichtigkeiten können intern auftreten.",
    points: 10,
  },
  {
    area: "Öldruckregelung",
    system: "Variable Ölpumpe",
    symptom:
      "Öldruckfehler bei warmem Motor und niedriger Drehzahl.",
    measured:
      "Mechanischer Öldruck ist an der unteren Grenze, Stellventil der Ölpumpe ist sporadisch offen.",
    correctConclusion:
      "Mechanischer Öldruck, Ölqualität, Stellventil und Steuerung müssen gemeinsam beurteilt werden.",
    firstCheck:
      "Öldruck mechanisch mit Temperatur und Drehzahl nach Herstellervorgabe messen.",
    confirmationCheck:
      "Stellventil-Ansteuerung, Ölqualität, Filter und Ansaugsieb prüfen.",
    documentation:
      "Öldruck, Öltemperatur, Drehzahl, Stellgröße und Ölzustand dokumentieren.",
    trap:
      "Ein elektrischer Öldruckfehler erlaubt immer nur den Sensortausch.",
    unsafe:
      "Mit aktiver Öldruckwarnung eine Belastungsfahrt durchführen.",
    unrelated:
      "Die Rückfahrkamera regelt die variable Ölpumpe.",
    finalCheck:
      "Öldruckkennfeld und Warnstatus nach Reparatur warm prüfen.",
    explanation:
      "Variable Ölpumpen verbinden mechanische Ölversorgung mit elektrischer Regelung.",
    points: 10,
  },
  {
    area: "Abgastemperatur",
    system: "Abgastemperatursensor",
    symptom:
      "Regeneration wird gesperrt, Sensor zeigt direkt nach Kaltstart 780 Grad C.",
    measured:
      "Umgebungstemperatur und andere Sensoren sind plausibel.",
    correctConclusion:
      "Der Sensorwert ist unplausibel; Sensor, Leitung und Steuergeräteauswertung müssen geprüft werden.",
    firstCheck:
      "Istwerte aller Temperatursensoren bei kaltem Motor vergleichen.",
    confirmationCheck:
      "Sensorwiderstand/Signal, Steckverbindung und Leitung nach Vorgabe prüfen.",
    documentation:
      "Kaltstartwerte, Umgebungstemperatur, Steckbefund und Fehlercodeumgebung dokumentieren.",
    trap:
      "780 Grad C direkt nach Kaltstart beweist eine echte Abgasüberhitzung.",
    unsafe:
      "Regeneration erzwingen, obwohl Temperaturwerte unplausibel sind.",
    unrelated:
      "Die Zentralverriegelung bestimmt die Abgastemperatur vor dem DPF.",
    finalCheck:
      "Temperaturwerte nach Reparatur kalt und warm sowie Regenerationsfreigabe prüfen.",
    explanation:
      "Unrealistische Kaltwerte sind ein starker Hinweis auf Sensor- oder Leitungsfehler.",
    points: 10,
  },
  {
    area: "Luftmassenmessung",
    system: "Luftmassenmesser nach Filterwechsel",
    symptom:
      "Nach Luftfilterwechsel meldet das Steuergerät Luftmasse unplausibel.",
    measured:
      "Der Luftfilterkasten ist nicht korrekt eingerastet, Nebenluft hinter dem Sensor möglich.",
    correctConclusion:
      "Montagefehler im Ansaugsystem können den Luftmassenwert verfälschen.",
    firstCheck:
      "Luftfilterkasten, Dichtungen, Ansaugschläuche und Sensorlage sichtprüfen.",
    confirmationCheck:
      "Luftmasse bei Leerlauf und Last nach korrekter Montage mit Sollwertbereich vergleichen.",
    documentation:
      "Montagebefund, Luftmasse, Fehlercode und Reparaturmaßnahme dokumentieren.",
    trap:
      "Nach jedem Luftmassenfehler muss der Sensor ersetzt werden.",
    unsafe:
      "Ohne Luftfilter Probefahrt durchführen, um mehr Luftmasse zu erzeugen.",
    unrelated:
      "Die Achsvermessung beeinflusst die Dichtung des Luftfilterkastens.",
    finalCheck:
      "Luftmasse, Dichtheit und Fehlerspeicher nach korrekter Montage prüfen.",
    explanation:
      "Nebenluft hinter dem Luftmassenmesser macht die gemessene Luftmasse unplausibel.",
  },
  {
    area: "Diagnosestrategie",
    system: "Teiletausch auf Verdacht",
    symptom:
      "Mehrere Werkstätten haben Sensoren ersetzt, der Fehler tritt weiter sporadisch auf.",
    measured:
      "Fehler tritt nur bei Vibration auf, Wackeltest am Kabelbaum reproduziert ihn.",
    correctConclusion:
      "Die Befundkette spricht für Kontakt- oder Leitungsfehler statt für weitere Sensoren auf Verdacht.",
    firstCheck:
      "Kabelbaum, Steckkontakte, Zugentlastung und Massepunkte unter Reproduktion prüfen.",
    confirmationCheck:
      "Signal während Wackeltest aufzeichnen und Leitung abschnittsweise prüfen.",
    documentation:
      "Reproduktionsbedingung, Signalabbruch, betroffener Leitungsabschnitt und Reparatur dokumentieren.",
    trap:
      "Wenn ein Sensor schon ersetzt wurde, muss als Nächstes das Steuergerät ersetzt werden.",
    unsafe:
      "Kabelbaum ohne Schaltplan aufschneiden und Leitungen beliebig verbinden.",
    unrelated:
      "Der Kühlmittel-Frostschutzwert verursacht Vibrationsaussetzer im Kabelbaum.",
    finalCheck:
      "Wackeltest, Probefahrt und Fehlerspeicher nach Leitungsreparatur prüfen.",
    explanation:
      "Sporadische, vibrationsabhängige Fehler entstehen häufig durch Kontakt- und Leitungsprobleme.",
    points: 10,
  },
  {
    area: "Kundenauftrag",
    system: "Kostenvoranschlag Diagnose",
    symptom:
      "Der Kunde möchte sofort einen Preis, die Ursache ist aber noch nicht sicher.",
    measured:
      "Erste Messwerte zeigen mehrere mögliche Fehlerpfade.",
    correctConclusion:
      "Es ist fachlich sauber, Diagnosezeit, nächste Prüfschritte und mögliche Kosten transparent zu erklären.",
    firstCheck:
      "Bisherige Befunde und sinnvolle nächste Prüfschritte verständlich zusammenfassen.",
    confirmationCheck:
      "Freigabe für Diagnoseumfang einholen und Abbruchpunkt bei neuen Befunden festlegen.",
    documentation:
      "Kundenfreigabe, Diagnoseumfang, bekannte Risiken und Zwischenergebnisse dokumentieren.",
    trap:
      "Um Vertrauen zu schaffen, sollte immer sofort ein sicherer Endpreis genannt werden.",
    unsafe:
      "Ohne Kundenfreigabe teure Bauteile ersetzen.",
    unrelated:
      "Die Farbe des Auftragszettels bestimmt den Reparaturpreis.",
    finalCheck:
      "Nach Diagnose Befund, Empfehlung und Kosten transparent mit dem Kunden abstimmen.",
    explanation:
      "Bei komplexen Fehlern schützt transparente Diagnosekommunikation Kunde und Werkstatt.",
  },
  {
    area: "Emissionsdiagnose",
    system: "Readiness und OBD-Monitore",
    symptom:
      "Nach Löschen des Fehlerspeichers besteht das Fahrzeug die OBD-Prüfung nicht.",
    measured:
      "Mehrere Monitore sind nicht abgeschlossen.",
    correctConclusion:
      "Nach dem Löschen müssen Fahrzyklen und Monitorbedingungen erfüllt werden.",
    firstCheck:
      "Readiness-Status vor und nach Reparatur prüfen und nicht unnötig löschen.",
    confirmationCheck:
      "Passenden Fahrzyklus nach Herstellervorgabe durchführen.",
    documentation:
      "Readiness-Status, gelöschte Fehler, Fahrzyklus und Monitorabschluss dokumentieren.",
    trap:
      "Fehlerspeicher löschen setzt alle Monitore automatisch auf bestanden.",
    unsafe:
      "OBD-Prüfung mit nicht abgeschlossenen emissionsrelevanten Monitoren als bestanden dokumentieren.",
    unrelated:
      "Die Sitzposition beeinflusst den Katalysatormonitor.",
    finalCheck:
      "Readiness und emissionsrelevante Fehlerspeicher nach Fahrzyklus kontrollieren.",
    explanation:
      "OBD-Monitore benötigen definierte Bedingungen. Löschen macht sie meist zunächst unvollständig.",
  },
];

const additionalQuestionsPerPart = 150;

export const ADVANCED_TEIL_1_QUESTIONS = buildAdvancedQuestions(
  "teil-1",
  "t1",
  teil1Seeds,
).slice(0, additionalQuestionsPerPart);

export const ADVANCED_TEIL_2_QUESTIONS = buildAdvancedQuestions(
  "teil-2",
  "t2",
  teil2Seeds,
).slice(0, additionalQuestionsPerPart);
