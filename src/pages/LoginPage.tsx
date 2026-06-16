import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { motion } from 'motion/react'
import { Kanban, BarChart3, ShieldCheck, Zap, ArrowRight } from 'lucide-react'

const FEATURES = [
  { icon: Kanban,      text: 'Quadro Kanban com drag-and-drop em tempo real' },
  { icon: BarChart3,   text: 'Dashboard analítico com métricas de SLA'       },
  { icon: ShieldCheck, text: 'Controle de acesso e autenticação segura'       },
  { icon: Zap,         text: 'Assistente de IA para triagem de chamados'      },
]

export function LoginPage() {
  const { signIn }   = useAuth()
  const navigate     = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#09090b] flex">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 -translate-y-1/2 -left-48 w-[500px] h-[500px] bg-emerald-500/[0.06] rounded-full blur-[120px]" />
      </div>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 border-r border-white/[0.06] relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/[0.05] rounded-full blur-[90px] pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <img src="/logo.png" alt="DeskFlow" className="w-8 h-8 rounded-xl object-cover shadow-[0_0_14px_rgba(16,185,129,0.35)]" />
          <span className="font-semibold text-base tracking-tight text-white">
            Desk<span className="text-emerald-400">Flow</span>
          </span>
        </div>

        {/* Hero text + features */}
        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sistema ITSM · ITIL 4
            </div>
            <h2 className="text-3xl font-bold text-white leading-tight tracking-tight mb-3">
              Gerencie chamados<br />com eficiência.
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Centralize o suporte técnico, aplique SLAs automatizados e tome decisões baseadas em dados.
            </p>
          </div>

          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.35 }}
                className="flex items-center gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/[0.07] flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
                </div>
                <span className="text-sm text-zinc-400">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-xs text-zinc-700 relative z-10 font-medium">© 2026 DeskFlow · PUC Minas</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden flex items-center justify-center gap-2.5">
            <img src="/logo.png" alt="DeskFlow" className="w-8 h-8 rounded-xl object-cover" />
            <span className="font-semibold text-base tracking-tight text-white">
              Desk<span className="text-emerald-400">Flow</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Entrar</h1>
          <p className="text-zinc-500 text-sm mb-8">Acesse o painel de suporte interno</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agente@empresa.com"
              required
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {error && (
              <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5">
                <span className="mt-0.5 shrink-0">⚠</span>
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold mt-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Entrando…
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-zinc-600 text-sm mt-6">
            Precisa abrir um chamado?{' '}
            <a href="/portal" className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
              Acesse o Portal
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
