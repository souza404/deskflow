import { supabase } from './supabase'
import { Ticket, Comment } from './utils'

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
}) {
  const { error } = await supabase.from('tickets').insert(data)
  if (error) throw error
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
