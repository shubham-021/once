"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { draftsApi, storiesApi } from "@/lib/api";
import type { CodexEntry, CreateStoryInput, Protagonist, Scene } from "@once/shared";
import { useDraft } from "@/hooks/useDrafts";
import { ActionInput } from "./action-input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UnifiedEditor } from "./unified-editor";
import { DraftControls } from "./draft-controls";
import { useCreateStore } from "@/stores/create-store";
import { ProtagonistSidebar } from "./protagonist-sidebar";
import { BookOpen, User } from "lucide-react";
import { CodexSidebar } from "./codex-sidebar";

export function ManuscriptView({ storyId: initialStoryId, creationData }: { storyId?: string; creationData?: CreateStoryInput }) {
    const router = useRouter();

    const [storyId, setStoryId] = useState<string | null>(initialStoryId ?? null);
    const [storyTitle, setStoryTitle] = useState<string | null>(null);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [protagonist, setProtagonist] = useState<Protagonist | null>(null);
    const [codex, setCodex] = useState<CodexEntry[]>([]);

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
            if (result.protagonist) setProtagonist(result.protagonist);
            if (result.codex) setCodex(result.codex);
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
                const [draftRes, scenesRes, codexRes, storyRes] = await Promise.all([
                    draftsApi.getDraft(parseInt(storyId)),
                    storiesApi.getScenes(storyId),
                    storiesApi.getCodex(storyId),
                    storiesApi.get(storyId),
                ]);

                if (scenesRes.data) {
                    setScenes(scenesRes.data.storyScenes);
                    setStoryTitle(scenesRes.data.storyTitle);
                }

                if (codexRes.data) setCodex(codexRes.data);

                if (storyRes.data) {
                    const storyData = storyRes.data;
                    if (storyData.protagonist) {
                        const protagonists = Array.isArray(storyData.protagonist) ? storyData.protagonist : [storyData.protagonist];
                        const active = protagonists.find(p => p.isActive);
                        if (active) setProtagonist(active);
                    }
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
                {/* Codex Sidebar — Left */}
                <aside className="hidden lg:block w-64 overflow-y-auto dotted-border-r p-4">
                    {/* <h2 className="flex items-center gap-2 text-sm font-semibold text-muted mb-4">
                        <BookOpen size={16} /> Codex
                    </h2> */}
                    <CodexSidebar codex={codex} protagonistName={protagonist?.name} />
                </aside>

                {/* Main Content */}
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

                {/* Protagonist Sidebar — Right */}
                {protagonist && (
                    <aside className="hidden lg:block w-64 overflow-y-auto dotted-border-l p-4">
                        {/* <h2 className="flex items-center gap-2 text-sm font-semibold text-muted mb-4">
                            <User size={16} /> Protagonist
                        </h2> */}
                        <ProtagonistSidebar protagonist={protagonist} />
                    </aside>
                )}
            </div>
        </div >
    );
}