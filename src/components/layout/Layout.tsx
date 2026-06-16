import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Trello, LogOut, Menu, X } from 'lucide-react'

export function Layout() {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const avatar = user?.user_metadata?.name
    ? (user.user_metadata.name as string).slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '??'

  const navLinks = [
    { to: '/kanban',    label: 'Orquestração', Icon: Trello          },
    { to: '/dashboard', label: 'Dashboard',    Icon: LayoutDashboard },
  ]

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[640px] h-[360px] bg-emerald-500/[0.07] rounded-full blur-[110px]" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.07] bg-[#09090b]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2.5 shrink-0 px-2 py-1 -ml-2 rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <img src="/logo.png" alt="DeskFlow" className="w-7 h-7 rounded-lg object-cover" />
            <span className="font-semibold text-[15px] tracking-tight text-white">
              Desk<span className="text-emerald-400">Flow</span>
            </span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                    isActive
                      ? 'bg-white/[0.08] text-white'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                  )
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-white/[0.08] flex items-center justify-center">
              <span className="text-[10px] font-semibold text-zinc-300">{avatar}</span>
            </div>
            <button
              onClick={signOut}
              className="hidden sm:flex text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 hover:bg-white/[0.06] rounded-lg"
              title="Sair"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="sm:hidden text-zinc-400 hover:text-white p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden border-t border-white/[0.07] bg-[#09090b]/98 px-4 py-3 space-y-1">
            {navLinks.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full',
                    isActive
                      ? 'bg-white/[0.08] text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  )
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
            <button
              onClick={() => { signOut(); setMenuOpen(false) }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        )}
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-10 relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
