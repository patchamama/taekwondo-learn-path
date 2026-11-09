import type { Loc } from '../../shared/i18n/types'

const L = (en: string, de: string, es: string): Loc => ({ en, de, es })

export interface Event {
  year: string
  text: Loc
  source: 'pdf' | 'general'
}

// Source: Korea PDF §5.3, §5.8 (timeline condensed and translated)
export const TIMELINE: Event[] = [
  {
    year: '2333 BC',
    source: 'pdf',
    text: L(
      'The demigod Tangun founds (Old) Choson, "Land of the Morning Calm".',
      'Der Halbgott Tangun gründet (Alt-)Choson, das „Land der Morgenstille“.',
      'El semidiós Tangun funda (Viejo) Choson, la «Tierra de la Calma Matutina».',
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
    year: '668 – 918',
    source: 'pdf',
    text: L(
      "Unified Silla under King Munmu. (Silla's Hwarang warriors inspire the form Hwa-Rang.)",
      'Groß-Silla unter König Munmu. (Sillas Hwarang-Krieger inspirieren die Form Hwa-Rang.)',
      'Gran Silla bajo el rey Munmu. (Los guerreros Hwarang de Silla inspiran la forma Hwa-Rang.)',
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
    source: 'pdf',
    text: L(
      'Yi Songgye (Taejo) founds the Joseon dynasty.',
      'Yi Songgye (Taejo) gründet die Joseon-Dynastie.',
      'Yi Songgye (Taejo) funda la dinastía Joseon.',
    ),
  },
  {
    year: '1910 – 1945',
    source: 'pdf',
    text: L(
      'Korea is a Japanese colony. Karate reaches Korea in this period.',
      'Korea ist japanische Kolonie. In dieser Zeit gelangt Karate nach Korea.',
      'Corea es colonia japonesa. En esta época llega el karate a Corea.',
    ),
  },
  {
    year: '1945',
    source: 'pdf',
    text: L(
      'Division of Korea into a Soviet and an American zone.',
      'Teilung Koreas in eine sowjetische und eine amerikanische Zone.',
      'División de Corea en una zona soviética y otra estadounidense.',
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
      'The name "Taekwondo" is adopted.',
      'Der Name „Taekwondo“ wird angenommen.',
      'Se adopta el nombre «Taekwondo».',
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
    year: '1965 – 1969',
    source: 'pdf',
    text: L(
      'KTA committee creates the Poomse: Palgwae and Yudanja (taught from 30 Nov 1967), Taeguk (30 Jan 1969).',
      'KTA-Komitee schafft die Poomse: Palgwae und Yudanja (ab 30.11.1967), Taeguk (30.01.1969).',
      'El comité KTA crea las Poomse: Palgwae y Yudanja (desde 30-11-1967), Taeguk (30-01-1969).',
    ),
  },
  {
    year: '1972',
    source: 'pdf',
    text: L(
      'Choi emigrates to Canada and the ITF moves with him; South Korea founds the WTF in response.',
      'Choi wandert nach Kanada aus, die ITF zieht mit; Südkorea gründet als Reaktion die WTF.',
      'Choi emigra a Canadá y la ITF se traslada con él; Corea del Sur funda la WTF como respuesta.',
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

export const CHOI: Loc[] = [
  L(
    'Born 9 Nov 1918 in Hwa Dae (today North Korea); expelled from school at 12 for protesting against the Japanese occupation.',
    'Geboren am 9.11.1918 in Hwa Dae (heute Nordkorea); mit 12 von der Schule verwiesen, weil er gegen die japanische Besatzung aufwiegelte.',
    'Nació el 9-11-1918 en Hwa Dae (hoy Corea del Norte); expulsado del colegio a los 12 por protestar contra la ocupación japonesa.',
  ),
  L(
    'In 1938 he was sent to Japan, learned karate and reached 1st Dan after two years.',
    '1938 nach Japan geschickt, lernte er Karate und erreichte nach zwei Jahren den 1. Dan.',
    'En 1938 fue enviado a Japón, aprendió karate y alcanzó el 1.er Dan en dos años.',
  ),
  L(
    'After 1945 he served in the new South Korean army and wanted to create a Korean martial art superior to Japanese karate in spirit and technique.',
    'Nach 1945 diente er in der südkoreanischen Armee und wollte eine koreanische Kampfkunst schaffen, die dem Karate in Psyche und Technik überlegen ist.',
    'Tras 1945 sirvió en el ejército surcoreano y quiso crear un arte marcial coreano superior al karate en espíritu y técnica.',
  ),
  L(
    'He became brigadier general in 1951 and introduced the art into army training under the new name Taekwon-Do.',
    '1951 wurde er Brigadegeneral und führte die Kunst unter dem neuen Namen Taekwon-Do in die Armeeausbildung ein.',
    'En 1951 fue general de brigada e introdujo el arte en el ejército con el nuevo nombre Taekwon-Do.',
  ),
  L(
    'He died on 15 June 2002 in Pyeongyang, aged 83.',
    'Er starb am 15.6.2002 mit 83 Jahren in Pyeongyang.',
    'Murió el 15-06-2002 en Pyeongyang, a los 83 años.',
  ),
]
