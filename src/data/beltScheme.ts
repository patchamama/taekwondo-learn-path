import type { Loc } from '../shared/i18n/types'
import type { Belt } from './belts'

export type BeltScheme = 'club' | 'traditional'

const L = (en: string, de: string, es: string): Loc => ({ en, de, es })

const C = {
  white: '#f5f5f0',
  yellow: '#facc15',
  orange: '#f97316',
  green: '#16a34a',
  blue: '#2563eb',
  brown: '#92400e',
  black: '#111111',
}

type Look = Pick<Belt, 'color' | 'stripe' | 'name'>

/**
 * Traditional colour sequence (white, yellow, orange, green, green-blue, blue, blue-brown, brown, brown,
 * brown-black, black). The club scheme (white, white-yellow, yellow, yellow-green, ...) is the belt data
 * itself. Which Kup gets which colour in the traditional scheme is our assumption: edit it here.
 */
const TRADITIONAL: Record<string, Look> = {
  kup10: { color: C.white, name: L('White belt', 'Weißer Gürtel', 'Cinturón blanco') },
  kup9: { color: C.yellow, name: L('Yellow belt', 'Gelber Gürtel', 'Cinturón amarillo') },
  kup8: { color: C.orange, name: L('Orange belt', 'Oranger Gürtel', 'Cinturón naranja') },
  kup7: { color: C.green, name: L('Green belt', 'Grüner Gürtel', 'Cinturón verde') },
  kup6: {
    color: C.green,
    stripe: C.blue,
    name: L(
      'Green belt, blue stripe',
      'Grüner Gürtel, blauer Streifen',
      'Cinturón verde con raya azul',
    ),
  },
  kup5: { color: C.blue, name: L('Blue belt', 'Blauer Gürtel', 'Cinturón azul') },
  kup4: {
    color: C.blue,
    stripe: C.brown,
    name: L(
      'Blue belt, brown stripe',
      'Blauer Gürtel, brauner Streifen',
      'Cinturón azul con raya marrón',
    ),
  },
  kup3: { color: C.brown, name: L('Brown belt', 'Brauner Gürtel', 'Cinturón marrón') },
  kup2: { color: C.brown, name: L('Brown belt', 'Brauner Gürtel', 'Cinturón marrón') },
  kup1: {
    color: C.brown,
    stripe: C.black,
    name: L(
      'Brown belt, black stripe',
      'Brauner Gürtel, schwarzer Streifen',
      'Cinturón marrón con raya negra',
    ),
  },
  dan1: { color: C.black, name: L('Black belt', 'Schwarzer Gürtel', 'Cinturón negro') },
}

/** The belt as shown under a colour scheme. The club scheme is the belt data itself. */
export function beltLook(belt: Belt, scheme: BeltScheme): Belt {
  if (scheme === 'club') return belt
  const look = TRADITIONAL[belt.id]
  return look ? { ...belt, ...look, stripe: look.stripe } : belt
}
