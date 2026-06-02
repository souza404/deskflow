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
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Visão geral do desempenho e métricas de suporte.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-5 border-l-2 border-l-emerald-500 border-white/[0.07]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Fechado</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-3xl font-bold text-white tabular-nums">{totalClosed}</h3>
          <p className="text-xs text-zinc-600 mt-1">chamados resolvidos</p>
        </GlassCard>

        <GlassCard className="p-5 border-l-2 border-l-blue-500 border-white/[0.07]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">SLA Cumprido</p>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-3xl font-bold text-white tabular-nums">{slaPercentage}%</h3>
          <p className="text-xs text-zinc-600 mt-1">dentro do prazo</p>
        </GlassCard>

        <GlassCard className="p-5 border-l-2 border-l-amber-500 border-white/[0.07]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Tempo Médio</p>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-3xl font-bold text-white tabular-nums">{avgResolutionTime}</h3>
          <p className="text-xs text-zinc-600 mt-1">tempo de resolução</p>
        </GlassCard>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.07]">
          <h3 className="text-sm font-semibold text-white">Atividade Recente</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Chamado</th>
                <th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Tipo</th>
                <th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Responsável</th>
                <th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Fechado em</th>
                <th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {closedTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-zinc-600 text-sm">
                    Nenhum chamado fechado ainda.
                  </td>
                </tr>
              ) : (
                closedTickets.map((ticket, i) => (
                  <tr
                    key={ticket.id}
                    className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-zinc-200">{ticket.title}</span>
                        <span className="text-xs text-zinc-600 font-mono">{ticket.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                        ticket.type === 'INCIDENT' ? 'bg-red-500/10 text-red-400'
                          : ticket.type === 'PROBLEM' ? 'bg-amber-500/10 text-amber-400'
                          : ticket.type === 'DEMAND' ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {ticket.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-400 text-sm">{ticket.assignee || <span className="text-zinc-600">—</span>}</td>
                    <td className="px-5 py-3.5 text-zinc-500 text-sm tabular-nums">
                      {ticket.closedAt ? format(new Date(ticket.closedAt), 'd MMM, yyyy') : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
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
