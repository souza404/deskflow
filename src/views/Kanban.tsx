import { useState, useEffect, useRef } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { SLATimer } from '@/components/SLATimer'
import { TicketDetailModal } from '@/components/TicketDetailModal'
import { getTickets, subscribeToTickets, updateTicket, getProfiles } from '@/lib/tickets'
import { Ticket, Status, TicketType } from '@/lib/utils'
import {
  User, Search, X, SlidersHorizontal,
  Circle, Loader2, Ban, CheckCircle2,
  Zap, AlertCircle, Layers, Wrench,
  InboxIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

const COLUMNS: {
  id: Status
  title: string
  dot: string
  ring: string
  icon: React.ElementType
  iconColor: string
}[] = [
  { id: 'TODO',        title: 'A Fazer',      dot: 'bg-zinc-500',    ring: 'ring-zinc-500/20',    icon: Circle,       iconColor: 'text-zinc-400'    },
  { id: 'IN_PROGRESS', title: 'Em Progresso', dot: 'bg-blue-400',    ring: 'ring-blue-400/20',    icon: Loader2,      iconColor: 'text-blue-400'    },
  { id: 'BLOCKED',     title: 'Bloqueado',    dot: 'bg-red-400',     ring: 'ring-red-400/20',     icon: Ban,          iconColor: 'text-red-400'     },
  { id: 'DONE',        title: 'Concluído',    dot: 'bg-emerald-400', ring: 'ring-emerald-400/20', icon: CheckCircle2, iconColor: 'text-emerald-400' },
]

const TYPE_META: Record<TicketType, { icon: React.ElementType; variant: 'danger' | 'warning' | 'info' | 'success'; label: string }> = {
  INCIDENT: { icon: Zap,          variant: 'danger',  label: 'Incidente' },
  PROBLEM:  { icon: AlertCircle,  variant: 'warning', label: 'Problema'  },
  DEMAND:   { icon: Layers,       variant: 'info',    label: 'Demanda'   },
  REQUEST:  { icon: Wrench,       variant: 'success', label: 'Requisição'},
}

const TYPE_OPTIONS: { value: TicketType | 'ALL'; label: string }[] = [
  { value: 'ALL',      label: 'Todos os tipos' },
  { value: 'INCIDENT', label: 'Incidente'      },
  { value: 'PROBLEM',  label: 'Problema'       },
  { value: 'DEMAND',   label: 'Demanda'        },
  { value: 'REQUEST',  label: 'Requisição'     },
]

const PRIORITY_OPTIONS = [
  { value: 'ALL',    label: 'Toda criticidade' },
  { value: 'HIGH',   label: 'Alta'             },
  { value: 'MEDIUM', label: 'Média'            },
  { value: 'LOW',    label: 'Baixa'            },
]

export function Kanban() {
  const [tickets, setTickets]           = useState<Ticket[]>([])
  const [profiles, setProfiles]         = useState<{ id: string; name: string }[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [loading, setLoading]           = useState(true)
  const [draggedId, setDraggedId]       = useState<string | null>(null)
  const [dragOverCol, setDragOverCol]   = useState<Status | null>(null)
  const [showFilters, setShowFilters]   = useState(false)
  const [mobileCol, setMobileCol]       = useState<Status>('TODO')
  const [search, setSearch]             = useState('')
  const [typeFilter, setTypeFilter]     = useState<TicketType | 'ALL'>('ALL')
  const [prioFilter, setPrioFilter]     = useState<string>('ALL')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL')
  const selectedTicketRef               = useRef<Ticket | null>(null)

  useEffect(() => { selectedTicketRef.current = selectedTicket }, [selectedTicket])

  const load = async () => {
    const data = await getTickets()
    setTickets(data)
    setLoading(false)
    if (selectedTicketRef.current) {
      const refreshed = data.find((t) => t.id === selectedTicketRef.current!.id)
      if (refreshed) setSelectedTicket(refreshed)
    }
  }

  useEffect(() => {
    load()
    const unsubscribe = subscribeToTickets(load)
    getProfiles().then(setProfiles)
    return unsubscribe
  }, [])

  const activeFilterCount = [
    search.trim() !== '',
    typeFilter !== 'ALL',
    prioFilter !== 'ALL',
    assigneeFilter !== 'ALL',
  ].filter(Boolean).length

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('ALL')
    setPrioFilter('ALL')
    setAssigneeFilter('ALL')
  }

  const applyFilters = (list: Ticket[]) =>
    list.filter((t) => {
      if (search.trim() && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.id.toLowerCase().includes(search.toLowerCase())) return false
      if (typeFilter !== 'ALL' && t.type !== typeFilter) return false
      if (prioFilter !== 'ALL') { if (t.type !== 'INCIDENT') return false; if (t.priority !== prioFilter) return false }
      if (assigneeFilter === 'NONE' && t.assignee_id) return false
      if (assigneeFilter !== 'ALL' && assigneeFilter !== 'NONE' && t.assignee_id !== assigneeFilter) return false
      return true
    })

  const getTicketsByStatus = (status: Status) =>
    applyFilters(tickets.filter((t) => t.status === status))

  const handleDelete = (id: string) => setTickets((prev) => prev.filter((t) => t.id !== id))

  const handleDrop = async (targetStatus: Status) => {
    if (!draggedId) return
    const ticket = tickets.find((t) => t.id === draggedId)
    if (!ticket || ticket.status === targetStatus) return
    setTickets((prev) => prev.map((t) => t.id === draggedId ? { ...t, status: targetStatus } : t))
    setDraggedId(null); setDragOverCol(null)
    await updateTicket(draggedId, { status: targetStatus })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Orquestração</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Gerencie e acompanhe os chamados de suporte.</p>
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all border',
            showFilters || activeFilterCount > 0
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-white/[0.04] border-white/[0.07] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.07]'
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-4"
          >
            <GlassCard className="p-3 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[160px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar por título ou ID…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-white/10 bg-zinc-900/60 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TicketType | 'ALL')}
                className="px-3 py-1.5 rounded-xl border border-white/10 bg-zinc-900/60 text-sm text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
              >
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select
                value={prioFilter}
                onChange={(e) => setPrioFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-white/10 bg-zinc-900/60 text-sm text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
              >
                {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-white/10 bg-zinc-900/60 text-sm text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
              >
                <option value="ALL">Todos os agentes</option>
                <option value="NONE">Sem responsável</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <X className="w-3 h-3" />
                  Limpar
                </button>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile column tabs */}
      <div className="flex md:hidden gap-1.5 mb-3 overflow-x-auto pb-1">
        {COLUMNS.map((col) => {
          const count = getTicketsByStatus(col.id).length
          const Icon = col.icon
          return (
            <button
              key={col.id}
              onClick={() => setMobileCol(col.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0',
                mobileCol === col.id
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
              )}
            >
              <Icon className={cn('w-3 h-3', mobileCol === col.id ? col.iconColor : '')} />
              {col.title}
              <span className="text-zinc-600">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Desktop: all columns */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-4 min-h-0 flex-1">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id} col={col}
            tickets={getTicketsByStatus(col.id)}
            draggedId={draggedId} dragOverCol={dragOverCol}
            onDragOver={() => setDragOverCol(col.id)}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={() => handleDrop(col.id)}
            onDragStart={(id) => setDraggedId(id)}
            onDragEnd={() => { setDraggedId(null); setDragOverCol(null) }}
            onSelect={setSelectedTicket}
          />
        ))}
      </div>

      {/* Mobile: single column */}
      <div className="flex md:hidden flex-col gap-2 flex-1 overflow-y-auto pb-4">
        {(() => {
          const col = COLUMNS.find((c) => c.id === mobileCol)!
          return (
            <KanbanColumn
              key={col.id} col={col}
              tickets={getTicketsByStatus(col.id)}
              draggedId={draggedId} dragOverCol={dragOverCol}
              onDragOver={() => setDragOverCol(col.id)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => handleDrop(col.id)}
              onDragStart={(id) => setDraggedId(id)}
              onDragEnd={() => { setDraggedId(null); setDragOverCol(null) }}
              onSelect={setSelectedTicket}
              mobileExpanded
            />
          )
        })()}
      </div>

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket} isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={(updated) => setSelectedTicket(updated)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

/* ─── KanbanColumn ─────────────────────────────────────────── */

interface KanbanColumnProps {
  col: typeof COLUMNS[number]
  tickets: Ticket[]
  draggedId: string | null
  dragOverCol: Status | null
  onDragOver: () => void
  onDragLeave: () => void
  onDrop: () => void
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onSelect: (t: Ticket) => void
  mobileExpanded?: boolean
}

function KanbanColumn({
  col, tickets, draggedId, dragOverCol,
  onDragOver, onDragLeave, onDrop,
  onDragStart, onDragEnd, onSelect,
  mobileExpanded,
}: KanbanColumnProps) {
  const ColIcon = col.icon
  return (
    <div
      className={cn('flex flex-col', mobileExpanded ? 'w-full' : 'shrink-0 w-[272px]')}
      onDragOver={(e) => { e.preventDefault(); onDragOver() }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <div className="flex items-center gap-2">
          <ColIcon className={cn('w-3.5 h-3.5', col.iconColor)} strokeWidth={2} />
          <h3 className="text-sm font-semibold text-zinc-300 tracking-tight">{col.title}</h3>
        </div>
        <span className={cn(
          'text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded-md',
          tickets.length > 0 ? 'bg-white/[0.06] text-zinc-400' : 'text-zinc-700'
        )}>
          {tickets.length}
        </span>
      </div>

      {/* Cards */}
      <div className={cn(
        'flex-1 space-y-2 rounded-2xl transition-all duration-150 p-1.5 -m-1.5',
        dragOverCol === col.id && draggedId ? `bg-white/[0.03] ring-1 ${col.ring}` : ''
      )}>
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 h-24 text-zinc-700 border border-dashed border-white/[0.06] rounded-2xl">
            <InboxIcon className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-xs">Nenhum chamado</span>
          </div>
        ) : (
          tickets.map((ticket) => {
            const meta = TYPE_META[ticket.type]
            const TypeIcon = meta.icon
            return (
              <motion.div
                key={ticket.id}
                layoutId={ticket.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                draggable
                onDragStart={() => onDragStart(ticket.id)}
                onDragEnd={onDragEnd}
                onClick={() => onSelect(ticket)}
                className={draggedId === ticket.id ? 'opacity-40' : ''}
                style={{ cursor: 'grab' }}
              >
                <GlassCard
                  variant="hover"
                  className="p-3.5 flex flex-col gap-2.5 border-white/[0.06] bg-zinc-950/60"
                >
                  {/* Top row: badge + id */}
                  <div className="flex items-center gap-2">
                    <Badge variant={meta.variant} className="text-[10px] px-1.5 py-0 gap-1 rounded-md">
                      <TypeIcon className="w-2.5 h-2.5" strokeWidth={2.5} />
                      {meta.label}
                    </Badge>
                    <span className="text-[10px] text-zinc-700 font-mono ml-auto tracking-wide">
                      #{ticket.id.slice(0, 7)}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-semibold text-[13px] text-zinc-100 line-clamp-2 leading-snug tracking-tight">
                    {ticket.title}
                  </h4>

                  {/* Bottom row: assignee + SLA */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.05]">
                    {ticket.assignee ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-900/60 border border-emerald-500/20 flex items-center justify-center text-[9px] text-emerald-400 font-bold">
                          {ticket.assignee.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-[11px] text-zinc-500 truncate max-w-[80px]">
                          {ticket.assignee.split(' ')[0]}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-zinc-700">
                        <div className="w-5 h-5 rounded-full bg-zinc-900 border border-white/[0.06] flex items-center justify-center">
                          <User className="w-2.5 h-2.5" />
                        </div>
                        <span className="text-[11px]">Sem agente</span>
                      </div>
                    )}
                    <SLATimer ticket={ticket} />
                  </div>
                </GlassCard>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
