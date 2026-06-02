import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { motion } from 'motion/react'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_20%_50%,rgba(16,185,129,0.06),transparent)]" />

      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 border-r border-white/[0.07] relative">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
            <span className="font-bold text-black text-sm">D</span>
          </div>
          <span className="font-semibold text-[15px] text-white">
            Desk<span className="text-emerald-400">Flow</span>
          </span>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Gerencie chamados<br />com eficiência.
          </h2>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
            Kanban integrado, SLA em tempo real e assistente de IA para o seu time de suporte.
          </p>
        </div>

        <p className="text-xs text-zinc-700">© 2025 DeskFlow</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <span className="font-bold text-black text-sm">D</span>
              </div>
              <span className="font-semibold text-[15px] text-white">
                Desk<span className="text-emerald-400">Flow</span>
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Entrar</h1>
          <p className="text-zinc-500 text-sm mb-8">Acesse o painel de suporte</p>

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
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold mt-2 transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="text-center text-zinc-600 text-sm mt-6">
            Precisa abrir um chamado?{' '}
            <a href="/portal" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Acesse o Portal
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
