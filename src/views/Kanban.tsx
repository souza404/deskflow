import { useState, useEffect, useRef } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { SLATimer } from '@/components/SLATimer'
import { TicketDetailModal } from '@/components/TicketDetailModal'
import { getTickets, subscribeToTickets, updateTicket } from '@/lib/tickets'
import { Ticket, Status } from '@/lib/utils'
import { User } from 'lucide-react'
import { motion } from 'motion/react'

const COLUMNS: { id: Status; title: string }[] = [
  { id: 'TODO', title: 'A Fazer' },
  { id: 'IN_PROGRESS', title: 'Em Progresso' },
  { id: 'BLOCKED', title: 'Bloqueado' },
  { id: 'DONE', title: 'Concluído' },
]

export function Kanban() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null)
  const selectedTicketRef = useRef<Ticket | null>(null)

  useEffect(() => {
    selectedTicketRef.current = selectedTicket
  }, [selectedTicket])

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
    return unsubscribe
  }, [])

  const getTicketsByStatus = (status: Status) => tickets.filter((t) => t.status === status)

  const handleDelete = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id))
  }

  const handleDrop = async (targetStatus: Status) => {
    if (!draggedId) return
    const ticket = tickets.find((t) => t.id === draggedId)
    if (!ticket || ticket.status === targetStatus) return
    setTickets((prev) => prev.map((t) => t.id === draggedId ? { ...t, status: targetStatus } : t))
    setDraggedId(null)
    setDragOverCol(null)
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Orquestração</h1>
          <p className="text-zinc-400">Gerencie e acompanhe os chamados de suporte.</p>
        </div>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-4 min-h-0 flex-1">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className="flex flex-col shrink-0 w-72"
            onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id) }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={() => handleDrop(col.id)}
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-semibold text-zinc-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500/50" />
                {col.title}
              </h3>
              <span className="text-xs text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">
                {getTicketsByStatus(col.id).length}
              </span>
            </div>

            <div className={`flex-1 space-y-3 rounded-xl transition-colors duration-150 p-1 -m-1 ${dragOverCol === col.id && draggedId ? 'bg-emerald-500/10 ring-1 ring-emerald-500/30' : ''}`}>
              {getTicketsByStatus(col.id).map((ticket) => (
                <motion.div
                  key={ticket.id}
                  layoutId={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  draggable
                  onDragStart={() => setDraggedId(ticket.id)}
                  onDragEnd={() => { setDraggedId(null); setDragOverCol(null) }}
                  onClick={() => setSelectedTicket(ticket)}
                  className={draggedId === ticket.id ? 'opacity-40' : ''}
                  style={{ cursor: 'grab' }}
                >
                  <GlassCard
                    variant="hover"
                    className="p-3.5 flex flex-col gap-2.5 border-white/5 bg-zinc-900/50"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          ticket.type === 'INCIDENT' ? 'danger'
                            : ticket.type === 'PROBLEM' ? 'warning'
                            : ticket.type === 'DEMAND' ? 'info'
                            : 'success'
                        }
                        className="text-[10px] px-1.5 py-0"
                      >
                        {ticket.type}
                      </Badge>
                      <span className="text-[10px] text-zinc-600 font-mono ml-auto">{ticket.id.slice(0, 8)}</span>
                    </div>

                    <h4 className="font-medium text-sm text-zinc-200 line-clamp-2 leading-snug">
                      {ticket.title}
                    </h4>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      {ticket.assignee ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-900/60 border border-emerald-500/20 flex items-center justify-center text-[9px] text-emerald-400 font-medium">
                          {ticket.assignee.split(' ').map((n) => n[0]).join('')}
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-600">
                          <User className="w-2.5 h-2.5" />
                        </div>
                      )}
                      <SLATimer ticket={ticket} />
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={(updated) => setSelectedTicket(updated)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
