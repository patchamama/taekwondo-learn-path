import { HashRouter, Route, Routes } from 'react-router-dom'
import { FormsPage } from './features/forms/FormsPage'
import { HistoryPage } from './features/history/HistoryPage'
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
          <Route path="techniques" element={<TechniquesPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="forms" element={<FormsPage />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
