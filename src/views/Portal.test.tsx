import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Portal } from './Portal'

vi.mock('@/lib/tickets', () => ({
  createTicket: vi.fn(),
}))

import { createTicket } from '@/lib/tickets'
const mockCreateTicket = vi.mocked(createTicket)

describe('Portal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form with required fields', () => {
    render(<Portal />)
    expect(screen.getByText('Abrir um Chamado')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Breve resumo do problema')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Descreva detalhadamente/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Criar Chamado' })).toBeInTheDocument()
  })

  it('shows all four ticket type options', () => {
    render(<Portal />)
    expect(screen.getByText('Requisição')).toBeInTheDocument()
    expect(screen.getByText('Demanda')).toBeInTheDocument()
    expect(screen.getByText('Problema')).toBeInTheDocument()
    expect(screen.getByText('Incidente')).toBeInTheDocument()
  })

  it('does not show priority selector for REQUEST type (default)', () => {
    render(<Portal />)
    expect(screen.queryByText('Criticidade')).not.toBeInTheDocument()
  })

  it('shows priority selector when INCIDENT type is selected', async () => {
    render(<Portal />)
    await userEvent.click(screen.getByText('Incidente'))
    expect(await screen.findByText('Criticidade')).toBeInTheDocument()
    expect(screen.getByText('Baixa')).toBeInTheDocument()
    expect(screen.getByText('Média')).toBeInTheDocument()
    expect(screen.getByText('Alta')).toBeInTheDocument()
  })

  it('hides priority selector when switching away from INCIDENT', async () => {
    render(<Portal />)
    await userEvent.click(screen.getByText('Incidente'))
    await screen.findByText('Criticidade')
    await userEvent.click(screen.getByText('Requisição'))
    await waitFor(() => {
      expect(screen.queryByText('Criticidade')).not.toBeInTheDocument()
    })
  })

  it('shows success state after successful submission', async () => {
    mockCreateTicket.mockResolvedValueOnce(undefined as any)
    render(<Portal />)

    await userEvent.type(screen.getByPlaceholderText('Breve resumo do problema'), 'Meu título')
    await userEvent.type(
      screen.getByPlaceholderText(/Descreva detalhadamente/),
      'Descrição do problema'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Criar Chamado' }))

    expect(await screen.findByText('Chamado criado!')).toBeInTheDocument()
    expect(mockCreateTicket).toHaveBeenCalledOnce()
    expect(mockCreateTicket).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Meu título', type: 'REQUEST' })
    )
  })

  it('shows error message when createTicket throws', async () => {
    mockCreateTicket.mockRejectedValueOnce(new Error('Servidor indisponível'))
    render(<Portal />)

    await userEvent.type(screen.getByPlaceholderText('Breve resumo do problema'), 'Título')
    await userEvent.type(screen.getByPlaceholderText(/Descreva detalhadamente/), 'Desc')
    await userEvent.click(screen.getByRole('button', { name: 'Criar Chamado' }))

    expect(await screen.findByText('Servidor indisponível')).toBeInTheDocument()
  })

  it('passes priority for INCIDENT tickets', async () => {
    mockCreateTicket.mockResolvedValueOnce(undefined as any)
    render(<Portal />)

    await userEvent.click(screen.getByText('Incidente'))
    await screen.findByText('Criticidade')
    await userEvent.click(screen.getByText('Alta'))

    await userEvent.type(screen.getByPlaceholderText('Breve resumo do problema'), 'Incidente crítico')
    await userEvent.type(screen.getByPlaceholderText(/Descreva detalhadamente/), 'Sistema fora do ar')
    await userEvent.click(screen.getByRole('button', { name: 'Criar Chamado' }))

    await screen.findByText('Chamado criado!')
    expect(mockCreateTicket).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'INCIDENT', priority: 'HIGH' })
    )
  })

  it('does not pass priority for non-INCIDENT tickets', async () => {
    mockCreateTicket.mockResolvedValueOnce(undefined as any)
    render(<Portal />)

    await userEvent.click(screen.getByText('Problema'))
    await userEvent.type(screen.getByPlaceholderText('Breve resumo do problema'), 'Título')
    await userEvent.type(screen.getByPlaceholderText(/Descreva detalhadamente/), 'Desc')
    await userEvent.click(screen.getByRole('button', { name: 'Criar Chamado' }))

    await screen.findByText('Chamado criado!')
    expect(mockCreateTicket).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'PROBLEM', priority: undefined })
    )
  })

  it('"Enviar outro chamado" button brings back the form', async () => {
    mockCreateTicket.mockResolvedValueOnce(undefined as any)
    render(<Portal />)

    await userEvent.type(screen.getByPlaceholderText('Breve resumo do problema'), 'T')
    await userEvent.type(screen.getByPlaceholderText(/Descreva detalhadamente/), 'D')
    await userEvent.click(screen.getByRole('button', { name: 'Criar Chamado' }))

    await screen.findByText('Chamado criado!')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar outro chamado' }))

    expect(await screen.findByRole('button', { name: 'Criar Chamado' })).toBeInTheDocument()
  })
})
