import { useState, FormEvent } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { LiaChat } from '@/components/LiaChat'
import { UploadCloud, CheckCircle2 } from 'lucide-react'
import { motion } from 'motion/react'
import { createTicket } from '@/lib/tickets'

export function Portal() {
  const [title, setTitle] = useState('')
  const [ticketType, setTicketType] = useState('REQUEST')
  const [priority, setPriority] = useState('LOW')
  const [description, setDescription] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setTitle('')
    setDescription('')
    setTicketType('REQUEST')
    setPriority('LOW')
    setError('')
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
      setTimeout(() => setIsSubmitted(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao criar chamado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-white font-sans relative flex flex-col items-center justify-center">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(16,185,129,0.07),transparent)]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl relative z-10 px-4 py-12"
      >
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="font-bold text-black text-sm">D</span>
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-white">
              Desk<span className="text-emerald-400">Flow</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1.5">Abrir um Chamado</h1>
          <p className="text-zinc-500 text-sm">Descreva seu problema e nós cuidaremos disso.</p>
        </div>

        <GlassCard className="p-6">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">Chamado Criado!</h3>
              <p className="text-zinc-400 max-w-md">
                Seu chamado foi enviado com sucesso. Nossa equipe irá analisá-lo em breve com base no SLA.
              </p>
              <Button onClick={() => setIsSubmitted(false)} variant="outline" className="mt-6">
                Enviar Outro
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    label="Título"
                    placeholder="Breve resumo do problema"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <Select
                    label="Tipo"
                    value={ticketType}
                    onChange={(e) => setTicketType(e.target.value)}
                    options={[
                      { value: 'REQUEST', label: 'Requisição (Pequena alteração)' },
                      { value: 'DEMAND', label: 'Demanda (Grande funcionalidade)' },
                      { value: 'PROBLEM', label: 'Problema (Causa raiz)' },
                      { value: 'INCIDENT', label: 'Incidente (Erro/Interrupção)' },
                    ]}
                  />
                  {ticketType === 'INCIDENT' && (
                    <Select
                      label="Criticidade"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      options={[
                        { value: 'LOW', label: 'Baixa - Impacto Menor' },
                        { value: 'MEDIUM', label: 'Média - Interrupção Parcial' },
                        { value: 'HIGH', label: 'Alta - Sistema Fora do Ar' },
                      ]}
                    />
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5 h-full">
                    <label className="text-sm font-medium text-zinc-400">Descrição</label>
                    <textarea
                      className="flex-1 w-full rounded-xl border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:bg-zinc-900/80 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none min-h-[120px]"
                      placeholder="Descrição detalhada..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <Button type="button" variant="ghost" className="text-zinc-400 hover:text-white">
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Anexar Arquivo
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  {loading ? 'Enviando...' : 'Criar Chamado'}
                </Button>
              </div>
            </form>
          )}
        </GlassCard>

        <p className="text-center text-zinc-600 text-sm mt-5">
          Você é agente?{' '}
          <a href="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            Acesse o painel
          </a>
        </p>
      </motion.div>

      <LiaChat />
    </div>
  )
}
