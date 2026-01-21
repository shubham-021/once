"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import FontDropdown from "@/components/font-dropdown";
import { BookOpen, User } from "lucide-react";
import MobileDrawer from "@/components/mobile-drawer";
import { storiesApi } from "@/lib/api";
import type { Story, Scene, Protagonist, CodexEntry } from "@once/shared";
import { useDraft } from "@/hooks/useDrafts";
import { DraftEditor } from "./draft-editor";
import { CodexSidebar } from "./codex-sidebar";
import { ProtagonistSidebar } from "./protagonist-sidebar";
import { SceneBlock } from "./scene-block";
import { ActionInput } from "./action-input";

export function ManuscriptView({ storyId }: { storyId: string }) {
    const [showCodex, setShowCodex] = useState(false);
    const [showProtagonist, setShowProtagonist] = useState(false);

    const [story, setStory] = useState<Story | null>(null);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [codex, setCodex] = useState<CodexEntry[]>([]);
    const [protagonists, setProtagonists] = useState<Protagonist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionInput, setActionInput] = useState("");

    const storyMode = story?.storyMode;
    const activeProtagonist = protagonists.find(p => p.isActive) || null;

    const {
        draft,
        isStreaming,
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
            // Add new scene to list
            setScenes(prev => [...prev, result.scene]);
            // Refresh codex
            const res = await storiesApi.getCodex(storyId);
            if (res.data) setCodex(res.data);
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            const [storyRes, scenesRes, codexRes] = await Promise.all([
                storiesApi.get(storyId),
                storiesApi.getScenes(storyId),
                storiesApi.getCodex(storyId),
            ]);

            if (storyRes.data) {
                setStory(storyRes.data);
                if (storyRes.data.protagonist) {
                    setProtagonists(storyRes.data.protagonist);
                }
            }
            if (scenesRes.data) setScenes(scenesRes.data);
            if (codexRes.data) setCodex(codexRes.data);
            setIsLoading(false);
        };
        fetchData();
    }, [storyId]);

    const handleContinue = () => {
        if (!actionInput.trim() || isStreaming) return;
        startContinue(actionInput.trim());
        setActionInput("");
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <p className="text-muted">Loading story...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col bg-background">
            {/* Header - same as before */}
            <header className="flex h-14 items-center justify-center dotted-border-b gap-2 md:gap-4">
                <button onClick={() => setShowCodex(true)} className="lg:hidden text-muted hover:text-foreground">
                    <BookOpen className="size-5" />
                </button>
                <div className="flex items-center gap-5">
                    <h1 className="text-lg text-foreground">{story?.title}</h1>
                    <FontDropdown />
                </div>
                {storyMode === "protagonist" && activeProtagonist && (
                    <button onClick={() => setShowProtagonist(true)} className="lg:hidden text-muted hover:text-foreground">
                        <User className="size-5" />
                    </button>
                )}
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Codex Sidebar - reuse existing */}
                <aside className="hidden lg:block w-56 shrink-0 overflow-y-auto px-8 py-4 dotted-border-r">
                    <CodexSidebar codex={codex} protagonistName={storyMode === "protagonist" ? activeProtagonist?.name : undefined} />
                </aside>

                <MobileDrawer className="py-4 px-8" open={showCodex} onClose={() => setShowCodex(false)} side="left">
                    <CodexSidebar codex={codex} protagonistName={storyMode === "protagonist" ? activeProtagonist?.name : undefined} />
                </MobileDrawer>

                {/* Main Content */}
                <main className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                        <div className="mx-auto max-w-3xl space-y-6">
                            {/* Committed Scenes (read-only) */}
                            {scenes.map((scene) => (
                                <SceneBlock key={scene.id} scene={scene} />
                            ))}

                            {/* Draft (editable) */}
                            {draft && (
                                <DraftEditor
                                    draft={draft}
                                    isStreaming={isStreaming}
                                    isAccepting={isAccepting}
                                    revise={revise}
                                    saveEdits={saveEdits}
                                    accept={accept}
                                    discard={discard}
                                    setNarration={setNarration}
                                />
                            )}
                        </div>
                    </div>

                    {/* Action Input (only show when no draft) */}
                    {!draft && (
                        <div className="dotted-border-t p-4">
                            <ActionInput onSubmit={startContinue} disabled={isStreaming} />
                        </div>
                    )}
                </main>

                {/* Protagonist Sidebar - same as before */}
                {storyMode === "protagonist" && activeProtagonist && (
                    <aside className="hidden lg:block w-56 shrink-0 overflow-y-auto p-4 dotted-border-l">
                        <ProtagonistSidebar protagonist={activeProtagonist} />
                    </aside>
                )}

                {storyMode === "protagonist" && activeProtagonist && (
                    <MobileDrawer className="py-4 px-8" open={showProtagonist} onClose={() => setShowProtagonist(false)} side="right">
                        <ProtagonistSidebar protagonist={activeProtagonist} />
                    </MobileDrawer>
                )}
            </div>
        </div>
    );
}