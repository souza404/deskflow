import { useState, useRef, useEffect, ChangeEvent } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Ticket, Status, Comment } from '@/lib/utils'
import { updateTicket, addComment as addCommentApi, getProfiles, deleteTicket } from '@/lib/tickets'
import { useAuth } from '@/contexts/AuthContext'
import { X, Send, MessageSquare, Calendar, Trash2, Zap, AlertCircle, Layers, Wrench, UserCircle2, Tag } from 'lucide-react'
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
  const [deleting, setDeleting] = useState(false)
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
    setDeleting(true)
    try {
      await deleteTicket(ticket.id)
      onDelete(ticket.id)
      onClose()
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
      alert('Erro ao excluir o chamado. Verifique as permissões no Supabase.')
    }
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

  const TYPE_META = {
    INCIDENT: { icon: Zap,         variant: 'danger'  as const, label: 'Incidente',  accent: 'bg-red-500'     },
    PROBLEM:  { icon: AlertCircle, variant: 'warning' as const, label: 'Problema',   accent: 'bg-amber-500'   },
    DEMAND:   { icon: Layers,      variant: 'info'    as const, label: 'Demanda',    accent: 'bg-blue-500'    },
    REQUEST:  { icon: Wrench,      variant: 'success' as const, label: 'Requisição', accent: 'bg-emerald-500' },
  }
  const typeMeta = TYPE_META[ticket.type] ?? TYPE_META.REQUEST
  const TypeIcon = typeMeta.icon

  const PRIORITY_LABELS: Record<string, { label: string; dot: string }> = {
    HIGH:   { label: 'Alta',   dot: 'bg-red-400'     },
    MEDIUM: { label: 'Média',  dot: 'bg-amber-400'   },
    LOW:    { label: 'Baixa',  dot: 'bg-emerald-400' },
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <GlassCard className="flex flex-col overflow-hidden border-white/[0.1] shadow-[0_0_60px_rgba(0,0,0,0.6)]">
            {/* Header */}
            <div className="relative p-6 border-b border-white/[0.06] flex justify-between items-start">
              {/* Left color accent */}
              <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${typeMeta.accent} rounded-l-2xl`} />
              <div className="pl-3">
                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                  <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 border border-white/[0.06] rounded-md px-1.5 py-0.5">
                    #{ticket.id.slice(0, 7)}
                  </span>
                  <Badge variant={typeMeta.variant} className="gap-1 text-[11px] rounded-md">
                    <TypeIcon className="w-3 h-3" strokeWidth={2.5} />
                    {typeMeta.label}
                  </Badge>
                  {ticket.priority && ticket.type === 'INCIDENT' && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 bg-zinc-900 border border-white/[0.07] rounded-md px-2 py-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_LABELS[ticket.priority]?.dot ?? 'bg-zinc-500'}`} />
                      {PRIORITY_LABELS[ticket.priority]?.label ?? ticket.priority}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white leading-tight tracking-tight">{ticket.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-white p-1.5 hover:bg-white/[0.08] rounded-xl transition-colors shrink-0 ml-4"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Description */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-3.5 h-3.5 text-zinc-600" strokeWidth={2} />
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Descrição</h3>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed bg-zinc-900/40 px-4 py-3 rounded-xl border border-white/[0.05]">
                  {ticket.description}
                </p>
              </div>

              {/* Status + Assignee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Status"
                  value={status}
                  onChange={handleStatusChange}
                  options={[
                    { value: 'TODO',        label: '○  A Fazer'      },
                    { value: 'IN_PROGRESS', label: '◎  Em Progresso' },
                    { value: 'BLOCKED',     label: '⊘  Bloqueado'    },
                    { value: 'DONE',        label: '✓  Concluído'    },
                  ]}
                />
                <div>
                  <label className="text-sm font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5">
                    <UserCircle2 className="w-3.5 h-3.5 text-zinc-600" strokeWidth={2} />
                    Atribuído a
                  </label>
                  <select
                    value={assigneeId}
                    onChange={handleAssigneeChange}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-zinc-900/60 text-sm text-zinc-200 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                  >
                    <option value="">Não atribuído</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Comments */}
              <div className="flex flex-col h-[260px]">
                <div className="flex items-center gap-2 mb-2.5">
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-600" strokeWidth={2} />
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Comentários</h3>
                  {comments.length > 0 && (
                    <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-900 border border-white/[0.07] rounded-full px-1.5 py-0.5">
                      {comments.length}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto bg-zinc-900/30 rounded-xl border border-white/[0.05] p-3.5 space-y-3.5 mb-3">
                  {comments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-700 text-xs gap-2">
                      <MessageSquare className="w-5 h-5 opacity-40" strokeWidth={1.5} />
                      <p>Nenhum comentário ainda.</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-emerald-900/40 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0">
                          {comment.author.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-xs font-semibold text-emerald-400">{comment.author}</span>
                            <span className="text-[10px] text-zinc-600">
                              {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm')}
                            </span>
                          </div>
                          <div className="bg-zinc-800/60 px-3 py-2 rounded-xl rounded-tl-sm text-sm text-zinc-300 border border-white/[0.05] leading-relaxed">
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
                    placeholder="Escreva um comentário…"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddComment}
                    size="icon"
                    disabled={saving || !newComment.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-zinc-900/40 border-t border-white/[0.05] flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-3 text-[11px] text-zinc-600">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Criado {format(new Date(ticket.createdAt), 'dd/MM/yyyy')}
                </span>
                {ticket.closedAt && (
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span>·</span>
                    Fechado {format(new Date(ticket.closedAt), 'dd/MM/yyyy')}
                  </span>
                )}
              </div>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-400 font-medium">Excluir chamado?</span>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Excluindo...' : 'Confirmar'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1 text-xs bg-white/5 text-zinc-400 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 hover:border-red-500/40 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  Excluir
                </button>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
