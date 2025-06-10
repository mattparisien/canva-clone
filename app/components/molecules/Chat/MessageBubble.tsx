import { Card, CardContent } from "@/components/atoms/card"

interface MessageBubbleProps {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

export function MessageBubble({ id, type, content, timestamp }: MessageBubbleProps) {
  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <Card className={`max-w-[75%] ${type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
        <CardContent className="p-3">
          <p className="text-sm">{content}</p>
          <p className="text-xs opacity-60 mt-2">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}