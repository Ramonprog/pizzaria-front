import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type } from "os"

type InputCustomComponentProps = {
    type: string
    label: string
    htmlfor: string
    placeholder?: string
}

export function InputCustomComponent({ type, label, htmlfor, placeholder }: InputCustomComponentProps) {
    return (
        <div className={`grid w-full max-w-sm items-center gap-1.5`}>
            <Label htmlFor={htmlfor}>{label}</Label>
            <Input className="bg-zinc-700 placeholder:text-neutral-300" placeholder={placeholder} />
        </div>
    )
}