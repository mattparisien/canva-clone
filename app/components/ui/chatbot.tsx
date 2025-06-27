"use client"

import { Button } from "@components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog"
import { Input } from "@components/ui/input"
import { Textarea } from "@components/ui/textarea"
import { useToast } from "@components/ui/use-toast"
import { Bot, Send, User, MessageCircle, Copy, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils/utils"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface ChatbotProps {
  trigger?: React.ReactNode
  className?: string
}

export function Chatbot({ trigger, className }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you with creating projects, searching the web, analyzing content, and more. How can I assist you today?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    // Add user message and typing indicator
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    }
    setMessages(prev => [...prev, typingMessage])

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userMessage.content,
          response_format: null
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from agent')
      }

      const data = await response.json()
      console.log('the data', data);
      
      // Remove typing indicator and add actual response
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'))
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.answer || 'I apologize, but I couldn\'t generate a response. Please try again.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Remove typing indicator and show error
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'))
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I\'m sorry, but I encountered an error. Please try again later.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    })
  }

  const regenerateResponse = async (messageIndex: number) => {
    if (messageIndex < 1) return // Can't regenerate first message or user messages
    
    const userMessage = messages[messageIndex - 1]
    if (userMessage.role !== 'user') return

    // Remove the assistant message we want to regenerate
    setMessages(prev => prev.slice(0, messageIndex))
    setIsLoading(true)

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    }
    setMessages(prev => [...prev, typingMessage])

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userMessage.content,
          response_format: null
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from agent')
      }

      const data = await response.json()
      
      // Remove typing indicator and add new response
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'))
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.answer || 'I apologize, but I couldn\'t generate a response. Please try again.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error regenerating response:', error)
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'))
      toast({
        title: "Error",
        description: "Failed to regenerate response. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. I can help you with creating projects, searching the web, analyzing content, and more. How can I assist you today?',
        timestamp: new Date()
      }
    ])
  }

  const defaultTrigger = (
    <Button 
      size="lg"
      className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-900 z-50 group border-2 border-white/20 backdrop-blur-sm"
    >
      <MessageCircle className="h-7 w-7 text-white group-hover:scale-110 transition-transform duration-200" />
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] h-[850px] flex flex-col p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 border-b border-gray-100/50 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/40 backdrop-blur-sm">
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-sm">
              <Bot className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                AI Assistant
              </span>
              <span className="text-xs text-gray-500 font-normal">
                Powered by GPT-4 • Always ready to help
              </span>
            </div>
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="absolute right-6 top-6 h-9 w-9 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 border border-transparent transition-all duration-200"
          >
            Clear Chat
          </Button>
        </DialogHeader>
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/30 to-white/50 backdrop-blur-sm">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4 max-w-[85%] group",
                message.role === 'user' ? "ml-auto" : "mr-auto"
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border-2 border-white bg-gradient-to-br from-blue-100 to-indigo-200">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
              )}
              
              <div
                className={cn(
                  "rounded-2xl px-5 py-4 text-sm shadow-md border backdrop-blur-sm relative",
                  message.role === 'user'
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500/20 shadow-blue-200/50"
                    : "bg-gradient-to-br from-white to-gray-50/80 text-gray-900 border-gray-200/60 shadow-gray-200/30"
                )}
              >
                {message.isTyping ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="ml-2 text-xs text-blue-600 font-medium">AI is thinking...</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
                
                {/* Message Actions */}
                {!message.isTyping && message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-all duration-200"
                      onClick={() => copyMessage(message.content)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg hover:bg-green-100 hover:text-green-600 transition-all duration-200"
                      onClick={() => regenerateResponse(index)}
                      disabled={isLoading}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-md border-2 border-white">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="border-t border-gray-200/60 p-6 bg-gradient-to-r from-white via-gray-50/50 to-white backdrop-blur-sm">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                className="min-h-[52px] max-h-[120px] resize-none pr-14 bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 shadow-sm"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="sm"
                className={cn(
                  "absolute right-3 bottom-3 h-9 w-9 rounded-xl p-0 transition-all duration-200 shadow-md",
                  !inputValue.trim() || isLoading
                    ? "bg-gray-300 hover:bg-gray-400 text-gray-500"
                    : "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-200/50 hover:shadow-blue-300/60"
                )}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>AI assistant powered by GPT-4 • Ready to help with projects, searches, and more</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
