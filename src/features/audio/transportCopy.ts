import type { Lang } from '../../shared/i18n/types'

// Player-owned copy keeps transport additions within the audio feature.
const copy = {
  en: {
    previous: 'Previous term / technique',
    next: 'Next term / technique',
    speed: 'Playback speed',
    back: 'Back',
    forward: 'Forward',
    seekSeconds: 'Seek seconds',
    controls: 'Audio controls',
    random: 'Narrate techniques in random order',
    generateNew: 'Generate audio for new terms',
    clip: 'Clip frames',
    video: 'Video',
  },
  de: {
    previous: 'Vorheriger Begriff / Technik',
    next: 'Nächster Begriff / Technik',
    speed: 'Wiedergabegeschwindigkeit',
    back: 'Zurück',
    forward: 'Vorwärts',
    seekSeconds: 'Sprungweite in Sekunden',
    controls: 'Audiosteuerung',
    random: 'Techniken in zufälliger Reihenfolge vorlesen',
    generateNew: 'Audio für neue Begriffe erzeugen',
    clip: 'Clip-Bilder',
    video: 'Video',
  },
  es: {
    previous: 'Término / técnica anterior',
    next: 'Término / técnica siguiente',
    speed: 'Velocidad de reproducción',
    back: 'Retroceder',
    forward: 'Adelantar',
    seekSeconds: 'Salto en segundos',
    controls: 'Controles de audio',
    random: 'Narrar técnicas en orden aleatorio',
    generateNew: 'Generar audio de términos nuevos',
    clip: 'Fotogramas del clip',
    video: 'Vídeo',
  },
} satisfies Record<Lang, Record<string, string>>

export const transportCopy = (lang: Lang) => copy[lang]
export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]
