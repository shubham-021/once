import { useState, useRef, useEffect } from "react";
import { Wand, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface Props {
    onSubmit: (action: string) => void;
    disabled?: boolean;
    className?: string;
}

export function ActionInput({ onSubmit, disabled, className }: Props) {
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
        <motion.div 
            // transition={{type:'spring', duration: 0.3}}
            className={cn("fixed bottom-2 left-1/2 -translate-x-1/2 w-full max-w-2xl min-[1024]:max-w-lg min-[1226px]:max-w-2xl px-4 pb-6 transition-all duration-300",className)}
        >
            <div className="rounded-lg border border-line bg-surface p-3 flex gap-2">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSubmit())}
                    placeholder="What do you do next?"
                    rows={1}
                    disabled={disabled}
                    className="max-h-30 w-full resize-none bg-transparent text-foreground placeholder:text-muted placeholder:italic focus:outline-none disabled:opacity-50"
                />
                <button
                    onClick={handleSubmit}
                    disabled={!value.trim() || disabled}
                    className="w-7 h-7 shrink-0 p-1 flex items-center justify-center border border-line rounded-md hover:border-foreground disabled:opacity-50 transition-colors"
                >
                    {disabled ? <Loader2 className="size-4 animate-spin" /> : <Wand className="size-4" />}
                </button>
            </div>
        </motion.div>
    );
}