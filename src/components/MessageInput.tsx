'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { submitMessage } from '@/app/actions/round'

interface MessageInputProps {
  roundId: string
  playerId: string
  onSent: () => void
}

export default function MessageInput({ roundId, playerId, onSent }: MessageInputProps) {
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async () => {
    const trimmed = content.trim()
    if (!trimmed) {
      setError('Message cannot be empty')
      return
    }

    try {
      const result = await submitMessage({
        roundId,
        playerId,
        content: trimmed,
      })

      if (result && 'error' in result && result.error) {
        setError(result.error as string)
      } else {
        setContent('')
        setError(null)
        setIsSent(true)
        onSent()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        className="w-full p-2 border rounded text-sm"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSent}
        placeholder="Type your message..."
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <Button 
        onClick={handleSubmit} 
        disabled={isSent} 
        className="w-full"
      >
        Send
      </Button>
    </div>
  )
}