import { Input } from "@components/atoms/input"
import { Button } from "@components/atoms/button"
import { Send } from "lucide-react"

interface ChatInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyPress: (e: React.KeyboardEvent) => void
  onSend: () => void
  isLoading: boolean
}

export function ChatInput({ value, onChange, onKeyPress, onSend, isLoading }: ChatInputProps) {
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Describe what you want to create..."
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        disabled={isLoading}
        className="flex-1"
      />
      <Button 
        onClick={onSend} 
        disabled={!value.trim() || isLoading}
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  )
}