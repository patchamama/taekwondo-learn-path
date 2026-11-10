import type { Loc } from '../shared/i18n/types'

const L = (en: string, de: string, es: string): Loc => ({ en, de, es })

/** What each technique is, how it is executed and what it is used for. Written from the club programme and general Taekwondo knowledge. */
export const TECHNIQUE_INFO: Record<string, Loc> = {
  'momtong-chirugi': L(
    'A straight punch to the trunk (solar plexus). The fist travels from the hip, the forearm turns over at the end and the wrist stays straight. Basic attack of every form and drill.',
    'Ein gerader Fauststoß zum Rumpf (Solarplexus). Die Faust kommt aus der Hüfte, der Unterarm dreht am Ende ein, das Handgelenk bleibt gerade. Grundangriff jeder Form und Übung.',
    'Puñetazo recto al tronco (plexo solar). El puño sale de la cadera, el antebrazo gira al final y la muñeca queda recta. Ataque básico de toda forma y ejercicio.',
  ),
  'hansonnal-mok-chicki': L(
    'A cutting strike with the knife-hand edge to the side of the neck, travelling from outside to inside. Used as a counterattack after a block.',
    'Ein Schlag mit der Handkante seitlich zum Hals, von außen nach innen. Wird als Konter nach einer Abwehr eingesetzt.',
    'Golpe cortante con el canto de la mano al lateral del cuello, de fuera hacia dentro. Se usa como contraataque tras un bloqueo.',
  ),
  'arae-macki': L(
    'Low block: the forearm sweeps from the opposite shoulder down to above the knee to stop a punch or kick to the lower body.',
    'Abwärtsblock: Der Unterarm fährt von der gegenüberliegenden Schulter nach unten bis über das Knie und stoppt Stoß oder Tritt zum Unterkörper.',
    'Bloqueo bajo: el antebrazo baja desde el hombro contrario hasta encima de la rodilla para detener un golpe o patada al tren inferior.',
  ),
  'olgul-macki': L(
    'High (rising) block: the forearm rises from the hip to just above the forehead, deflecting an attack to the face upwards.',
    'Aufwärtsblock: Der Unterarm steigt von der Hüfte bis knapp über die Stirn und lenkt einen Angriff zum Gesicht nach oben ab.',
    'Bloqueo alto: el antebrazo sube desde la cadera hasta justo encima de la frente y desvía hacia arriba un ataque a la cara.',
  ),
  'momtong-an-macki': L(
    'Middle block from outside to inside: the forearm describes an arc from the shoulder to in front of the solar plexus and moves a trunk attack to the side.',
    'Mittelstufenblock von außen nach innen: Der Unterarm beschreibt einen Bogen von der Schulter bis vor den Solarplexus und lenkt einen Rumpfangriff zur Seite.',
    'Bloqueo medio de fuera a dentro: el antebrazo dibuja un arco desde el hombro hasta delante del plexo y aparta hacia un lado un ataque al tronco.',
  ),
  'momtong-packat-macki': L(
    'Middle block from inside to outside: the forearm swings outwards in front of the trunk and pushes the attack away from the centre line.',
    'Mittelstufenblock von innen nach außen: Der Unterarm schwingt vor dem Rumpf nach außen und drückt den Angriff von der Mittellinie weg.',
    'Bloqueo medio de dentro a fuera: el antebrazo se abre delante del tronco y aparta el ataque de la línea central.',
  ),
  'hansonnal-arae-macki': L(
    'Low block made with the knife-hand edge instead of the forearm; the edge cuts down across the body.',
    'Abwärtsblock mit der Handkante statt mit dem Unterarm; die Handkante schneidet nach unten vor dem Körper.',
    'Bloqueo bajo con el canto de la mano en lugar del antebrazo; el canto corta hacia abajo delante del cuerpo.',
  ),
  'momtong-hansonnal-packat-macki': L(
    'Middle block with the knife-hand edge, from inside to outside. Typically done in a back stance, with the other hand ready in front of the trunk.',
    'Mittelstufenblock mit der Handkante von innen nach außen. Meist in der L-Stellung, die andere Hand schützt den Rumpf.',
    'Bloqueo medio con el canto de la mano, de dentro a fuera. Suele hacerse en posición en L, con la otra mano protegiendo el tronco.',
  ),
  'sonnal-momtong-kotoro-macki': L(
    'Reinforced middle block: both hands take part, the second one supports or covers while the first blocks with the knife-hand edge.',
    'Verstärkter Mittelstufenblock: Beide Hände sind beteiligt, die zweite unterstützt oder deckt, während die erste mit der Handkante abwehrt.',
    'Bloqueo medio reforzado: participan ambas manos; la segunda apoya o cubre mientras la primera bloquea con el canto de la mano.',
  ),
  'goduro-packat-palmok-packat-macki': L(
    'Reinforced middle block with the forearm: the second fist supports the blocking arm, which makes the block stronger against a powerful attack.',
    'Verstärkter Mittelstufenblock mit dem Unterarm: Die zweite Faust unterstützt den abwehrenden Arm und macht die Abwehr gegen einen kräftigen Angriff stabiler.',
    'Bloqueo medio reforzado con el antebrazo: el segundo puño apoya al brazo que bloquea y lo hace más firme ante un ataque potente.',
  ),
  'ap-chagi': L(
    'Front kick: lift the knee, extend the leg straight forward and hit with the ball of the foot (apchuk), then bring the leg back. Used to keep distance or attack the trunk.',
    'Vorwärtsfußstoß: Knie anheben, Bein gerade nach vorn strecken und mit dem Fußballen (apchuk) treffen, dann zurückziehen. Zum Abstand halten oder Rumpf angreifen.',
    'Patada frontal: sube la rodilla, extiende la pierna hacia delante y golpea con la bola del pie (apchuk); luego recoge la pierna. Sirve para mantener la distancia o atacar el tronco.',
  ),
  'dollyo-chagi': L(
    'Roundhouse kick: the hip turns over, the leg swings in a half circle and hits with the instep or the ball of the foot. The most used kick in sparring.',
    'Halbkreisfußstoß: Die Hüfte dreht ein, das Bein schwingt im Halbkreis und trifft mit Spann oder Fußballen. Der häufigste Tritt im Kampf.',
    'Patada circular: la cadera gira, la pierna describe un semicírculo y golpea con el empeine o la bola del pie. La patada más usada en combate.',
  ),
  'yop-chagi': L(
    'Side kick: the body turns sideways, the knee is chambered and the leg thrusts out sideways, hitting with the edge of the foot (palnal) or heel. Powerful and long reaching.',
    'Seitenfußstoß: Der Körper dreht seitlich, das Knie wird angezogen und das Bein stößt seitlich aus; Treffer mit der Fußkante (palnal) oder Ferse. Kraftvoll und weitreichend.',
    'Patada lateral: el cuerpo gira de lado, se sube la rodilla y la pierna se proyecta hacia el costado, golpeando con el canto del pie (palnal) o el talón. Potente y de largo alcance.',
  ),
  'naeryo-chagi': L(
    'Axe kick: the leg rises straight and comes down like an axe, hitting with the heel. Used against the head, collarbone or to break a guard.',
    'Axt-Tritt: Das Bein steigt gestreckt auf und fällt wie eine Axt herab; Treffer mit der Ferse. Gegen Kopf, Schlüsselbein oder um eine Deckung zu durchbrechen.',
    'Patada de hacha: la pierna sube estirada y cae como un hacha golpeando con el talón. Se usa contra la cabeza, la clavícula o para romper una guardia.',
  ),
  'düt-chagi': L(
    'Back kick ("horse kick"): look over the shoulder, turn the back to the target and push the heel straight backwards. Strong, used when an opponent is behind or closing in.',
    'Rückwärtsfußstoß („Pferdetritt“): Blick über die Schulter, Rücken zum Ziel drehen und die Ferse gerade nach hinten stoßen. Kraftvoll, gegen Gegner hinter oder nahe am Körper.',
    'Patada hacia atrás («de caballo»): mira por encima del hombro, gira la espalda al objetivo y empuja el talón recto hacia atrás. Fuerte; sirve cuando el oponente está detrás o muy cerca.',
  ),
  'moa-sogi': L(
    'Attention stance: heels together, feet slightly apart at the toes, arms along the seams of the trousers. Used for greeting and at the start/end of practice.',
    'Achtungsstellung: Fersen zusammen, Fußspitzen leicht geöffnet, Arme an der Hosennaht. Für Gruß sowie Beginn und Ende des Trainings.',
    'Posición de firmes: talones juntos, puntas ligeramente abiertas, brazos pegados a la costura del pantalón. Se usa para saludar y al empezar o terminar la práctica.',
  ),
  'pyonhi-sogi': L(
    'Small parallel ("comfortable") stance: feet shoulder-width apart, relaxed. A ready position between techniques.',
    'Kleine Parallelstellung („bequem“): Füße schulterbreit, entspannt. Bereitschaftsposition zwischen den Techniken.',
    'Posición paralela corta («cómoda»): pies a la anchura de los hombros, relajados. Posición de espera entre técnicas.',
  ),
  'chuchum-sogi': L(
    'Large parallel (horse) stance: feet twice shoulder-width apart, knees bent, weight evenly distributed. Trains leg strength and is used for punching drills.',
    'Große Parallelstellung (Pferdestellung): Füße doppelt schulterbreit, Knie gebeugt, Gewicht gleich verteilt. Trainiert Beinkraft und wird für Stoßübungen genutzt.',
    'Posición paralela larga (del jinete): pies a doble anchura de hombros, rodillas flexionadas y peso repartido. Entrena la fuerza de piernas y se usa para ejercicios de golpes.',
  ),
  'ap-sogi': L(
    'Small forward (walking) stance: a normal step length, front knee slightly bent. Used for walking and quick transitions.',
    'Kleine Vorwärtsstellung (Schrittstellung): normale Schrittlänge, vorderes Knie leicht gebeugt. Für Gehen und schnelle Übergänge.',
    'Posición adelantada corta (de marcha): un paso normal con la rodilla delantera ligeramente flexionada. Para caminar y hacer transiciones rápidas.',
  ),
  'ap-gubi': L(
    'Long forward (bow) stance: feet shoulder-width apart on two lines, front knee bent above the foot, back leg straight. Stable base for blocks and punches (like karate zenkutsu-dachi).',
    'Große Vorwärtsstellung: Füße schulterbreit auf zwei Linien, vorderes Knie über dem Fuß gebeugt, hinteres Bein gestreckt. Stabile Basis für Abwehr und Stoß (wie Karate zenkutsu-dachi).',
    'Posición de arco larga: pies a la anchura de hombros en dos líneas, rodilla delantera flexionada sobre el pie y pierna trasera estirada. Base estable para bloqueos y golpes (como el zenkutsu-dachi del karate).',
  ),
  'düt-gubi': L(
    'L-stance (back stance): about 70% of the weight on the back leg, front foot light. Allows quick kicks with the front leg and protects the centre line.',
    'L-Stellung (rückwärtige Stellung): etwa 70 % des Gewichts auf dem hinteren Bein, vorderer Fuß leicht. Ermöglicht schnelle Tritte mit dem Vorderbein und schützt die Mittellinie.',
    'Posición en L (peso atrás): cerca del 70 % del peso sobre la pierna trasera y el pie delantero ligero. Permite patadas rápidas con la pierna delantera y protege la línea central.',
  ),
  'saju-macki': L(
    'Four-direction block drill: low block with the knife-hand, then a middle block with the forearm, turning a quarter each time. Practises stances, turns and blocks. A drill, not a form.',
    'Vierseitenblock: Abwärtsblock mit der Handkante, dann Mittelstufenblock mit dem Unterarm, jeweils mit einer Vierteldrehung. Übt Stellungen, Drehungen und Abwehr. Eine Übung, keine Form.',
    'Ejercicio de bloqueo en cuatro direcciones: bloqueo bajo con el canto de la mano y luego medio con el antebrazo, girando un cuarto cada vez. Practica posiciones, giros y bloqueos. Es un ejercicio, no una forma.',
  ),
  'twio-chagi': L(
    'Jump kick: the same kick done in the air after a jump. Adds reach and surprise; it trains balance, timing and power.',
    'Sprungtechnik: derselbe Tritt in der Luft nach einem Sprung. Gibt Reichweite und Überraschung; trainiert Gleichgewicht, Timing und Kraft.',
    'Patada con salto: la misma patada ejecutada en el aire tras un salto. Da alcance y sorpresa; entrena equilibrio, timing y potencia.',
  ),
  'twio-ap-chagi': L(
    'Jumping front kick: jump forward and strike with the ball of the foot while in the air. Used to cross distance quickly or to hit a high target.',
    'Gesprungener Vorwärtsfußtritt: nach vorn abspringen und in der Luft mit dem Fußballen treffen. Zum schnellen Überbrücken der Distanz oder für hohe Ziele.',
    'Patada frontal saltada: se salta hacia delante y se golpea con la bola del pie en el aire. Sirve para cubrir la distancia rápido o alcanzar un objetivo alto.',
  ),
  'an-naeryo-chagi': L(
    'Inward axe kick: the leg rises on the outside and comes down across the body to the inside, finishing with the heel on the target.',
    'Axt-Tritt von außen nach innen: Das Bein steigt außen auf und fällt quer vor dem Körper nach innen; Abschluss mit der Ferse auf dem Ziel.',
    'Hacha de fuera a dentro: la pierna sube por fuera y cae cruzando el cuerpo hacia dentro, terminando con el talón en el objetivo.',
  ),
  'packat-naeryo-chagi': L(
    'Outward axe kick: the leg rises across the body and comes down from inside to outside, finishing with the heel on the target.',
    'Axt-Tritt von innen nach außen: Das Bein steigt quer vor dem Körper auf und fällt von innen nach außen; Abschluss mit der Ferse auf dem Ziel.',
    'Hacha de dentro a fuera: la pierna sube cruzando el cuerpo y cae de dentro a fuera, terminando con el talón en el objetivo.',
  ),
  'gibon-junbi-sogi': L(
    'Basic ready stance: feet parallel, both fists held in a circle at belt-knot height in front of the belly. Start position of most forms.',
    'Grund-Bereitschaftsstellung: Füße parallel, beide Fäuste kreisförmig in Höhe des Gürtelknotens vor dem Bauch. Startstellung der meisten Formen.',
    'Posición básica de preparación: pies paralelos y ambos puños formando un círculo a la altura del nudo del cinturón. Posición inicial de casi todas las formas.',
  ),
  'narani-sogi': L(
    'Parallel stance with the toes slightly turned in (club usage, outer edges of the feet parallel). Careful: in the Kukkiwon textbook "narani seogi" is a parallel stance with toes forward.',
    'Parallelstellung mit leicht nach innen zeigenden Zehen (Vereinsgebrauch, Außenkanten parallel). Achtung: Im Kukkiwon-Lehrbuch ist „narani seogi“ eine Parallelstellung mit Zehen nach vorn.',
    'Posición paralela con las puntas ligeramente hacia dentro (uso del club, cantos externos paralelos). Ojo: en el libro Kukkiwon «narani seogi» es una paralela con las puntas hacia delante.',
  ),
  'saju-chirugi': L(
    'Four-direction punch drill: low block then middle punch in a long forward stance, turning a quarter each time. Practises the long stance, turns and the basic punch. A drill, not a form.',
    'Vierseitenfauststoß: Abwärtsblock, dann Mittelstufenfauststoß in der großen Vorwärtsstellung, jeweils mit Vierteldrehung. Übt die große Stellung, Drehungen und den Grundstoß. Eine Übung, keine Form.',
    'Ejercicio de golpe en cuatro direcciones: bloqueo bajo y luego puñetazo medio en posición de arco larga, girando un cuarto cada vez. Practica la posición larga, los giros y el golpe básico. Es un ejercicio, no una forma.',
  ),
}
