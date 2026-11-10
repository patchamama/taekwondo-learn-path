import type { Loc } from '../shared/i18n/types'

const L = (en: string, de: string, es: string): Loc => ({ en, de, es })

export type SelfDefenseGroup = 'basics' | 'situational1' | 'situational2' | 'special'

export interface SelfDefenseEntry {
  /** card id, `sd-<chapter>` */
  id: string
  /** chapter number of the 91-min Kukkiwon compilation (docs/video/self-defense-course-map.md) */
  n: number
  group: SelfDefenseGroup
  /** Kukkiwon name (Revised Romanization) */
  ko: string
  /** Korean shown and spoken; generic "hosinsul" (self-defence) when the chapter has no Korean name */
  hangul: string
  title: Loc
  desc: Loc
  /** what the course notes list for the chapter (English) */
  contents: string
  start: number
  end: number
}

export const SELF_DEFENSE_GROUPS: { id: SelfDefenseGroup; title: Loc; hint: Loc }[] = [
  {
    id: 'basics',
    title: L(
      'Basic self-defence skills',
      'Grundlagen der Selbstverteidigung',
      'Habilidades básicas de defensa personal',
    ),
    hint: L(
      'Releases, joint locks, throws and chokes: the relative skills of Taekwondo self-defence.',
      'Befreiungen, Hebel, Würfe und Würgegriffe: die relativen Fertigkeiten der Taekwondo-Selbstverteidigung.',
      'Liberaciones, luxaciones, proyecciones y estrangulaciones: las habilidades relativas de la defensa personal.',
    ),
  },
  {
    id: 'situational1',
    title: L(
      'Situational self-defence I',
      'Situative Selbstverteidigung I',
      'Defensa personal por situaciones I',
    ),
    hint: L(
      'Counterattacks against punches and defence against kicks.',
      'Konter gegen Fauststöße und Abwehr gegen Tritte.',
      'Contraataques contra puñetazos y defensa contra patadas.',
    ),
  },
  {
    id: 'situational2',
    title: L(
      'Situational self-defence II',
      'Situative Selbstverteidigung II',
      'Defensa personal por situaciones II',
    ),
    hint: L(
      'Ten partner sequences (named "gyeorugi once" in the course; the exact meaning is unverified).',
      'Zehn Partnerabläufe (im Kurs „gyeorugi once“ genannt; genaue Bedeutung nicht verifiziert).',
      'Diez secuencias con compañero (llamadas «gyeorugi once» en el curso; el significado exacto no está verificado).',
    ),
  },
  {
    id: 'special',
    title: L('Special situations', 'Besondere Situationen', 'Situaciones especiales'),
    hint: L(
      'Being knocked down, attacks with a knife, a stick or a gun. Only practise these with a qualified instructor.',
      'Zu Boden gebracht werden, Angriffe mit Messer, Stock oder Pistole. Nur mit qualifiziertem Trainer üben.',
      'Derribo, ataques con cuchillo, palo o pistola. Practícalos solo con un instructor cualificado.',
    ),
  },
]

const e = (
  n: number,
  group: SelfDefenseGroup,
  ko: string,
  hangul: string,
  title: Loc,
  desc: Loc,
  contents: string,
  start: number,
  end: number,
): SelfDefenseEntry => ({
  id: `sd-${String(n).padStart(2, '0')}`,
  n,
  group,
  ko,
  hangul,
  title,
  desc,
  contents,
  start,
  end,
})

const sit2 = (n: number, k: number, start: number, end: number) =>
  e(
    n,
    'situational2',
    `Gyeorugi once ${k}`,
    '호신술',
    L(`Partner sequence ${k}`, `Partnerablauf ${k}`, `Secuencia con compañero ${k}`),
    L(
      'A short attack-and-counter sequence with a partner. Watch the distance, the timing and how the defender ends in a safe position.',
      'Ein kurzer Angriffs-und-Konter-Ablauf mit Partner. Achte auf Distanz, Timing und darauf, wie der Verteidiger in einer sicheren Position endet.',
      'Una secuencia corta de ataque y contraataque con compañero. Fíjate en la distancia, el timing y en cómo el defensor termina en una posición segura.',
    ),
    `Gyeorugi once ${k}`,
    start,
    end,
  )

export const SELF_DEFENSE: SelfDefenseEntry[] = [
  e(
    5,
    'basics',
    'Ppaegi',
    '빼기',
    L('Releases (pull-outs)', 'Befreiungen', 'Liberaciones (escapes)'),
    L(
      'Freeing a grabbed wrist or arm by turning it against the weak point of the grip (the opening between thumb and fingers): inward, outward and upward.',
      'Ein gepacktes Handgelenk oder einen Arm befreien, indem man gegen die schwache Stelle des Griffs dreht (die Öffnung zwischen Daumen und Fingern): nach innen, außen und oben.',
      'Liberar una muñeca o un brazo agarrado girándolo contra el punto débil del agarre (la abertura entre pulgar y dedos): hacia dentro, fuera y arriba.',
    ),
    'Inward, outward and upward pull-outs',
    148,
    224,
  ),
  e(
    6,
    'basics',
    'Kkeokgi',
    '꺾기',
    L('Joint locks (bending)', 'Hebel (Beugen)', 'Luxaciones (torsión)'),
    L(
      'Bending a joint (wrist, elbow) against its natural direction to control the attacker, from inside to outside and from outside to inside.',
      'Ein Gelenk (Handgelenk, Ellenbogen) gegen seine natürliche Richtung beugen, um den Angreifer zu kontrollieren; von innen nach außen und von außen nach innen.',
      'Doblar una articulación (muñeca, codo) contra su dirección natural para controlar al atacante, de dentro a fuera y de fuera a dentro.',
    ),
    'Wrist and arm bends, inside to outside and outside to inside',
    225,
    352,
  ),
  e(
    7,
    'basics',
    'Neomgigi',
    '넘기기',
    L('Throws and take-downs', 'Würfe und Niederwerfen', 'Proyecciones y derribos'),
    L(
      'Unbalancing the attacker and putting them on the ground: leg throws, throws by lifting the leg and throws pulling the arm.',
      'Den Angreifer aus dem Gleichgewicht bringen und zu Boden bringen: Beinwürfe, Würfe durch Anheben des Beins und Würfe mit Armzug.',
      'Desequilibrar al atacante y llevarlo al suelo: proyecciones con la pierna, levantando la pierna y tirando del brazo.',
    ),
    'Leg throws, heel/lift throws and arm throws',
    353,
    465,
  ),
  e(
    8,
    'basics',
    'Joleugi',
    '조르기',
    L('Chokes', 'Würgegriffe', 'Estrangulaciones'),
    L(
      'Controlling the attacker by pressure on the neck: from the front and from the side. Always trained with care and with a tap-out signal.',
      'Den Angreifer durch Druck am Hals kontrollieren: von vorn und von der Seite. Immer vorsichtig und mit Abklopfsignal geübt.',
      'Controlar al atacante con presión en el cuello: de frente y de lado. Se entrena siempre con cuidado y con señal de rendición.',
    ),
    'Front and side chokes',
    466,
    525,
  ),
  e(
    27,
    'situational1',
    'Situational self-defence I (1)',
    '호신술',
    L(
      'Counterattacks against punches and kicks (1)',
      'Konter gegen Fauststöße und Tritte (1)',
      'Contraataques contra puñetazos y patadas (1)',
    ),
    L(
      'Two counterattacks against a punch and one defence against a kick, using blocks, evasions and a finishing technique.',
      'Zwei Konter gegen einen Fauststoß und eine Abwehr gegen einen Tritt mit Blocks, Ausweichen und Abschlusstechnik.',
      'Dos contraataques contra un puñetazo y una defensa contra una patada, con bloqueos, esquivas y una técnica final.',
    ),
    'Counterattack on jireugi attack 1, 2; defence on chagi attack',
    2892,
    2988,
  ),
  e(
    28,
    'situational1',
    'Situational self-defence I (2)',
    '호신술',
    L(
      'Counterattacks against punches and kicks (2)',
      'Konter gegen Fauststöße und Tritte (2)',
      'Contraataques contra puñetazos y patadas (2)',
    ),
    L(
      'A second set of counterattacks against punches and a kick defence, with different blocks and finishing techniques.',
      'Ein zweiter Satz Konter gegen Fauststöße und Trittabwehr mit anderen Blocks und Abschlusstechniken.',
      'Un segundo conjunto de contraataques contra puñetazos y defensa de patada, con otros bloqueos y técnicas finales.',
    ),
    'Counterattack on jireugi attack 1, 2; defence on chagi attack',
    2989,
    3079,
  ),
  e(
    29,
    'situational1',
    'Situational self-defence I (3)',
    '호신술',
    L(
      'Counterattacks against punches and kicks (3)',
      'Konter gegen Fauststöße und Tritte (3)',
      'Contraataques contra puñetazos y patadas (3)',
    ),
    L(
      'A third set of counterattacks against punches and a kick defence.',
      'Ein dritter Satz Konter gegen Fauststöße und Trittabwehr.',
      'Un tercer conjunto de contraataques contra puñetazos y defensa de patada.',
    ),
    'Counterattack on jireugi attack 1, 2; defence on chagi attack',
    3080,
    3200,
  ),
  sit2(30, 1, 3201, 3241),
  sit2(31, 2, 3242, 3284),
  sit2(32, 3, 3285, 3327),
  sit2(33, 4, 3328, 3369),
  sit2(34, 5, 3370, 3415),
  sit2(35, 6, 3416, 3459),
  sit2(36, 7, 3460, 3503),
  sit2(37, 8, 3504, 3541),
  sit2(38, 9, 3542, 3578),
  sit2(39, 10, 3579, 3614),
  e(
    40,
    'special',
    'Knock-over defence',
    '호신술',
    L('Defence when knocked over', 'Abwehr nach dem Umwerfen', 'Defensa tras ser derribado'),
    L(
      'How to counterattack from the ground: kicking upward, turning over and pressing the nape of the back.',
      'Wie man vom Boden aus kontert: aufwärts treten, sich drehen und den Nacken drücken.',
      'Cómo contraatacar desde el suelo: patear hacia arriba, girar y presionar la nuca.',
    ),
    'Counterattack with kicking, turn over 1, 2, pressing the nape of the back',
    3615,
    3766,
  ),
  e(
    41,
    'special',
    'Lying-position defence',
    '호신술',
    L(
      'Defence against being strangled while lying down',
      'Abwehr gegen Würgen in Rückenlage',
      'Defensa contra estrangulación tumbado',
    ),
    L(
      'Counterattack when an attacker strangles you from above while you are on your back.',
      'Konter, wenn ein Angreifer dich in Rückenlage von oben würgt.',
      'Contraataque cuando un atacante te estrangula desde arriba estando tú de espaldas.',
    ),
    'Counterattack against being strangled from above',
    3767,
    3832,
  ),
  e(
    42,
    'special',
    'Knife defence I',
    '호신술',
    L(
      'Knife defence I: the knife block',
      'Messerabwehr I: der Messerblock',
      'Defensa contra cuchillo I: el bloqueo',
    ),
    L(
      'The basic block against a knife attack (knife makgi): control the attacking arm first.',
      'Der Grundblock gegen einen Messerangriff (Knife makgi): zuerst den angreifenden Arm kontrollieren.',
      'El bloqueo básico contra un ataque con cuchillo (knife makgi): primero se controla el brazo atacante.',
    ),
    'Knife makgi',
    3833,
    3872,
  ),
  e(
    43,
    'special',
    'Knife defence II',
    '호신술',
    L(
      'Knife defence II: knife at the neck',
      'Messerabwehr II: Messer am Hals',
      'Defensa contra cuchillo II: cuchillo en el cuello',
    ),
    L(
      'Counterattacks when a knife is held at the left or right side of the neck, or when held from behind.',
      'Konter, wenn ein Messer links oder rechts am Hals gehalten wird oder von hinten.',
      'Contraataques cuando sostienen un cuchillo en el lado izquierdo o derecho del cuello, o desde atrás.',
    ),
    'Knife held at the left/right neck, held from behind',
    3873,
    3970,
  ),
  e(
    44,
    'special',
    'Knife defence III',
    '호신술',
    L(
      'Knife defence III: stabbing the abdomen',
      'Messerabwehr III: Stich zum Bauch',
      'Defensa contra cuchillo III: puñalada al abdomen',
    ),
    L(
      'Two counterattacks against a stab to the abdomen.',
      'Zwei Konter gegen einen Stich zum Bauch.',
      'Dos contraataques contra una puñalada al abdomen.',
    ),
    'Counterattack when stabbing the abdomen 1, 2',
    3971,
    4034,
  ),
  e(
    45,
    'special',
    'Knife defence IV',
    '호신술',
    L(
      'Knife defence IV: slashing attacks',
      'Messerabwehr IV: Schneidangriffe',
      'Defensa contra cuchillo IV: cortes',
    ),
    L(
      'Counterattacks against diagonal and sideways slashes.',
      'Konter gegen diagonale und seitliche Schnitte.',
      'Contraataques contra cortes en diagonal y laterales.',
    ),
    'Counterattack when swinging diagonally 1, 2 and sideways',
    4035,
    4128,
  ),
  e(
    46,
    'special',
    'Stick defence',
    '호신술',
    L('Defence against a stick', 'Abwehr gegen einen Stock', 'Defensa contra un palo'),
    L(
      'Counterattacks against diagonal attacks and against a blow from above.',
      'Konter gegen diagonale Angriffe und einen Schlag von oben.',
      'Contraataques contra ataques en diagonal y contra un golpe desde arriba.',
    ),
    'Counterattack against diagonal attacks 1, 2 and against hitting from above',
    4129,
    4226,
  ),
  e(
    47,
    'special',
    'Pistol defence',
    '호신술',
    L('Defence against a pistol', 'Abwehr gegen eine Pistole', 'Defensa contra una pistola'),
    L(
      'Counterattacks when a gun is aimed from the front, from behind or from the side. A demonstration only: never improvise this.',
      'Konter, wenn eine Pistole von vorn, hinten oder der Seite gerichtet wird. Nur eine Vorführung: niemals improvisieren.',
      'Contraataques cuando apuntan con una pistola de frente, por detrás o de lado. Solo una demostración: nunca lo improvises.',
    ),
    'Counterattack when aimed from front, behind, side',
    4227,
    4344,
  ),
]

export const SELF_DEFENSE_BY_ID: Record<string, SelfDefenseEntry> = Object.fromEntries(
  SELF_DEFENSE.map((x) => [x.id, x]),
)
