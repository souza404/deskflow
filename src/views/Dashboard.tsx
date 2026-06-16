import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { getTickets } from '@/lib/tickets'
import { Ticket, getSLAStatus } from '@/lib/utils'
import {
  CheckCircle2, Clock, TrendingUp, FileDown,
  Zap, AlertCircle, Layers, Wrench,
  ShieldCheck, ShieldAlert, Activity,
} from 'lucide-react'
import { format, differenceInMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'motion/react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { cn } from '@/lib/utils'

const TYPE_META = [
  { key: 'INCIDENT', label: 'Incidentes', icon: Zap,         color: 'text-red-400',     bar: 'bg-red-500'     },
  { key: 'PROBLEM',  label: 'Problemas',  icon: AlertCircle, color: 'text-amber-400',   bar: 'bg-amber-500'   },
  { key: 'DEMAND',   label: 'Demandas',   icon: Layers,      color: 'text-blue-400',    bar: 'bg-blue-500'    },
  { key: 'REQUEST',  label: 'Requisições',icon: Wrench,      color: 'text-emerald-400', bar: 'bg-emerald-500' },
] as const

const TYPE_LABEL: Record<string, string> = {
  INCIDENT: 'Incidente', PROBLEM: 'Problema', DEMAND: 'Demanda', REQUEST: 'Requisição',
}

export function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    getTickets().then((data) => { setTickets(data); setLoading(false) })
  }, [])

  const closedTickets  = tickets.filter((t) => t.status === 'DONE')
  const activeTickets  = tickets.filter((t) => t.status !== 'DONE')
  const totalClosed    = closedTickets.length
  const slaBreached    = closedTickets.filter((t) => getSLAStatus(t).isBreached).length
  const slaPercentage  = totalClosed > 0 ? Math.round(((totalClosed - slaBreached) / totalClosed) * 100) : 100

  const avgResolutionTime = (() => {
    const resolved = closedTickets.filter((t) => t.closedAt)
    if (!resolved.length) return '—'
    const totalMin = resolved.reduce(
      (acc, t) => acc + differenceInMinutes(new Date(t.closedAt!), new Date(t.createdAt)), 0
    )
    const avg = totalMin / resolved.length
    const hours = Math.floor(avg / 60)
    const mins  = Math.round(avg % 60)
    return hours >= 24 ? `${Math.floor(hours / 24)}d ${hours % 24}h` : `${hours}h ${mins}m`
  })()

  const totalAll = tickets.length || 1

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const doc  = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageW = doc.internal.pageSize.getWidth()
      const now   = new Date()

      doc.setFillColor(16, 185, 129)
      doc.rect(0, 0, pageW, 14, 'F')
      doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(0, 0, 0)
      doc.text('DeskFlow', 10, 9.5)
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(20, 20, 20)
      doc.text('Sistema Ágil para Gestão de Incidentes', 38, 9.5)
      const dateStr = format(now, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
      doc.text(`Gerado em ${dateStr}`, pageW - 10, 9.5, { align: 'right' })

      doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(20, 20, 20)
      doc.text('Relatório Gerencial de Chamados', 10, 26)

      const kpis = [
        { label: 'Total Fechado',  value: String(totalClosed),         sub: 'chamados resolvidos', color: [16, 185, 129] as [number,number,number] },
        { label: 'SLA Cumprido',   value: `${slaPercentage}%`,         sub: 'dentro do prazo',     color: [59, 130, 246] as [number,number,number] },
        { label: 'Tempo Médio',    value: avgResolutionTime,            sub: 'tempo de resolução',  color: [245, 158, 11] as [number,number,number] },
        { label: 'Chamados Ativos',value: String(activeTickets.length), sub: 'em aberto',           color: [139, 92, 246] as [number,number,number] },
      ]
      const cardW = (pageW - 20 - 9) / 4
      kpis.forEach((kpi, i) => {
        const x = 10 + i * (cardW + 3), y = 32
        doc.setDrawColor(...kpi.color); doc.setLineWidth(0.8)
        doc.setFillColor(248, 248, 248); doc.roundedRect(x, y, cardW, 22, 2, 2, 'FD')
        doc.setFillColor(...kpi.color); doc.rect(x, y, 2, 22, 'F')
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(100, 100, 100)
        doc.text(kpi.label.toUpperCase(), x + 5, y + 7)
        doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(20, 20, 20)
        doc.text(kpi.value, x + 5, y + 15.5)
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(130, 130, 130)
        doc.text(kpi.sub, x + 5, y + 20)
      })

      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(30, 30, 30)
      doc.text('Chamados Fechados', 10, 64)

      const rows = closedTickets.map((t) => {
        const sla = getSLAStatus(t)
        return [
          t.id.slice(0, 8),
          t.title.length > 55 ? t.title.slice(0, 55) + '…' : t.title,
          TYPE_LABEL[t.type] ?? t.type,
          t.priority ?? '—',
          t.assignee ?? '—',
          t.createdAt ? format(new Date(t.createdAt), 'dd/MM/yyyy') : '—',
          t.closedAt  ? format(new Date(t.closedAt),  'dd/MM/yyyy') : '—',
          sla.isBreached ? 'Violado' : 'Cumprido',
        ]
      })

      autoTable(doc, {
        startY: 67,
        head: [['ID', 'Título', 'Tipo', 'Criticidade', 'Responsável', 'Aberto em', 'Fechado em', 'SLA']],
        body: rows.length > 0 ? rows : [['—', 'Nenhum chamado fechado', '', '', '', '', '', '']],
        styles: { fontSize: 8, cellPadding: 3, textColor: [40, 40, 40], lineColor: [220, 220, 220], lineWidth: 0.2 },
        headStyles: { fillColor: [24, 24, 27], textColor: [200, 200, 200], fontStyle: 'bold', fontSize: 7.5 },
        alternateRowStyles: { fillColor: [248, 248, 250] },
        columnStyles: { 0: { cellWidth: 20, font: 'courier' }, 1: { cellWidth: 'auto' }, 7: { halign: 'center', fontStyle: 'bold' } },
        didParseCell(data) {
          if (data.column.index === 7 && data.section === 'body') {
            data.cell.styles.textColor = (data.cell.raw as string) === 'Violado' ? [220, 38, 38] : [16, 185, 129]
          }
        },
        margin: { left: 10, right: 10 },
      })

      const totalPages = (doc as any).internal.getNumberOfPages()
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p)
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(160, 160, 160)
        doc.text(`DeskFlow — Relatório Gerencial  |  Página ${p} de ${totalPages}`, pageW / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' })
      }

      doc.save(`deskflow-relatorio-${format(now, 'yyyy-MM-dd')}.pdf`)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Visão geral do desempenho e métricas de suporte.</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/25 text-emerald-400 hover:text-emerald-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileDown className="w-4 h-4" />
          {exporting ? 'Gerando PDF…' : 'Exportar PDF'}
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-5 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-l-2xl" />
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Total Fechado</p>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={2} />
            </div>
          </div>
          <h3 className="text-4xl font-bold text-white tabular-nums tracking-tight">{totalClosed}</h3>
          <p className="text-xs text-zinc-600 mt-1.5 font-medium">chamados resolvidos</p>
        </GlassCard>

        <GlassCard className="p-5 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-2xl" />
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">SLA Cumprido</p>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              {slaPercentage >= 80
                ? <ShieldCheck className="w-4 h-4 text-blue-400" strokeWidth={2} />
                : <ShieldAlert className="w-4 h-4 text-amber-400" strokeWidth={2} />}
            </div>
          </div>
          <h3 className="text-4xl font-bold text-white tabular-nums tracking-tight">{slaPercentage}%</h3>
          <div className="mt-2 h-1 rounded-full bg-zinc-800">
            <div
              className={cn('h-1 rounded-full transition-all', slaPercentage >= 80 ? 'bg-blue-500' : 'bg-amber-500')}
              style={{ width: `${slaPercentage}%` }}
            />
          </div>
          <p className="text-xs text-zinc-600 mt-1.5 font-medium">dentro do prazo</p>
        </GlassCard>

        <GlassCard className="p-5 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-amber-500 to-amber-600 rounded-l-2xl" />
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Tempo Médio</p>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-400" strokeWidth={2} />
            </div>
          </div>
          <h3 className="text-4xl font-bold text-white tabular-nums tracking-tight">{avgResolutionTime}</h3>
          <p className="text-xs text-zinc-600 mt-1.5 font-medium">tempo de resolução</p>
        </GlassCard>
      </div>

      {/* Distribution + Activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Type distribution */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-zinc-500" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-white">Distribuição por Tipo</h3>
          </div>
          <div className="space-y-3">
            {TYPE_META.map(({ key, label, icon: Icon, color, bar }) => {
              const count = tickets.filter((t) => t.type === key).length
              const pct   = Math.round((count / totalAll) * 100)
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className={cn('w-3.5 h-3.5', color)} strokeWidth={2} />
                      <span className="text-xs font-medium text-zinc-400">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-600">{count}</span>
                      <span className="text-xs font-semibold text-zinc-400 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-900">
                    <motion.div
                      className={cn('h-1.5 rounded-full', bar)}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>

        {/* Activity table */}
        <GlassCard className="overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-500" strokeWidth={2} />
              <h3 className="text-sm font-semibold text-white">Atividade Recente</h3>
            </div>
            <span className="text-xs text-zinc-600 font-medium">{totalClosed} fechado{totalClosed !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className="px-5 py-3 text-[11px] font-semibold text-zinc-600 uppercase tracking-widest">Chamado</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-zinc-600 uppercase tracking-widest">Tipo</th>
                  <th className="hidden sm:table-cell px-5 py-3 text-[11px] font-semibold text-zinc-600 uppercase tracking-widest">Responsável</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-zinc-600 uppercase tracking-widest">SLA</th>
                </tr>
              </thead>
              <tbody>
                {closedTickets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-zinc-700 text-sm">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-2 opacity-30" />
                      Nenhum chamado fechado ainda.
                    </td>
                  </tr>
                ) : (
                  closedTickets.map((ticket, i) => {
                    const breached = getSLAStatus(ticket).isBreached
                    const meta = TYPE_META.find((m) => m.key === ticket.type)
                    const TypeIcon = meta?.icon ?? Wrench
                    return (
                      <tr
                        key={ticket.id}
                        className={cn(
                          'border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors',
                          i % 2 !== 0 && 'bg-white/[0.01]'
                        )}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-semibold text-zinc-200 line-clamp-1 tracking-tight">{ticket.title}</span>
                            <span className="text-[10px] text-zinc-700 font-mono">#{ticket.id.slice(0, 7)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className={cn(
                            'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold',
                            ticket.type === 'INCIDENT' ? 'bg-red-500/10 text-red-400'
                              : ticket.type === 'PROBLEM' ? 'bg-amber-500/10 text-amber-400'
                              : ticket.type === 'DEMAND' ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-emerald-500/10 text-emerald-400'
                          )}>
                            <TypeIcon className="w-3 h-3" strokeWidth={2.5} />
                            {TYPE_LABEL[ticket.type]}
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-5 py-3.5">
                          {ticket.assignee ? (
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[9px] font-bold text-zinc-400">
                                {ticket.assignee.charAt(0)}
                              </div>
                              <span className="text-xs text-zinc-400">{ticket.assignee}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-700 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={cn(
                            'inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-lg px-2 py-1',
                            breached
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-emerald-500/10 text-emerald-400'
                          )}>
                            {breached
                              ? <ShieldAlert className="w-3 h-3" strokeWidth={2.5} />
                              : <ShieldCheck className="w-3 h-3" strokeWidth={2.5} />}
                            {breached ? 'Violado' : 'Cumprido'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
