/** Hepburn romaji → hiragana, so a Japanese voice reads karate terms as Japanese instead of spelling the letters. */
const KANA: Record<string, string> = {
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
  ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
  ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
  sa: 'さ', shi: 'し', si: 'し', su: 'す', se: 'せ', so: 'そ',
  za: 'ざ', ji: 'じ', zi: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
  ta: 'た', chi: 'ち', ti: 'ち', tsu: 'つ', te: 'て', to: 'と',
  da: 'だ', de: 'で', do: 'ど',
  na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
  ha: 'は', hi: 'ひ', fu: 'ふ', hu: 'ふ', he: 'へ', ho: 'ほ',
  ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
  pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
  ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
  ya: 'や', yu: 'ゆ', yo: 'よ',
  ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
  wa: 'わ', wo: 'を',
  kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ', gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ',
  sha: 'しゃ', shu: 'しゅ', sho: 'しょ', ja: 'じゃ', ju: 'じゅ', jo: 'じょ',
  cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ',
  nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ', hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ',
  bya: 'びゃ', byu: 'びゅ', byo: 'びょ', pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ',
  mya: 'みゃ', myu: 'みゅ', myo: 'みょ', rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ',
}

const MACRON: Record<string, string> = { ā: 'aa', ī: 'ii', ū: 'uu', ē: 'ee', ō: 'ou' }
const SORTED = Object.keys(KANA).sort((a, b) => b.length - a.length)

/** Returns hiragana, or null when the text contains something that is not romaji. */
export function romajiToKana(input: string): string | null {
  const s = input
    .toLowerCase()
    .replace(/[āīūēō]/g, (c) => MACRON[c])
    .replace(/[\s\-'’]+/g, '|')
    .replace(/^\|+|\|+$/g, '')
  if (!s || !/^[a-z|]+$/.test(s)) return null
  let out = ''
  let i = 0
  while (i < s.length) {
    const rest = s.slice(i)
    if (rest[0] === '|') {
      i++
      continue
    }
    // sokuon: doubled consonant (tch → っち)
    if (/^([kgsztdhbpmrjfcw])\1/.test(rest) && rest[0] !== 'n') {
      out += 'っ'
      i++
      continue
    }
    if (rest.startsWith('tch')) {
      out += 'っ'
      i++
      continue
    }
    // moraic n: before a consonant (not y), before an apostrophe marker, or at the end
    if (rest[0] === 'n' && (rest.length === 1 || rest[1] === '|' || !/^[aiueoy]/.test(rest.slice(1)))) {
      out += 'ん'
      i++
      continue
    }
    const hit = SORTED.find((k) => rest.startsWith(k))
    if (!hit) return null
    out += KANA[hit]
    i += hit.length
  }
  return out
}
