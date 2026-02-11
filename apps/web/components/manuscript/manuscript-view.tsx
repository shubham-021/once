"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { draftsApi, storiesApi } from "@/lib/api";
import type { CreateStoryInput, Scene } from "@once/shared";
import { useDraft } from "@/hooks/useDrafts";
import { ActionInput } from "./action-input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UnifiedEditor } from "./unified-editor";
import { DraftControls } from "./draft-controls";
import { useCreateStore } from "@/stores/create-store";

export function ManuscriptView({ storyId: initialStoryId, creationData }: { storyId?: string; creationData?: CreateStoryInput }) {
    const router = useRouter();

    const [storyId, setStoryId] = useState<string | null>(initialStoryId ?? null);
    const [storyTitle, setStoryTitle] = useState<string | null>(null);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const setIsCreating = useCreateStore(s => s.setIsCreating);
    const setFormData = useCreateStore(s => s.setFormData);

    const {
        draft,
        setDraft,
        isStreaming,
        isAccepting,
        startCreate,
        startContinue,
        revise,
        saveEdits,
        accept,
        discard,
        setNarration
    } = useDraft({
        storyId: storyId ? parseInt(storyId) : 0,
        onAccept: async (result) => {
            setScenes(prev => [...prev, result.scene]);
        }
    });

    const started = useRef(false);

    useEffect(() => {

        if (creationData) {
            if (started.current) return;
            started.current = true;

            startCreate(creationData, (newStoryId) => {
                setStoryId(newStoryId.toString());
                setIsCreating(false);
                setFormData(null);
                window.history.replaceState(null, '', `/story/${newStoryId}`);
                return;
            })
        }

        if (!storyId) return;

        const fetchData = async () => {
            try {
                setIsLoading(true)
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
            } catch (error) {
                toast.error("Failed to load story");
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
            <header className="flex items-center justify-center dotted-border-b gap-2 md:gap-4 p-2">
                <h1 className="text-2xl tracking-widest text-accent italic">{storyTitle}</h1>
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
                                    onDiscard={scenes.length > 0 ? discard : undefined}
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