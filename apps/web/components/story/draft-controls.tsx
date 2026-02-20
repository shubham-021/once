"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Check, X, RefreshCw, Save } from "lucide-react"

interface DraftControlsProps {
    narration: string
    isStreaming: boolean
    isAccepting: boolean
    onRevise: (narration: string, comment: string) => void
    onSaveEdits: (narration: string) => void
    onAccept: () => void
    onDiscard: (() => void) | undefined;
}

export function DraftControls({
    narration,
    isStreaming,
    isAccepting,
    onRevise,
    onSaveEdits,
    onAccept,
    onDiscard,
}: DraftControlsProps) {
    const [comment, setComment] = useState("")
    const [showComment, setShowComment] = useState(false)

    const handleRevise = () => {
        if (comment.trim()) {
            onRevise(narration, comment)
            setComment("")
            setShowComment(false)
        }
    }

    const disabled = isStreaming || isAccepting

    return (
        <div className="border-t border-border pt-4 mt-4 space-y-3">
            {showComment && (
                <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell the AI how to revise this scene..."
                    className="min-h-20 resize-none"
                    disabled={disabled}
                />
            )}

            <div className="flex items-center gap-2 flex-wrap">
                {!showComment ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowComment(true)}
                        disabled={disabled}
                    >
                        <RefreshCw className="size-4 mr-2" />
                        Revise with AI
                    </Button>
                ) : (
                    <>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleRevise}
                            disabled={disabled || !comment.trim()}
                        >
                            {isStreaming ? (
                                <Loader2 className="size-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCw className="size-4 mr-2" />
                            )}
                            Revise
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                                setShowComment(false)
                                setComment("")
                            }}
                            disabled={disabled}
                            className="text-red-600 border border-transparent hover:border-red-600"
                        >
                            Cancel
                        </Button>
                    </>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSaveEdits(narration)}
                    disabled={disabled}
                >
                    <Save className="size-4 mr-2" />
                    Save Edits
                </Button>

                <div className="flex-1" />

                {onDiscard && (
                    <Button
                        variant="default"
                        size="sm"
                        onClick={onDiscard}
                        disabled={disabled}
                        className="text-red-600 border border-transparent hover:border-red-600"
                    >
                        <X className="size-4 mr-2" />
                        Discard
                    </Button>
                )}

                <Button
                    variant="default"
                    size="sm"
                    onClick={onAccept}
                    disabled={disabled}
                    className="border border-transparent hover:border-lime-600 text-lime-600"
                >
                    {isAccepting ? (
                        <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                        <Check className="size-4 mr-2" />
                    )}
                    Accept
                </Button>
            </div>
        </div>
    )
}