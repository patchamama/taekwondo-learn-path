import type { Loc } from '../shared/i18n/types'

export interface Belt {
  id: string
  rank: string // "9. Kup"
  color: string // main belt color
  stripe?: string // stripe color
  name: Loc
  koName?: string
  stage: 'cho-kup' | 'jung-kup' | 'ko-kup' | 'dan'
  filled: boolean // content available
}

// Source: Koreanische Fachbegriffe §6.3 / Pruefungsprogramm TOC
export const BELTS: Belt[] = [
  {
    id: 'kup9',
    rank: '9 Kup',
    color: '#f5f5f0',
    stripe: '#facc15',
    stage: 'cho-kup',
    filled: true,
    name: {
      en: 'White belt, yellow stripe',
      de: 'Weißer Gürtel mit gelbem Streifen',
      es: 'Cinturón blanco con raya amarilla',
    },
  },
  {
    id: 'kup8',
    rank: '8 Kup',
    color: '#facc15',
    stage: 'cho-kup',
    filled: true,
    koName: 'Narangsäk',
    name: { en: 'Yellow belt', de: 'Gelber Gürtel', es: 'Cinturón amarillo' },
  },
  {
    id: 'kup7',
    rank: '7 Kup',
    color: '#facc15',
    stripe: '#16a34a',
    stage: 'cho-kup',
    filled: false,
    name: {
      en: 'Yellow belt, green stripe',
      de: 'Gelber Gürtel mit grünem Streifen',
      es: 'Cinturón amarillo con raya verde',
    },
  },
  {
    id: 'kup6',
    rank: '6 Kup',
    color: '#16a34a',
    stage: 'cho-kup',
    filled: false,
    koName: 'Tschoroksäk',
    name: { en: 'Green belt', de: 'Grüner Gürtel', es: 'Cinturón verde' },
  },
  {
    id: 'kup5',
    rank: '5 Kup',
    color: '#16a34a',
    stripe: '#2563eb',
    stage: 'cho-kup',
    filled: false,
    name: {
      en: 'Green belt, blue stripe',
      de: 'Grüner Gürtel mit blauem Streifen',
      es: 'Cinturón verde con raya azul',
    },
  },
  {
    id: 'kup4',
    rank: '4 Kup',
    color: '#2563eb',
    stage: 'jung-kup',
    filled: false,
    koName: 'Parangsäk',
    name: { en: 'Blue belt', de: 'Blauer Gürtel', es: 'Cinturón azul' },
  },
  {
    id: 'kup3',
    rank: '3 Kup',
    color: '#2563eb',
    stripe: '#dc2626',
    stage: 'jung-kup',
    filled: false,
    name: {
      en: 'Blue belt, red stripe',
      de: 'Blauer Gürtel mit rotem Streifen',
      es: 'Cinturón azul con raya roja',
    },
  },
  {
    id: 'kup2',
    rank: '2 Kup',
    color: '#dc2626',
    stage: 'ko-kup',
    filled: false,
    koName: 'Palgansäk',
    name: { en: 'Red belt', de: 'Roter Gürtel', es: 'Cinturón rojo' },
  },
  {
    id: 'kup1',
    rank: '1 Kup',
    color: '#dc2626',
    stripe: '#111111',
    stage: 'ko-kup',
    filled: false,
    name: {
      en: 'Red belt, black stripe',
      de: 'Roter Gürtel mit schwarzem Streifen',
      es: 'Cinturón rojo con raya negra',
    },
  },
  {
    id: 'dan1',
    rank: '1 Dan',
    color: '#111111',
    stage: 'dan',
    filled: false,
    koName: 'Komdijongsäk / Cho-Dan',
    name: {
      en: 'Black belt (1st Dan)',
      de: '1. Schwarzer Gürtel',
      es: 'Cinturón negro (1.er Dan)',
    },
  },
]
