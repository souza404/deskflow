import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { getTickets } from '@/lib/tickets'
import { Ticket, getSLAStatus } from '@/lib/utils'
import { CheckCircle2, Clock, TrendingUp } from 'lucide-react'
import { format, differenceInMinutes } from 'date-fns'

export function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTickets().then((data) => {
      setTickets(data)
      setLoading(false)
    })
  }, [])

  const closedTickets = tickets.filter((t) => t.status === 'DONE')
  const totalClosed = closedTickets.length
  const slaBreachedCount = closedTickets.filter((t) => getSLAStatus(t).isBreached).length
  const slaPercentage =
    totalClosed > 0 ? Math.round(((totalClosed - slaBreachedCount) / totalClosed) * 100) : 100

  const avgResolutionTime = (() => {
    const resolved = closedTickets.filter((t) => t.closedAt)
    if (!resolved.length) return '-'
    const totalMin = resolved.reduce(
      (acc, t) => acc + differenceInMinutes(new Date(t.closedAt!), new Date(t.createdAt)),
      0
    )
    const avg = totalMin / resolved.length
    const hours = Math.floor(avg / 60)
    const mins = Math.round(avg % 60)
    return hours >= 24 ? `${Math.floor(hours / 24)}d ${hours % 24}h` : `${hours}h ${mins}m`
  })()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-zinc-400">Visão geral do desempenho e métricas de suporte.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 flex items-center gap-4 bg-emerald-900/10 border-emerald-500/20">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Total Fechado</p>
            <h3 className="text-3xl font-bold text-white">{totalClosed}</h3>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4 bg-blue-900/10 border-blue-500/20">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">SLA Cumprido</p>
            <h3 className="text-3xl font-bold text-white">{slaPercentage}%</h3>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4 bg-amber-900/10 border-amber-500/20">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Tempo Médio</p>
            <h3 className="text-3xl font-bold text-white">{avgResolutionTime}</h3>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Atividade Recente</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 font-medium text-zinc-400">Chamado</th>
                <th className="px-6 py-4 font-medium text-zinc-400">Tipo</th>
                <th className="px-6 py-4 font-medium text-zinc-400">Responsável</th>
                <th className="px-6 py-4 font-medium text-zinc-400">Data de Fechamento</th>
                <th className="px-6 py-4 font-medium text-zinc-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {closedTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    Nenhum chamado fechado ainda.
                  </td>
                </tr>
              ) : (
                closedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{ticket.title}</span>
                        <span className="text-xs text-zinc-500 font-mono">{ticket.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          ticket.type === 'INCIDENT'
                            ? 'bg-red-500/10 text-red-400'
                            : ticket.type === 'PROBLEM'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {ticket.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">{ticket.assignee || 'Não atribuído'}</td>
                    <td className="px-6 py-4 text-zinc-400">
                      {ticket.closedAt ? format(new Date(ticket.closedAt), 'd MMM, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        Fechado
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
