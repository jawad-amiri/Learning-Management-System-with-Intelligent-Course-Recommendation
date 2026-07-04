// SIDEBAR TOGGLE FEATURE: professional desktop collapse plus mobile drawer.
import { useEffect, useRef } from 'react'
import {
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Moon,
  Sparkles,
  Sun,
  TrendingUp,
  Upload,
  User,
  Users,
} from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import BrandMark from '@/components/brand/BrandMark'
import { useAuth } from '@/features/auth/context/useAuth'
import { resolveMediaUrl } from '@/lib/media'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface SidebarProps {
  collapsed: boolean
  isOpen: boolean
  onClose: () => void
  onToggleTheme: () => void
  onToggleCollapsed: () => void
  theme: "light" | "dark"
}

function Sidebar({ collapsed, isOpen, onClose, onToggleCollapsed, onToggleTheme, theme }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const sidebarRef = useRef<HTMLDivElement>(null)

  const getNavItems = (): NavItem[] => {
    const items: NavItem[] = [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Courses', href: '/courses', icon: BookOpen },
      { label: 'Profile', href: '/profile', icon: User },
    ]

    if (user?.role === 'student') {
      items.push({ label: 'Progress', href: '/progress', icon: TrendingUp })
      items.push({ label: 'Certificates', href: '/certificates', icon: Award })
      items.push({ label: 'Recommendations', href: '/recommendations', icon: Sparkles })
    }

    if (user?.role === 'teacher') {
      items.push({ label: 'Progress', href: '/progress', icon: TrendingUp })
      items.push({ label: 'Certificates', href: '/certificates', icon: Award })
      items.push({ label: 'Uploads', href: '/teacher/media', icon: Upload })
    }

    if (user?.role === 'admin' || user?.role === 'super_admin') {
      // UPDATED - SIDEBAR TOGGLE FEATURE: keep only one course management entry for admin roles.
      items.push(
        { label: 'Users', href: '/admin/users', icon: Users },
        { label: 'Manage courses', href: '/admin/courses', icon: BookOpen },
      )
    }

    return items
  }

  const navItems = getNavItems()
  const avatarUrl = resolveMediaUrl(user?.profile_photo_url)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        ref={sidebarRef}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-primary-800 text-white shadow-2xl transition-all duration-300 ease-in-out dark:bg-[#071522]',
          collapsed ? 'lg:w-24' : 'lg:w-72',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className={cn('border-b border-white/10 px-5 py-5', collapsed && 'lg:px-3')}>
          <div className="flex items-center justify-between gap-3">
            {collapsed ? (
              <div className="hidden h-14 w-14 items-center justify-center rounded-full bg-white text-primary-700 shadow lg:flex">
                <BookOpen className="h-7 w-7" />
              </div>
            ) : (
              <BrandMark />
            )}
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="hidden rounded-xl bg-white/10 p-2 text-primary-50 transition hover:bg-white/20 lg:inline-flex"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Link
          to="/profile"
          onClick={() => {
            if (window.innerWidth < 1024) onClose()
          }}
          className={cn('border-b border-white/10 px-4 py-4 transition hover:bg-white/10', collapsed && 'lg:px-3')}
          title="Open profile"
        >
          <div className={cn('flex items-center gap-3', collapsed && 'lg:justify-center')}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-sm font-semibold text-primary-700 dark:bg-primary-300/18 dark:text-primary-100 dark:ring-1 dark:ring-primary-200/20">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user?.full_name ?? 'Profile'} className="h-full w-full object-cover" />
              ) : (
                user?.full_name?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div className={cn('min-w-0', collapsed && 'lg:hidden')}>
              <p className="truncate text-sm font-semibold text-white">{user?.full_name}</p>
              <p className="text-xs capitalize text-primary-100">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === '/dashboard'
                ? location.pathname === item.href
                : location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)

            return (
              <NavLink
                key={item.href}
                to={item.href}
                title={collapsed ? item.label : undefined}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose()
                }}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                  collapsed && 'lg:justify-center lg:px-3',
                  isActive
                    ? 'sidebar-nav-active'
                    : 'text-primary-50 hover:bg-white/10 hover:text-white dark:text-slate-300 dark:hover:bg-primary-300/10',
                )}
              >
                <Icon className="sidebar-icon" />
                <span className={cn(collapsed && 'lg:hidden')}>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <button
            type="button"
            onClick={onToggleTheme}
            title={collapsed ? 'Toggle dark mode' : undefined}
            className={cn(
              'mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-primary-50 transition hover:bg-white/10 dark:text-slate-300 dark:hover:bg-primary-300/10',
              collapsed ? 'lg:justify-center lg:px-3' : 'justify-start',
            )}
          >
            {theme === 'dark' ? <Sun className="sidebar-icon" /> : <Moon className="sidebar-icon" />}
            <span className={cn(collapsed && 'lg:hidden')}>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className={cn(
              'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-primary-50 transition hover:bg-white/10 dark:text-slate-300 dark:hover:bg-primary-300/10',
              collapsed ? 'lg:justify-center lg:px-3' : 'justify-start',
            )}
          >
            <LogOut className="sidebar-icon" />
            <span className={cn(collapsed && 'lg:hidden')}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export { Sidebar }

