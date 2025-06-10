import { MessageCircle } from "lucide-react"
import { Heading } from "@/components/atoms/heading"
import { Switch } from "@components/atoms/switch"
import { Label } from "@components/atoms/label"
import { Badge } from "@components/atoms/badge"

interface ChatHeaderProps {
  title: string
  useOwnData: boolean
  onToggleData: (checked: boolean) => void
}

export function ChatHeader({ title, useOwnData, onToggleData }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 pb-6 border-b">
      <div className="flex items-center gap-3">
        <MessageCircle className="w-6 h-6" />
        <Heading level={1}>{title}</Heading>
      </div>
      
      <div className="flex items-center gap-3">
        <Label htmlFor="use-own-data" className="text-sm">
          Use my data
        </Label>
        <Switch
          id="use-own-data"
          checked={useOwnData}
          onCheckedChange={onToggleData}
        />
        {useOwnData && (
          <Badge variant="secondary">Personal Assets</Badge>
        )}
      </div>
    </div>
  )
}