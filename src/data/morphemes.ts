import type { Loc } from '../shared/i18n/types'

export interface Morpheme {
  id: string
  ko: string
  hangul: string
  group: 'action' | 'zone' | 'direction' | 'tool'
  meaning: Loc
}

const m = (
  id: string,
  hangul: string,
  group: Morpheme['group'],
  en: string,
  de: string,
  es: string,
): Morpheme => ({ id, ko: id, hangul, group, meaning: { en, de, es } })

export const MORPHEMES: Morpheme[] = [
  m('macki', '막기', 'action', 'block', 'Abwehr, Block', 'bloqueo'),
  m('chirugi', '지르기', 'action', 'thrust / punch', 'Stoß', 'golpe directo'),
  m('chicki', '치기', 'action', 'strike', 'Schlag', 'golpe de corte'),
  m('chagi', '차기', 'action', 'kick', 'Tritt', 'patada'),
  m('sogi', '서기', 'action', 'stance', 'Stellung', 'posición'),
  m('gubi', '굽이', 'action', 'bent (bow)', 'Beugestellung', 'arco'),
  m('olgul', '얼굴', 'zone', 'face / high', 'oben', 'cara / arriba'),
  m('momtong', '몸통', 'zone', 'trunk / middle', 'Mitte', 'tronco / medio'),
  m('arae', '아래', 'zone', 'low', 'unten', 'abajo'),
  m('mok', '목', 'zone', 'neck', 'Hals', 'cuello'),
  m('ap', '앞', 'direction', 'front', 'vorn', 'delante'),
  m('yop', '옆', 'direction', 'side', 'Seite', 'lado'),
  m('düt', '뒷', 'direction', 'back', 'hinten', 'atrás'),
  m('an', '안', 'direction', 'inside (outside→in)', 'von außen nach innen', 'hacia dentro'),
  m('packat', '바깥', 'direction', 'outside (inside→out)', 'von innen nach außen', 'hacia fuera'),
  m('naeryo', '내려', 'direction', 'downward (axe)', 'abwärts', 'hacia abajo (hacha)'),
  m('dollyo', '돌려', 'direction', 'turning / semicircular', 'halbkreisförmig', 'semicircular'),
  m('twio', '뛰어', 'direction', 'jumping', 'gesprungen', 'saltado'),
  m('sonnal', '손날', 'tool', 'knife-hand edge', 'Handkante', 'canto de la mano'),
  m('palmok', '팔목', 'tool', 'forearm', 'Unterarm', 'antebrazo'),
  m('batangson', '바탕손', 'tool', 'palm heel', 'Handballen', 'talón de la mano'),
]

export const MORPHEME_BY_ID = Object.fromEntries(MORPHEMES.map((x) => [x.id, x]))
