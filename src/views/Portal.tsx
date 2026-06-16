import { useState, FormEvent } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  UploadCloud, CheckCircle2, Wrench, Layers, AlertCircle, Zap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { createTicket } from '@/lib/tickets'
import { cn } from '@/lib/utils'

const TICKET_TYPES = [
  {
    value: 'REQUEST',
    label: 'Requisição',
    desc: 'Pequena alteração ou ajuste',
    icon: Wrench,
    ring: 'ring-emerald-500/40',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  {
    value: 'DEMAND',
    label: 'Demanda',
    desc: 'Nova funcionalidade ou projeto',
    icon: Layers,
    ring: 'ring-blue-500/40',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  {
    value: 'PROBLEM',
    label: 'Problema',
    desc: 'Investigação de causa raiz',
    icon: AlertCircle,
    ring: 'ring-amber-500/40',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  {
    value: 'INCIDENT',
    label: 'Incidente',
    desc: 'Erro crítico ou interrupção',
    icon: Zap,
    ring: 'ring-red-500/40',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
  },
] as const

const PRIORITIES = [
  { value: 'LOW',    label: 'Baixa',  desc: 'Impacto menor',      dot: 'bg-emerald-400' },
  { value: 'MEDIUM', label: 'Média',  desc: 'Interrupção parcial', dot: 'bg-amber-400'   },
  { value: 'HIGH',   label: 'Alta',   desc: 'Sistema fora do ar', dot: 'bg-red-400'     },
] as const

export function Portal() {
  const [title, setTitle]           = useState('')
  const [ticketType, setTicketType] = useState('REQUEST')
  const [priority, setPriority]     = useState('LOW')
  const [description, setDescription] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [showPriority, setShowPriority] = useState(false)

  const reset = () => {
    setTitle('')
    setDescription('')
    setTicketType('REQUEST')
    setPriority('LOW')
    setError('')
    setShowPriority(false)
  }

  const handleTypeSelect = (val: string) => {
    setTicketType(val)
    setShowPriority(val === 'INCIDENT')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createTicket({
        title,
        description,
        type: ticketType,
        priority: ticketType === 'INCIDENT' ? priority : undefined,
      })
      reset()
      setIsSubmitted(true)
      setTimeout(() => setIsSubmitted(false), 3500)
    } catch (err: any) {
      setError(err.message || 'Erro ao criar chamado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-white font-sans relative flex flex-col items-center justify-center">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[560px] h-[320px] bg-emerald-500/[0.07] rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl relative z-10 px-4 py-8 sm:py-12"
      >
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-5">
            <img src="/logo.png" alt="DeskFlow" className="w-8 h-8 rounded-xl object-cover shadow-[0_0_12px_rgba(16,185,129,0.3)]" />
            <span className="font-semibold text-base tracking-tight text-white">
              Desk<span className="text-emerald-400">Flow</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1.5">Abrir um Chamado</h1>
          <p className="text-zinc-500 text-sm">Descreva seu problema e nossa equipe cuidará disso.</p>
        </div>

        <GlassCard className="p-5 sm:p-6">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-14 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 shadow-[0_0_24px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Chamado criado!</h3>
                <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
                  Sua solicitação foi enviada. Nossa equipe irá analisá-la de acordo com o SLA.
                </p>
                <Button onClick={() => setIsSubmitted(false)} variant="outline" className="mt-4 text-sm">
                  Enviar outro chamado
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Title */}
                <Input
                  label="Título"
                  placeholder="Breve resumo do problema"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                {/* Type selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Tipo de chamado</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TICKET_TYPES.map(({ value, label, desc, icon: Icon, bg, text, border, ring }) => {
                      const active = ticketType === value
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleTypeSelect(value)}
                          className={cn(
                            'flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-150',
                            active
                              ? `${bg} ${border} ring-1 ${ring}`
                              : 'bg-zinc-900/40 border-white/[0.07] hover:border-white/[0.14] hover:bg-zinc-900/70'
                          )}
                        >
                          <div className={cn('mt-0.5 p-1.5 rounded-lg', active ? bg : 'bg-zinc-800')}>
                            <Icon className={cn('w-3.5 h-3.5', active ? text : 'text-zinc-500')} strokeWidth={2} />
                          </div>
                          <div>
                            <p className={cn('text-xs font-semibold leading-tight', active ? 'text-white' : 'text-zinc-300')}>
                              {label}
                            </p>
                            <p className="text-[11px] text-zinc-500 mt-0.5 leading-tight">{desc}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Priority (incident only) */}
                <AnimatePresence>
                  {showPriority && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Criticidade</label>
                        <div className="flex gap-2">
                          {PRIORITIES.map(({ value, label, desc, dot }) => {
                            const active = priority === value
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setPriority(value)}
                                className={cn(
                                  'flex-1 flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border text-center transition-all duration-150 text-xs',
                                  active
                                    ? 'bg-zinc-800 border-white/20 text-white'
                                    : 'bg-zinc-900/40 border-white/[0.07] text-zinc-400 hover:border-white/[0.14]'
                                )}
                              >
                                <span className={cn('w-2 h-2 rounded-full', dot)} />
                                <span className="font-semibold">{label}</span>
                                <span className="text-[10px] text-zinc-500">{desc}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-zinc-400">Descrição</label>
                  <textarea
                    className="w-full rounded-xl border border-white/10 bg-zinc-900/50 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:bg-zinc-900/80 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 resize-none min-h-[100px] leading-relaxed"
                    placeholder="Descreva detalhadamente o problema, o que aconteceu e o impacto..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/[0.05]"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Anexar arquivo
                  </button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-[0_0_20px_rgba(16,185,129,0.25)] px-5"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enviando…
                      </span>
                    ) : 'Criar Chamado'}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </GlassCard>

        <p className="text-center text-zinc-600 text-sm mt-5">
          Você é agente?{' '}
          <a href="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
            Acesse o painel →
          </a>
        </p>
      </motion.div>
    </div>
  )
}
