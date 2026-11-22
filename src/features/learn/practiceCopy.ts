import type { Loc } from '../../shared/i18n/types'

export const PRACTICE_COPY = {
  practiced: { en: 'Practised', de: 'Geübt', es: 'Practicados' },
  pending: { en: 'Pending', de: 'Ausstehend', es: 'Pendientes' },
  allPending: { en: 'Practise all pending', de: 'Alles Ausstehende üben', es: 'Practicar todo lo pendiente' },
  progressMeaning: {
    en: 'Unique terms in your selected sections, Kup range and supported formats. Practised means answered at least once regardless of correctness, not mastered. Pending means no saved answer yet. Progress is saved at session completion.',
    de: 'Einmalige Begriffe der gewählten Bereiche, Kup-Stufen und unterstützten Formate. Geübt heißt mindestens einmal beantwortet, ob richtig oder falsch, nicht gemeistert. Ausstehend heißt noch keine gespeicherte Antwort. Fortschritt wird am Sitzungsende gespeichert.',
    es: 'Términos únicos de las secciones, rango de Kup y formatos compatibles elegidos. Practicados significa respondidos al menos una vez, con o sin acierto, no dominados. Pendientes significa sin respuesta guardada todavía. El progreso se guarda al terminar la sesión.',
  },
  noEligible: {
    en: 'No terms support the selected formats in these sections and Kup range. Choose another section or format, or enable sound for listening questions.',
    de: 'Keine Begriffe unterstützen die gewählten Formate in diesen Bereichen und Kup-Stufen. Wähle andere Bereiche oder Formate oder aktiviere Ton für Hörfragen.',
    es: 'Ningún término admite los formatos elegidos en estas secciones y rango de Kup. Elige otra sección o formato, o activa el sonido para preguntas de escucha.',
  },
  nonePending: { en: 'No pending terms in this selection. Normal practice is still available.', de: 'Keine ausstehenden Begriffe in dieser Auswahl. Normales Üben ist weiterhin möglich.', es: 'No hay términos pendientes en esta selección. La práctica normal sigue disponible.' },
  bulkHelp: {
    en: 'Start a new session with all pending terms, without the normal question limit. Terms without a supported selected format are excluded.',
    de: 'Starte eine neue Sitzung mit allen ausstehenden Begriffen, ohne das normale Fragenlimit. Begriffe ohne unterstütztes gewähltes Format sind ausgeschlossen.',
    es: 'Inicia una nueva sesión con todos los términos pendientes, sin el límite normal de preguntas. Se excluyen los términos sin un formato elegido compatible.',
  },
  hint: { en: 'Hint', de: 'Tipp', es: 'Pista' },
  hintHelp: {
    en: 'Use the small hint button to reveal a word’s meaning.',
    de: 'Mit der kleinen Tipp-Taste zeigst du die Bedeutung eines Wortes an.',
    es: 'Usa el pequeño botón de pista para revelar el significado de una palabra.',
  },
  watchMuted: { en: 'Watch muted video', de: 'Video ohne Ton ansehen', es: 'Ver vídeo sin sonido' },
} satisfies Record<string, Loc>
