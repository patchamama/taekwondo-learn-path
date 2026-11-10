import type { Loc } from '../shared/i18n/types'

const L = (en: string, de: string, es: string): Loc => ({ en, de, es })
const same = (v: string): Loc => L(v, v, v)

export interface Row {
  label: Loc
  value: Loc
}
export interface RuleSection {
  id: string
  title: Loc
  bullets?: Loc[]
  rows?: Row[]
}

const months = (n: number): Loc => L(`${n} months`, `${n} Monate`, `${n} meses`)
const years = (n: number): Loc => L(`${n} years`, `${n} Jahre`, `${n} años`)
const row = (label: string, value: Loc): Row => ({ label: same(label), value })

// Source: Pruefungsregularien (Regularien PDF, 1st edition 2024), sections 1.1-1.14.
export const EXAM_RULES: RuleSection[] = [
  {
    id: 'general',
    title: L('General rules', 'Allgemeines', 'Reglas generales'),
    bullets: [
      L(
        'From 8th Kup on, the previous programme is required and can be asked again in every later exam.',
        'Ab dem 8. Kup wird das vorhergehende Programm vorausgesetzt und kann bei jeder folgenden Prüfung abverlangt werden.',
        'Desde el 8.º Kup se exige el programa anterior, y puede volver a pedirse en cada examen posterior.',
      ),
      L(
        'Dress: dobok (trousers ha-i, jacket sang-i) and the belt of your current grade. The exam is barefoot and without jewellery.',
        'Kleidung: Dobok (Hose ha-i, Jacke sang-i) und Gürtel (ty) der aktuellen Graduierung. Die Prüfung ist barfuß und ohne Schmuck.',
        'Vestimenta: dobok (pantalón ha-i, chaqueta sang-i) y el cinturón de tu grado actual. El examen es descalzo y sin joyas.',
      ),
      L(
        'Register with the master (or via a trainer) at the latest two weeks before the exam; the fee is paid at the latest on exam day.',
        'Anmeldung beim Meister (ggf. über einen Übungsleiter) spätestens zwei Wochen vor dem Termin; die Gebühr ist spätestens am Prüfungstag zu entrichten.',
        'Inscripción con el maestro (o mediante un entrenador) como máximo dos semanas antes; la tasa se paga como muy tarde el día del examen.',
      ),
      L(
        'Skipping a grade is normally only allowed from 10th Kup to 8th Kup. There is no exam programme for 10th Kup.',
        'Das Überspringen einer Graduierung ist im Regelfall nur vom 10. auf den 8. Kup zulässig. Für den 10. Kup gibt es kein Prüfungsprogramm.',
        'Saltarse un grado normalmente solo es posible del 10.º al 8.º Kup. No hay programa de examen para el 10.º Kup.',
      ),
      L(
        'Modern and traditional execution are both accepted, but do not mix styles: stay consistent.',
        'Moderne und traditionelle Ausführungen werden akzeptiert; die Stile sollen nicht vermischt werden.',
        'Se aceptan ejecuciones modernas y tradicionales, pero sin mezclar estilos: sé coherente.',
      ),
      L(
        'Under 13: no stick or knife work in ho-sin-sul. Over 40: after agreement, an extended ho-sin-sul can replace kyorugi.',
        'Unter 13 Jahren: keine Stock-/Messerübungen im ho-sin-sul. Über 40: nach Absprache kann ein verstärktes ho-sin-sul das kyorugi ersetzen.',
        'Menores de 13: sin ejercicios con palo ni cuchillo en ho-sin-sul. Mayores de 40: previo acuerdo, un ho-sin-sul reforzado puede sustituir al kyorugi.',
      ),
    ],
  },
  {
    id: 'disciplines',
    title: L(
      'The eight exam disciplines',
      'Die acht Prüfungsdisziplinen',
      'Las ocho disciplinas del examen',
    ),
    rows: [
      row(
        'gibon donjak (kwon-sul, tae-sul)',
        L(
          'Basic techniques, including the previous programme',
          'Grundtechniken inkl. Vorprogramm',
          'Técnicas básicas, incluido el programa anterior',
        ),
      ),
      row('nak-bop', L('Breakfalls', 'Fallschule', 'Caídas')),
      row('tul (hyong / poomse)', L('Forms', 'Formen', 'Formas')),
      row(
        'taeryon',
        L(
          'Partner drills: sambo- (3-step), ibo- (2-step), ilbo-taeryon (1-step)',
          'Partnerübungen: sambo- (3 Schritte), ibo- (2), ilbo-taeryon (1)',
          'Ejercicios con compañero: sambo- (3 pasos), ibo- (2), ilbo-taeryon (1)',
        ),
      ),
      row('kyorugi', L('Sparring', 'Wettkampf', 'Combate')),
      row('ho-sin-sul', L('Self-defence', 'Selbstverteidigung', 'Defensa personal')),
      row(
        'kyekpa',
        L(
          'Board breaking (from 4th Kup)',
          'Bruchtest (ab dem 4. Kup)',
          'Rotura de tablas (desde el 4.º Kup)',
        ),
      ),
      row(
        'ilon',
        L(
          'Theory (up to 1st Dan; usually none from 2nd Dan)',
          'Theorie (bis 1. Dan; ab 2. Dan in der Regel nicht mehr)',
          'Teoría (hasta 1.er Dan; desde 2.º Dan normalmente ya no)',
        ),
      ),
    ],
    bullets: [
      L(
        'The warm-up is usually led by the examinee with the highest grade and counts in the overall mark.',
        'Die Erwärmung wird im Regelfall vom Prüfling mit der höchsten Graduierung angeleitet und fließt in die Bewertung ein.',
        'El calentamiento suele dirigirlo quien tiene el grado más alto y cuenta en la nota global.',
      ),
    ],
  },
  {
    id: 'scoring',
    title: L('Scoring', 'Bewertung', 'Puntuación'),
    bullets: [
      L(
        'Each practical discipline is scored from 0.0 to 6.0 by every examiner. A mark of 0.0-1.9 in any discipline cannot be compensated and ends the exam.',
        'Jede praktische Disziplin wird von jedem Prüfer mit 0,0 bis 6,0 Punkten bewertet. Eine Wertung von 0,0-1,9 kann nicht ausgeglichen werden und beendet die Prüfung.',
        'Cada disciplina práctica se puntúa de 0,0 a 6,0 por cada examinador. Una nota de 0,0-1,9 no se compensa y termina el examen.',
      ),
      L(
        'To pass you need 4.0 on average: with 8 disciplines that is at least 32 points per examiner (64 with two examiners).',
        'Zum Bestehen sind im Schnitt 4,0 nötig: bei 8 Disziplinen mindestens 32 Punkte je Prüfer (64 bei zwei Prüfern).',
        'Para aprobar hace falta una media de 4,0: con 8 disciplinas, al menos 32 puntos por examinador (64 con dos).',
      ),
    ],
    rows: [
      row(
        '0.0 – 1.9',
        L(
          'Does not meet the requirements in any way',
          'Entspricht in keiner Weise den Anforderungen',
          'No cumple los requisitos en absoluto',
        ),
      ),
      row(
        '2.0 – 2.9',
        L(
          'Clearly below the requirements',
          'Liegt deutlich unter den Anforderungen',
          'Claramente por debajo de lo exigido',
        ),
      ),
      row(
        '3.0 – 3.9',
        L('Below the requirements', 'Liegt unter den Anforderungen', 'Por debajo de lo exigido'),
      ),
      row(
        '4.0 – 4.5',
        L('Meets the requirements', 'Entspricht den Anforderungen', 'Cumple lo exigido'),
      ),
      row(
        '4.6 – 5.0',
        L('Exceeds the requirements', 'Übertrifft die Anforderungen', 'Supera lo exigido'),
      ),
      row(
        '5.1 – 5.5',
        L(
          'Clearly exceeds the requirements',
          'Übertrifft die Anforderungen deutlich',
          'Supera claramente lo exigido',
        ),
      ),
      row(
        '5.6 – 6.0',
        L(
          'Exceeds them to a special degree',
          'Übertrifft die Anforderungen in besonderem Maße',
          'Supera lo exigido de forma excepcional',
        ),
      ),
    ],
  },
  {
    id: 'forms',
    title: L(
      'Forms: deductions and repeats',
      'Formen: Abzüge und Wiederholung',
      'Formas: descuentos y repetición',
    ),
    bullets: [
      L(
        'Three forms are shown: the exam form(s), one of your choice, one chosen by the examiner, plus the forms of the other system from 2nd Kup on. Up to 9th-8th Kup the four-direction drills are required.',
        'Gezeigt werden drei Formen: Prüfungsform(en), eine nach Wahl des Prüflings, eine nach Wahl des Prüfers; ab dem 2. Kup zusätzlich Formen des anderen Systems. Beim 9.-8. Kup werden die Vierseitenübungen verlangt.',
        'Se muestran tres formas: la(s) del examen, una a tu elección y una elegida por el examinador; desde el 2.º Kup, además, formas del otro sistema. En 9.º-8.º Kup se piden los ejercicios en cuatro direcciones.',
      ),
      L(
        'A form may be repeated once on request after an interruption or error; the better run counts.',
        'Eine Form darf bei Abbruch oder Fehler auf Wunsch einmal wiederholt werden; der bessere Lauf zählt.',
        'Una forma puede repetirse una vez, a petición, tras una interrupción o error; cuenta la mejor ejecución.',
      ),
    ],
    rows: [
      row(
        '0.1 – 0.2',
        L(
          'Short hesitation quickly fixed; other slight error',
          'Kurzes, schnell behobenes Zögern; sonstiger leichter Fehler',
          'Duda breve resuelta rápido; otro fallo leve',
        ),
      ),
      row(
        '0.1 – 0.3',
        L(
          'Loss of balance; leaving the diagram; not reaching the start point (more than 50 cm)',
          'Gleichgewichtsverlust; Abweichen vom Diagramm; Startpunkt verfehlt (mehr als 50 cm)',
          'Pérdida de equilibrio; salirse del diagrama; no volver al punto de inicio (más de 50 cm)',
        ),
      ),
      row(
        '0.3 – 0.4',
        L(
          'Short interruption of the sequence; other medium error',
          'Kurze Unterbrechung des Ablaufs; sonstiger mittlerer Fehler',
          'Interrupción breve de la secuencia; otro fallo medio',
        ),
      ),
      row(
        '0.5 – 0.8',
        L(
          'Clear interruption of the sequence',
          'Deutliche Unterbrechung des Ablaufs',
          'Interrupción clara de la secuencia',
        ),
      ),
      row(
        '0.9 – 1.5',
        L(
          'Stopping in the second half of the form',
          'Abbruch in der zweiten Hälfte der Form',
          'Parar en la segunda mitad de la forma',
        ),
      ),
      row(
        'from 1.6',
        L(
          'Stopping in the first half of the form',
          'Abbruch in der ersten Hälfte der Form',
          'Parar en la primera mitad de la forma',
        ),
      ),
    ],
  },
  {
    id: 'breaking',
    title: L('Board breaking (kyekpa)', 'Bruchtest (kyekpa)', 'Rotura de tablas (kyekpa)'),
    bullets: [
      L(
        'Spruce boards of about 30 x 30 cm. No board breaking for children and teenagers under 14. From 40 years and 2nd Dan the jump technique can be replaced by a break without a jump.',
        'Fichtenbretter von ca. 30 x 30 cm. Kein Bruchtest bei Kindern und Jugendlichen unter 14 Jahren. Ab 40 Jahren und 2. Dan kann die Sprungtechnik durch einen Bruchtest ohne Sprung ersetzt werden.',
        'Tablas de abeto de unos 30 x 30 cm. Sin rotura para menores de 14. Desde los 40 años y el 2.º Dan, la técnica con salto puede cambiarse por una rotura sin salto.',
      ),
      L(
        'If the board does not break the maximum is 3.9 points, unless the technique was correct and a thicker board or a very hard technique was used (then 4.0). A broken board scores 4.0-6.0 depending on difficulty, execution and behaviour. One repeat is allowed; the better attempt counts.',
        'Bricht das Brett nicht, gibt es maximal 3,9 Punkte, außer die Technik war korrekt und es wurde ein stärkeres Brett oder eine sehr schwierige Technik gewählt (dann 4,0). Ein gebrochenes Brett wird mit 4,0-6,0 bewertet. Ein weiterer Versuch ist erlaubt; der bessere zählt.',
        'Si la tabla no se rompe, máximo 3,9 puntos, salvo que la técnica fuera correcta y se usara una tabla más gruesa o una técnica muy difícil (entonces 4,0). Una tabla rota puntúa 4,0-6,0. Se permite repetir una vez; cuenta el mejor intento.',
      ),
    ],
    rows: [
      row('2.5 cm', L('Men 18-40 years', 'Männer 18-40 Jahre', 'Hombres de 18 a 40 años')),
      row('2.0 cm', L('Women 18-40 years', 'Frauen 18-40 Jahre', 'Mujeres de 18 a 40 años')),
      row(
        '1.5 cm',
        L(
          'Teenagers 16-17 years and people over 40',
          'Jugendliche 16-17 Jahre und Personen über 40',
          'Jóvenes de 16 a 17 años y mayores de 40',
        ),
      ),
      row(
        '1.0 cm',
        L(
          'Children and teenagers 14-15 years',
          'Kinder und Jugendliche 14-15 Jahre',
          'Niños y jóvenes de 14 a 15 años',
        ),
      ),
    ],
  },
  {
    id: 'stepsparring',
    title: L(
      'Step sparring / self-defence: number of techniques (up to 3rd Kup)',
      'Schrittkampf / Selbstverteidigung: Anzahl Techniken (bis 3. Kup)',
      'Combate a pasos / defensa personal: número de técnicas (hasta 3.er Kup)',
    ),
    rows: [
      row(
        '≤ 10',
        L(
          '4 techniques (up to the completed 10th year)',
          '4 Techniken (bis zum vollendeten 10. Lebensjahr)',
          '4 técnicas (hasta cumplir los 10 años)',
        ),
      ),
      row(
        '10 – 14',
        L(
          '6 techniques (up to the completed 14th year)',
          '6 Techniken (bis zum vollendeten 14. Lebensjahr)',
          '6 técnicas (hasta cumplir los 14 años)',
        ),
      ),
      row('≥ 14', L('8 techniques', '8 Techniken', '8 técnicas')),
    ],
  },
  {
    id: 'sparring-gear',
    title: L('Sparring equipment', 'Ausrüstung beim Freikampf', 'Equipo de combate'),
    bullets: [
      L(
        'Head guard, vest, groin guard, forearm guards and shin guards; optional: mouth guard and chest guard.',
        'Kopfschutz, Weste, Tiefschutz, Unterarmschutz, Schienbeinschutz; optional: Mundschutz, Brustschutz.',
        'Protector de cabeza, peto, coquilla, protectores de antebrazo y de espinilla; opcional: protector bucal y de pecho.',
      ),
    ],
  },
  {
    id: 'result',
    title: L(
      'Result, repeat and appeals',
      'Ergebnis, Wiederholung und Einspruch',
      'Resultado, repetición y recurso',
    ),
    bullets: [
      L(
        'The marks are final. An objection is only possible against a formal error and must be filed in writing within two weeks; video recordings are not accepted as evidence.',
        'Die Bewertung ist endgültig. Einspruch ist nur gegen formelle Fehler möglich, schriftlich binnen zwei Wochen; Videoaufnahmen sind kein Beweismittel.',
        'La nota es definitiva. Solo cabe recurso por un error formal, por escrito en dos semanas; las grabaciones de vídeo no valen como prueba.',
      ),
      L(
        'A failed Kup exam can be repeated after three weeks at the earliest and within twelve weeks at the latest; a failed Dan exam after three months at the earliest and within twelve months.',
        'Eine nicht bestandene Kup-Prüfung frühestens nach drei Wochen, spätestens innerhalb von zwölf Wochen wiederholen; eine Dan-Prüfung frühestens nach drei Monaten, spätestens innerhalb von zwölf Monaten.',
        'Un examen de Kup suspendido se repite como pronto a las tres semanas y como tarde en doce; uno de Dan, como pronto a los tres meses y como tarde en doce.',
      ),
      L(
        'Sanctions for bad behaviour: warning, deduction from the bonus mark, exclusion from the exam.',
        'Sanktionen bei Fehlverhalten: Ermahnung, Punkteabzug (Bonusnote), Ausschluss von der Prüfung.',
        'Sanciones por mala conducta: amonestación, descuento en la nota de bonus, exclusión del examen.',
      ),
    ],
  },
  {
    id: 'recognition',
    title: L(
      'Recognition of grades and Poom',
      'Anerkennung von Graduierungen und Poom',
      'Reconocimiento de grados y Poom',
    ),
    bullets: [
      L(
        'Kup grades from other clubs are checked by the masters in training and confirmed with a certificate. Poom/Dan grades of Kukkiwon, ITF and WT member federations can be recognised without a technical check when proven by a certificate.',
        'Kup-Grade anderer Vereine werden von den Meistern im Training überprüft und beurkundet. Poom-/Dan-Grade von Kukkiwon, ITF und WT-Verbänden können mit Urkunde ohne technische Überprüfung anerkannt werden.',
        'Los Kup de otros clubes los comprueban los maestros en el entrenamiento y se certifican. Los Poom/Dan de Kukkiwon, ITF y federaciones de la WT se reconocen con certificado sin revisión técnica.',
      ),
      L(
        'Poom (young master) is worn until the 14th birthday with the red-black belt; at 18 it is converted to 1st Dan without a further check.',
        'Poom (jugendlicher Meister) bis zum vollendeten 14. Lebensjahr mit rot-schwarzem Gürtel; mit 18 wird der Poom ohne weitere Überprüfung zum 1. Dan umgeschrieben.',
        'El Poom (maestro joven) se lleva hasta los 14 años con cinturón rojo-negro; a los 18 se convierte en 1.er Dan sin más comprobación.',
      ),
      L(
        'From 4th Dan the exam focuses on teaching ability: explaining the techniques.',
        'Ab dem 4. Dan liegt der Schwerpunkt auf der Lehrqualifikation: die Techniken erklären können.',
        'Desde el 4.º Dan el examen se centra en la capacidad de enseñar: saber explicar las técnicas.',
      ),
    ],
  },
  {
    id: 'waiting',
    title: L(
      'Minimum preparation time',
      'Minimale Vorbereitungszeit',
      'Tiempo mínimo de preparación',
    ),
    rows: [
      row('9 Kup', months(3)),
      row('8 Kup', months(3)),
      row('7 Kup', months(3)),
      row('6 Kup', months(4)),
      row('5 Kup', months(4)),
      row('4 Kup', months(4)),
      row('3 Kup', months(6)),
      row('2 Kup', months(6)),
      row('1 Kup', months(6)),
      row('1 Dan (Cho-Dan)', years(1)),
      row('2 Dan (Eh-Dan)', years(2)),
      row('3 Dan (Sam-Dan)', years(3)),
      row('4 Dan (Sa-Dan)', years(4)),
      row('5 Dan (Oh-Dan)', years(5)),
      row('6 Dan (Yuk-Dan)', years(6)),
    ],
    bullets: [
      L(
        'The date counts from the last exam. Training camps, hosting camps and leading sessions can shorten it (up to 1 week for 10-7 Kup, 2 weeks for 6-4 Kup, 4 weeks for 3-1 Kup), but only with a practical check.',
        'Stichtag ist die letzte Prüfung. Trainingslager, Ausrichten von Lehrgängen und Leiten von Training können die Zeit verkürzen (bis 1 Woche bei 10.-7. Kup, 2 Wochen bei 6.-4. Kup, 4 Wochen bei 3.-1. Kup), aber nur mit praktischer Überprüfung.',
        'Se cuenta desde el último examen. Campamentos, organizar cursos y dirigir clases pueden acortarlo (hasta 1 semana en 10.º-7.º Kup, 2 en 6.º-4.º, 4 en 3.º-1.º), pero solo con una comprobación práctica.',
      ),
    ],
  },
  {
    id: 'age',
    title: L(
      'Minimum age for Dan grades',
      'Mindestalter für Dan-Grade',
      'Edad mínima para los grados Dan',
    ),
    rows: [
      row('1 Dan', years(15)),
      row('2 Dan', years(16)),
      row('3 Dan', years(18)),
      row('4 Dan', years(21)),
      row('5 Dan', years(25)),
      row('6 Dan', years(30)),
      row('7 Dan', years(36)),
      row('8 Dan', years(44)),
      row('9 Dan', years(53)),
    ],
  },
]
