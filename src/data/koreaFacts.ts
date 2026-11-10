import type { Loc } from '../shared/i18n/types'
import type { Row, RuleSection } from './examRules'

const L = (en: string, de: string, es: string): Loc => ({ en, de, es })
const same = (v: string): Loc => L(v, v, v)
const r = (label: Loc, v: string): Row => ({ label, value: same(v) })

// Source: Korea PDF (1st edition 2024), sections 5.1, 5.2 and 5.7.
export const KOREA_FACTS: RuleSection[] = [
  {
    id: 'geography',
    title: L('Geography', 'Geografie', 'Geografía'),
    bullets: [
      L(
        "The Korean peninsula is of volcanic origin and has been split since 1948 into the north (Democratic People's Republic of Korea, capital Pyeongyang) and the south (Republic of Korea, Daehan Min-guk, capital Seoul).",
        'Die koreanische Halbinsel ist vulkanischen Ursprungs und seit 1948 geteilt: Nordkorea (Hauptstadt Pyeongyang) und die Republik Korea im Süden (Daehan Min-guk, Hauptstadt Seoul).',
        'La península de Corea es de origen volcánico y está dividida desde 1948 entre el norte (República Popular Democrática de Corea, capital Pyeongyang) y el sur (República de Corea, Daehan Min-guk, capital Seúl).',
      ),
      L(
        'The border runs roughly along the 38th parallel as a 4 km wide demilitarised zone, since 27 July 1953.',
        'Die Grenze verläuft etwa entlang des 38. Breitengrads als 4 km breite entmilitarisierte Zone, seit dem 27.7.1953.',
        'La frontera sigue aproximadamente el paralelo 38 como una zona desmilitarizada de 4 km de ancho, desde el 27 de julio de 1953.',
      ),
      L(
        'About 1,000 km north to south, 216 km at the narrowest point; 218,940 km² (about the size of New Zealand). Seas: Yellow Sea (west), Sea of Japan (east), East China Sea (south). Neighbours: China (Manchuria) and, at the far north-east, Russia.',
        'Rund 1.000 km Nord-Süd-Ausdehnung, an der schmalsten Stelle 216 km; 218.940 km² (etwa so groß wie Neuseeland). Meere: Gelbes Meer (West), Japanisches Meer (Ost), Ostchinesisches Meer (Süd). Nachbarn: China (Mandschurei) und im äußersten Nordosten Russland.',
        'Unos 1.000 km de norte a sur, 216 km en el punto más estrecho; 218.940 km² (similar a Nueva Zelanda). Mares: Amarillo (oeste), de Japón (este) y de China Oriental (sur). Vecinos: China (Manchuria) y, en el extremo noreste, Rusia.',
      ),
      L(
        'About 70% mountains; more than 3,400 islands, the largest being Cheju-do. Highest mountain: Paektusan (2,744 m) in the north, then Hallasan (1,950 m) on Cheju-do. Longest rivers: Amnokkang/Yalu (790 km) and Naktongang (525 km).',
        'Rund 70% niedrige Höhenzüge; über 3.400 Inseln, die größte ist Cheju-do. Höchster Berg: Paektusan (2.744 m) im Norden, dann Hallasan (1.950 m) auf Cheju-do. Längste Flüsse: Amnokkang/Yalu (790 km) und Naktongang (525 km).',
        'Alrededor del 70% son montañas; más de 3.400 islas, la mayor es Cheju-do. Montaña más alta: Paektusan (2.744 m) al norte, luego Hallasan (1.950 m) en Cheju-do. Ríos más largos: Amnokkang/Yalu (790 km) y Naktongang (525 km).',
      ),
      L(
        'Monsoon climate: hot and humid summers (rain June-August), short spring and autumn, long, cold and dry winters.',
        'Monsunklima: heiße, feuchte Sommer (Regen Juni bis August), kurzer Frühling und Herbst, lange, kalte und trockene Winter.',
        'Clima monzónico: veranos calurosos y húmedos (lluvias de junio a agosto), primavera y otoño cortos, inviernos largos, fríos y secos.',
      ),
      L(
        'National flower: Mugunghwa (hibiscus). The Korean tiger no longer lives on the peninsula and survives mostly in legends, which is why Horangi is your guide.',
        'Nationalblume: Mugunghwa (Hibiskus). Der koreanische Tiger kommt auf der Halbinsel nicht mehr vor und lebt vor allem in Sagen weiter, daher ist Horangi dein Begleiter.',
        'Flor nacional: Mugunghwa (hibisco). El tigre coreano ya no vive en la península y pervive sobre todo en las leyendas, por eso Horangi es tu guía.',
      ),
    ],
  },
  {
    id: 'culture',
    title: L('Culture and etiquette', 'Kultur und Etikette', 'Cultura y etiqueta'),
    bullets: [
      L(
        'Confucianism, Buddhism and shamanism shape Korean life. Respect for elders and ancestors and a clear hierarchy (age, status, profession) matter more than in Western cultures; this is why the dojang has its bows and forms of address.',
        'Konfuzianismus, Buddhismus und Schamanismus prägen das Leben. Respekt vor Älteren und Vorfahren und eine klare Hierarchie (Alter, Status, Beruf) zählen mehr als im Westen; deshalb gibt es im Dojang Verbeugungen und Anredeformen.',
        'El confucianismo, el budismo y el chamanismo marcan la vida coreana. El respeto a mayores y antepasados y una jerarquía clara (edad, estatus, profesión) pesan más que en Occidente; por eso el dojang tiene saludos y formas de tratamiento.',
      ),
      L(
        'Chaemyeon (체면), "keeping face": staying calm and not showing anger openly protects one\'s social standing.',
        'Chaemyeon (체면), „das Gesicht wahren“: Ruhe bewahren und Ärger nicht offen zeigen schützt die soziale Stellung.',
        'Chaemyeon (체면), «salvar la cara»: mantener la calma y no mostrar la ira abiertamente protege la posición social.',
      ),
    ],
  },
  {
    id: 'data',
    title: L(
      'Key data: Germany, South Korea, North Korea',
      'Eckdaten: Deutschland, Südkorea, Nordkorea',
      'Datos clave: Alemania, Corea del Sur, Corea del Norte',
    ),
    rows: [
      r(
        L('Area', 'Gesamtfläche', 'Superficie'),
        'DE 357,580 km² · KR 100,339 km² · KP 120,540 km²',
      ),
      r(
        L('Population', 'Einwohner', 'Habitantes'),
        'DE 84.6 M (2022) · KR 51.63 M (2022) · KP 26.07 M (2018)',
      ),
      r(L('Capital', 'Hauptstadt', 'Capital'), 'Berlin · Seoul · Pyeongyang'),
      r(
        L('Highest mountain', 'Höchster Berg', 'Montaña más alta'),
        'Zugspitze 2,963 m · Hallasan 1,950 m · Paektusan 2,744 m',
      ),
      r(
        L('Longest river', 'Längster Fluss', 'Río más largo'),
        'Rhein 865 km · Naktonggang 525 km · Amnokkang 790 km',
      ),
      r(
        L('GDP per capita', 'BIP pro Kopf', 'PIB per cápita'),
        '46,266 € · 30,791 € · 1,572 € (2022)',
      ),
    ],
  },
  {
    id: 'flag',
    title: L('The flag: Taeguk-ki', 'Die Flagge: Taeguk-ki', 'La bandera: Taeguk-ki'),
    bullets: [
      L(
        'Taeguk-ki comes from "Tae Guk", the circle in the middle: the same Taeguk that names the Taegeuk forms. First raised in 1882; King Kojong decreed its design on 6 March 1883; the current form was introduced on 25 January 1950.',
        'Taeguk-ki leitet sich von „Tae Guk“ ab, dem Kreis in der Mitte: dasselbe Taeguk, das den Taegeuk-Formen den Namen gibt. 1882 erstmals gehisst; König Kojong ordnete das Aussehen am 6.3.1883 an; die heutige Form gilt seit dem 25.1.1950.',
        'Taeguk-ki viene de «Tae Guk», el círculo central: el mismo Taeguk que da nombre a las formas Taegeuk. Se izó por primera vez en 1882; el rey Kojong decretó su diseño el 6 de marzo de 1883; la forma actual rige desde el 25 de enero de 1950.',
      ),
      L(
        'White background = peace. The red (yang, male) and blue (yin, female) circle = origin of everything and perfect harmony of opposites such as fire and water, day and night.',
        'Weißer Hintergrund = Frieden. Roter (Yang, männlich) und blauer (Yin, weiblich) Kreis = Ursprung aller Dinge und Harmonie der Gegensätze wie Feuer und Wasser, Tag und Nacht.',
        'Fondo blanco = paz. El círculo rojo (yang, masculino) y azul (yin, femenino) = origen de todo y armonía de opuestos como fuego y agua, día y noche.',
      ),
      L(
        'Four trigrams from the I Ching: Kien (heaven, three solid lines, top left), Li (fire, bottom left), Kan (water, top right), Kun (earth, six half lines, bottom right).',
        'Vier Trigramme aus dem I-Ging: Kien (Himmel, drei durchgezogene Striche, oben links), Li (Feuer, unten links), Kan (Wasser, oben rechts), Kun (Erde, sechs halbe Striche, unten rechts).',
        'Cuatro trigramas del I Ching: Kien (cielo, tres líneas continuas, arriba a la izquierda), Li (fuego, abajo a la izquierda), Kan (agua, arriba a la derecha), Kun (tierra, seis medias líneas, abajo a la derecha).',
      ),
      L(
        'The flag of North Korea was adopted on 8 September 1948 (ratio 1:2): blue and white stripes at the edges, a wide red band and a red star on a white disc.',
        'Die Flagge Nordkoreas wurde am 8.9.1948 angenommen (Verhältnis 1:2): blaue und weiße Streifen am Rand, ein breites rotes Band und ein roter Stern auf weißer Scheibe.',
        'La bandera de Corea del Norte se adoptó el 8 de septiembre de 1948 (proporción 1:2): franjas azules y blancas en los bordes, una banda roja ancha y una estrella roja sobre un disco blanco.',
      ),
    ],
  },
]
