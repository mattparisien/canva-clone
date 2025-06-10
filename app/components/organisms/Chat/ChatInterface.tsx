"use client"

import { LoadingIndicator } from "@/components/atoms/loading-indicator"
import { ChatHeader } from "@/components/molecules/Chat/ChatHeader"
import { ChatInput } from "@/components/molecules/Chat/ChatInput"
import { MessageBubble } from "@/components/molecules/Chat/MessageBubble"
import { QuickPrompts } from "@/components/molecules/Chat/QuickPrompts"
import { Card, CardContent } from "@/components/atoms/card"
import { chatAPI } from "@/lib/api"
import { ChatMessage } from "@/lib/types/api"
import { useEffect, useRef, useState } from "react"

interface ChatInterfaceProps {
    initialMessage?: string
    title?: string
    quickPrompts?: string[]
    onSendMessage?: (message: string, useOwnData: boolean) => Promise<void>
}

export function ChatInterface({
    initialMessage = "Hi! I'm your Design Assistant. Tell me what you'd like to create and I'll help you design it.",
    title = "Design Assistant",
    quickPrompts = [
        "Create a social media post",
        "Design a presentation",
        "Make a logo",
        "Create a flyer"
    ],
    onSendMessage
}: ChatInterfaceProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            type: 'bot',
            content: initialMessage,
            timestamp: new Date()
        }
    ])
    const [inputValue, setInputValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [useOwnData, setUseOwnData] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: inputValue,
            timestamp: new Date()
        }

        const messageText = inputValue
        setMessages(prev => [...prev, userMessage])
        setInputValue("")
        setIsLoading(true)

        // Create a placeholder bot message for streaming
        const botMessageId = (Date.now() + 1).toString()
        const initialBotMessage: ChatMessage = {
            id: botMessageId,
            type: 'bot',
            content: '',
            timestamp: new Date()
        }
        setMessages(prev => [...prev, initialBotMessage])

        try {
            // Use streaming chat API
            const response = await chatAPI.sendMessage({
                message: messageText,
                useOwnData: useOwnData
            }, (chunk: string) => {
                // Update the bot message content as chunks arrive
                setMessages(prev => prev.map(msg => 
                    msg.id === botMessageId 
                        ? { ...msg, content: msg.content + chunk }
                        : msg
                ))
            })
            
            // Update with final response data (for suggestions, etc.)
            setMessages(prev => prev.map(msg => 
                msg.id === botMessageId 
                    ? { 
                        ...msg, 
                        content: response.response,
                        timestamp: new Date(response.timestamp)
                    }
                    : msg
            ))
            
            // If there's a custom onSendMessage handler, call it too
            if (onSendMessage) {
                await onSendMessage(messageText, useOwnData)
            }
        } catch (error) {
            console.error("Error sending message:", error)
            
            // Show error message to user
            const errorResponse: ChatMessage = {
                id: (Date.now() + 2).toString(),
                type: 'bot',
                content: "Sorry, I encountered an error. Please check your connection and try again.",
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorResponse])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <ChatHeader
                title={title}
                useOwnData={useOwnData}
                onToggleData={setUseOwnData}
            />

            {messages.length <= 1 && (
                <QuickPrompts
                    prompts={quickPrompts}
                    onSelectPrompt={(prompt) => setInputValue(prompt)}
                />
            )}

            <div className="space-y-4 mb-6 min-h-[400px] max-h-[500px] overflow-y-auto border rounded-lg p-4 bg-muted/10">
                {messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        id={message.id}
                        type={message.type}
                        content={message.content}
                        timestamp={message.timestamp}
                    />
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <Card className="bg-card">
                            <CardContent className="p-3">
                                <LoadingIndicator />
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <ChatInput
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                onSend={handleSendMessage}
                isLoading={isLoading}
            />
        </div>
    )
}