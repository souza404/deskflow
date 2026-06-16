import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  it('renders without label by default', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    expect(screen.queryByRole('label')).toBeNull()
  })

  it('renders label when provided', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<Input error="Campo obrigatório" />)
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
  })

  it('applies error border classes when error is set', () => {
    render(<Input error="Bad" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500/50')
  })

  it('does not apply error classes when error is absent', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).not.toHaveClass('border-red-500/50')
  })

  it('calls onChange when typing', async () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox'), 'hello')
    expect(onChange).toHaveBeenCalled()
  })

  it('reflects controlled value', () => {
    render(<Input value="preset" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('preset')
  })

  it('is disabled when disabled prop is set', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})
