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
      className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-900 z-50 group border-2 border-white/20 backdrop-blur-sm"
    >
      <MessageCircle className="h-7 w-7 text-white group-hover:scale-110 transition-transform duration-200" />
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </Button>
  )

  return (
    <TooltipProvider>
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
              <div className="flex items-center gap-2 ml-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRequestJsonResponse(!requestJsonResponse)}
                      className={cn(
                        "h-9 px-3 rounded-lg transition-all duration-200 border border-transparent",
                        requestJsonResponse 
                          ? "bg-blue-100 text-blue-700 border-blue-200 shadow-sm" 
                          : "hover:bg-white/60 hover:border-gray-200"
                      )}
                    >
                      <span className="text-xs font-medium">JSON</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-gray-900 text-white text-xs">
                    {requestJsonResponse ? "Disable JSON responses" : "Request JSON responses"}
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={exportConversation}
                      className="h-9 w-9 rounded-lg hover:bg-white/60 hover:border-gray-200 border border-transparent transition-all duration-200"
                    >
                      <Download className="h-4 w-4 text-gray-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-gray-900 text-white text-xs">
                    Export conversation
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearMessages}
                      className="h-9 w-9 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 border border-transparent transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-gray-900 text-white text-xs">
                    Clear conversation
                  </TooltipContent>
                </Tooltip>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/30 to-white/50 backdrop-blur-sm">
            {messages.length === 1 && (
              <div className="space-y-4 mb-8">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                    <Sparkles className="h-4 w-4" />
                    Try asking me about:
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                  {suggestedPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="justify-start text-left h-auto p-4 whitespace-normal bg-white/60 hover:bg-white/80 border border-gray-100 hover:border-blue-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                      onClick={() => setInputValue(prompt)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-blue-100 flex-shrink-0 mt-0.5">
                          <Sparkles className="h-3 w-3 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-700">{prompt}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-4 max-w-[85%] group",
                  message.role === 'user' ? "ml-auto" : "mr-auto"
                )}
              >
                {message.role === 'assistant' && (
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border-2 border-white",
                    message.error 
                      ? "bg-gradient-to-br from-red-100 to-red-200" 
                      : "bg-gradient-to-br from-blue-100 to-indigo-200"
                  )}>
                    <Bot className={cn(
                      "h-5 w-5",
                      message.error ? "text-red-600" : "text-blue-600"
                    )} />
                  </div>
                )}
                
                <div
                  className={cn(
                    "rounded-2xl px-5 py-4 text-sm shadow-md border backdrop-blur-sm relative",
                    message.role === 'user'
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500/20 shadow-blue-200/50"
                      : message.error
                      ? "bg-gradient-to-br from-red-50 to-red-100 text-red-900 border-red-200 shadow-red-100/50"
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
                  ) : message.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight, rehypeRaw]}
                        components={{
                          code: ({ node, inline, className, children, ...props }: any) => {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                              <pre className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-4 rounded-xl overflow-x-auto shadow-lg border border-gray-700 my-3">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-mono border border-blue-200" {...props}>
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
                    <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-all duration-200"
                            onClick={() => copyMessage(message.content)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-gray-900 text-white text-xs">
                          Copy message
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg hover:bg-green-100 hover:text-green-600 transition-all duration-200"
                            onClick={() => regenerateResponse(index)}
                            disabled={isLoading}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-gray-900 text-white text-xs">
                          Regenerate response
                        </TooltipContent>
                      </Tooltip>
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
                  onClick={handleSendMessage}
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
            <div className="text-xs text-gray-500 mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>AI assistant powered by GPT-4 • Ready to help with projects, searches, and more</span>
              </div>
              {requestJsonResponse && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-600 font-medium">JSON mode enabled</span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
