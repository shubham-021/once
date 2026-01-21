"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface NarrationEditorProps {
    content: string;
    onChange?: (content: string) => void;
    editable?: boolean;
    className?: string;
}

export function NarrationEditor({
    content,
    onChange,
    editable = true,
    className
}: NarrationEditorProps) {
    const editor = useEditor({
        extensions: [StarterKit],
        content,
        editable,
        editorProps: {
            attributes: {
                class: cn(
                    "min-h-[200px] px-4 py-3 text-lg leading-relaxed",
                    "focus:outline-none",
                    "text-foreground bg-transparent",
                    "font-[inherit]"
                ),
            },
        },
        onUpdate: ({ editor }) => {
            onChange?.(editor.getText());
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getText()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className={cn(
            "rounded-lg border border-line bg-surface/50",
            editable && "focus-within:border-accent/50 transition-colors",
            className
        )}>
            <EditorContent editor={editor} />
        </div>
    );
}