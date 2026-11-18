import type { Loc } from '../shared/i18n/types'

const L = (en: string, de: string, es: string): Loc => ({ en, de, es })

export interface ConceptSource {
  book: 'sharp' | 'pottle' | 'mcwhorter'
  member: string
  heading: string
}

export interface Concept {
  /** Stable fragment identifier, also suitable for lesson/study references. */
  id: string
  title: Loc
  paragraphs: Loc[]
  optional?: boolean
  sources: ConceptSource[]
}

const sharp = (member: string, heading: string): ConceptSource => ({ book: 'sharp', member: `OEBPS/${member}.xhtml`, heading })
const pottle = (member: string, heading: string): ConceptSource => ({ book: 'pottle', member: `OEBPS/${member}.xhtml`, heading })
const mcwhorter = (member: string, heading: string): ConceptSource => ({ book: 'mcwhorter', member: `OEBPS/${member}.xhtml`, heading })

/** Original editorial readings, not quotations, quiz prompts or a training prescription.
 * Source pointers identify discussion context, not approval of every source claim.
 */
export const CONCEPTS: Concept[] = [
  {
    id: 'movement',
    title: L('Movement, balance and relaxation', 'Bewegung, Gleichgewicht und Entspannung', 'Movimiento, equilibrio y relajación'),
    paragraphs: [
      L(
        'A stance is a base for movement, not a pose to endure. Balance means keeping control while transferring weight, turning and returning to readiness. A wider or deeper stance is not automatically better: it must still let you move without wobbling or straining. Follow your instructor’s version of the club stance rather than copying fixed distances from a book.',
        'Eine Stellung ist die Grundlage für Bewegung, keine Haltung zum Ausharren. Gleichgewicht bedeutet, beim Verlagern des Gewichts, Drehen und Zurückkehren in die Bereitschaft die Kontrolle zu behalten. Breiter oder tiefer ist nicht automatisch besser: Bewegung muss ohne Wackeln oder Überlastung möglich bleiben. Orientiere dich an der Vereinsausführung deiner Lehrkraft statt an festen Buchmaßen.',
        'Una posición es una base para moverse, no una postura que haya que aguantar. El equilibrio consiste en mantener el control al trasladar el peso, girar y volver a la posición de preparación. Más anchura o profundidad no siempre es mejor: debe permitir moverse sin tambalearse ni forzar. Sigue la versión de tu instructor en el club, no medidas fijas de un libro.',
      ),
      L(
        'Coordination connects the feet, hips, trunk and arms. First learn a small step on its own; then add the familiar hand movement and notice whether they finish together as your instructor intends. Keep the knee moving in the same general direction as the foot and avoid twisting over a planted foot. Make turns smaller or rehearse them without the hand technique if control is lost.',
        'Koordination verbindet Füße, Hüfte, Rumpf und Arme. Übe zuerst einen kleinen Schritt allein, ergänze dann die bekannte Armbewegung und beobachte, ob beides wie vorgesehen gemeinsam endet. Das Knie bewegt sich grundsätzlich in Richtung des Fußes; verdrehe dich nicht über einem feststehenden Fuß. Verkleinere Drehungen oder übe sie ohne Armtechnik, wenn die Kontrolle nachlässt.',
        'La coordinación conecta pies, caderas, tronco y brazos. Aprende primero un paso pequeño; añade después un movimiento de brazos conocido y observa si terminan juntos como indica tu instructor. La rodilla debe acompañar la dirección general del pie; evita girar sobre un pie clavado en el suelo. Reduce el giro o ensáyalo sin la técnica de brazos si pierdes el control.',
      ),
      L(
        'Relaxation means releasing unnecessary tension while keeping useful support, not letting the body collapse. Notice raised shoulders, a clenched jaw or interrupted breathing. In a clear space, try a few slow weight shifts with both feet supported, then pause. Use a stable support or a seated version if needed. Stop for pain, dizziness or instability; speed comes later, after control.',
        'Entspannung bedeutet, unnötige Spannung loszulassen und dabei Halt zu bewahren, nicht in sich zusammenzusinken. Achte auf hochgezogene Schultern, einen festen Kiefer oder stockenden Atem. Probiere auf freier Fläche einige langsame Gewichtsverlagerungen mit beiden Füßen am Boden und pausiere. Nutze bei Bedarf eine stabile Stütze oder übe im Sitzen. Bei Schmerzen, Schwindel oder Unsicherheit aufhören; Tempo folgt erst auf Kontrolle.',
        'Relajarse es soltar la tensión innecesaria sin perder el sostén del cuerpo, no desplomarse. Observa los hombros elevados, la mandíbula apretada o la respiración interrumpida. En un espacio despejado, prueba unos cambios lentos de peso con ambos pies apoyados y descansa. Usa un apoyo estable o una versión sentada si lo necesitas. Para ante dolor, mareo o inestabilidad; la velocidad viene después del control.',
      ),
    ],
    sources: [sharp('c84', 'Chapter 4: Fundamental Movements in Taekwondo — The Stances'), mcwhorter('cJ8', 'Chapter Eight — How to Train for Form')],
  },
  {
    id: 'technique-purpose',
    title: L('What a technique is for', 'Wozu eine Technik dient', 'Para qué sirve una técnica'),
    paragraphs: [
      L(
        'Learning a technique involves more than naming its final shape. Ask what task it trains, where the movement begins, how the body supports it and how you recover afterward. A chamber gives a repeatable starting point for learning a pathway. The finishing position helps a teacher check alignment; it is not the whole technique.',
        'Eine Technik zu lernen bedeutet mehr, als ihre Endhaltung zu benennen. Frage nach ihrer Aufgabe, dem Bewegungsbeginn, der Unterstützung durch den Körper und der anschließenden Rückkehr. Eine Ausholposition schafft einen wiederholbaren Ausgangspunkt zum Erlernen des Weges. Die Endhaltung erleichtert die Kontrolle der Ausrichtung; sie ist nicht die gesamte Technik.',
        'Aprender una técnica es más que nombrar su forma final. Pregunta qué tarea entrena, dónde empieza el movimiento, cómo lo sostiene el cuerpo y cómo se recupera la posición después. La preparación ofrece un punto inicial repetible para aprender el recorrido. La posición final permite comprobar la alineación, pero no constituye toda la técnica.',
      ),
      L(
        'Accuracy, timing, speed and force are different qualities. Moving faster can hide an unstable base; adding force can make a poor pathway harder to correct. Start slowly with a familiar technique in the air, leaving room around you and avoiding a locked elbow or knee. Observe one feature, such as returning to readiness, rather than trying to improve everything at once.',
        'Genauigkeit, Timing, Geschwindigkeit und Kraft sind unterschiedliche Eigenschaften. Mehr Tempo kann einen instabilen Stand verdecken; mehr Kraft kann einen ungünstigen Bewegungsweg schwerer korrigierbar machen. Beginne langsam mit einer bekannten Technik in der Luft, mit ausreichend Platz und ohne Ellenbogen oder Knie durchzudrücken. Beobachte nur ein Merkmal, etwa die Rückkehr in Bereitschaft, statt alles zugleich verbessern zu wollen.',
        'Precisión, momento oportuno, velocidad y fuerza son cualidades distintas. Acelerar puede ocultar una base inestable; añadir fuerza puede dificultar la corrección del recorrido. Empieza despacio con una técnica conocida al aire, dejando espacio alrededor y sin bloquear el codo ni la rodilla. Observa un aspecto, como volver a la preparación, en vez de intentar mejorar todo a la vez.',
      ),
      L(
        'A formal movement is a learning model, not a promise of success in an unpredictable encounter. Forms, controlled partner practice and sport sparring have different constraints. Solo repetition cannot teach every judgment about distance or another person’s movement. Ask the instructor to explain the context; partner and pad work need their supervision, suitable equipment and agreement about intensity.',
        'Eine formale Bewegung ist ein Lernmodell, kein Erfolgsversprechen für unvorhersehbare Situationen. Formen, kontrollierte Partnerübungen und sportlicher Freikampf haben unterschiedliche Bedingungen. Alleinige Wiederholung vermittelt nicht jede Entscheidung über Abstand oder fremde Bewegungen. Lass dir den Kontext erklären; Partner- und Pratzentraining brauchen Aufsicht, passende Ausrüstung und eine Absprache zur Intensität.',
        'Un movimiento formal es un modelo de aprendizaje, no una garantía en una situación imprevisible. Las formas, la práctica controlada por parejas y el combate deportivo tienen condiciones distintas. Repetir a solas no enseña todas las decisiones sobre distancia o movimiento ajeno. Pide que te expliquen el contexto; el trabajo con compañero y paos requiere supervisión, equipo adecuado y acuerdo sobre la intensidad.',
      ),
    ],
    sources: [sharp('c84', 'Chapter 4: Fundamental Movements in Taekwondo'), mcwhorter('c9Y', 'Chapter Four — The Five Components of an Effective Striking Weapon'), mcwhorter('cJ8', 'Chapter Eight — Tradition and Technique')],
  },
  {
    id: 'blocks',
    title: L('Understanding blocks', 'Blocktechniken verstehen', 'Comprender los bloqueos'),
    paragraphs: [
      L(
        'A block aims to manage an incoming line of movement, often by redirecting it rather than opposing it head-on. Position, distance and timing matter as much as the arm shape. Moving away or changing position can also be part of defense. No block makes you invulnerable, and a list of block names is not a substitute for supervised practice.',
        'Ein Block soll eine ankommende Bewegung kontrollieren, häufig durch Umlenken statt durch frontales Gegenhalten. Position, Abstand und Timing zählen ebenso wie die Armhaltung. Ausweichen oder ein Positionswechsel können ebenfalls zur Verteidigung gehören. Kein Block macht unverwundbar, und eine Liste von Blocknamen ersetzt keine angeleitete Übung.',
        'Un bloqueo busca gestionar una línea de movimiento entrante, a menudo desviándola en vez de oponerse de frente. La posición, la distancia y el momento importan tanto como la forma del brazo. Alejarse o cambiar de posición también puede formar parte de la defensa. Ningún bloqueo hace invulnerable, y una lista de nombres no sustituye la práctica supervisada.',
      ),
      L(
        'Block names describe several independent features: level, direction, contact surface or the relationship between the hands. High, middle and low describe levels; inward and outward describe pathways, not extra levels. Keep the club’s names and ask which reference point each uses. Sharp mixes organizational vocabulary, so do not assume that similar labels always prescribe identical mechanics.',
        'Blocknamen beschreiben mehrere unabhängige Merkmale: Höhe, Richtung, Kontaktfläche oder das Zusammenspiel der Hände. Hoch, mittel und tief sind Höhen; nach innen und außen sind Bewegungsrichtungen, keine weiteren Höhen. Behalte die Vereinsbegriffe bei und frage nach ihren Bezugspunkten. Sharp vermischt Organisationsbegriffe; ähnliche Namen bedeuten deshalb nicht zwingend gleiche Ausführungen.',
        'Los nombres de bloqueos describen rasgos independientes: altura, dirección, superficie de contacto o relación entre las manos. Alto, medio y bajo son niveles; hacia dentro y hacia fuera son recorridos, no niveles adicionales. Conserva los términos del club y pregunta por sus referencias. Sharp mezcla vocabulario de organizaciones: nombres parecidos no siempre indican una mecánica idéntica.',
      ),
      L(
        'For a beginner’s solo check, trace a block already taught in class slowly through the air. Notice the preparation, the working arm’s path, the other hand and the return to readiness. Keep joints softly controlled, not locked, and reduce the range if the shoulder rises or balance goes. Pause between attempts. Do not test blocks by hitting forearms together or asking someone to strike you; contact practice belongs with the instructor.',
        'Zeichne zur einfachen Selbstkontrolle einen bereits unterrichteten Block langsam in der Luft nach. Achte auf Vorbereitung, Weg des ausführenden Arms, zweite Hand und Rückkehr in Bereitschaft. Halte die Gelenke kontrolliert statt verriegelt und verkleinere den Weg, wenn die Schulter hochzieht oder das Gleichgewicht verloren geht. Pausiere zwischen Versuchen. Teste Blocks nicht durch Zusammenschlagen der Unterarme oder angeforderte Treffer; Kontaktübungen gehören in die Anleitung.',
        'Como comprobación individual, dibuja lentamente al aire un bloqueo ya aprendido en clase. Observa la preparación, el recorrido del brazo activo, la otra mano y la vuelta a la preparación. Mantén las articulaciones controladas, sin bloquearlas, y reduce el recorrido si sube el hombro o pierdes el equilibrio. Descansa entre intentos. No pruebes bloqueos chocando antebrazos ni pidiendo que te golpeen; el contacto se practica con el instructor.',
      ),
    ],
    sources: [sharp('cYG', 'Chapter 11: The Art of Blocking in Taekwondo — Basic Principles of Blocking; How Blocks Are Classified in Taekwondo')],
  },
  {
    id: 'patterns',
    title: L('Forms, patterns and school traditions', 'Formen, Bewegungsmuster und Schultraditionen', 'Formas, patrones y tradiciones de escuela'),
    paragraphs: [
      L(
        'A form links techniques into a remembered sequence. It lets you study transitions, direction, rhythm and coordination without needing a partner for every repetition. Knowing the order is only a beginning: you can later refine the pathway, stance, breathing and purpose of each movement. Pottle’s “Levels of Knowing” is a useful reflection tool, not a universal grading rule.',
        'Eine Form verbindet Techniken zu einer erlernten Folge. So lassen sich Übergänge, Richtung, Rhythmus und Koordination ohne Partner bei jeder Wiederholung untersuchen. Die Reihenfolge zu kennen ist erst der Anfang: Später verfeinerst du Bewegungsweg, Stellung, Atmung und Zweck. Pottles „Levels of Knowing“ eignet sich zur Selbsteinschätzung, ist aber keine allgemeingültige Prüfungsregel.',
        'Una forma enlaza técnicas en una secuencia memorizada. Permite estudiar transiciones, dirección, ritmo y coordinación sin necesitar compañero en cada repetición. Saber el orden es solo el principio: después se afinan el recorrido, la posición, la respiración y el propósito. Los “Levels of Knowing” de Pottle sirven para reflexionar, no como regla universal de examen.',
      ),
      L(
        'ITF Chang-Hon patterns (tul or teul), classic Hyung and Kukkiwon Taegeuk poomsae are not interchangeable syllabuses. Sharp’s chapter on the 24 patterns discusses the ITF tradition, not every school’s required forms. Hyung is also a term used in traditional schools; a shared word does not prove that two sequences match. Use the club’s form names and required version, and do not replace its Hyung with a similarly ranked Taegeuk.',
        'ITF-Chang-Hon-Muster (Tul oder Teul), klassische Hyung und Kukkiwon-Taegeuk-Poomsae sind keine austauschbaren Lehrpläne. Sharps Kapitel über die 24 Muster behandelt die ITF-Tradition, nicht die Pflichtformen jeder Schule. Hyung wird auch in traditionellen Schulen verwendet; ein gemeinsames Wort beweist keine identische Folge. Nutze die Namen und vorgeschriebene Version des Vereins und ersetze eine Hyung nicht durch eine Taegeuk ähnlicher Graduierung.',
        'Los patrones Chang-Hon de ITF (tul o teul), las Hyung clásicas y los poomsae Taegeuk de Kukkiwon no son programas intercambiables. El capítulo de Sharp sobre los 24 patrones trata la tradición ITF, no las formas obligatorias de todas las escuelas. Hyung también es un término de escuelas tradicionales; compartir una palabra no demuestra que coincidan las secuencias. Usa los nombres y la versión del club, sin sustituir una Hyung por un Taegeuk de grado parecido.',
      ),
      L(
        'Try a short section you already know: recall its direction, perform it slowly and stop to check the transition before repeating. If space is limited, study the order seated or mark the directions without full techniques. Returning near the starting point can reveal inconsistent steps, but is not proof that everything was correct. Ask for one correction and keep practicing earlier forms as new ones are introduced.',
        'Probiere einen kurzen bekannten Abschnitt: Erinnere dich an die Richtung, führe ihn langsam aus und prüfe vor der Wiederholung den Übergang. Bei wenig Platz kannst du die Folge im Sitzen durchgehen oder Richtungen ohne volle Techniken markieren. Die Rückkehr nahe zum Start kann ungleichmäßige Schritte aufzeigen, beweist aber nicht die Richtigkeit aller Details. Bitte um eine Korrektur und pflege ältere Formen auch beim Erlernen neuer.',
        'Prueba una sección corta conocida: recuerda su dirección, hazla despacio y comprueba la transición antes de repetir. Si falta espacio, estudia el orden sentado o marca las direcciones sin técnicas completas. Volver cerca del punto inicial puede revelar pasos desiguales, pero no demuestra que todo esté bien. Pide una corrección y sigue repasando formas anteriores al aprender otras nuevas.',
      ),
    ],
    sources: [sharp('cFT', 'Chapter 6: The 24 Essential Patterns in Taekwondo'), pottle('cNE_split_001', 'Chapter 6: Forms (Poomsae (WTF) or Tul (ITF)) — Why Forms?; Levels of Knowing')],
  },
  {
    id: 'principles',
    title: L('Principles in everyday practice', 'Grundsätze im Trainingsalltag', 'Principios en la práctica cotidiana'),
    paragraphs: [
      L(
        'Courtesy, integrity, perseverance, self-control and indomitable spirit become useful when translated into decisions. Courtesy means making room for others and listening; integrity means admitting uncertainty rather than pretending to know. These are practical commitments, not evidence that a belt rank makes someone morally superior.',
        'Höflichkeit, Integrität, Ausdauer, Selbstkontrolle und unbezwingbarer Geist werden durch Entscheidungen greifbar. Höflichkeit heißt, anderen Platz zu geben und zuzuhören; Integrität bedeutet, Unsicherheit zuzugeben statt Wissen vorzutäuschen. Das sind praktische Verpflichtungen, kein Beweis moralischer Überlegenheit durch einen Gürtelgrad.',
        'Cortesía, integridad, perseverancia, autocontrol y espíritu indomable resultan útiles al convertirse en decisiones. La cortesía implica dejar espacio y escuchar; la integridad, reconocer dudas en vez de fingir conocimientos. Son compromisos prácticos, no pruebas de que un grado haga a alguien moralmente superior.',
      ),
      L(
        'Perseverance can mean returning to a difficult transition after rest and feedback. Self-control includes reducing intensity and honoring another person’s stop signal immediately. Indomitable spirit need not mean enduring injury or obeying an unsafe demand: speaking up, declining contact and asking for an adaptation can require courage too.',
        'Ausdauer kann heißen, nach Erholung und Rückmeldung zu einem schwierigen Übergang zurückzukehren. Selbstkontrolle umfasst das Senken der Intensität und das sofortige Beachten eines Stoppsignals. Unbezwingbarer Geist verlangt weder das Ertragen einer Verletzung noch das Befolgen unsicherer Forderungen: Bedenken äußern, Kontakt ablehnen und Anpassungen erbitten kann ebenfalls Mut erfordern.',
        'Perseverar puede significar retomar una transición difícil después de descansar y recibir orientación. El autocontrol incluye bajar la intensidad y respetar de inmediato la señal de parar de otra persona. El espíritu indomable no exige soportar lesiones ni obedecer una demanda insegura: expresar dudas, rechazar el contacto y pedir una adaptación también requieren valor.',
      ),
      L(
        'Choose one behavior for the next class: leave safe spacing, thank a partner for a correction or tell the instructor when you need a pause. Afterward, reflect on what you actually did rather than merely reciting a list. Schools express their values differently; this reading uses the five-tenet framework without presenting it as a medical benefit or an uninterrupted ancient code.',
        'Wähle für die nächste Stunde ein Verhalten: sicheren Abstand lassen, einem Partner für eine Korrektur danken oder eine Pause ansprechen. Überlege danach, was du tatsächlich getan hast, statt nur eine Liste aufzusagen. Schulen formulieren Werte unterschiedlich; diese Lektüre nutzt den Rahmen der fünf Grundsätze ohne Gesundheitsversprechen oder Behauptung eines unverändert überlieferten antiken Kodex.',
        'Elige una conducta para la próxima clase: mantener distancia segura, agradecer una corrección o avisar de que necesitas una pausa. Después, reflexiona sobre lo que hiciste, no solo sobre una lista recitada. Las escuelas expresan sus valores de distintas maneras; aquí se usa el marco de los cinco principios sin prometer beneficios médicos ni presentarlo como un código antiguo ininterrumpido.',
      ),
    ],
    sources: [sharp('cJC', 'Chapter 7: The Five Tenets of Taekwondo — Analyzing the Tenets')],
  },
  {
    id: 'meditation',
    optional: true,
    title: L('Optional meditation and attention', 'Freiwillige Meditation und Aufmerksamkeit', 'Meditación y atención opcionales'),
    paragraphs: [
      L(
        'Meditation is an optional attention exercise, not a requirement for learning Taekwondo or a treatment. Its practical task here is noticing distraction and returning gently to a chosen focus. You do not need to empty the mind or achieve a special state. Quiet observation, with eyes open, is an equally valid alternative to focusing on breathing.',
        'Meditation ist eine freiwillige Aufmerksamkeitsübung, keine Voraussetzung für Taekwondo und keine Behandlung. Hier geht es darum, Ablenkung zu bemerken und behutsam zu einem gewählten Fokus zurückzukehren. Du musst weder den Kopf leeren noch einen besonderen Zustand erreichen. Ruhiges Beobachten mit offenen Augen ist eine gleichwertige Alternative zum Atemfokus.',
        'La meditación es un ejercicio opcional de atención, no un requisito para aprender Taekwondo ni un tratamiento. Aquí consiste en notar una distracción y volver suavemente al foco elegido. No hace falta vaciar la mente ni alcanzar un estado especial. Observar tranquilamente con los ojos abiertos es una alternativa igualmente válida a centrarse en la respiración.',
      ),
      L(
        'For a brief example, sit comfortably on a stable chair or stand with support. Notice a few ordinary breaths without making them deeper, slower or longer. Keep breathing continuously: do not hold your breath or force an exhalation. When a thought appears, acknowledge it and return attention to the room or the natural breath. A few moments are enough; there is no target duration.',
        'Setze dich als kurzes Beispiel bequem auf einen stabilen Stuhl oder stehe mit Halt. Beobachte einige normale Atemzüge, ohne sie tiefer, langsamer oder länger zu machen. Atme durchgehend weiter: weder die Luft anhalten noch das Ausatmen erzwingen. Wenn ein Gedanke auftaucht, nimm ihn wahr und richte die Aufmerksamkeit wieder auf den Raum oder den natürlichen Atem. Einige Augenblicke genügen; eine Zieldauer gibt es nicht.',
        'Como ejemplo breve, siéntate cómodamente en una silla estable o permanece de pie con apoyo. Observa unas respiraciones normales sin hacerlas más profundas, lentas ni largas. Respira de forma continua: no retengas el aire ni fuerces la exhalación. Cuando aparezca un pensamiento, reconócelo y vuelve al entorno o a la respiración natural. Bastan unos momentos; no hay una duración objetivo.',
      ),
      L(
        'Stop if you feel dizzy, short of breath or distressed. Look around, return to ordinary activity and tell the instructor if help is needed. Skip the exercise if it is uncomfortable; calmly naming the next movement is another way to prepare. Nervousness is not a failure of character, and attention practice must never be used to ignore pain or pressure someone into contact.',
        'Höre bei Schwindel, Atemnot oder Belastungsgefühlen auf. Schau dich um, kehre zu gewöhnlicher Tätigkeit zurück und sage der Lehrkraft Bescheid, wenn du Hilfe brauchst. Lass die Übung aus, wenn sie unangenehm ist; die nächste Bewegung ruhig zu benennen ist eine andere Vorbereitung. Nervosität ist kein Charakterfehler, und Aufmerksamkeitsübungen dürfen nie zum Übergehen von Schmerzen oder zum Erzwingen von Kontakt dienen.',
        'Para si notas mareo, falta de aire o angustia. Mira alrededor, vuelve a una actividad normal y avisa al instructor si necesitas ayuda. Omite el ejercicio si resulta incómodo; nombrar con calma el siguiente movimiento es otra forma de prepararte. Los nervios no son un defecto personal, y la atención nunca debe usarse para ignorar dolor ni presionar a alguien a aceptar contacto.',
      ),
    ],
    sources: [sharp('cDF', 'Chapter 5: Meditation and Taekwondo — Breath and Focus; Mindfulness and Taekwondo'), mcwhorter('cYR', 'Chapter Fourteen — Overcoming Fear; Controlling Fear')],
  },
  {
    id: 'warmup-mobility',
    title: L('Warm-up and comfortable mobility', 'Aufwärmen und angenehme Mobilität', 'Calentamiento y movilidad cómoda'),
    paragraphs: [
      L(
        'A warm-up gradually prepares you for the movements ahead; it is not a test of endurance or flexibility. Begin with easy movement in a clear, non-slip space, then rehearse familiar techniques at small range and low speed. Mobility is actively moving through a range you control, unlike staying in a stretch. Warm-up and stretching are related but not interchangeable.',
        'Aufwärmen bereitet schrittweise auf folgende Bewegungen vor; es ist kein Ausdauer- oder Beweglichkeitstest. Beginne mit leichter Bewegung auf freier, rutschfester Fläche und übe dann bekannte Techniken langsam mit kleinem Bewegungsumfang. Mobilität bedeutet, einen kontrollierten Bereich aktiv zu durchlaufen, statt in einer Dehnung zu bleiben. Aufwärmen und Dehnen hängen zusammen, sind aber nicht austauschbar.',
        'El calentamiento prepara gradualmente para los movimientos posteriores; no es una prueba de resistencia ni flexibilidad. Empieza con movimiento suave en un espacio despejado y antideslizante; luego ensaya técnicas conocidas despacio y con recorrido pequeño. La movilidad es recorrer activamente un rango controlado, no permanecer en un estiramiento. Calentar y estirar se relacionan, pero no son intercambiables.',
      ),
      L(
        'One adaptable example is easy walking or seated marching, followed by small shoulder circles and gentle ankle movements. Then try a few short, slow steps into a familiar stance. Start with less than you think you need and pause to check comfort. Use a chair or stable support, keep turns small and leave out any movement you cannot control. These examples are choices, not a required circuit.',
        'Ein anpassbares Beispiel ist lockeres Gehen oder Marschieren im Sitzen, gefolgt von kleinen Schulterkreisen und sanften Sprunggelenkbewegungen. Probiere danach einige kurze, langsame Schritte in eine bekannte Stellung. Beginne sparsam und pausiere zur Kontrolle des Wohlbefindens. Nutze einen Stuhl oder festen Halt, halte Drehungen klein und lasse unkontrollierbare Bewegungen weg. Das sind Wahlmöglichkeiten, kein Pflichtzirkel.',
        'Un ejemplo adaptable es caminar suavemente o marchar sentado, seguido de círculos pequeños de hombros y movimientos suaves de tobillos. Después prueba unos pasos cortos y lentos hacia una posición conocida. Empieza con poco y haz una pausa para comprobar cómo te sientes. Usa una silla o un apoyo estable, reduce los giros y omite lo que no controles. Son opciones, no un circuito obligatorio.',
      ),
      L(
        'You should still be able to speak comfortably during this easy preparation. Rest whenever needed and allow time to settle before the next activity; no timer overrides discomfort. Stop for pain, dizziness, unusual breathlessness or loss of balance. Do not use neck pulling, forced joint circles, bouncing into range or high kicks to prove you are warm. Ask the instructor for an alternative when a movement is unsuitable.',
        'Bei dieser leichten Vorbereitung solltest du noch bequem sprechen können. Ruhe dich nach Bedarf aus und komme vor der nächsten Aktivität zur Ruhe; kein Timer hat Vorrang vor Beschwerden. Bei Schmerzen, Schwindel, ungewöhnlicher Atemnot oder Gleichgewichtsverlust aufhören. Kein Ziehen am Nacken, erzwungenes Gelenkkreisen, Wippen in Endstellungen oder hohe Kicks als Aufwärmbeweis. Bitte bei ungeeigneten Bewegungen um eine Alternative.',
        'Durante esta preparación suave deberías poder hablar cómodamente. Descansa cuando lo necesites y recupérate antes de continuar; ningún cronómetro está por encima de una molestia. Para ante dolor, mareo, falta de aire inusual o pérdida de equilibrio. No tires del cuello, fuerces círculos articulares, rebotes al final del recorrido ni hagas patadas altas para demostrar que has calentado. Pide una alternativa si algo no te resulta adecuado.',
      ),
    ],
    sources: [sharp('c11H', 'Chapter 12: Stretches and Drills — Different Kinds of Stretches'), pottle('c2GV', 'Stretching')],
  },
  {
    id: 'stretching',
    title: L('Gentle stretching without forcing', 'Sanftes Dehnen ohne Zwang', 'Estiramientos suaves sin forzar'),
    paragraphs: [
      L(
        'Stretching explores a comfortable range; it does not require splits or high kicks. A mild pulling sensation is different from pain, but you do not have to label discomfort as “good” and push through it. Warm up first. Gentle static stretching can be considered after easy practice, when you can pay attention rather than compete with someone else’s range.',
        'Dehnen erkundet einen angenehmen Bewegungsbereich; Spagat oder hohe Kicks sind dafür nicht nötig. Ein leichtes Zuggefühl unterscheidet sich von Schmerz, doch du musst Beschwerden nicht als „gut“ einordnen und überwinden. Wärme dich zuerst auf. Sanftes statisches Dehnen kommt nach leichter Übung infrage, wenn du aufmerksam bleibst statt dich mit dem Umfang anderer zu messen.',
        'Estirar explora un rango cómodo; no exige abrirse de piernas ni dar patadas altas. Una tirantez leve no es lo mismo que dolor, pero no tienes que llamar “buena” a una molestia y atravesarla. Calienta primero. Puedes considerar estiramientos estáticos suaves tras una práctica ligera, prestando atención en vez de competir con la amplitud de otros.',
      ),
      L(
        'For example, with hands on a stable wall, take a short staggered stance and gently move forward until a light calf stretch is felt in the rear leg, keeping the heel supported. Shorten the stance to reduce the stretch. If comfortable, an optional brief hold of about 10 seconds on each side is enough to explore the position; release slowly and rest between sides. Omit it if it is unsuitable, and never chase a deeper stretch.',
        'Stütze zum Beispiel die Hände an eine stabile Wand, stelle die Füße kurz versetzt auf und verlagere dich sanft nach vorn, bis ein leichter Zug in der hinteren Wade spürbar ist; die Ferse bleibt am Boden. Verkürze den Stand, um den Zug zu verringern. Wenn angenehm, genügt als freiwilliges Beispiel ein kurzes Halten von etwa 10 Sekunden pro Seite; löse langsam und pausiere zwischen den Seiten. Lass es bei Unverträglichkeit aus und strebe keine tiefere Dehnung an.',
        'Por ejemplo, apoya las manos en una pared estable, coloca los pies algo escalonados y desplázate suavemente hacia delante hasta sentir una tirantez ligera en la pantorrilla trasera, con el talón apoyado. Acorta la posición para reducirla. Si resulta cómodo, mantenerla opcionalmente unos 10 segundos por lado basta para explorarla; suelta despacio y descansa entre lados. Omítela si no es adecuada y no busques más profundidad.',
      ),
      L(
        'Breathe normally and stop for pain, tingling, numbness or joint discomfort. Do not bounce, pull the neck, force the knees down or let a partner push or lift you into a stretch. This reading deliberately does not teach maximal holds, partner-assisted stretching or contraction-against-resistance methods. Stretching is not a guarantee against injury and is not a rehabilitation plan; persistent symptoms need qualified health advice.',
        'Atme normal und höre bei Schmerzen, Kribbeln, Taubheit oder Gelenkbeschwerden auf. Nicht federn, am Nacken ziehen, Knie nach unten drücken oder dich von einem Partner in eine Dehnung drücken oder heben lassen. Diese Lektüre vermittelt bewusst keine maximalen Halteübungen, Partnerdehnungen oder Anspannungsmethoden gegen Widerstand. Dehnen garantiert keine Verletzungsfreiheit und ist kein Rehabilitationsplan; anhaltende Beschwerden brauchen qualifizierte gesundheitliche Abklärung.',
        'Respira normalmente y para ante dolor, hormigueo, entumecimiento o molestias articulares. No rebotes, tires del cuello, fuerces las rodillas hacia abajo ni permitas que un compañero te empuje o levante para estirar. Aquí se excluyen las sujeciones máximas, los estiramientos asistidos y los métodos de contracción contra resistencia. Estirar no garantiza evitar lesiones ni constituye rehabilitación; los síntomas persistentes necesitan orientación sanitaria cualificada.',
      ),
    ],
    sources: [sharp('c11H', 'Chapter 12: Stretches and Drills — Leg Stretches'), pottle('c2GV', 'Stretching; Stretching Form')],
  },
  {
    id: 'conditioning',
    title: L('Adaptable exercises and recovery', 'Anpassbare Übungen und Erholung', 'Ejercicios adaptables y recuperación'),
    paragraphs: [
      L(
        'Conditioning supports repeated, controlled movement; exhaustion is not its goal. Strength work and easy endurance work serve different tasks, and neither replaces learning technique. Choose a familiar, comfortable exercise with the instructor’s guidance. This is general education, not an individual program: health conditions, injuries or uncertainty about suitability call for qualified advice before trying something new.',
        'Konditionstraining unterstützt wiederholte, kontrollierte Bewegung; Erschöpfung ist nicht sein Ziel. Kraftübungen und leichte Ausdauerarbeit erfüllen unterschiedliche Aufgaben und ersetzen kein Techniklernen. Wähle mit der Lehrkraft eine bekannte, angenehme Übung. Das ist allgemeine Information, kein persönliches Programm: Erkrankungen, Verletzungen oder Zweifel an der Eignung erfordern qualifizierte Beratung vor neuen Übungen.',
        'La preparación física apoya movimientos repetidos y controlados; agotarse no es la meta. La fuerza y la resistencia suave cumplen tareas distintas y no sustituyen aprender técnica. Elige con el instructor un ejercicio conocido y cómodo. Esto es información general, no un programa individual: ante enfermedades, lesiones o dudas sobre la adecuación, consulta a alguien cualificado antes de probar algo nuevo.',
      ),
      L(
        'One optional strength example is 3 slow rises from a stable chair, using the hands for support if needed; sit back down under control without dropping. A higher stable seat or simply rehearsing a small supported weight shift makes the task easier. For easy endurance, comfortable walking or seated marching is an alternative. Do not combine every example into a compulsory workout or copy a book’s heavy lifting routine.',
        'Ein freiwilliges Kraftbeispiel sind 3 langsame Aufstehbewegungen von einem stabilen Stuhl, bei Bedarf mit Unterstützung der Hände; setze dich kontrolliert statt fallend wieder hin. Eine höhere stabile Sitzfläche oder nur eine kleine gestützte Gewichtsverlagerung erleichtert die Aufgabe. Für leichte Ausdauer sind angenehmes Gehen oder Marschieren im Sitzen Alternativen. Verbinde nicht alle Beispiele zu einem Pflichtprogramm und kopiere kein schweres Hanteltraining aus dem Buch.',
        'Un ejemplo opcional de fuerza son 3 levantamientos lentos desde una silla estable, ayudándote con las manos si hace falta; vuelve a sentarte con control, sin dejarte caer. Un asiento estable más alto o ensayar solo un pequeño cambio de peso con apoyo facilita la tarea. Para resistencia suave, caminar cómodamente o marchar sentado son alternativas. No conviertas todos los ejemplos en una rutina obligatoria ni copies el levantamiento pesado del libro.',
      ),
      L(
        'Rest after the small effort until breathing and balance feel comfortable; stop the session rather than repeat with deteriorating control. Keep breathing throughout. Pain, dizziness, unusual breathlessness or joint discomfort mean stop, not “one more.” Allow recovery between demanding sessions and reduce or skip activity when unusually tired or sore. Seek qualified help for persistent or concerning symptoms; a text cannot determine whether discomfort is harmless.',
        'Ruhe nach der kleinen Belastung, bis Atmung und Gleichgewicht angenehm sind; beende die Einheit statt mit schlechterer Kontrolle zu wiederholen. Atme durchgehend. Schmerzen, Schwindel, ungewöhnliche Atemnot oder Gelenkbeschwerden bedeuten Stopp, nicht „noch einmal“. Plane Erholung zwischen anstrengenden Einheiten und reduziere oder überspringe Aktivität bei ungewöhnlicher Müdigkeit oder Muskelbeschwerden. Lass anhaltende oder beunruhigende Symptome qualifiziert abklären; ein Text kann ihre Harmlosigkeit nicht bestimmen.',
        'Descansa tras el pequeño esfuerzo hasta recuperar una respiración y un equilibrio cómodos; termina la sesión en vez de repetir perdiendo control. Sigue respirando. Dolor, mareo, falta de aire inusual o molestias articulares significan parar, no “una más”. Deja recuperación entre sesiones exigentes y reduce u omite actividad si hay cansancio o molestias musculares inusuales. Busca ayuda cualificada para síntomas persistentes o preocupantes; un texto no puede decidir si son inofensivos.',
      ),
    ],
    sources: [sharp('c148', 'Chapter 13: The Taekwondo Habit: Training, Discipline, and Mindset — Exercise'), pottle('c2D4', 'Chapter 14: Training — Good Vs Bad Pain'), pottle('c2GV', 'Weight Training: (by Bing Zhao, CU Class of 2003)')],
  },
  {
    id: 'practice',
    title: L('Practice habits and progression', 'Übungsgewohnheiten und Fortschritt', 'Hábitos de práctica y progresión'),
    paragraphs: [
      L(
        'A useful practice habit has a small purpose and a feedback loop. Choose a familiar movement, recall one teaching cue, rehearse it slowly and check what changed. A short note such as “I kept balance during the turn” is more informative than counting repetitions alone. Regular, attentive practice is different from repeating an error while tired; rest and asking a question are productive choices too.',
        'Eine hilfreiche Übungsgewohnheit hat ein kleines Ziel und eine Rückmeldung. Wähle eine bekannte Bewegung, erinnere dich an einen Hinweis, übe langsam und prüfe die Veränderung. Eine kurze Notiz wie „Ich hielt beim Drehen das Gleichgewicht“ sagt mehr als eine bloße Wiederholungszahl. Regelmäßiges, aufmerksames Üben ist nicht das ermüdete Wiederholen eines Fehlers; auch Pausen und Nachfragen sind sinnvoll.',
        'Un hábito útil tiene un propósito pequeño y un ciclo de revisión. Elige un movimiento conocido, recuerda una indicación, ensáyalo despacio y comprueba qué cambió. Una nota como “mantuve el equilibrio al girar” informa más que contar repeticiones. Practicar con regularidad y atención no es repetir un error estando cansado; descansar y preguntar también son decisiones productivas.',
      ),
      L(
        'Progress can mean needing fewer reminders, moving comfortably on both sides or understanding why a transition is used. It does not have to mean a higher kick, more force or an earlier belt test. Keep the same manageable task while improving its quality; change only one demand at a time with guidance. Earlier basics remain worth revisiting, and plateaus do not prove a lack of talent or effort.',
        'Fortschritt kann bedeuten, weniger Erinnerungen zu brauchen, sich auf beiden Seiten angenehm zu bewegen oder einen Übergang zu verstehen. Höhere Kicks, mehr Kraft oder frühere Prüfungen sind nicht nötig. Behalte eine bewältigbare Aufgabe bei und verbessere ihre Qualität; ändere angeleitet jeweils nur eine Anforderung. Grundlagen bleiben wiederholenswert, und ein Stillstand beweist weder mangelndes Talent noch fehlenden Einsatz.',
        'Progresar puede ser necesitar menos recordatorios, moverse cómodamente a ambos lados o entender una transición. No tiene que significar una patada más alta, más fuerza o un examen anticipado. Conserva una tarea manejable y mejora su calidad; cambia solo una exigencia cada vez con orientación. Siempre merece la pena volver a lo básico, y un estancamiento no demuestra falta de talento ni esfuerzo.',
      ),
      L(
        'For an adaptable practice plan, clear the space, prepare gently, review one known section and finish with a note or question for class. Pause whenever attention or movement quality drops, and leave recovery time afterward. On a day when physical practice is unsuitable, recalling the sequence or reviewing terminology may be enough, or simply rest. Do not copy large daily repetition totals or use a streak to override pain, illness or fatigue.',
        'Ein anpassbarer Übungsrahmen: Platz schaffen, behutsam vorbereiten, einen bekannten Abschnitt wiederholen und eine Notiz oder Frage für den Unterricht festhalten. Pausiere bei nachlassender Aufmerksamkeit oder Bewegungsqualität und lasse danach Zeit zur Erholung. Ist körperliches Üben ungeeignet, können Erinnern der Folge oder Begriffswiederholung genügen, oder einfach Ruhe. Übernimm keine hohen täglichen Wiederholungszahlen und stelle keine Übungsserie über Schmerzen, Krankheit oder Müdigkeit.',
        'Como marco adaptable, despeja el espacio, prepárate suavemente, repasa una sección conocida y termina con una nota o pregunta para clase. Haz una pausa si decae la atención o la calidad y deja tiempo de recuperación después. Si la práctica física no es adecuada ese día, puede bastar recordar la secuencia o repasar términos, o simplemente descansar. No copies grandes cifras diarias ni uses una racha para ignorar dolor, enfermedad o fatiga.',
      ),
    ],
    sources: [sharp('c148', 'Chapter 13: The Taekwondo Habit: Training, Discipline, and Mindset — Practice Regularly; Meditate and Visualize'), pottle('c2D4', 'Chapter 14: Training — Progress Vs Time; Process Vs Outcome'), mcwhorter('c9Y', 'Chapter Four — Have Fun; Repetition Leads to Successes')],
  },
]
