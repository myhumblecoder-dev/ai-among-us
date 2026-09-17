import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ChatPanel from './ChatPanel'

describe('ChatPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders messages in order: render with `messages=[{ id:\'1\', content:\'Hello!\', player:{ name:\'Alice\', isAI:false } }, { id:\'2\', content:\'Testing format.\', player:{ name:\'Bob\', isAI:true } }]`; collect elements via `document.querySelectorAll(\'p\')`; assert `els[0].textContent === \'Alice: Hello!\'` and `els[1].textContent === \'Bob: Testing format.\'`', async () => {
    const messages = [
      { id: '1', content: 'Hello!', player: { name: 'Alice', isAI: false } },
      { id: '2', content: 'Testing format.', player: { name: 'Bob', isAI: true } },
    ]
    render(<ChatPanel messages={messages} />)
    const els = document.querySelectorAll('p')
    expect(els[0].textContent).toBe('Alice: Hello!')
    expect(els[1].textContent).toBe('Bob: Testing format.')
  })

  it('single message name colon content: render with `messages=[{ id:\'1\', content:\'Hi there\', player:{ name:\'Charlie\', isAI:false } }]`; collect via `document.querySelectorAll(\'p\')`; assert `els[0].textContent === \'Charlie: Hi there\'`', async () => {
    const messages = [
      { id: '1', content: 'Hi there', player: { name: 'Charlie', isAI: false } },
    ]
    render(<ChatPanel messages={messages} />)
    const els = document.querySelectorAll('p')
    expect(els[0].textContent).toBe('Charlie: Hi there')
  })
})
