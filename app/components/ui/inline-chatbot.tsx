"use client"

import { Button } from "@components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Textarea } from "@components/ui/textarea"
import { ScrollArea } from "@components/ui/scroll-area"
import { Separator } from "@components/ui/separator"
import { Bot, Send, User, Copy, RotateCcw, Sparkles } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils/utils"
import { useChatbot, type ChatMessage } from "@/hooks/use-chatbot"
import { useToast } from "@components/ui/use-toast"

interface InlineChatbotProps {
  className?: string
  height?: string
  initialMessage?: string
  enableWebSearch?: boolean
  enableProjectCreation?: boolean
  onProjectCreated?: (projectData: any) => void
  showSuggestedPrompts?: boolean
}

export function InlineChatbot({ 
  className,
  height = "h-[500px]",
  initialMessage,
  enableWebSearch = true,
  enableProjectCreation = true,
  onProjectCreated,
  showSuggestedPrompts = true
}: InlineChatbotProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  const {
    messages,
    isLoading,
    sendMessage,
    regenerateResponse,
    clearMessages
  } = useChatbot({
    initialMessage,
    enableWebSearch,
    enableProjectCreation
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const content = inputValue.trim()
    setInputValue('')
    
    const result = await sendMessage(content)

    // Check if the response contains project creation data
    if (result?.parsed && onProjectCreated) {
      try {
        onProjectCreated(result.parsed)
      } catch (error) {
        console.error('Error handling project creation:', error)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    })
  }

  const suggestedPrompts = [
    "Help me create a new project",
    "Search for design inspiration",
    "What can you help me with?",
    "Generate marketing ideas"
  ]

  return (
    <Card className={cn("flex flex-col", height, className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          AI Assistant
          <Button
            variant="outline"
            size="sm"
            onClick={clearMessages}
            className="ml-auto h-8"
          >
            Clear
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {/* Suggested Prompts */}
            {showSuggestedPrompts && messages.length === 1 && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600">Try asking me:</div>
                <div className="grid grid-cols-1 gap-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto p-2 text-xs"
                      onClick={() => setInputValue(prompt)}
                    >
                      <Sparkles className="h-3 w-3 mr-2 flex-shrink-0 text-blue-500" />
                      {prompt}
                    </Button>
                  ))}
                </div>
                <Separator className="my-4" />
              </div>
            )}
            
            {/* Messages */}
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 max-w-[90%]",
                  message.role === 'user' ? "ml-auto" : "mr-auto"
                )}
              >
                {message.role === 'assistant' && (
                  <div className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                    message.error ? "bg-red-100" : "bg-blue-100"
                  )}>
                    <Bot className={cn(
                      "h-3 w-3",
                      message.error ? "text-red-600" : "text-blue-600"
                    )} />
                  </div>
                )}
                
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm group",
                    message.role === 'user'
                      ? "bg-blue-600 text-white"
                      : message.error
                      ? "bg-red-50 text-red-900 border border-red-200"
                      : "bg-gray-100 text-gray-900"
                  )}
                >
                  {message.isTyping ? (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {/* Message Actions */}
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 hover:bg-white/50"
                            onClick={() => copyMessage(message.content)}
                          >
                            <Copy className="h-2.5 w-2.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 hover:bg-white/50"
                            onClick={() => regenerateResponse(index)}
                            disabled={isLoading}
                          >
                            <RotateCcw className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[40px] max-h-[80px] resize-none pr-10 text-sm"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="sm"
                className="absolute right-2 bottom-2 h-6 w-6 p-0"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            AI assistant powered by GPT-4
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
