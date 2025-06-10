import { Section } from "@/components/ui/section";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Send, MessageCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
}

export interface ChatbotProps {
  className?: string
}

export function Chatbot({ className }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hi! I'm your Design Assistant. Tell me what you'd like to create and I'll help you design it.",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [useOwnData, setUseOwnData] = useState(false)
  const [activePrompt, setActivePrompt] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickPrompts = [
    "Create an infographic on my latest data",
    "Design a social media post",
    "Make a logo",
    "Create a flyer",
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setActivePrompt("")
    setIsLoading(true)

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: `I'll help you create: "${inputValue}". ${useOwnData ? "I'll use your assets and data. " : ""}Let me generate some design options for you.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Section className={className}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 pb-6 border-b">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6" />
            <h1 className="text-2xl font-semibold">Design Assistant</h1>
          </div>
          <Button
            variant={useOwnData ? "default" : "outline"}
            onClick={() => setUseOwnData((v) => !v)}
          >
            Use my own data
            {useOwnData && <Badge className="ml-2">on</Badge>}
          </Button>
        </div>

        {messages.length <= 1 && (
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">Get started</h2>
            <Tabs
              value={activePrompt}
              onValueChange={(val) => {
                setActivePrompt(val)
                setInputValue(val)
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickPrompts.map((prompt) => (
                  <TabsTrigger key={prompt} value={prompt} className="whitespace-normal">
                    {prompt}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        <div className="space-y-4 mb-6 min-h-[400px] max-h-[500px] overflow-y-auto border rounded-lg p-4 bg-muted/10">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-[75%] ${message.type === "user" ? "bg-primary text-primary-foreground" : "bg-card"}`}
              >
                <CardContent className="p-3">
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-60 mt-2">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-card">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Describe what you want to create..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Section>
  )
}

export default Chatbot
