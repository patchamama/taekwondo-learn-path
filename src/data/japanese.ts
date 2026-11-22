import type { Card } from './cards'

/**
 * Japanese (karate) equivalents of Korean word parts and terms, written in Hepburn romaji with macrons.
 * They are study aids: the Japanese term is the closest established karate word, not a translation of the
 * Korean spelling. Only entries with a reliable equivalent are listed; anything else is left out on purpose.
 */

// Word parts (morpheme ids). In a compound the voiced form is used (tsuki → zuki); see COMPOUND.
const PART: Record<string, string> = {
  macki: 'uke',
  chirugi: 'tsuki',
  chicki: 'uchi',
  chagi: 'geri',
  sogi: 'dachi',
  gubi: 'kutsu',
  olgul: 'jōdan',
  momtong: 'chūdan',
  arae: 'gedan',
  mok: 'kubi',
  ap: 'mae',
  yop: 'yoko',
  düt: 'ushiro',
  an: 'uchi',
  packat: 'soto',
  naeryo: 'oroshi',
  dollyo: 'mawashi',
  twio: 'tobi',
  sonnal: 'shutō',
  palmok: 'ude',
  batangson: 'shōtei',
  jumok: 'kobushi',
  'dung-jumok': 'uraken',
  me: 'tettsui',
  sonnaldung: 'haitō',
  pyonsonkut: 'nukite',
  nullo: 'osae',
  hechyo: 'kakiwake',
  gawi: 'hasami',
  santul: 'yama',
  kima: 'kiba',
  kumgang: 'kongō',
  gibon: 'kihon',
  narani: 'heikō',
  mikurumbal: 'suri-ashi',
  koa: 'jūji',
  palkup: 'hiji',
  murup: 'hiza',
  bom: 'tora',
  hagdari: 'tsuru',
  jebibum: 'tsubame',
  sasun: 'naname',
  soojik: 'suichoku',
  sewo: 'tate',
  ollyo: 'age',
  opo: 'age',
  pandal: 'hangetsu',
  tok: 'ago',
  bituro: 'hineri',
  dangyo: 'hiki',
  miro: 'oshi',
}

// Terms (term ids): numbers, commands, everyday dojo words, body parts.
const TERM: Record<string, string> = {
  'sino-sib': 'jū',
  'native-hana': 'ichi',
  'native-dul': 'ni',
  'native-set': 'san',
  'native-net': 'shi',
  'native-dasot': 'go',
  'native-yosot': 'roku',
  'native-ilgob': 'shichi',
  'native-yodul': 'hachi',
  'native-ahop': 'kyū',
  'native-yol': 'jū',
  'command-charyot': 'kiotsuke',
  'command-kyongi': 'rei',
  'command-chunbi': 'yōi',
  'command-sijak': 'hajime',
  'command-guman': 'yame',
  'command-kallyo': 'wakare',
  'command-tora': 'mawatte',
  'command-cuy-oh': 'yasume',
  'command-paro': 'naore',
  'basic-dojang': 'dōjō',
  'basic-dobok': 'dōgi',
  'basic-ty': 'obi',
  'basic-sabom': 'sensei',
  'basic-sabom-nim': 'sensei',
  'basic-jeja': 'deshi',
  'basic-kihap': 'kiai',
  'basic-hogu': 'bōgu',
  'basic-kam sa hamnida': 'arigatō gozaimasu',
  'basic-sang-i': 'uwagi',
  'basic-ha-i': 'zubon',
  'basic-cho-bo-ja': 'shoshinsha',
  'basic-keup': 'kyū',
  'basic-dan': 'dan',
  'basic-kyok-pa': 'tameshiwari',
  'training-kyekpa': 'tameshiwari',
  'training-tul': 'kata',
  'training-kyorugi': 'kumite',
  'training-ho-sin-sul': 'goshin-jutsu',
  'training-gibon-donjak': 'kihon',
  'training-ilbo-taeryon': 'ippon-kumite',
  'training-sambo-taeryon': 'sanbon-kumite',
  'training-ibo-taeryon': 'nihon-kumite',
  'training-yaksok-taeryon': 'yakusoku-kumite',
  'training-nak-bop': 'ukemi',
  'training-tallyon': 'renshū',
  'training-bigim': 'hikiwake',
  // Literal Japanese vocabulary / established category names, not technique identities.
  'training-ilon': 'riron',
  'training-tae-sogi': 'tachi-kata',
  // Kukkiwon spelling variants and broad martial-arts categories.
  'kukkiwon-jireugi': 'tsuki',
  'kukkiwon-chigi': 'uchi',
  'kukkiwon-chagi': 'geri',
  'kukkiwon-makgi': 'uke',
  'kukkiwon-seogi': 'dachi',
  'kukkiwon-kkeokgi': 'kansetsu-waza',
  'kukkiwon-neomgigi': 'nage-waza',
  'kukkiwon-joleugi': 'shime-waza',
  'kukkiwon-poomsae': 'kata',
  'basic-dwit': 'ushiro',
  'basic-sonkeut': 'yubisaki',
  'basic-agwison': 'toraguchi',
  'basic-deung-jumok': 'uraken',
  'basic-sonnal-chigi': 'shutō-uchi',
  'basic-sonnal-makki': 'shutō-uke',
  'basic-gawi-makki': 'hasami-uke',
  'basic-yop-chigi': 'yoko-uchi',
  'basic-yop-jireugi': 'yoko-zuki',
  'basic-yop-makki': 'yoko-uke',
  'basic-mureup-chigi': 'hiza-geri',
  'basic-juchum-sogi': 'kiba-dachi',
  'body-mori': 'atama',
  'body-nun': 'me',
  'body-ko': 'hana',
  'body-ip': 'kuchi',
  'body-ipsul': 'kuchibiru',
  'body-dunbu': 'koshi',
  'body-eongdeongi': 'shiri',
  'body-gwi': 'mimi',
  'body-eokkae': 'kata',
  'body-gaseum': 'mune',
  'body-pal': 'ude',
  'body-palkup': 'hiji',
  'body-son': 'te',
  'body-jumok': 'kobushi',
  'body-eolgul': 'kao',
  'body-ima': 'hitai',
  'body-deung': 'senaka',
  'body-sonmok': 'tekubi',
  'body-songarak': 'yubi',
  'body-dari': 'ashi',
  'body-mureup': 'hiza',
  'body-murup': 'hiza',
  'body-jongari': 'fukurahagi',
  'body-jeonggangi': 'sune',
  'body-tok': 'ago',
  'body-myongchi': 'suigetsu',
  'body-danjon': 'tanden',
  'body-dungjumok': 'uraken',
  'body-dung-jumok': 'uraken',
  'body-mejumok': 'tettsui',
  'body-sonnal': 'shutō',
  'body-batangson': 'shōtei',
  'body-sonnaldung': 'haitō',
  'body-pyonsonkut': 'nukite',
  'body-palmok': 'wanshu',
  'body-apchuk': 'chūsoku',
  'body-dütchuk': 'kakato',
  'body-paldung': 'haisoku',
}

// In a compound the second word is voiced: chūdan + tsuki → chūdan-zuki.
const COMPOUND: Record<string, string> = { tsuki: 'zuki' }

const firstKarate = (k: string) =>
  k
    .split('/')[0]
    .replace(/\(.*?\)/g, '')
    .trim()

/**
 * Japanese term of a card, or undefined when there is no reliable one:
 * explicit term > the curated karate field > composed from the parts of a hand or foot technique.
 * Stances are never composed (gluing parts gives names that do not exist).
 */
export function japaneseOf(
  card: Pick<Card, 'id' | 'kind' | 'group' | 'parts' | 'karate'> | undefined,
): string | undefined {
  if (!card) return undefined
  const explicit = card.kind === 'morpheme' ? PART[card.id] : TERM[card.id]
  if (explicit) return explicit
  if (card.karate) return firstKarate(card.karate)
  if (card.kind !== 'technique' || !card.parts || card.parts.length < 2) return undefined
  if (card.group.includes('stance') || card.group.includes('combo')) return undefined
  const parts = card.parts.map((p) => PART[p])
  if (parts.some((p) => !p)) return undefined
  return parts.map((p, i) => (i > 0 ? (COMPOUND[p] ?? p) : p)).join('-')
}

/** Japanese equivalent of a single word part (morpheme id), for word bricks and breakdowns. */
export const japanesePart = (id: string): string | undefined => PART[id]

/** "momtong (trunk / middle; JP chūdan)": a word part with its meaning and, when known, its Japanese term. */
export const partLabel = (id: string, meaning: string): string => {
  const jp = PART[id]
  return jp ? `${id} (${meaning}; JP ${jp})` : `${id} (${meaning})`
}
