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
