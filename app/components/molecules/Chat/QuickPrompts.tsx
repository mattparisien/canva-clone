import { Button } from "@components/atoms/button"
import { Heading } from "@/components/atoms/heading"

interface QuickPromptsProps {
  prompts: string[]
  onSelectPrompt: (prompt: string) => void
}

export function QuickPrompts({ prompts, onSelectPrompt }: QuickPromptsProps) {
  return (
    <div className="mb-8">
      <Heading level={2} className="mb-4">Get started</Heading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {prompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            className="justify-start text-left h-auto p-4"
            onClick={() => onSelectPrompt(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  )
}