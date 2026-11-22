import { useLayoutEffect, useRef } from 'react'
import { HashRouter, NavLink, Outlet, Route, Routes, useHref, useLocation, useNavigate } from 'react-router-dom'
import { ConceptsPage } from './features/concepts/ConceptsPage'
import { CONCEPTS } from './data/concepts'
import { useT } from './shared/i18n/useT'
import { FormsPage } from './features/forms/FormsPage'
import { HistoryPage } from './features/history/HistoryPage'
import { LessonPage, PracticePage } from './features/learn/LessonPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { VideoQuizPage } from './features/videos/VideoQuizPage'
import { VideosPage } from './features/videos/VideosPage'
import { KukkiwonPage } from './features/kukkiwon/KukkiwonPage'
import { SelfDefensePage } from './features/selfdefense/SelfDefensePage'
import { StudyPage } from './features/study/StudyPage'
import { AudioPage } from './features/audio/AudioPage'
import { ExamPage } from './features/exam/ExamPage'
import { BackgroundPage } from './features/background/BackgroundPage'
import { PathPage } from './features/path/PathPage'
import { TechniquesPage } from './features/techniques/TechniquesPage'
import { TermsPage } from './features/terms/TermsPage'
import { Layout } from './shared/components/Layout'

/** Keep the shared layout unchanged; expose readings on every route in a wrapping row. */
function ReadingNavigation() {
  const { t } = useT()
  return (
    <>
      <nav aria-label={t('navConcepts')} className="mb-6 flex flex-wrap gap-3 text-sm">
        <NavLink to="/concepts" className={({ isActive }) =>
          `rounded-xl border bg-white px-4 py-2 ${isActive ? 'font-bold underline' : 'text-slate-600'}`
        }>{t('navConcepts')}</NavLink>
      </nav>
      <Outlet />
    </>
  )
}

/** Adapt the standalone page's native fragments to HashRouter URLs, including new tabs. */
function ConceptReadingRoute() {
  const root = useRef<HTMLDivElement>(null)
  const href = useHref('/concepts')
  const { hash } = useLocation()
  const navigate = useNavigate()
  useLayoutEffect(() => {
    root.current?.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
      const topic = CONCEPTS.find((c) => link.getAttribute('href') === `#${c.id}`)
      if (topic) link.setAttribute('href', `${href}#${topic.id}`)
    })
    const topic = CONCEPTS.find((c) => hash === `#${c.id}`)
    if (topic) document.getElementById(topic.id)?.scrollIntoView?.({ block: 'start' })
  }, [href, hash])
  return (
    <div ref={root} onClick={(event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = (event.target as HTMLElement).closest('a')
      const topic = CONCEPTS.find((c) => link?.getAttribute('href') === `${href}#${c.id}`)
      if (topic) {
        event.preventDefault()
        navigate(`/concepts#${topic.id}`)
        // Repeated activation of the current topic must also bring it back into view.
        document.getElementById(topic.id)?.scrollIntoView?.({ block: 'start' })
      }
    }}>
      <ConceptsPage />
    </div>
  )
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route element={<ReadingNavigation />}>
            <Route path="concepts" element={<ConceptReadingRoute />} />
            <Route index element={<PathPage />} />
            <Route path="lesson/:id" element={<LessonPage />} />
            <Route path="study/:level?" element={<StudyPage />} />
            <Route path="exam" element={<ExamPage />} />
            <Route path="background" element={<BackgroundPage />} />
            <Route path="practice" element={<PracticePage />} />
            <Route path="videos" element={<VideosPage />} />
            <Route path="video-quiz" element={<VideoQuizPage />} />
            <Route path="selfdefense" element={<SelfDefensePage />} />
            <Route path="kukkiwon" element={<KukkiwonPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="audio" element={<AudioPage />} />
            <Route path="techniques" element={<TechniquesPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="forms" element={<FormsPage />} />
            <Route path="history" element={<HistoryPage />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  )
}
