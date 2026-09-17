import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MessageInput from './MessageInput'
import * as roundActions from '@/app/actions/round'

vi.mock('@/app/actions/round', () => ({ submitMessage: vi.fn() }))

describe('MessageInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders textarea and send button: render `MessageInput` with `roundId=r1`, `playerId=p1`, and `onSent` as `vi.fn()`; assert a `<textarea>` and a button with text `Send` are present', async () => {
    const onSent = vi.fn()
    render(<MessageInput roundId="r1" playerId="p1" onSent={onSent} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
  })

  it('blank input shows error: fire change on textarea with value ` `, click Send; assert `Message cannot be empty` appears in the document and `roundActions.submitMessage` was not called', async () => {
    const user = userEvent.setup()
    const onSent = vi.fn()
    render(<MessageInput roundId="r1" playerId="p1" onSent={onSent} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '   ')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByText('Message cannot be empty')).toBeInTheDocument()
    expect(vi.mocked(roundActions.submitMessage)).not.toHaveBeenCalled()
  })

  it('success disables inputs: mock `vi.mocked(roundActions.submitMessage).mockResolvedValue({ messageId: \'msg1\' })`, type non-blank text, click Send, await resolution; assert textarea and Send button both have the `disabled` attribute', async () => {
    const user = userEvent.setup()
    const onSent = vi.fn()
    vi.mocked(roundActions.submitMessage).mockResolvedValue({ messageId: 'msg1' })
    
    render(<MessageInput roundId="r1" playerId="p1" onSent={onSent} />)
    
    const textarea = screen.getByRole('textbox')
    const button = screen.getByRole('button', { name: 'Send' })
    
    await user.type(textarea, 'Hello world')
    await user.click(button)

    await vi.waitFor(() => {
      expect(textarea).toBeDisabled()
      expect(button).toBeDisabled()
    })
    expect(onSent).toHaveBeenCalled()
  })
})
