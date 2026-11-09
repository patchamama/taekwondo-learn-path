import { NavLink, Outlet } from 'react-router-dom'
import { LANGS } from '../i18n/types'
import { useT } from '../i18n/useT'
import { useAppStore } from '../store/useAppStore'
import { Banner } from './Banner'
import { activeStreak, dayString } from '../../features/learn/progress'
import type { StringKey } from '../i18n/strings'

const LINKS: { to: string; key: StringKey }[] = [
  { to: '/', key: 'navPath' },
  { to: '/practice', key: 'navPractice' },
  { to: '/techniques', key: 'navTechniques' },
  { to: '/terms', key: 'navTerms' },
  { to: '/forms', key: 'navForms' },
  { to: '/history', key: 'navHistory' },
]

export function Layout() {
  const { t, lang } = useT()
  const setLang = useAppStore((s) => s.setLang)
  const xp = useAppStore((s) => s.xp)
  const streak = useAppStore((s) => s.streak)
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Banner />
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
          <span className="font-bold">{t('appTitle')}</span>
          <nav className="flex flex-wrap gap-3 text-sm">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end
                className={({ isActive }) => (isActive ? 'font-bold underline' : 'text-slate-600')}
              >
                {t(l.key)}
              </NavLink>
            ))}
          </nav>
          <span className="ml-auto text-sm font-semibold" aria-label="progress">
            🔥 {activeStreak(streak, dayString())} {t('days')} · ⭐ {xp} {t('xp')}
          </span>
          <select
            aria-label="Language"
            value={lang}
            onChange={(e) => setLang(e.target.value as typeof lang)}
            className="rounded border px-2 py-1 text-sm"
          >
            {LANGS.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
