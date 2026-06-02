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
    <div className="min-h-screen w-full bg-black text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-emerald-900/20 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <span className="font-bold text-black text-lg">D</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Desk<span className="text-emerald-400">Flow</span>
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md">
            <NavLink
              to="/kanban"
              className={({ isActive }) =>
                cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                )
              }
            >
              <Trello className="w-4 h-4" />
              Orquestração
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                )
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center">
              <span className="text-xs font-medium text-zinc-400">{avatar}</span>
            </div>
            <button
              onClick={signOut}
              className="text-zinc-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
