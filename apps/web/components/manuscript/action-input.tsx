import { useState, useRef, useEffect } from "react";
import { Wand, Loader2 } from "lucide-react";

interface Props {
    onSubmit: (action: string) => void;
    disabled?: boolean;
}

export function ActionInput({ onSubmit, disabled }: Props) {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [value]);

    const handleSubmit = () => {
        if (!value.trim() || disabled) return;
        onSubmit(value.trim());
        setValue("");
    };

    return (
        <div className="mx-auto w-full max-w-2xl px-4 pb-6">
            <div className="rounded-lg border border-line bg-surface p-3 flex gap-2">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSubmit())}
                    placeholder="What do you do next?"
                    rows={1}
                    disabled={disabled}
                    className="max-h-[200px] w-full resize-none bg-transparent text-foreground placeholder:text-muted placeholder:italic focus:outline-none disabled:opacity-50"
                />
                <button
                    onClick={handleSubmit}
                    disabled={!value.trim() || disabled}
                    className="w-10 h-10 shrink-0 flex items-center justify-center border border-line rounded-md hover:border-foreground disabled:opacity-50 transition-colors"
                >
                    {disabled ? <Loader2 className="size-5 animate-spin" /> : <Wand className="size-5" />}
                </button>
            </div>
        </div>
    );
}