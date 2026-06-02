import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Trello, LogOut } from 'lucide-react'

export function Layout() {
  const { user, signOut } = useAuth()
  const avatar = user?.user_metadata?.name
    ? (user.user_metadata.name as string).slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(16,185,129,0.07),transparent)]" />

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.07] bg-[#09090b]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="font-bold text-black text-sm">D</span>
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-white">
              Desk<span className="text-emerald-400">Flow</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <NavLink
              to="/kanban"
              className={({ isActive }) =>
                cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                  isActive
                    ? 'bg-white/[0.08] text-white'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                )
              }
            >
              <Trello className="w-3.5 h-3.5" />
              Orquestração
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                  isActive
                    ? 'bg-white/[0.08] text-white'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                )
              }
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </NavLink>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-white/[0.08] flex items-center justify-center">
              <span className="text-[10px] font-semibold text-zinc-300">{avatar}</span>
            </div>
            <button
              onClick={signOut}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 hover:bg-white/[0.06] rounded-lg"
              title="Sair"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 pt-20 pb-10 relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
