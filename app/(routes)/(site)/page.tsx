"use client"

import { Section } from "@/components/atoms/section"
import { ChatInterface } from "@/components/organisms/Chat/ChatInterface"
import { useState } from "react"

export default function HomePage() {
    const [currentChatId, setCurrentChatId] = useState<string | undefined>()
    
    // Mock user ID - in a real app this would come from authentication
    const userId = 'demo-user-123'

    const handleChatIdChange = (chatId: string) => {
        setCurrentChatId(chatId)
        console.log('Chat ID updated:', chatId)
    }

    return (
        <Section>
            <div className="max-w-4xl mx-auto">
                {/* Header with chat info */}
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                    <h1 className="text-2xl font-bold mb-2">Design Assistant with Conversation History</h1>
                    <p className="text-muted-foreground mb-2">
                        Chat with the AI design assistant. Your conversation history is automatically saved and maintained across messages.
                    </p>
                    {currentChatId && (
                        <p className="text-sm text-primary">
                            Current conversation ID: <code className="bg-background px-2 py-1 rounded">{currentChatId}</code>
                        </p>
                    )}
                </div>

                <ChatInterface 
                    userId={userId}
                    chatId={currentChatId}
                    onChatIdChange={handleChatIdChange}
                    title="Design Assistant"
                    initialMessage="Hi! I'm your Design Assistant with conversation memory. I can remember our previous messages and provide contextual responses. Tell me what you'd like to create!"
                />
            </div>
        </Section>
    )
}