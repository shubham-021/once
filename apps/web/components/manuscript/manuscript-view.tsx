"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import FontDropdown from "@/components/font-dropdown";
import { draftsApi, storiesApi } from "@/lib/api";
import type { Scene } from "@once/shared";
import { useDraft } from "@/hooks/useDrafts";
import { ActionInput } from "./action-input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UnifiedEditor } from "./unified-editor";
import { DraftControls } from "./draft-controls";
import { useCreateStore } from "@/stores/create-store";

export function ManuscriptView({ storyId, initialDraft, isInitialStreaming }: { storyId: string; initialDraft?: { id: number; narration: string }; isInitialStreaming?: boolean; }) {
    const router = useRouter();

    const [storyTitle, setStoryTitle] = useState<string | null>(null);
    const [scenes, setScenes] = useState<Scene[]>([]);

    const isCreating = useCreateStore(s => s.isCreating);
    const setIsCreating = useCreateStore(s => s.setIsCreating);
    const [isLoading, setIsLoading] = useState(false);

    const {
        draft,
        setDraft,
        isStreaming: isDraftStreaming,
        isAccepting,
        startContinue,
        revise,
        saveEdits,
        accept,
        discard,
        setNarration
    } = useDraft({
        storyId: parseInt(storyId),
        onAccept: async (result) => {
            setScenes(prev => [...prev, result.scene]);
        }
    });

    const isStreaming = isInitialStreaming || isDraftStreaming;

    useEffect(() => {

        if (initialDraft) {
            setDraft({ id: initialDraft.id, narration: initialDraft.narration });
            setIsCreating(false);
            return;
        }

        const fetchData = async () => {
            try {
                if (!isCreating) setIsLoading(true)
                const [draftRes, scenesRes] = await Promise.all([
                    draftsApi.getDraft(parseInt(storyId)),
                    storiesApi.getScenes(storyId)
                ]);

                if (scenesRes.data) {
                    setScenes(scenesRes.data.storyScenes);
                    setStoryTitle(scenesRes.data.storyTitle);
                }

                if (draftRes.data) {
                    const { id, narration } = draftRes.data;
                    setDraft({ id, narration });
                }

                setIsCreating(false);
            } catch (error) {
                toast.error("Failed to load story");
                setIsCreating(false);
                router.push("/library");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [storyId]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <p className="text-muted">Loading story...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col bg-background">
            <header className="flex h-14 items-center justify-center dotted-border-b gap-2 md:gap-4">
                <div className="flex items-center gap-5">
                    <h1 className="text-lg text-foreground">{storyTitle}</h1>
                    <FontDropdown />
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <main className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                        <div className="mx-auto max-w-4xl space-y-6">
                            <UnifiedEditor
                                scenes={scenes}
                                draft={draft}
                                isStreaming={isStreaming}
                                isAccepting={isAccepting}
                                onNarrationChange={setNarration}
                            />
                            {draft && !isStreaming && (
                                <DraftControls
                                    narration={draft.narration}
                                    isStreaming={isStreaming}
                                    isAccepting={isAccepting}
                                    onRevise={revise}
                                    onSaveEdits={saveEdits}
                                    onAccept={accept}
                                    onDiscard={discard}
                                />
                            )}
                        </div>
                    </div>

                    {!draft && (
                        <div className="dotted-border-t p-4">
                            <ActionInput onSubmit={startContinue} disabled={isStreaming} />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}