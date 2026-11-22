import type { Loc } from '../../shared/i18n/types'

const L = (en: string, de: string, es: string): Loc => ({ en, de, es })

export interface Event {
  year: string
  text: Loc
  source: 'pdf' | 'general'
}

// Baseline: Korea PDF §5.3, §5.8; reconciled history: docs/curriculum/epub-history.md.
// `pdf` retains club material; `general` marks editorial/source-reconciled entries,
// not a claim that an EPUB or institutional source is part of the club PDF.
export const TIMELINE: Event[] = [
  {
    year: '2333 BC',
    source: 'general',
    text: L(
      'Korean foundation myth: tradition dates Tangun (Dangun) and the founding of Gojoseon to 2333 BC, not a documented event or a date for Taekwondo.',
      'Koreanischer Gründungsmythos: Die Überlieferung datiert Tangun (Dangun) und die Gründung Gojoseons auf 2333 v. Chr.; kein belegtes Ereignis und kein Datum für Taekwondo.',
      'Mito fundacional coreano: la tradición sitúa a Tangun (Dangun) y la fundación de Gojoseon en 2333 a. C.; no es un hecho documentado ni una fecha del Taekwondo.',
    ),
  },
  {
    year: '57 BC – 668',
    source: 'pdf',
    text: L(
      'Three Kingdoms: Koguryo, Paekche and Silla. Buddhism arrives under King Sosurim.',
      'Drei Reiche: Koguryo, Paekche und Silla. Unter König Sosurim kommt der Buddhismus.',
      'Tres Reinos: Koguryo, Paekche y Silla. El budismo llega con el rey Sosurim.',
    ),
  },
  {
    year: '668 – 935',
    source: 'general',
    text: L(
      'Unified Silla begins under King Munmu. The Hwarang inspire the modern Chang-Hon form Hwa-Rang; this cultural reference does not prove an uninterrupted Taekwondo lineage.',
      'Unter König Munmu beginnt das vereinte Silla. Die Hwarang inspirieren die moderne Chang-Hon-Form Hwa-Rang; dieser Kulturbezug belegt keine ununterbrochene Taekwondo-Traditionslinie.',
      'Con el rey Munmu comienza Silla unificada. Los Hwarang inspiran la forma moderna Chang-Hon Hwa-Rang; esta referencia cultural no demuestra un linaje ininterrumpido del Taekwondo.',
    ),
  },
  {
    year: '918 – 1392',
    source: 'pdf',
    text: L(
      'Koryo dynasty: the origin of the name "Korea" and of the form Koryo.',
      'Koryo-Dynastie: Ursprung des Namens „Korea“ und der Form Koryo.',
      'Dinastía Koryo: origen del nombre «Corea» y de la forma Koryo.',
    ),
  },
  {
    year: '1392 – 1910',
    source: 'general',
    text: L(
      'Yi Songgye (Taejo) founds Joseon in 1392. Dynastic rule ends in 1910; the state is called the Korean Empire from 1897.',
      'Yi Songgye (Taejo) gründet 1392 Joseon. Die Dynastie herrscht bis 1910; ab 1897 heißt der Staat Kaiserreich Korea.',
      'Yi Songgye (Taejo) funda Joseon en 1392. El gobierno dinástico termina en 1910; desde 1897 el Estado se llama Imperio de Corea.',
    ),
  },
  {
    year: '1910 – 1945',
    source: 'general',
    text: L(
      'Japan annexes Korea in 1910 after earlier imperial pressure. Colonial rule ends in 1945. Karate training influences many founders of the later Korean kwans (schools).',
      'Japan annektiert Korea 1910 nach früherem imperialem Druck. Die Kolonialherrschaft endet 1945. Karate prägt die Ausbildung vieler Gründer der späteren koreanischen Kwans (Schulen).',
      'Japón anexiona Corea en 1910 tras presiones imperiales anteriores. El dominio colonial termina en 1945. El karate influye en la formación de muchos fundadores de los posteriores kwans (escuelas) coreanos.',
    ),
  },
  {
    year: '1945',
    source: 'general',
    text: L(
      'Korea is divided into Soviet and American zones. Modern Taekwondo develops through several kwans and instructors from the 1940s onward, not through one universally agreed sole founder.',
      'Korea wird in eine sowjetische und eine amerikanische Zone geteilt. Modernes Taekwondo entsteht ab den 1940er-Jahren durch mehrere Kwans und Lehrer, nicht durch einen allgemein anerkannten alleinigen Gründer.',
      'Corea se divide en zonas soviética y estadounidense. El Taekwondo moderno se desarrolla desde los años cuarenta mediante varios kwans e instructores, sin consenso sobre un único fundador.',
    ),
  },
  {
    year: '1950 – 1953',
    source: 'pdf',
    text: L(
      'Korean War; armistice of Panmunjom on 27 July 1953.',
      'Koreakrieg; Waffenstillstand von Panmunjom am 27.07.1953.',
      'Guerra de Corea; armisticio de Panmunjom el 27-07-1953.',
    ),
  },
  {
    year: '1955',
    source: 'general',
    text: L(
      'Choi Hong Hi promotes the name "Taekwondo", associated with the 1955 naming proposal. Acceptance among schools is gradual, not immediate or unanimous.',
      'Choi Hong Hi fördert den Namen „Taekwondo“, verbunden mit dem Namensvorschlag von 1955. Die Schulen übernehmen ihn schrittweise, nicht sofort oder einstimmig.',
      'Choi Hong Hi impulsa el nombre «Taekwondo», asociado a la propuesta de 1955. Su aceptación entre las escuelas es gradual, no inmediata ni unánime.',
    ),
  },
  {
    year: '1959',
    source: 'pdf',
    text: L(
      'Choi Hong Hi tours the Far East with a 19-person demonstration team.',
      'Choi Hong Hi bereist mit einem 19-köpfigen Demonstrationsteam den Fernen Osten.',
      'Choi Hong Hi recorre el Lejano Oriente con un equipo de demostración de 19 personas.',
    ),
  },
  {
    year: '22 Mar 1966',
    source: 'pdf',
    text: L(
      'The ITF (International Taekwon-Do Federation) is founded in Seoul.',
      'Die ITF (International Taekwon-Do Federation) wird in Seoul gegründet.',
      'Se funda en Seúl la ITF (International Taekwon-Do Federation).',
    ),
  },
  {
    year: '1960s – 1970s',
    source: 'general',
    text: L(
      'Committees develop Palgwae, Taegeuk and black-belt poomsae. Taegeuk belongs to the Kukkiwon curriculum, distinct from Choi’s Chang-Hon Hyong / Tul; exact development dates vary by source.',
      'Komitees entwickeln Palgwae, Taegeuk und Schwarzgurt-Poomsae. Taegeuk gehört zum Kukkiwon-Lehrplan und ist von Chois Chang-Hon Hyong / Tul zu unterscheiden; genaue Entstehungsdaten variieren je nach Quelle.',
      'Comités desarrollan Palgwae, Taegeuk y poomsae de cinturón negro. Taegeuk pertenece al programa Kukkiwon y se distingue de los Hyong / Tul Chang-Hon de Choi; las fechas exactas varían según la fuente.',
    ),
  },
  {
    year: '1972',
    source: 'general',
    text: L(
      'Choi moves to Canada and the ITF headquarters moves from Seoul to Toronto. This is a headquarters move, not the founding of the ITF.',
      'Choi zieht nach Kanada; der ITF-Hauptsitz wechselt von Seoul nach Toronto. Dies ist ein Umzug des Hauptsitzes, nicht die Gründung der ITF.',
      'Choi se traslada a Canadá y la sede de la ITF pasa de Seúl a Toronto. Es un traslado de sede, no la fundación de la ITF.',
    ),
  },
  {
    year: '30 Nov 1972',
    source: 'general',
    text: L(
      'Kukkiwon is founded in Seoul: a central institution for Taekwondo education and Dan / Poom certification, distinct from the international sport federation.',
      'Kukkiwon wird in Seoul gegründet: eine zentrale Institution für Taekwondo-Ausbildung und Dan-/Poom-Zertifizierung, getrennt vom internationalen Sportverband.',
      'Se funda Kukkiwon en Seúl: una institución central de enseñanza y certificación Dan / Poom, distinta de la federación deportiva internacional.',
    ),
  },
  {
    year: '28 May 1973',
    source: 'general',
    text: L(
      'The World Taekwondo Federation (WTF, renamed World Taekwondo in 2017) is founded in Seoul as the international sport federation.',
      'Die World Taekwondo Federation (WTF, seit 2017 World Taekwondo) wird in Seoul als internationaler Sportverband gegründet.',
      'Se funda en Seúl la World Taekwondo Federation (WTF, llamada World Taekwondo desde 2017), la federación deportiva internacional.',
    ),
  },
  {
    year: '1988',
    source: 'pdf',
    text: L(
      'Olympic Games in Seoul (17 Sept – 2 Oct).',
      'Olympische Spiele in Seoul (17.09.–02.10.).',
      'Juegos Olímpicos de Seúl (17 sept – 2 oct).',
    ),
  },
]

// Original reading notes from Sharp, chapter 1; claim-level treatment is in the ledger.
// Kept outside Event so book narratives cannot become dated quiz facts implicitly.
export const HISTORY_READING_TITLE = L(
  'Beyond the dates', 'Hinter den Jahreszahlen', 'Más allá de las fechas',
)
export const HISTORY_READING_SOURCE = L(
  'Reading source: Clint Sharp, Taekwondo: A Comprehensive Guide…, chapter 1 (OEBPS/c2A.xhtml). Original summaries with qualifications, not independently verified primary history. Book rights remain with the owner; no CC license is asserted.',
  'Lektürequelle: Clint Sharp, Taekwondo: A Comprehensive Guide…, Kapitel 1 (OEBPS/c2A.xhtml). Eigene Zusammenfassungen mit Einordnungen, keine unabhängig geprüfte Primärgeschichte. Die Buchrechte verbleiben beim Rechteinhaber; keine CC-Lizenz wird behauptet.',
  'Fuente de lectura: Clint Sharp, Taekwondo: A Comprehensive Guide…, capítulo 1 (OEBPS/c2A.xhtml). Resúmenes originales con matices, no historia primaria verificada independientemente. Los derechos del libro siguen perteneciendo a su titular; no se afirma una licencia CC.',
)

export const HISTORY_CONTEXT: { id: string; title: Loc; paragraphs: Loc[] }[] = [
  {
    id: 'cultural-memory',
    title: L('Cultural memory, not a continuous syllabus', 'Kulturelle Erinnerung, kein durchgehender Lehrplan', 'Memoria cultural, no un programa ininterrumpido'),
    paragraphs: [
      L(
        'Sharp portrays Silla’s Hwarang education as a combination of physical training, weapons and ethical duties such as service and exemplary conduct. This helps explain why modern martial-arts narratives draw on them for ideals of character, not just fighting ability.',
        'Sharp beschreibt die Erziehung der Hwarang Sillas als Verbindung von körperlichem Training, Waffen und ethischen Pflichten wie Dienst und vorbildlichem Verhalten. Das erklärt, warum moderne Kampfkunsterzählungen sie als Vorbilder für Charakter und nicht nur für Kampfkraft heranziehen.',
        'Sharp presenta la educación de los Hwarang de Silla como una combinación de preparación física, armas y deberes éticos, como el servicio y la conducta ejemplar. Esto ayuda a entender por qué los relatos marciales modernos los usan como modelos de carácter, no solo de destreza en combate.',
      ),
      L(
        'The book also invokes Subak and Taekkyeon. Treat its ancient succession story as an origin narrative: shared values or an emphasis on kicking do not establish an unbroken technical lineage to today’s Taekwondo. Modern kwan development and karate influence require their own history.',
        'Das Buch beruft sich auch auf Subak und Taekkyeon. Seine antike Abfolge ist als Ursprungserzählung zu lesen: Gemeinsame Werte oder eine Betonung der Tritte belegen keine lückenlose technische Linie zum heutigen Taekwondo. Die moderne Kwan-Entwicklung und der Karate-Einfluss brauchen eine eigene Geschichte.',
        'El libro también recurre al Subak y al Taekkyeon. Su cadena de sucesión antigua debe leerse como un relato de origen: los valores compartidos o el énfasis en las patadas no prueban un linaje técnico ininterrumpido hasta el Taekwondo actual. El desarrollo moderno de los kwans y la influencia del karate tienen su propia historia.',
      ),
    ],
  },
  {
    id: 'kwans-and-identity',
    title: L('From kwans to a shared identity', 'Von Kwans zu einer gemeinsamen Identität', 'De los kwans a una identidad compartida'),
    paragraphs: [
      L(
        'Sharp describes postwar schools in Seoul with differing methods and teachers’ varied training backgrounds, including karate and Chinese martial arts. “Traditional Taekwondo” is therefore an umbrella label in this account, not the name of one unchanged ancient school.',
        'Sharp beschreibt Nachkriegsschulen in Seoul mit unterschiedlichen Methoden und Ausbildungshintergründen ihrer Lehrer, darunter Karate und chinesische Kampfkünste. „Traditionelles Taekwondo“ ist in dieser Darstellung ein Sammelbegriff, nicht der Name einer unveränderten antiken Schule.',
        'Sharp describe escuelas de posguerra en Seúl con métodos distintos y diversas formaciones de sus maestros, entre ellas karate y artes marciales chinas. En este relato, «Taekwondo tradicional» es una denominación colectiva, no el nombre de una única escuela antigua e inmutable.',
      ),
      L(
        'A common name and shared teaching standards were organizing projects, not proof that differences vanished. Read the book’s unification story alongside the timeline’s gradual acceptance of the name: multiple instructors and school traditions contributed, rather than one inventor replacing every other tradition.',
        'Ein gemeinsamer Name und gemeinsame Unterrichtsstandards waren organisatorische Vorhaben, kein Beweis für das Verschwinden aller Unterschiede. Die Einigungserzählung des Buches ist neben der schrittweisen Namensübernahme in der Zeittafel zu lesen: Mehrere Lehrer und Schultraditionen wirkten mit, nicht ein Erfinder, der alle anderen Traditionen ersetzte.',
        'Un nombre común y criterios compartidos de enseñanza eran proyectos organizativos, no pruebas de que desaparecieran las diferencias. El relato de unificación del libro debe leerse junto a la aceptación gradual del nombre en la cronología: contribuyeron múltiples instructores y tradiciones, no un inventor que sustituyera a todos los demás.',
      ),
    ],
  },
  {
    id: 'military-and-associations',
    title: L('Military training and teaching abroad', 'Militärische Ausbildung und Unterricht im Ausland', 'Instrucción militar y enseñanza en el extranjero'),
    paragraphs: [
      L(
        'In Sharp’s account, military instruction created demand for common training methods, while demonstrations and instructors sent abroad carried the art to new audiences. Choi’s organizing and promotional work belongs within this wider network of teachers; it does not make all their methods his invention.',
        'In Sharps Darstellung schuf der Militärunterricht Bedarf an gemeinsamen Trainingsmethoden; Vorführungen und ins Ausland entsandte Lehrer erschlossen neue Zielgruppen. Chois Organisations- und Werbearbeit gehört in dieses größere Lehrernetzwerk; sie macht nicht alle Methoden zu seiner Erfindung.',
        'En el relato de Sharp, la instrucción militar generó demanda de métodos comunes, mientras las exhibiciones y los instructores enviados al extranjero acercaron el arte a nuevos públicos. La labor organizativa y de difusión de Choi forma parte de esa red más amplia de maestros; no convierte todos sus métodos en invenciones suyas.',
      ),
      L(
        'The Korea Taekwondo Association (KTA) appears in the book as a vehicle for coordinating Korean schools. Keep national coordination separate from the ITF’s international organization, Kukkiwon’s education and certification, and WT’s international sport governance. These are different roles, not successive names for a single institution.',
        'Die Korea Taekwondo Association (KTA) erscheint im Buch als Mittel zur Koordination koreanischer Schulen. Nationale Koordination ist von der internationalen Organisation der ITF, Kukkiwons Ausbildung und Zertifizierung sowie der internationalen Sportverwaltung durch WT zu trennen. Das sind verschiedene Aufgaben, keine aufeinanderfolgenden Namen derselben Institution.',
        'La Korea Taekwondo Association (KTA) aparece en el libro como un medio para coordinar las escuelas coreanas. Hay que distinguir esa coordinación nacional de la organización internacional de la ITF, la enseñanza y certificación de Kukkiwon y la gestión deportiva internacional de WT. Son funciones distintas, no nombres sucesivos de una sola institución.',
      ),
    ],
  },
  {
    id: 'american-pioneers',
    title: L('More than one American pioneer', 'Mehr als ein amerikanischer Pionier', 'Más de un pionero en Estados Unidos'),
    paragraphs: [
      L(
        'Sharp highlights Jhoon Goo Rhee’s teaching in Washington, DC, and the reputation “Father of American Taekwondo,” but also acknowledges other pioneers. Such an honorific recognizes influence; it should not be read as proof that he alone introduced the art to an entire country.',
        'Sharp hebt Jhoon Goo Rhees Unterricht in Washington, DC, und den Ruf als „Vater des amerikanischen Taekwondo“ hervor, erwähnt aber auch andere Pioniere. Ein solcher Ehrentitel würdigt Einfluss; er beweist nicht, dass er die Kunst allein in ein ganzes Land brachte.',
        'Sharp destaca la enseñanza de Jhoon Goo Rhee en Washington, DC, y su reputación de «padre del Taekwondo estadounidense», pero reconoce también a otros pioneros. Ese título honorífico reconoce su influencia; no demuestra que él solo introdujera el arte en todo un país.',
      ),
      L(
        'The chapter also discusses the American Taekwondo Association (ATA) and its own forms tradition. Overseas expansion involved schools and organizations building distinct teaching communities, not just the spread of one competition rulebook. The book’s “first school” and organizational chronology claims are not adopted here.',
        'Das Kapitel behandelt auch die American Taekwondo Association (ATA) und ihre eigene Formentradition. Die Ausbreitung im Ausland umfasste Schulen und Organisationen mit eigenen Lehrgemeinschaften, nicht nur die Verbreitung eines Wettkampfregelwerks. Die Behauptungen des Buches zur „ersten Schule“ und zur Verbandschronologie werden hier nicht übernommen.',
        'El capítulo también trata la American Taekwondo Association (ATA) y su propia tradición de formas. La expansión internacional implicó escuelas y organizaciones que crearon comunidades de enseñanza distintas, no solo la difusión de un reglamento competitivo. Aquí no se adoptan las afirmaciones del libro sobre la «primera escuela» ni su cronología organizativa.',
      ),
    ],
  },
  {
    id: 'olympic-development',
    title: L('From demonstration to Olympic medals', 'Von der Vorführung zu olympischen Medaillen', 'De la exhibición a las medallas olímpicas'),
    paragraphs: [
      L(
        'Sharp’s Olympic account distinguishes demonstration appearances in 1988 and 1992 from medal-sport participation in 2000 in Sydney. These book-reported milestones describe sport recognition, not the beginning of Taekwondo or a replacement of its other teaching traditions; they are not new independently verified timeline entries.',
        'Sharps olympische Darstellung unterscheidet Vorführungen 1988 und 1992 von der Teilnahme als Medaillensportart 2000 in Sydney. Diese im Buch genannten Stationen betreffen die sportliche Anerkennung, nicht den Beginn des Taekwondo oder die Ablösung anderer Lehrtraditionen; sie sind keine neuen unabhängig geprüften Zeittafeleinträge.',
        'El relato olímpico de Sharp distingue las exhibiciones de 1988 y 1992 de la participación como deporte de medallas en 2000 en Sydney. Estos hitos, según el libro, describen el reconocimiento deportivo, no el inicio del Taekwondo ni la sustitución de sus otras tradiciones de enseñanza; no son nuevas entradas de cronología verificadas independientemente.',
      ),
      L(
        'The chapter contrasts sporting emphasis with other training aims, while acknowledging traditional elements in sport-oriented schools. Avoid turning this into “WT is only sport, ITF is only self-defense”: an organization’s competition rules do not describe everything that an individual dojang teaches.',
        'Das Kapitel stellt den sportlichen Schwerpunkt anderen Trainingszielen gegenüber und erkennt zugleich traditionelle Elemente in sportorientierten Schulen an. Daraus sollte nicht „WT ist nur Sport, ITF nur Selbstverteidigung“ werden: Wettkampfregeln eines Verbands beschreiben nicht alles, was ein einzelner Dojang lehrt.',
        'El capítulo contrasta el énfasis deportivo con otros objetivos de entrenamiento y reconoce elementos tradicionales en escuelas deportivas. No debe reducirse a «WT es solo deporte, ITF solo defensa personal»: las reglas competitivas de una organización no describen todo lo que enseña cada dojang.',
      ),
    ],
  },
  {
    id: 'poomse-forms',
    title: L(
      'Poomse: what the forms are for',
      'Poomse: wozu die Formen da sind',
      'Poomse: para qué sirven las formas',
    ),
    paragraphs: [
      L(
        'A German Taekwondo guide notes that many see forms as a necessary evil for exams. Competition-minded and leisure athletes often reject them, because an exam form lacks the flow of sparring and its meaning is rarely explained. Students then pass on movements they do not understand, and many candidates fail the 1st Dan exam because of it.',
        'Ein deutscher Taekwondo-Ratgeber hält fest, dass viele Formen als notwendiges Übel für die Prüfung ansehen. Wettkampf- und Freizeitsportler lehnen sie oft ab, weil einer Prüfungsform der Fluss des Kampfes fehlt und ihr Sinn selten erklärt wird. Schüler geben dann Bewegungen weiter, die sie nicht verstehen; viele Anwärter scheitern deshalb an der 1.-Dan-Prüfung.',
        'Una guía alemana de Taekwondo señala que muchos ven las formas como un mal necesario para el examen. Los deportistas de competición y de ocio suelen rechazarlas, porque a una forma de examen le falta el fluir del combate y casi nunca se explica su sentido. Los alumnos transmiten entonces movimientos que no entienden, y muchos candidatos suspenden por ello el examen de 1.er Dan.',
      ),
      L(
        'Forms arose when sparring was done without protective gear: they let you practise techniques safely. They also train concentration, rhythm, breathing and self-defence situations, and every form starts and ends on the same spot. The ritual is part of it: the salute (charyot, kyongne), the ready stance (junbi) and the start (sijak) and end (guman). The shout (gihap) is used once, on the last technique, in the first seven Taegeuk forms, and twice in the remaining ten.',
        'Formen entstanden, als ohne Schutzausrüstung trainiert wurde: Sie erlauben, Techniken gefahrlos zu üben. Sie schulen außerdem Konzentration, Rhythmus, Atmung und Selbstverteidigungssituationen, und jede Form beginnt und endet am selben Punkt. Zum Ritual gehören Gruß (Charyŏt, Kyŏngne), Vorbereitungsstellung (Junbi), Beginn (Sijak) und Ende (Gŭman). Der Kampfschrei (Gihap) wird in den ersten sieben Taegeuk einmal bei der Schlusstechnik ausgeführt, in den restlichen zehn Formen zweimal.',
        'Las formas nacieron cuando se entrenaba sin protecciones: permiten practicar técnicas sin riesgo. También entrenan concentración, ritmo, respiración y situaciones de defensa personal, y cada forma empieza y termina en el mismo punto. El ritual forma parte: el saludo (charyot, kyongne), la posición de preparación (junbi), el inicio (sijak) y el final (guman). El grito (gihap) se da una vez, en la última técnica, en las siete primeras Taegeuk, y dos veces en las diez restantes.',
      ),
      L(
        'Taegeuk is the youngest of the form lines in Korea. When the Korean Taekwondo Association was founded, its member schools could not agree on one of their nine lines, so a committee created new forms: Palgwe, Taegeuk and the master forms. Palgwe was dropped soon after. The book glosses Taegeuk freely as "greatness of eternity"; the eight forms use the eight trigrams of the I Ching, four of which are on the Korean flag.',
        'Taegeuk ist der jüngste Zweig der Formenrichtungen in Korea. Bei der Gründung des koreanischen Taekwondo-Verbandes konnten sich die Mitgliedsschulen nicht auf eine ihrer neun Richtungen einigen; ein Gremium schuf deshalb neue Formen: Palgwe, Taegeuk und die Meisterformen. Palgwe wurde bald wieder verworfen. Das Buch übersetzt Taegeuk frei mit „Größe der Ewigkeit“; die acht Formen verwenden die acht Trigramme des I Ging, von denen vier auf der koreanischen Flagge stehen.',
        'Taegeuk es la línea de formas más joven de Corea. Al fundarse la Asociación Coreana de Taekwondo, sus escuelas no pudieron ponerse de acuerdo en una de sus nueve líneas, así que un comité creó formas nuevas: Palgwe, Taegeuk y las formas de maestro. Palgwe se abandonó poco después. El libro traduce Taegeuk libremente como «grandeza de la eternidad»; las ocho formas usan los ocho trigramas del I Ching, cuatro de los cuales están en la bandera coreana.',
      ),
      L(
        'Form competitions grew on top of this: Germany has held national poomse championships since 1982, and after a 1986 decision of the European Taekwondo Union, European poomse championships have been held since 1988.',
        'Darauf baute der Formenwettbewerb auf: In Deutschland gibt es seit 1982 Poomse-Meisterschaften auf Bundesebene, und nach einem Beschluss der Europäischen Taekwondo Union von 1986 finden seit 1988 europäische Poomse-Meisterschaften statt.',
        'Sobre esa base creció la competición de formas: Alemania celebra campeonatos nacionales de poomse desde 1982 y, tras una decisión de 1986 de la Unión Europea de Taekwondo, hay campeonatos europeos de poomse desde 1988.',
      ),
    ],
  },
  {
    id: 'poomse-vs-hyong',
    title: L(
      'Poomse (Kukkiwon/WT) versus Hyong (ITF)',
      'Poomse (Kukkiwon/WT) gegenüber Hyong (ITF)',
      'Poomse (Kukkiwon/WT) frente a Hyong (ITF)',
    ),
    paragraphs: [
      L(
        'The two styles use different forms and are not interchangeable. Kukkiwon/WT teaches Poomse: the eight Taegeuk forms for the colour belts, numbered Il Jang to Pal Jang, plus separate black-belt poomse. ITF/Chang-Hon teaches 24 Hyong (teul), which carry names taken from Korean history instead of numbers, such as Chon-Ji, and adds three beginner exercises called saju.',
        'Die beiden Stile verwenden verschiedene Formen, die nicht austauschbar sind. Kukkiwon/WT lehrt Poomse: die acht Taegeuk-Formen für die Farbgurte, nummeriert von Il Jang bis Pal Jang, dazu eigene Schwarzgurt-Poomse. ITF/Chang-Hon lehrt 24 Hyong (Teul), die statt Nummern Namen aus der koreanischen Geschichte tragen, etwa Chon-Ji, und ergänzt drei Anfängerübungen namens Saju.',
        'Los dos estilos usan formas distintas y no son intercambiables. Kukkiwon/WT enseña Poomse: las ocho formas Taegeuk para los cinturones de color, numeradas de Il Jang a Pal Jang, más poomse propias de cinturón negro. ITF/Chang-Hon enseña 24 Hyong (teul), que llevan nombres tomados de la historia coreana en vez de números, como Chon-Ji, y añade tres ejercicios de principiante llamados saju.',
      ),
      L(
        'The execution also differs. In the club material Poomse swing the arms from the shoulders and Hyong start from the hip. ITF patterns are typically performed with a characteristic rise and fall of the body, which Poomse do not use in the same way. The sources of the names differ too: Taegeuk refers to the I Ching trigrams, Hyong to historical figures and events.',
        'Auch die Ausführung unterscheidet sich. Im Vereinsmaterial holen Poomse aus Schulterhöhe aus, Hyong starten von der Hüfte. ITF-Muster werden typischerweise mit einem charakteristischen Heben und Senken des Körpers ausgeführt, das Poomse so nicht verwenden. Auch die Namensquellen unterscheiden sich: Taegeuk bezieht sich auf die Trigramme des I Ging, Hyong auf historische Persönlichkeiten und Ereignisse.',
        'La ejecución también difiere. En el material del club los Poomse sacan los brazos desde los hombros y los Hyong parten de la cadera. Los patrones ITF suelen hacerse con un característico subir y bajar del cuerpo que los Poomse no usan del mismo modo. Las fuentes de los nombres también difieren: Taegeuk remite a los trigramas del I Ching, Hyong a personajes y hechos históricos.',
      ),
    ],
  },
]

export const CHOI: Loc[] = [
  L(
    'Born on 9 Nov 1918 in what is now North Korea.',
    'Geboren am 9.11.1918 im heutigen Nordkorea.',
    'Nació el 9-11-1918 en la actual Corea del Norte.',
  ),
  L(
    'He studied karate in Japan before his work on modern Taekwondo.',
    'Er lernte Karate in Japan, bevor er an der Entwicklung des modernen Taekwondo mitwirkte.',
    'Estudió karate en Japón antes de contribuir al desarrollo del Taekwondo moderno.',
  ),
  L(
    'After 1945 he served in the South Korean army and became an influential organizer and international promoter of Taekwon-Do.',
    'Nach 1945 diente er in der südkoreanischen Armee und wurde ein einflussreicher Organisator und internationaler Förderer des Taekwon-Do.',
    'Tras 1945 sirvió en el ejército surcoreano y se convirtió en un influyente organizador y promotor internacional del Taekwon-Do.',
  ),
  L(
    'He helped develop military training and the Chang-Hon forms, promoted the name Taekwon-Do in 1955 and became the ITF’s first president in 1966. His central ITF role does not make him the undisputed sole founder of all Taekwondo.',
    'Er prägte die militärische Ausbildung und die Chang-Hon-Formen, förderte 1955 den Namen Taekwon-Do und wurde 1966 erster ITF-Präsident. Seine zentrale ITF-Rolle macht ihn nicht zum unumstrittenen alleinigen Gründer des gesamten Taekwondo.',
    'Contribuyó a la instrucción militar y las formas Chang-Hon, impulsó el nombre Taekwon-Do en 1955 y fue el primer presidente de la ITF en 1966. Su papel central en la ITF no lo convierte en el único fundador indiscutido de todo el Taekwondo.',
  ),
  L(
    'He died on 15 June 2002 in Pyeongyang, aged 83.',
    'Er starb am 15.6.2002 mit 83 Jahren in Pyeongyang.',
    'Murió el 15-06-2002 en Pyeongyang, a los 83 años.',
  ),
]
