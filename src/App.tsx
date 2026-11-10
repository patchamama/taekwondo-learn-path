import { HashRouter, Route, Routes } from 'react-router-dom'
import { FormsPage } from './features/forms/FormsPage'
import { HistoryPage } from './features/history/HistoryPage'
import { LessonPage, PracticePage } from './features/learn/LessonPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { VideoQuizPage } from './features/videos/VideoQuizPage'
import { VideosPage } from './features/videos/VideosPage'
import { KukkiwonPage } from './features/kukkiwon/KukkiwonPage'
import { SelfDefensePage } from './features/selfdefense/SelfDefensePage'
import { StudyPage } from './features/study/StudyPage'
import { PathPage } from './features/path/PathPage'
import { TechniquesPage } from './features/techniques/TechniquesPage'
import { TermsPage } from './features/terms/TermsPage'
import { Layout } from './shared/components/Layout'

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<PathPage />} />
          <Route path="lesson/:id" element={<LessonPage />} />
          <Route path="study/:level?" element={<StudyPage />} />
          <Route path="practice" element={<PracticePage />} />
          <Route path="videos" element={<VideosPage />} />
          <Route path="video-quiz" element={<VideoQuizPage />} />
          <Route path="selfdefense" element={<SelfDefensePage />} />
          <Route path="kukkiwon" element={<KukkiwonPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="techniques" element={<TechniquesPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="forms" element={<FormsPage />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
