import type { Loc } from '../shared/i18n/types'

export interface Lesson {
  id: string
  unit: UnitId
  title: Loc
  /** Horangi's intro tip shown before the lesson starts */
  tip: Loc
  cardIds: string[]
  theoryIds?: string[]
  checkpoint?: boolean
}

export type UnitId = 'kup10' | 'kup9' | 'kup8' | 'bonus'

export interface Unit {
  id: UnitId
  /** belt earned when every lesson of the unit is complete (bonus units earn nothing) */
  earns?: string
  title: Loc
}

const L = (en: string, de: string, es: string): Loc => ({ en, de, es })

export const UNITS: Unit[] = [
  {
    id: 'kup10',
    earns: 'kup10',
    title: L(
      'Unit 1 – Welcome to the dojang',
      'Einheit 1 – Willkommen im Dojang',
      'Unidad 1 – Bienvenida al dojang',
    ),
  },
  {
    id: 'kup9',
    earns: 'kup9',
    title: L(
      'Unit 2 – Road to 9th Kup',
      'Einheit 2 – Weg zum 9. Kup',
      'Unidad 2 – Camino al 9.º Kup',
    ),
  },
  {
    id: 'kup8',
    earns: 'kup8',
    title: L(
      'Unit 3 – Road to 8th Kup (yellow)',
      'Einheit 3 – Weg zum 8. Kup (gelb)',
      'Unidad 3 – Camino al 8.º Kup (amarillo)',
    ),
  },
  {
    id: 'bonus',
    title: L(
      'Bonus – Kukkiwon, forms & self-defence',
      'Bonus – Kukkiwon, Formen & Selbstverteidigung',
      'Bonus – Kukkiwon, formas y defensa personal',
    ),
  },
]

const ids = (prefix: string, list: string[]) => list.map((x) => `${prefix}-${x}`)

export const LESSONS: Lesson[] = [
  // ───────── Unit 1: white belt
  {
    id: 'u1-dojang',
    unit: 'kup10',
    title: L('Dojang & greetings', 'Dojang & Grüße', 'Dojang y saludos'),
    tip: L(
      'Welcome! "Dojang" is the place where we practise the Way (Do). Say it out loud with me — tap the speaker!',
      'Willkommen! „Dojang“ ist der Ort, an dem wir den Weg (Do) üben. Sprich mit mir – tippe auf den Lautsprecher!',
      '¡Bienvenida! «Dojang» es el lugar donde practicamos el Camino (Do). ¡Repítelo conmigo: toca el altavoz!',
    ),
    cardIds: [
      'basic-dojang',
      'basic-dobok',
      'basic-ty',
      'basic-sabom',
      'basic-jeja',
      'basic-kihap',
      'basic-kam sa hamnida',
    ],
  },
  {
    id: 'u1-commands',
    unit: 'kup10',
    title: L('Commands', 'Kommandos', 'Comandos'),
    tip: L(
      'In class you hear short commands. "Charyot!" means attention, "Kyongi!" means bow.',
      'Im Training hörst du kurze Kommandos. „Charyot!“ heißt Achtung, „Kyongi!“ heißt grüßen.',
      'En clase oyes comandos cortos. «Charyot!» es atención, «Kyongi!» es saludar.',
    ),
    cardIds: ids('command', [
      'charyot',
      'kyongi',
      'chunbi',
      'sijak',
      'kallyo',
      'guman',
      'tora',
      'cuy-oh',
    ]),
  },
  {
    id: 'u1-num-a',
    unit: 'kup10',
    title: L('Numbers 1–5', 'Zahlen 1–5', 'Números 1–5'),
    tip: L(
      'Sino-Korean numbers number the forms: Taeguk 1 is "Il-Chang". Learn il, i, sam, sa, oh.',
      'Sino-koreanische Zahlen nummerieren die Formen: Taeguk 1 ist „Il-Chang“. Lerne il, i, sam, sa, oh.',
      'Los números sino-coreanos numeran las formas: Taeguk 1 es «Il-Chang». Aprende il, i, sam, sa, oh.',
    ),
    cardIds: ids('sino', ['il', 'i', 'sam', 'sa', 'oh']),
  },
  {
    id: 'u1-num-b',
    unit: 'kup10',
    title: L('Numbers 6–10', 'Zahlen 6–10', 'Números 6–10'),
    tip: L(
      'Halfway there! yuk, chil, pal, ku, sib.',
      'Halbzeit! yuk, chil, pal, ku, sib.',
      '¡Ya casi! yuk, chil, pal, ku, sib.',
    ),
    cardIds: ids('sino', ['yuk', 'chil', 'pal', 'ku', 'sib']),
  },
  {
    id: 'u1-native',
    unit: 'kup10',
    title: L(
      'Native numbers (repeat counts)',
      'Koreanische Zahlen (Wiederholungen)',
      'Números nativos (repeticiones)',
    ),
    tip: L(
      'When you repeat a technique, the club counts with native Korean numbers: hana, dul, set…',
      'Bei Wiederholungen zählt man mit koreanischen Zahlen: hana, dul, set …',
      'Al repetir una técnica se cuenta con números nativos: hana, dul, set…',
    ),
    cardIds: ids('native', [
      'hana',
      'dul',
      'set',
      'net',
      'dasot',
      'yosot',
      'ilgob',
      'yodul',
      'ahop',
      'yol',
    ]),
  },
  {
    id: 'u1-actions',
    unit: 'kup10',
    title: L('Action words', 'Aktionswörter', 'Palabras de acción'),
    tip: L(
      'The secret of technique names: the LAST word is the action. macki = block, chirugi = punch, chagi = kick.',
      'Das Geheimnis der Technik-Namen: Das LETZTE Wort ist die Aktion. macki = Block, chirugi = Stoß, chagi = Tritt.',
      'El secreto de los nombres: la ÚLTIMA palabra es la acción. macki = bloqueo, chirugi = golpe, chagi = patada.',
    ),
    cardIds: ['macki', 'chirugi', 'chicki', 'chagi', 'sogi', 'gubi'],
  },
  {
    id: 'u1-zones',
    unit: 'kup10',
    title: L('Heights', 'Höhen', 'Alturas'),
    tip: L(
      'Before the action comes the target height: olgul (high), momtong (middle), arae (low).',
      'Vor der Aktion steht die Zielhöhe: olgul (oben), momtong (Mitte), arae (unten).',
      'Antes de la acción va la altura: olgul (alto), momtong (medio), arae (bajo).',
    ),
    cardIds: ['olgul', 'momtong', 'arae', 'mok'],
  },
  {
    id: 'u1-theory',
    unit: 'kup10',
    title: L(
      'Theory: what is Taekwondo?',
      'Theorie: Was ist Taekwondo?',
      'Teoría: ¿qué es el Taekwondo?',
    ),
    tip: L(
      'Let me tell you where it all began. Some answers come from your club PDFs; I mark the others.',
      'Ich erzähle dir, wo alles begann. Manche Antworten stehen in euren Club-PDFs; die anderen kennzeichne ich.',
      'Te cuento dónde empezó todo. Algunas respuestas vienen de los PDFs de tu club; las otras las marco.',
    ),
    cardIds: [],
    theoryIds: ['th-origin', 'th-founder', 'th-year', 'th-white', 'th-club'],
  },
  {
    id: 'u1-check',
    unit: 'kup10',
    checkpoint: true,
    title: L('Unit 1 checkpoint', 'Einheit 1 – Check', 'Repaso de la unidad 1'),
    tip: L(
      'Checkpoint! Show what you remember.',
      'Checkpoint! Zeig, was du weißt.',
      '¡Repaso! Demuestra lo que recuerdas.',
    ),
    cardIds: [
      'basic-dojang',
      'basic-sabom',
      'command-charyot',
      'command-sijak',
      'sino-sam',
      'sino-pal',
      'macki',
      'chagi',
      'olgul',
      'momtong',
    ],
    theoryIds: ['th-origin'],
  },

  // ───────── Unit 2: 9th Kup
  {
    id: 'u2-directions',
    unit: 'kup9',
    title: L('Directions', 'Richtungen', 'Direcciones'),
    tip: L(
      'ap = front, yop = side, düt = back. "an" goes outside→inside, "packat" inside→outside.',
      'ap = vorn, yop = Seite, düt = hinten. „an“ von außen nach innen, „packat“ von innen nach außen.',
      'ap = delante, yop = lado, düt = atrás. «an» de fuera a dentro, «packat» de dentro a fuera.',
    ),
    cardIds: ['ap', 'yop', 'düt', 'an', 'packat', 'naeryo', 'dollyo', 'twio'],
  },
  {
    id: 'u2-tools',
    unit: 'kup9',
    title: L('Body tools', 'Werkzeuge', 'Herramientas'),
    tip: L(
      'Which part of the body does the work? sonnal, palmok, batangson.',
      'Welcher Körperteil arbeitet? sonnal, palmok, batangson.',
      '¿Qué parte del cuerpo trabaja? sonnal, palmok, batangson.',
    ),
    cardIds: ['sonnal', 'palmok', 'batangson'],
  },
  {
    id: 'u2-stances',
    unit: 'kup9',
    title: L('Stances', 'Stellungen', 'Posiciones'),
    tip: L(
      'You know karate, so: ap-gubi is your zenkutsu-dachi and düt-gubi your kokutsu-dachi.',
      'Du kennst Karate: ap-gubi ist dein zenkutsu-dachi, düt-gubi dein kokutsu-dachi.',
      'Ya conoces karate: ap-gubi es tu zenkutsu-dachi y düt-gubi tu kokutsu-dachi.',
    ),
    cardIds: ['moa-sogi', 'pyonhi-sogi', 'chuchum-sogi', 'ap-sogi', 'ap-gubi', 'düt-gubi'],
  },
  {
    id: 'u2-blocks',
    unit: 'kup9',
    title: L('Blocks', 'Blocks', 'Bloqueos'),
    tip: L(
      'Build the name: height + (direction) + macki. olgul + macki = high block. Try to guess before you check!',
      'Baue den Namen: Höhe + (Richtung) + macki. olgul + macki = Aufwärtsblock. Rate, bevor du prüfst!',
      'Construye el nombre: altura + (dirección) + macki. olgul + macki = bloqueo alto. ¡Intenta adivinar antes de comprobar!',
    ),
    cardIds: [
      'arae-macki',
      'olgul-macki',
      'momtong-an-macki',
      'momtong-packat-macki',
      'hansonnal-arae-macki',
      'momtong-hansonnal-packat-macki',
    ],
  },
  {
    id: 'u2-strikes',
    unit: 'kup9',
    title: L('Punches & strikes', 'Stöße & Schläge', 'Puñetazos y golpes'),
    tip: L(
      'chirugi is a straight thrust, chicki a cutting strike.',
      'chirugi ist ein gerader Stoß, chicki ein Schlag.',
      'chirugi es un golpe recto, chicki un golpe cortante.',
    ),
    cardIds: ['momtong-chirugi', 'hansonnal-mok-chicki'],
  },
  {
    id: 'u2-kicks',
    unit: 'kup9',
    title: L('Kicks', 'Tritte', 'Patadas'),
    tip: L(
      'Direction + chagi. ap = front, yop = side, dollyo = round, düt = back, naeryo = axe (down).',
      'Richtung + chagi. ap = vorn, yop = seitlich, dollyo = Halbkreis, düt = hinten, naeryo = Axt.',
      'Dirección + chagi. ap = frontal, yop = lateral, dollyo = circular, düt = atrás, naeryo = hacha.',
    ),
    cardIds: ['ap-chagi', 'yop-chagi', 'dollyo-chagi', 'düt-chagi', 'naeryo-chagi'],
  },
  {
    id: 'u2-saju',
    unit: 'kup9',
    title: L(
      'Saju-macki (four-direction block)',
      'Saju-macki (Vierseitenblock)',
      'Saju-macki (bloqueo en cuatro direcciones)',
    ),
    tip: L(
      '"Saju" means four directions. It is a drill, not a real form: low block, then middle block, turning a quarter each time.',
      '„Saju“ heißt vier Richtungen. Es ist eine Übung, keine echte Form: Abwärtsblock, dann Mittelstufenblock, je eine Vierteldrehung.',
      '«Saju» significa cuatro direcciones. Es un ejercicio, no una forma: bloqueo bajo y luego medio, girando un cuarto cada vez.',
    ),
    cardIds: ['saju-macki', 'arae-macki', 'momtong-an-macki', 'ap-gubi'],
    theoryIds: ['th-saju'],
  },
  {
    id: 'u2-theory',
    unit: 'kup9',
    title: L('Theory: belts & titles', 'Theorie: Gürtel & Titel', 'Teoría: cinturones y títulos'),
    tip: L(
      'Who is called sabom, sabom-nim and sabom-nim-ke? Let us see.',
      'Wer heißt sabom, sabom-nim und sabom-nim-ke? Schauen wir.',
      '¿Quién es sabom, sabom-nim y sabom-nim-ke? Veamos.',
    ),
    cardIds: [],
    theoryIds: ['th-belt9', 'th-sabom2', 'th-sabom', 'th-itf'],
  },
  {
    id: 'u2-check',
    unit: 'kup9',
    checkpoint: true,
    title: L('Unit 2 checkpoint', 'Einheit 2 – Check', 'Repaso de la unidad 2'),
    tip: L(
      'Checkpoint! Earn your 9th Kup.',
      'Checkpoint! Hol dir den 9. Kup.',
      '¡Repaso! Gana tu 9.º Kup.',
    ),
    cardIds: [
      'arae-macki',
      'olgul-macki',
      'momtong-chirugi',
      'ap-chagi',
      'yop-chagi',
      'dollyo-chagi',
      'ap-gubi',
      'düt-gubi',
      'saju-macki',
      'sonnal',
    ],
    theoryIds: ['th-belt9'],
  },

  // ───────── Unit 3: 8th Kup
  {
    id: 'u3-jump',
    unit: 'kup8',
    title: L('Jumping kicks', 'Sprungtritte', 'Patadas saltadas'),
    tip: L(
      'twio = jumping. twio + ap + chagi = jumping front kick.',
      'twio = gesprungen. twio + ap + chagi = gesprungener Vorwärtstritt.',
      'twio = saltado. twio + ap + chagi = patada frontal saltada.',
    ),
    cardIds: ['twio-chagi', 'twio-ap-chagi', 'twio', 'ap-chagi'],
  },
  {
    id: 'u3-axe',
    unit: 'kup8',
    title: L('Axe kicks', 'Axt-Tritte', 'Patadas de hacha'),
    tip: L(
      'an = inward, packat = outward: two axe kicks that differ only by direction.',
      'an = nach innen, packat = nach außen: zwei Axt-Tritte, nur die Richtung unterscheidet sich.',
      'an = hacia dentro, packat = hacia fuera: dos hachas que solo cambian de dirección.',
    ),
    cardIds: ['an-naeryo-chagi', 'packat-naeryo-chagi', 'naeryo-chagi', 'an', 'packat'],
  },
  {
    id: 'u3-ready',
    unit: 'kup8',
    title: L('Ready stances', 'Grundstellungen', 'Posiciones de inicio'),
    tip: L(
      'narani and pyonhi look alike: toes slightly in (narani, hyong) or out (pyonhi, poomse).',
      'narani und pyonhi ähneln sich: Zehen leicht innen (narani, Hyong) oder außen (pyonhi, Poomse).',
      'narani y pyonhi se parecen: puntas ligeramente hacia dentro (narani, hyong) o fuera (pyonhi, poomse).',
    ),
    cardIds: ['gibon-junbi-sogi', 'narani-sogi', 'pyonhi-sogi'],
  },
  {
    id: 'u3-blocks',
    unit: 'kup8',
    title: L('Reinforced blocks', 'Verstärkte Blocks', 'Bloqueos reforzados'),
    tip: L(
      'kotoro / goduro means "reinforced": the second arm helps the first one. Look for it in the name!',
      'kotoro / goduro heißt „verstärkt“: der zweite Arm unterstützt den ersten. Achte im Namen darauf!',
      'kotoro / goduro significa «reforzado»: el segundo brazo ayuda al primero. ¡Búscalo en el nombre!',
    ),
    cardIds: [
      'kotoro',
      'goduro',
      'sonnal-momtong-kotoro-macki',
      'goduro-packat-palmok-packat-macki',
      'momtong-hansonnal-packat-macki',
    ],
  },
  {
    id: 'u3-saju',
    unit: 'kup8',
    title: L(
      'Saju-chirugi (four-direction punch)',
      'Saju-chirugi (Vierseitenfauststoß)',
      'Saju-chirugi (golpe en cuatro direcciones)',
    ),
    tip: L(
      'Low block, then punch: arae-macki + momtong-chirugi in a long forward stance.',
      'Abwärtsblock, dann Fauststoß: arae-macki + momtong-chirugi in der großen Vorwärtsstellung.',
      'Bloqueo bajo y luego puñetazo: arae-macki + momtong-chirugi en posición de arco larga.',
    ),
    cardIds: ['saju-chirugi', 'arae-macki', 'momtong-chirugi', 'ap-gubi'],
  },
  {
    id: 'u3-training',
    unit: 'kup8',
    title: L('Training vocabulary', 'Trainingsbegriffe', 'Vocabulario de entrenamiento'),
    tip: L(
      'The 8th Kup exam has more parts: step sparring, self-defence, falling, forms… learn their names.',
      'Die 8.-Kup-Prüfung hat mehr Teile: Schrittkampf, Selbstverteidigung, Fallschule, Formen … lerne ihre Namen.',
      'El examen de 8.º Kup tiene más partes: combate de pasos, defensa personal, caídas, formas… aprende sus nombres.',
    ),
    cardIds: ids('training', [
      'kwon-sul',
      'tae-sul',
      'tae-sogi',
      'tul',
      'kyorugi',
      'ho-sin-sul',
      'kyekpa',
      'ilon',
      'nak-bop',
      'sambo-taeryon',
    ]),
  },
  {
    id: 'u3-body',
    unit: 'kup8',
    title: L('Body parts', 'Körperteile', 'Partes del cuerpo'),
    tip: L(
      'Now the body: mori, nun, ko, ip… "momtong" (trunk) you already know!',
      'Jetzt der Körper: mori, nun, ko, ip … „momtong“ (Rumpf) kennst du schon!',
      'Ahora el cuerpo: mori, nun, ko, ip… ¡«momtong» (tronco) ya lo conoces!',
    ),
    cardIds: ids('body', [
      'mori',
      'nun',
      'ko',
      'ip',
      'gwi',
      'eokkae',
      'gaseum',
      'pal',
      'palkup',
      'son',
      'jumok',
    ]),
  },
  {
    id: 'u3-theory',
    unit: 'kup8',
    title: L(
      'Theory: yellow belt & forms',
      'Theorie: Gelbgurt & Formen',
      'Teoría: cinturón amarillo y formas',
    ),
    tip: L(
      'Two systems of forms exist. Which one did Choi Hong Hi create?',
      'Es gibt zwei Formen-Systeme. Welches schuf Choi Hong Hi?',
      'Existen dos sistemas de formas. ¿Cuál creó Choi Hong Hi?',
    ),
    cardIds: [],
    theoryIds: [
      'th-yellow',
      'th-belt8',
      'th-hyong',
      'th-taeguk',
      'th-seoul',
      'th-flag',
      'th-olympics',
    ],
  },
  {
    id: 'u3-check',
    unit: 'kup8',
    checkpoint: true,
    title: L('Unit 3 checkpoint', 'Einheit 3 – Check', 'Repaso de la unidad 3'),
    tip: L(
      'Final checkpoint to earn the yellow belt!',
      'Letzter Checkpoint für den Gelbgurt!',
      '¡Último repaso para ganar el cinturón amarillo!',
    ),
    cardIds: [
      'twio-ap-chagi',
      'an-naeryo-chagi',
      'packat-naeryo-chagi',
      'narani-sogi',
      'gibon-junbi-sogi',
      'saju-chirugi',
      'training-kyorugi',
      'training-nak-bop',
      'body-mori',
      'body-jumok',
    ],
    theoryIds: ['th-belt8', 'th-hyong'],
  },

  // ───────── Bonus: does not earn a belt
  {
    id: 'b-kukkiwon',
    unit: 'bonus',
    title: L('Kukkiwon spelling', 'Kukkiwon-Schreibweise', 'Escritura Kukkiwon'),
    tip: L(
      'Videos from the Kukkiwon world spell the same words differently: ch→j, k→g, c→g. Your club says chirugi, they say jireugi. Same punch, different spelling!',
      'Videos aus der Kukkiwon-Welt schreiben dieselben Wörter anders: ch→j, k→g. Euer Verein sagt chirugi, sie sagen jireugi. Derselbe Stoß, andere Schreibweise!',
      'Los vídeos del mundo Kukkiwon escriben igual las mismas palabras de otro modo: ch→j, k→g. Tu club dice chirugi, ellos jireugi. ¡El mismo golpe, otra escritura!',
    ),
    cardIds: ids('kukkiwon', ['jireugi', 'chigi', 'chagi', 'makgi', 'seogi', 'poomsae', 'jang']),
  },
  {
    id: 'b-selfdefense',
    unit: 'bonus',
    title: L('Self-defence words', 'Selbstverteidigungs-Wörter', 'Palabras de defensa personal'),
    tip: L(
      'The Kukkiwon self-defence course groups techniques by what they do: release (ppaegi), lock (kkeokgi), throw (neomgigi), choke (joleugi).',
      'Der Kukkiwon-Selbstverteidigungskurs ordnet Techniken nach ihrer Wirkung: Befreiung (ppaegi), Hebel (kkeokgi), Wurf (neomgigi), Würgen (joleugi).',
      'El curso de defensa personal Kukkiwon agrupa las técnicas por lo que hacen: liberación (ppaegi), luxación (kkeokgi), proyección (neomgigi), estrangulación (joleugi).',
    ),
    cardIds: [
      ...ids('kukkiwon', ['ppaegi', 'kkeokgi', 'neomgigi', 'joleugi']),
      'training-ho-sin-sul',
    ],
  },
  {
    id: 'b-taeguk-a',
    unit: 'bonus',
    title: L('Taegeuk 1–4', 'Taegeuk 1–4', 'Taegeuk 1–4'),
    tip: L(
      'Taegeuk forms are named after the I Ching: heaven, lake, fire, thunder… "Chang" in your club is "Jang" in Kukkiwon spelling.',
      'Taegeuk-Formen sind nach dem I-Ging benannt: Himmel, See, Feuer, Donner … „Chang“ im Verein ist „Jang“ in Kukkiwon-Schreibweise.',
      'Las formas Taegeuk llevan nombres del I Ching: cielo, lago, fuego, trueno… «Chang» en tu club es «Jang» en la escritura Kukkiwon.',
    ),
    cardIds: ['taeguk-1', 'taeguk-2', 'taeguk-3', 'taeguk-4'],
  },
  {
    id: 'b-taeguk-b',
    unit: 'bonus',
    title: L('Taegeuk 5–8', 'Taegeuk 5–8', 'Taegeuk 5–8'),
    tip: L(
      'Wind, water, mountain, earth: the last four Taegeuk.',
      'Wind, Wasser, Berg, Erde: die letzten vier Taegeuk.',
      'Viento, agua, montaña, tierra: las cuatro últimas Taegeuk.',
    ),
    cardIds: ['taeguk-5', 'taeguk-6', 'taeguk-7', 'taeguk-8'],
  },
]

export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l]),
)

export const lessonsOfUnit = (unit: UnitId) => LESSONS.filter((l) => l.unit === unit)
