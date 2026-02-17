"use client"

import { DraftAcceptResult, draftsApi } from "@/lib/api/drafts";
import { useCreditStore } from "@/stores/credits-store";
import { CreateStoryInput } from "@once/shared";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface UseDraftOptions {
    storyId: number;
    onAccept?: (result: DraftAcceptResult) => void;
    onDiscard?: () => void;
}

export function useDraft({ storyId, onAccept, onDiscard }: UseDraftOptions) {
    const [draft, setDraft] = useState<{ id: number; narration: string } | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);

    const startCreate = useCallback(async (formData: CreateStoryInput, onStoryCreated: (storyId: number) => void) => {
        setIsStreaming(true);
        setDraft({ id: 0, narration: "" });

        try {
            await draftsApi.createStreamingDraft(
                formData,
                //onInit
                (data) => onStoryCreated(data.storyId),
                //onChunk
                (chunk) => setDraft(prev => prev ? { ...prev, narration: prev.narration + chunk } : null),
                //onComplete
                (data) => setDraft(prev => prev ? { ...prev, id: data.draftId } : null),
                //onError
                (error) => {
                    toast.error(`Failed: ${error.code}`);
                    setDraft(null);
                }
            )
        } catch {
            setDraft(null);
        } finally {
            setIsStreaming(false);
        }
    }, [])

    const startContinue = useCallback(async (action: string) => {
        setIsStreaming(true);
        setDraft({ id: 0, narration: "" });

        try {
            await draftsApi.continueStream(
                storyId,
                action,
                (chunk) => setDraft((prev) => prev ? { ...prev, narration: prev.narration + chunk } : null),
                (data) => setDraft((prev) => prev ? { ...prev, id: data.draftId } : null),
                (error) => {
                    toast.error(`Failed: ${error.code}`);
                    setDraft(null);
                }
            )
        } catch {
            setDraft(null);
        } finally {
            setIsStreaming(false);
        }
    }, [storyId])

    const revise = useCallback(async (narration: string, comment: string) => {
        if (!draft) return;
        setIsStreaming(true);
        setDraft({ ...draft, narration: "" });

        try {
            await draftsApi.reviseStream(
                draft.id,
                narration,
                comment,
                (chunk) => setDraft((prev) => prev ? { ...prev, narration: prev.narration + chunk } : null),
                () => { },
                (error) => toast.error(`Revision failed: ${error.code}`)
            );
        } finally {
            setIsStreaming(false);
        }
    }, [draft]);

    const saveEdits = useCallback(async (narration: string) => {
        if (!draft) return;
        const result = await draftsApi.saveEdits(draft.id, narration);

        if (result.error) {
            toast.error(result.error.message);
            return;
        }

        setDraft({ ...draft, narration });
        toast.success("Edits saved");
    }, [draft]);

    const accept = useCallback(async () => {
        if (!draft) return;
        setIsAccepting(true);

        const result = await draftsApi.accept(draft.id); 
        setIsAccepting(false);

        if (result.error) {
            toast.error(result.error.message);
            return;
        }

        setDraft(null);
        onAccept?.(result.data!);
    }, [draft, onAccept]);


    const discard = useCallback(async () => {
        if (!draft) return;
        const result = await draftsApi.discard(draft.id);

        if (result.error) {
            toast.error(result.error.message);
            return;
        }
        setDraft(null);
        onDiscard?.();
    }, [draft, onDiscard]);

    const setNarration = (narration: string) => setDraft(prev => prev ? { ...prev, narration } : null)

    return { draft, setDraft, isStreaming, isAccepting, startCreate, startContinue, revise, saveEdits, accept, discard, setNarration }
}