'use client'

import React from 'react'

interface ChatMessage {
  id: string
  content: string
  player: {
    name: string
    isAI: boolean
  }
}

interface ChatPanelProps {
  messages: ChatMessage[]
}

export default function ChatPanel({ messages }: ChatPanelProps) {
  return (
    <div className="flex flex-col h-full w-full border rounded-md bg-background overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message) => (
          <p key={message.id} className="text-sm text-foreground">
            {`${message.player.name}: ${message.content}`}
          </p>
        ))}
      </div>
    </div>
  )
}
