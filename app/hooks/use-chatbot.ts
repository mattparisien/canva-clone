import { useState, useCallback } from 'react'
import { useToast } from '@components/ui/use-toast'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isTyping?: boolean
  error?: boolean
}

export interface UseChatbotOptions {
  initialMessage?: string
  maxMessages?: number
  enableWebSearch?: boolean
  enableProjectCreation?: boolean
}

export function useChatbot(options: UseChatbotOptions = {}) {
  const {
    initialMessage = "Hello! I'm your AI assistant. I can help you with creating projects, searching the web, analyzing content, and more. How can I assist you today?",
    maxMessages = 100
  } = options

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial',
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date()
    }
  ])
  
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    }
    
    setMessages(prev => {
      const updated = [...prev, newMessage]
      // Keep only the last maxMessages
      if (updated.length > maxMessages) {
        return updated.slice(-maxMessages)
      }
      return updated
    })
    
    return newMessage.id
  }, [maxMessages])

  const removeMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
  }, [])

  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    ))
  }, [])

  const sendMessage = useCallback(async (content: string, options?: { responseFormat?: 'json' | null }) => {
    if (!content.trim() || isLoading) return

    setIsLoading(true)

    // Add user message
    const userMessageId = addMessage({
      role: 'user',
      content: content.trim()
    })

    // Add typing indicator
    const typingMessageId = addMessage({
      role: 'assistant',
      content: '',
      isTyping: true
    })

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: content.trim(),
          response_format: options?.responseFormat === 'json' ? { type: 'json_object' } : null
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to get response from agent')
      }

      const data = await response.json()
      console.log('the data', data);
      
      // Remove typing indicator
      removeMessage(typingMessageId)
      
      // Add assistant response
      const assistantMessageId = addMessage({
        role: 'assistant',
        content: data.answer || 'I apologize, but I couldn\'t generate a response. Please try again.'
      })

      return {
        userMessageId,
        assistantMessageId,
        response: data.response,
        parsed: data.parsed
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Remove typing indicator
      removeMessage(typingMessageId)
      
      // Add error message
      const errorMessageId = addMessage({
        role: 'assistant',
        content: error instanceof Error ? error.message : 'I\'m sorry, but I encountered an error. Please try again later.',
        error: true
      })

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive"
      })

      return {
        userMessageId,
        assistantMessageId: errorMessageId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, addMessage, removeMessage, toast])

  const regenerateResponse = useCallback(async (messageIndex: number) => {
    if (messageIndex < 1 || isLoading) return
    
    const userMessage = messages[messageIndex - 1]
    if (userMessage.role !== 'user') return

    // Remove messages from this point onwards
    const messagesToKeep = messages.slice(0, messageIndex)
    setMessages(messagesToKeep)

    // Regenerate response
    return await sendMessage(userMessage.content)
  }, [messages, isLoading, sendMessage])

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: 'initial',
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date()
      }
    ])
  }, [initialMessage])

  const getConversationContext = useCallback(() => {
    return messages
      .filter(msg => !msg.isTyping && !msg.error)
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n')
  }, [messages])

  return {
    messages,
    isLoading,
    sendMessage,
    regenerateResponse,
    clearMessages,
    addMessage,
    removeMessage,
    updateMessage,
    getConversationContext
  }
}
