// SIDEBAR TOGGLE FEATURE: layout owns persistent collapsed sidebar state.
import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Menu, Moon, Sun } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { useAuth } from '@/features/auth/context/useAuth'
import { useTheme } from '@/app/providers/useTheme';

const SIDEBAR_COLLAPSED_KEY = 'bamika-sidebar-collapsed'

export default function MainLayout({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true')
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed))
  }, [sidebarCollapsed])

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-[#0a1927]/92 lg:hidden">
        <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-primary-400/10">
          <Menu className="h-6 w-6 text-gray-600 dark:text-slate-300" />
        </button>
        <Link to="/" className="text-lg font-semibold text-slate-900 dark:text-white">
          BAMIKA
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-primary-400/10" title="Toggle theme">
            {theme === 'dark' ? <Sun className="h-5 w-5 text-sky-300" /> : <Moon className="h-5 w-5 text-gray-600" />}
          </button>
        </div>
      </header>

      <Sidebar
        collapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      <div className={sidebarCollapsed ? 'lg:pl-24' : 'lg:pl-72'}>
        <main className="min-h-screen">
          <header className="sticky top-0 z-20 hidden items-center justify-between border-b border-slate-200 bg-white/92 px-8 py-4 backdrop-blur dark:border-slate-700 dark:bg-[#0a1927]/92 lg:flex">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-700 dark:text-primary-300">
                {user?.role?.replace('_', ' ') ?? 'workspace'}
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Welcome back, {user?.full_name?.split(' ')[0] ?? 'learner'}
              </p>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <button onClick={toggleTheme} className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm hover:bg-primary-50 dark:border-slate-700 dark:bg-surface-dark dark:hover:bg-primary-400/10" title="Toggle dark mode">
                {theme === 'dark' ? <Sun className="h-5 w-5 text-sky-300" /> : <Moon className="h-5 w-5 text-gray-600" />}
              </button>
            </div>
          </header>

          <div className="mx-auto w-full max-w-7xl p-4 lg:p-8">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  )
}
