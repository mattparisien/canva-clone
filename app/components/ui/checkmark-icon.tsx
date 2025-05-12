import { Check } from "lucide-react"

export default function CheckmarkIcon({ state = "hovered" }: { state?: "hovered" | "selected" }) {
    return <Check width="100%" height="100%" fill="none" strokeWidth="1.2px" className={`${state === "hovered" ? "text-gray-300" : "text-white"}`} />
}