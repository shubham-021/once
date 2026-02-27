"use client"

import { DraftAcceptResult, draftsApi } from "@/lib/api/drafts";
import { getToastErrorMessage } from "@/lib/error-mapper";
import { useCreateStore } from "@/stores/create-store";
import { useCreditStore } from "@/stores/credits-store";
import { CreateStoryInput } from "@once/shared";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface UseDraftOptions {
    storyId: number;
    onAccept?: (result: DraftAcceptResult) => void;
    onDiscard?: () => void;
}

export function useDraft({ storyId, onAccept, onDiscard }: UseDraftOptions) {
    const [draft, setDraft] = useState<{ id: number; narration: string } | null>(null);
    const [creatingFirstDraft, setCreatingFirstDraft] = useState<boolean>(false);
    const [loadingDraft, setLoadingDraft] = useState<boolean>(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);

    const setIsCreating = useCreateStore(s => s.setIsCreating);
    const setBalance = useCreditStore(s => s.setBalance);

    const firstChunk = useRef<boolean>(true);

    const router = useRouter();

    const startCreate = useCallback(async (formData: CreateStoryInput, onStoryCreated: (storyId: number, storyTitle:string) => void) => {
        setCreatingFirstDraft(true);
        setIsStreaming(true);
        // setDraft({ id: 0, narration: "" });

        try {
            await draftsApi.createStreamingDraft(
                formData,
                //onInit
                (data) => onStoryCreated(data.storyId,data.storyTitle),
                //onChunk
                (chunk) => {
                    if(firstChunk.current){
                        setCreatingFirstDraft(false);
                        setDraft({id: 0, narration: ""});
                        firstChunk.current = false;
                    }
                    setDraft(prev => prev ? { ...prev, narration: prev.narration + chunk } : null);
                },
                //onComplete
                (data) => {
                    setDraft(prev => prev ? { ...prev, id: data.draftId } : null);
                    setBalance(data.credits);
                },
                //onError
                (error) => {
                    setCreatingFirstDraft(false);
                    router.push('/library');
                    setIsCreating(false);
                    // console.log(error);
                    toast.error(getToastErrorMessage({code: error.code},"create-draft"));
                    setDraft(null);
                }
            )
        } catch {
            setCreatingFirstDraft(false);
            setDraft(null);
        } finally {
            setIsStreaming(false);
            firstChunk.current = true;
            // setLoadingDraft(false);
        }
    }, [])

    const startContinue = useCallback(async (action: string) => {
        setLoadingDraft(true);
        setIsStreaming(true);
        // setDraft({ id: 0, narration: "" });

        try {
            await draftsApi.continueStream(
                storyId,
                action,
                (chunk) => {
                    if(firstChunk.current){
                        setLoadingDraft(false);
                        setDraft({id: 0, narration: ""});
                        firstChunk.current = false;
                    }
                    setDraft((prev) => prev ? { ...prev, narration: prev.narration + chunk } : null);
                },
                (data) => setDraft((prev) => prev ? { ...prev, id: data.draftId } : null),
                (error) => {
                    setLoadingDraft(false);
                    toast.error(getToastErrorMessage({code: error.code}, "continue-draft"));
                    setDraft(null);
                }
            )
        } catch {
            setLoadingDraft(false);
            setDraft(null);
        } finally {
            // setLoadingDraft(false);
            setIsStreaming(false);
            firstChunk.current = true;
        }
    }, [storyId])

    const revise = useCallback(async (narration: string, comment: string) => {
        if (!draft) return;
        setIsStreaming(true);
        // setDraft({ ...draft, narration: "" });

        try {
            await draftsApi.reviseStream(
                draft.id,
                narration,
                comment,
                (chunk) => {
                    if(firstChunk.current){
                        setLoadingDraft(false);
                        setDraft({id: 0, narration: ""});
                        firstChunk.current = false;
                    }
                    setDraft((prev) => prev ? { ...prev, narration: prev.narration + chunk } : null)
                },
                () => { },
                (error) => {
                    setLoadingDraft(false);
                    toast.error(getToastErrorMessage({code: error.code}, "revise-draft"));
                }
            );
        } finally {
            setIsStreaming(false);
            firstChunk.current = true;
            setLoadingDraft(false);
        }
    }, [draft]);

    const saveEdits = useCallback(async (narration: string) => {
        if (!draft) return;
        const result = await draftsApi.saveEdits(draft.id, narration);

        if (result.error) {
            toast.error(getToastErrorMessage(result.error, "save-edits"));
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
            toast.error(getToastErrorMessage(result.error, "accept-draft"));
            return;
        }

        setDraft(null);
        onAccept?.(result.data!);
    }, [draft, onAccept]);


    const discard = useCallback(async () => {
        if (!draft) return;
        const result = await draftsApi.discard(draft.id);

        if (result.error) {
            toast.error(getToastErrorMessage(result.error, "discard-draft"));
            return;
        }

        setDraft(null);
        onDiscard?.();
    }, [draft, onDiscard]);

    const setNarration = (narration: string) => setDraft(prev => prev ? { ...prev, narration } : null)

    return { draft, setDraft, isStreaming, isAccepting, startCreate, startContinue, revise, saveEdits, accept, discard, setNarration, loadingDraft, creatingFirstDraft }
}