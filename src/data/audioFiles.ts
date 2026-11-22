export type AudioTrack = 'ko' | 'en' | 'de' | 'es' | 'ja' | 'info-en' | 'info-de' | 'info-es'

/** FNV-1a, so the same id gives the same file name in the browser and in the generator script. */
const fnv = (s: string) => {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

const slug = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

/** Public path (relative to the site base) of one pre-generated clip. */
export const audioFile = (track: AudioTrack, id: string) => `audio/${track}/${slug(id)}-${fnv(id)}.mp3`
