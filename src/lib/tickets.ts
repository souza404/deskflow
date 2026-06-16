import { supabase } from './supabase'
import { Ticket, Comment, Attachment } from './utils'

const BUCKET = 'ticket-attachments'

export async function uploadAttachments(ticketId: string, files: File[]): Promise<void> {
  for (const file of files) {
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${ticketId}/${Date.now()}-${safe}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file)
    if (error) throw new Error(`Falha ao enviar "${file.name}": ${error.message}`)
  }
}

export async function getAttachments(ticketId: string): Promise<Attachment[]> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(ticketId, { sortBy: { column: 'created_at', order: 'asc' } })
  if (error || !data) return []
  return data
    .filter((f) => f.name !== '.emptyFolderPlaceholder')
    .map((f) => ({
      name: f.name.replace(/^\d{13}-/, ''),
      url: supabase.storage.from(BUCKET).getPublicUrl(`${ticketId}/${f.name}`).data.publicUrl,
      size: f.metadata?.size ?? 0,
    }))
}

function mapTicket(row: any): Ticket {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    priority: row.priority,
    status: row.status,
    assignee_id: row.assignee_id,
    assignee: row.assignee?.name,
    createdAt: row.created_at,
    closedAt: row.closed_at ?? undefined,
    comments: (row.comments || [])
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((c: any): Comment => ({
        id: c.id,
        ticket_id: c.ticket_id,
        author: c.author_name,
        text: c.text,
        createdAt: c.created_at,
      })),
  }
}

export async function createTicket(data: {
  title: string
  description: string
  type: string
  priority?: string
}): Promise<string> {
  const { data: row, error } = await supabase
    .from('tickets')
    .insert(data)
    .select('id')
    .single()
  if (error) throw error
  return row.id
}

export async function getTickets(): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      assignee:profiles!tickets_assignee_id_fkey(id, name, avatar),
      comments(*)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(mapTicket)
}

export async function updateTicket(
  id: string,
  patch: Partial<{ status: string; assignee_id: string | null; closed_at: string | null }>
) {
  const { error } = await supabase.from('tickets').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteTicket(id: string) {
  const { error } = await supabase.from('tickets').delete().eq('id', id)
  if (error) throw error
}

export async function addComment(
  ticketId: string,
  text: string,
  authorName: string
): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({ ticket_id: ticketId, text, author_name: authorName })
    .select()
    .single()
  if (error) throw error
  return {
    id: data.id,
    ticket_id: data.ticket_id,
    author: data.author_name,
    text: data.text,
    createdAt: data.created_at,
  }
}

export async function getProfiles(): Promise<{ id: string; name: string; avatar: string }[]> {
  const { data, error } = await supabase.from('profiles').select('id, name, avatar')
  if (error) throw error
  return data || []
}

export function subscribeToTickets(callback: () => void): () => void {
  const channel = supabase
    .channel('tickets-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, callback)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}
