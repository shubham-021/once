"use client";

import { useState } from "react";
import { NarrationEditor } from "./narration-editor";
import { cn } from "@/lib/utils";
import { Loader2, Check, X, RefreshCw, Save } from "lucide-react";

interface DraftEditorProps {
    draft: { id: number; narration: string };
    isStreaming: boolean;
    isAccepting: boolean;
    revise: (narration: string, comment: string) => void;
    saveEdits: (narration: string) => void;
    accept: () => void;
    discard: () => void;
    setNarration: (narration: string) => void;
}

export function DraftEditor({
    draft,
    isStreaming,
    isAccepting,
    revise,
    saveEdits,
    accept,
    discard,
    setNarration
}: DraftEditorProps) {
    const [comment, setComment] = useState("");

    if (!draft) return null;

    const hasChanges = draft.narration.length > 0;

    return (
        <div className="space-y-4">
            {/* Editor */}
            <NarrationEditor
                content={draft.narration}
                onChange={setNarration}
                editable={!isStreaming}
                className={cn(isStreaming && "opacity-70")}
            />

            {/* Comment input */}
            <div className="space-y-2">
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add revision notes for the AI (optional)..."
                    disabled={isStreaming}
                    className="w-full px-4 py-3 bg-surface border border-line rounded-lg 
                               text-foreground placeholder:text-muted-foreground
                               focus:outline-none focus:border-accent/50
                               disabled:opacity-50 resize-none"
                    rows={2}
                />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
                {comment.trim() ? (
                    <button
                        onClick={() => revise(draft.narration, comment)}
                        disabled={isStreaming || !hasChanges}
                        className="flex items-center gap-2 px-4 py-2 bg-accent text-background 
                                   rounded-lg hover:bg-accent/90 disabled:opacity-50"
                    >
                        {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Revise
                    </button>
                ) : (
                    <button
                        onClick={() => saveEdits(draft.narration)}
                        disabled={isStreaming || !hasChanges}
                        className="flex items-center gap-2 px-4 py-2 bg-surface border border-line 
                                   rounded-lg hover:border-accent/50 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        Save Edits
                    </button>
                )}

                <button
                    onClick={accept}
                    disabled={isStreaming || isAccepting || !draft.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white 
                               rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                    {isAccepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Accept
                </button>

                <button
                    onClick={discard}
                    disabled={isStreaming || isAccepting}
                    className="flex items-center gap-2 px-4 py-2 text-danger hover:bg-danger/10 
                               rounded-lg disabled:opacity-50"
                >
                    <X className="w-4 h-4" />
                    Discard
                </button>
            </div>
        </div>
    );
}