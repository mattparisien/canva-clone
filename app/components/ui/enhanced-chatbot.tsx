"use client"

import { Button } from "@components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog"
import { Textarea } from "@components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip"
import { Bot, Send, User, MessageCircle, Copy, RotateCcw, Trash2, Download, Sparkles } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils/utils"
import { useChatbot, type ChatMessage } from "@/hooks/use-chatbot"
import { useToast } from "@components/ui/use-toast"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'

interface EnhancedChatbotProps {
  trigger?: React.ReactNode
  className?: string
  initialMessage?: string
  enableWebSearch?: boolean
  enableProjectCreation?: boolean
  onProjectCreated?: (projectData: any) => void
}

export function EnhancedChatbot({ 
  trigger, 
  className,
  initialMessage,
  enableWebSearch = true,
  enableProjectCreation = true,
  onProjectCreated
}: EnhancedChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [requestJsonResponse, setRequestJsonResponse] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  const {
    messages,
    isLoading,
    sendMessage,
    regenerateResponse,
    clearMessages,
    getConversationContext
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

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const content = inputValue.trim()
    setInputValue('')
    
    const result = await sendMessage(content, { 
      responseFormat: requestJsonResponse ? 'json' : null 
    })

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

  const exportConversation = () => {
    const conversation = getConversationContext()
    const blob = new Blob([conversation], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversation-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Exported",
      description: "Conversation exported successfully",
    })
  }

  const formatMessageContent = (message: ChatMessage) => {
    // If it's a JSON response, try to format it nicely
    if (message.content.trim().startsWith('{') || message.content.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(message.content)
        return JSON.stringify(parsed, null, 2)
      } catch {
        return message.content
      }
    }
    return message.content
  }

  const suggestedPrompts = [
    "Help me create a new project",
    "Search for design inspiration",
    "Analyze this image for colors and themes",
    "What can you help me with?",
    "Generate project ideas for marketing"
  ]

  const defaultTrigger = (
    <Button 
      size="lg"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 z-50"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  )

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px] h-[800px] flex flex-col p-0">
          <DialogHeader className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              AI Assistant
              <div className="flex items-center gap-1 ml-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRequestJsonResponse(!requestJsonResponse)}
                      className={cn(
                        "h-8",
                        requestJsonResponse && "bg-blue-100 text-blue-700 border-blue-300"
                      )}
                    >
                      JSON
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {requestJsonResponse ? "Disable JSON responses" : "Request JSON responses"}
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportConversation}
                      className="h-8"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export conversation</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearMessages}
                      className="h-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear conversation</TooltipContent>
                </Tooltip>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 1 && (
              <div className="space-y-3 mb-6">
                <div className="text-sm text-gray-600">Try asking me about:</div>
                <div className="grid grid-cols-1 gap-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto p-3 whitespace-normal"
                      onClick={() => setInputValue(prompt)}
                    >
                      <Sparkles className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  message.role === 'user' ? "ml-auto" : "mr-auto"
                )}
              >
                {message.role === 'assistant' && (
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    message.error ? "bg-red-100" : "bg-blue-100"
                  )}>
                    <Bot className={cn(
                      "h-4 w-4",
                      message.error ? "text-red-600" : "text-blue-600"
                    )} />
                  </div>
                )}
                
                <div
                  className={cn(
                    "rounded-lg px-4 py-3 text-sm",
                    message.role === 'user'
                      ? "bg-blue-600 text-white"
                      : message.error
                      ? "bg-red-50 text-red-900 border border-red-200"
                      : "bg-gray-100 text-gray-900"
                  )}
                >
                  {message.isTyping ? (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : message.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight, rehypeRaw]}
                        components={{
                          code: ({ node, inline, className, children, ...props }: any) => {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                              <pre className="bg-gray-800 text-gray-100 p-3 rounded-md overflow-x-auto">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-xs" {...props}>
                                {children}
                              </code>
                            )
                          },
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {formatMessageContent(message)}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans">
                      {formatMessageContent(message)}
                    </pre>
                  )}
                  
                  {/* Message Actions */}
                  {!message.isTyping && message.role === 'assistant' && (
                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-white/50"
                            onClick={() => copyMessage(message.content)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy message</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-white/50"
                            onClick={() => regenerateResponse(index)}
                            disabled={isLoading}
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Regenerate response</TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="border-t p-4 bg-gray-50/50">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                  className="min-h-[48px] max-h-[120px] resize-none pr-12 bg-white"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                  className="absolute right-2 bottom-2 h-8 w-8 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
              <span>AI assistant powered by GPT-4. Can help with projects, web searches, and more.</span>
              {requestJsonResponse && (
                <span className="text-blue-600 font-medium">JSON mode enabled</span>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
