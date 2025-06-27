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
    <Card className={cn("flex flex-col overflow-hidden bg-white/95 backdrop-blur-xl border-0 shadow-xl rounded-2xl", height, className)}>
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/40 backdrop-blur-sm border-b border-gray-100/50">
        <CardTitle className="flex items-center gap-3">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            className="ml-auto h-9 w-9 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 border border-transparent transition-all duration-200"
          >
            Clear
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-6 bg-gradient-to-b from-gray-50/30 to-white/50 backdrop-blur-sm">
          <div className="space-y-4 pb-4">
            {/* Suggested Prompts */}
            {showSuggestedPrompts && messages.length === 1 && (
              <div className="space-y-3 pt-4">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                    <Sparkles className="h-4 w-4" />
                    Try asking me:
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto">
                  {suggestedPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="justify-start text-left h-auto p-3 text-xs bg-white/60 hover:bg-white/80 border border-gray-100 hover:border-blue-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                      onClick={() => setInputValue(prompt)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="p-1 rounded-lg bg-blue-100 flex-shrink-0 mt-0.5">
                          <Sparkles className="h-2.5 w-2.5 text-blue-600" />
                        </div>
                        <span className="text-gray-700">{prompt}</span>
                      </div>
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
                  "flex gap-3 max-w-[90%] group",
                  message.role === 'user' ? "ml-auto" : "mr-auto"
                )}
              >
                {message.role === 'assistant' && (
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-2xl flex items-center justify-center shadow-sm border-2 border-white",
                    message.error 
                      ? "bg-gradient-to-br from-red-100 to-red-200" 
                      : "bg-gradient-to-br from-blue-100 to-indigo-200"
                  )}>
                    <Bot className={cn(
                      "h-4 w-4",
                      message.error ? "text-red-600" : "text-blue-600"
                    )} />
                  </div>
                )}
                
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm shadow-md border backdrop-blur-sm",
                    message.role === 'user'
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500/20 shadow-blue-200/50"
                      : message.error
                      ? "bg-gradient-to-br from-red-50 to-red-100 text-red-900 border-red-200 shadow-red-100/50"
                      : "bg-gradient-to-br from-white to-gray-50/80 text-gray-900 border-gray-200/60 shadow-gray-200/30"
                  )}
                >
                  {message.isTyping ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="ml-2 text-xs text-blue-600 font-medium">AI is thinking...</span>
                    </div>
                  ) : (
                    <>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {/* Message Actions */}
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-all duration-200"
                            onClick={() => copyMessage(message.content)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-600 rounded-lg transition-all duration-200"
                            onClick={() => regenerateResponse(index)}
                            disabled={isLoading}
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-md border-2 border-white">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Input Area */}
        <div className="p-6 border-t border-gray-200/60 bg-gradient-to-r from-white via-gray-50/50 to-white backdrop-blur-sm">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[48px] max-h-[80px] resize-none pr-12 text-sm bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 shadow-sm"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="sm"
                className={cn(
                  "absolute right-2 bottom-2 h-8 w-8 rounded-xl p-0 transition-all duration-200 shadow-md",
                  !inputValue.trim() || isLoading
                    ? "bg-gray-300 hover:bg-gray-400 text-gray-500"
                    : "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-200/50 hover:shadow-blue-300/60"
                )}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span>AI assistant powered by GPT-4</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
