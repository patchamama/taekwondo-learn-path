import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LANGS } from '../i18n/types'
import { useT } from '../i18n/useT'
import { useAppStore } from '../store/useAppStore'
import { Banner } from './Banner'
import { BeltRangeSlider } from './BeltRangeSlider'
import { activeStreak, dayString } from '../../features/learn/progress'
import type { StringKey } from '../i18n/strings'

const LINKS: { to: string; key: StringKey }[] = [
  { to: '/', key: 'navPath' },
  { to: '/study', key: 'navStudy' },
  { to: '/practice', key: 'navPractice' },
  { to: '/techniques', key: 'navTechniques' },
  { to: '/forms', key: 'navForms' },
  { to: '/videos', key: 'navVideos' },
  { to: '/terms', key: 'navTerms' },
  { to: '/kukkiwon', key: 'navKukkiwon' },
  { to: '/selfdefense', key: 'navDefense' },
  { to: '/exam', key: 'navExam' },
  { to: '/history', key: 'navHistory' },
  { to: '/background', key: 'navBackground' },
]

const FILTERED = ['/techniques', '/videos', '/video-quiz', '/terms', '/forms', '/kukkiwon', '/practice']

export function Layout() {
  const { pathname } = useLocation()
  const { t, lang } = useT()
  const setLang = useAppStore((s) => s.setLang)
  const xp = useAppStore((s) => s.xp)
  const streak = useAppStore((s) => s.streak)
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Banner />
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
          <span className="min-w-0 flex-1 font-bold">{t('appTitle')}</span>
          <span className="text-sm font-semibold" aria-label="progress">
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
          <NavLink
            to="/settings"
            aria-label={t('navSettings')}
            className={({ isActive }) =>
              `inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${isActive ? 'border-sky-700 bg-sky-100 text-sky-900' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`
            }
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 3-.5 2-2 1-2-.5-2 3.5L4 10v3l-1.5 1 2 3.5 2-.5 2 1 .5 2h4l.5-2 2-1 2 .5 2-3.5-1.5-1v-3l1.5-1-2-3.5-2 .5-2-1-.5-2Z" />
              <circle cx="11" cy="11.5" r="3" />
            </svg>
          </NavLink>
          <nav className="flex w-full min-w-0 flex-wrap gap-3 text-sm">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => (isActive ? 'font-bold underline' : 'text-slate-600')}
              >
                {t(l.key)}
              </NavLink>
            ))}
          </nav>
        </div>
        {FILTERED.includes(pathname) && <BeltRangeSlider />}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
