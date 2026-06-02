import { useState, useRef, useEffect, ChangeEvent } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Ticket, Status, Comment } from '@/lib/utils'
import { updateTicket, addComment as addCommentApi, getProfiles, deleteTicket } from '@/lib/tickets'
import { useAuth } from '@/contexts/AuthContext'
import { X, Send, MessageSquare, Calendar, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { format } from 'date-fns'

interface Profile {
  id: string
  name: string
  avatar: string
}

interface TicketDetailModalProps {
  ticket: Ticket
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedTicket: Ticket) => void
  onDelete: (id: string) => void
}

export function TicketDetailModal({ ticket, isOpen, onClose, onUpdate, onDelete }: TicketDetailModalProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<Status>(ticket.status)
  const [assigneeId, setAssigneeId] = useState<string>(ticket.assignee_id || '')
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<Comment[]>(ticket.comments || [])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const commentsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setStatus(ticket.status)
    setAssigneeId(ticket.assignee_id || '')
    setComments(ticket.comments || [])
  }, [ticket])

  useEffect(() => {
    getProfiles().then(setProfiles)
  }, [])

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments, isOpen])

  const handleStatusChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Status
    setStatus(newStatus)
    const patch: Record<string, unknown> = { status: newStatus }
    if (newStatus === 'DONE') patch.closed_at = new Date().toISOString()
    else if (ticket.status === 'DONE') patch.closed_at = null
    await updateTicket(ticket.id, patch as any)
    onUpdate({
      ...ticket,
      status: newStatus,
      closedAt: newStatus === 'DONE' ? (patch.closed_at as string) : undefined,
    })
  }

  const handleAssigneeChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value
    setAssigneeId(newId)
    const profile = profiles.find((p) => p.id === newId)
    await updateTicket(ticket.id, { assignee_id: newId || null })
    onUpdate({ ...ticket, assignee_id: newId || undefined, assignee: profile?.name })
  }

  const handleDelete = async () => {
    await deleteTicket(ticket.id)
    onDelete(ticket.id)
    onClose()
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || saving) return
    setSaving(true)
    try {
      const authorName =
        (user?.user_metadata?.name as string) || user?.email?.split('@')[0] || 'Agente'
      const comment = await addCommentApi(ticket.id, newComment.trim(), authorName)
      const updated = [...comments, comment]
      setComments(updated)
      setNewComment('')
      onUpdate({ ...ticket, comments: updated })
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <GlassCard className="flex flex-col overflow-hidden border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-start bg-zinc-900/50">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono text-zinc-500">{ticket.id.slice(0, 8)}</span>
                  <Badge
                    variant={
                      ticket.type === 'INCIDENT'
                        ? 'danger'
                        : ticket.type === 'PROBLEM'
                        ? 'warning'
                        : ticket.type === 'DEMAND'
                        ? 'info'
                        : 'success'
                    }
                  >
                    {ticket.type}
                  </Badge>
                </div>
                <h2 className="text-xl font-bold text-white leading-tight">{ticket.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-2">Descrição</h3>
                <p className="text-zinc-200 text-sm leading-relaxed bg-zinc-900/30 p-3 rounded-xl border border-white/5">
                  {ticket.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Status"
                  value={status}
                  onChange={handleStatusChange}
                  options={[
                    { value: 'TODO', label: 'A Fazer' },
                    { value: 'IN_PROGRESS', label: 'Em Progresso' },
                    { value: 'BLOCKED', label: 'Bloqueado' },
                    { value: 'DONE', label: 'Concluído' },
                  ]}
                />
                <Select
                  label="Atribuído a"
                  value={assigneeId}
                  onChange={handleAssigneeChange}
                  options={[
                    { value: '', label: 'Não atribuído' },
                    ...profiles.map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />
              </div>

              {/* Comments */}
              <div className="flex flex-col h-[300px]">
                <h3 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Comentários
                </h3>
                <div className="flex-1 overflow-y-auto bg-zinc-900/30 rounded-xl border border-white/5 p-4 space-y-4 mb-4">
                  {comments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-sm">
                      <p>Nenhum comentário ainda.</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400 border border-white/5 shrink-0">
                          {comment.author.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-emerald-400">
                              {comment.author}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm')}
                            </span>
                          </div>
                          <div className="bg-zinc-800/50 p-2.5 rounded-lg rounded-tl-none text-sm text-zinc-300 border border-white/5">
                            {comment.text}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={commentsEndRef} />
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Escreva um comentário..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddComment}
                    size="icon"
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-500"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-zinc-900/50 border-t border-white/5 flex justify-between items-center text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Criado em {format(new Date(ticket.createdAt), 'dd/MM/yyyy')}
                {ticket.closedAt && <span>· Fechado em {format(new Date(ticket.closedAt), 'dd/MM/yyyy')}</span>}
              </div>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-red-400">Confirmar exclusão?</span>
                  <button onClick={handleDelete} className="text-red-400 hover:text-red-300 font-medium transition-colors">Sim</button>
                  <button onClick={() => setConfirmDelete(false)} className="text-zinc-400 hover:text-white transition-colors">Não</button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Excluir chamado
                </button>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
