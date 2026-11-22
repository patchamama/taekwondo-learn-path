import type { Lang } from '../../shared/i18n/types'

// Player-owned copy keeps transport additions within the audio feature.
const copy = {
  en: { previous: 'Previous term / technique', next: 'Next term / technique', speed: 'Playback speed', back: 'Back', forward: 'Forward' },
  de: { previous: 'Vorheriger Begriff / Technik', next: 'Nächster Begriff / Technik', speed: 'Wiedergabegeschwindigkeit', back: 'Zurück', forward: 'Vorwärts' },
  es: { previous: 'Término / técnica anterior', next: 'Término / técnica siguiente', speed: 'Velocidad de reproducción', back: 'Retroceder', forward: 'Adelantar' },
} satisfies Record<Lang, Record<string, string>>

export const transportCopy = (lang: Lang) => copy[lang]
export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]
