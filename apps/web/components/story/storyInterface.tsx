"use client";

import { MouseEventHandler, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { draftsApi, storiesApi } from "@/lib/api";
import type { CodexEntry, CreateStoryInput, Protagonist, Scene } from "@once/shared";
import { useDraft } from "@/hooks/useDrafts";
import { ActionInput } from "./action-input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DraftControls } from "./draft-controls";
import { useCreateStore } from "@/stores/create-store";
import { ProtagonistSidebar } from "./protagonist-sidebar";
import { CodexSidebar } from "./codex-sidebar";
import { AnimatePresence, motion } from "motion/react";
import { useCreditStore } from "@/stores/credits-store";
import { SceneBlock } from "./scene-block";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { SimpleToggle } from "../simple-theme-toggler";

export function StoryInterface({ storyId: initialStoryId, creationData }: { storyId?: string; creationData?: CreateStoryInput }) {
    const router = useRouter();

    const [storyId, setStoryId] = useState<string | null>(initialStoryId ?? null);
    const [storyTitle, setStoryTitle] = useState<string | null>(null);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const balance = useCreditStore(s => s.balance);
    const setBalance = useCreditStore(s => s.setBalance);

    const [protagonist, setProtagonist] = useState<Protagonist | null>(null);
    const [codex, setCodex] = useState<CodexEntry[]>([]);

    const [toggleProtagonistSidebar,setToggleProtagonistSidebar] = useState(false);
    const [toggleCodexSidebar,setToggleCodexSidebar] = useState(false);

    useEffect(() => {
        if (window.innerWidth >= 1024) {
            setToggleCodexSidebar(true);
        }
    }, []);

    useEffect(() => {
        if (protagonist && window.innerWidth >= 1024) {
            setToggleProtagonistSidebar(true);
        }
    }, [protagonist]);

    const protagonistToggler = () => {
        if(window.innerWidth<1024 && toggleCodexSidebar) setToggleCodexSidebar(false);
        setToggleProtagonistSidebar(prev => !prev);
    }

    const codexToggler = () => {
        if(window.innerWidth<1024 && toggleProtagonistSidebar) setToggleProtagonistSidebar(false);
        setToggleCodexSidebar(prev => !prev);
    }

    const setIsCreating = useCreateStore(s => s.setIsCreating);
    const setFormData = useCreateStore(s => s.setFormData);

    const draftRef = useRef<HTMLTextAreaElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

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
            if(result.creditsUsed){
                const newBalance = balance-result.creditsUsed;
                setBalance(newBalance);
            }
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

    useEffect(() => {
        const el = draftRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
        }
    }, [draft?.narration]);

    useEffect(() => {
        if (isStreaming && bottomRef.current) {
            bottomRef.current.scrollIntoView({behavior: 'smooth', block: 'end'});
        }
    }, [draft?.narration, isStreaming]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <p className="text-muted">Loading story...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col bg-background relative">
            <header className="flex whitespace-nowrap items-center justify-between md:text-base text-sm dotted-border-b gap-2 md:gap-4 py-2 px-4">
                <div><span>Writing: </span><span className="tracking-widest text-accent italic">{storyTitle}</span></div>
                <div className="flex  items-center gap-2 italic text-muted ml-4"><SimpleToggle/><span>Credits: </span><span className="text-accent">{balance}</span></div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Codex Sidebar — Desktop */}
                <motion.aside
                    animate={{ width: toggleCodexSidebar ? 256 : 0 }}
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={cn(
                        "hidden lg:block overflow-hidden shrink-0",
                        toggleCodexSidebar && "dotted-border-r"
                    )}
                >
                    <div className="w-64 p-4 h-full overflow-y-auto">
                        <CodexSidebar codex={codex} protagonistName={protagonist?.name} />
                    </div>
                </motion.aside>

                {/* Codex Sidebar — Mobile */}
                <AnimatePresence>
                    {toggleCodexSidebar && (
                        <>
                            <motion.div
                                key="codex-backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="lg:hidden fixed inset-0 bg-black/40 z-50"
                                onClick={codexToggler}
                            />
                            <motion.aside
                                key="codex-mobile"
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="lg:hidden fixed left-0 top-0 h-full w-64 bg-background z-50 overflow-y-auto p-4 dotted-border-r shadow-xl"
                            >
                                <CodexSidebar codex={codex} protagonistName={protagonist?.name} />
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-8 py-6 pb-20">
                        <div className="mx-auto max-w-4xl space-y-6">
                            {scenes.map(scene => (
                                    <SceneBlock
                                        key={scene.id}
                                        narration={scene.narration}
                                        userAction={scene.userAction}
                                    />
                            ))}

                            {draft && (
                                <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-4">
                                    <textarea
                                        ref={draftRef}
                                        value={draft.narration}
                                        onChange={(e) => setNarration(e.target.value)}
                                        disabled={isStreaming || isAccepting}
                                        placeholder={isStreaming ? "" : "Edit your draft..."}
                                        className="w-full min-h-30 resize-none bg-transparent text-foreground placeholder:text-muted placeholder:italic focus:outline-none disabled:cursor-default prose dark:prose-invert leading-relaxed"
                                    />
                                </div>    
                            )}

                            {draft  && (
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
                            <div ref={bottomRef} />
                        </div>
                    </div>

                    {!draft && (
                        <ActionInput onSubmit={startContinue} disabled={isStreaming} />
                    )}
                </main>

                {/* Protagonist Sidebar — Desktop */}
                <AnimatePresence>
                    {protagonist && (
                        <motion.aside
                            key="protagonist-sidebar"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{
                                width: toggleProtagonistSidebar ? 256 : 0,
                                opacity: toggleProtagonistSidebar ? 1 : 0,
                            }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={cn(
                                "hidden lg:block overflow-hidden shrink-0",
                                toggleProtagonistSidebar && "dotted-border-l"
                            )}
                        >
                            <div className="w-64 p-4 h-full overflow-y-auto">
                                <ProtagonistSidebar protagonist={protagonist} />
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Protagonist Sidebar — Mobile */}
                <AnimatePresence>
                    {toggleProtagonistSidebar && protagonist && (
                        <>
                            <motion.div
                                key="protagonist-backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="lg:hidden fixed inset-0 bg-black/40 z-50"
                                onClick={protagonistToggler}
                            />
                            <motion.aside
                                key="protagonist-mobile"
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="lg:hidden fixed right-0 top-0 h-full w-64 bg-background z-50 overflow-y-auto p-4 dotted-border-l shadow-xl"
                            >
                                <ProtagonistSidebar protagonist={protagonist} />
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* Codex Toggle — Desktop */}
                <motion.button
                    onClick={codexToggler}
                    animate={{ left: toggleCodexSidebar ? 220 : 8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="hidden lg:flex fixed top-14.5 items-center justify-center w-7 h-7 text-neutral-400 rounded-lg cursor-pointer z-50"
                >
                    {toggleCodexSidebar
                        ? <ChevronsLeft className="size-5" />
                        : <ChevronsRight className="size-5" />
                    }
                </motion.button>

                {/* Codex Toggle — Mobile */}
                <motion.button
                    onClick={codexToggler}
                    animate={{ left: toggleCodexSidebar ? 220 : 4 , top: toggleCodexSidebar ? 16 : 48 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="lg:hidden fixed flex items-center justify-center w-7 h-7 text-neutral-400 rounded-lg cursor-pointer z-60"
                >
                    {toggleCodexSidebar
                        ? <ChevronsLeft className="size-5" />
                        : <ChevronsRight className="size-5" />
                    }
                </motion.button>

                {/* Protagonist Toggle — Desktop */}
                <motion.button
                    onClick={protagonistToggler}
                    animate={{ right: toggleProtagonistSidebar ? 220 : 8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="hidden lg:flex fixed top-14.5 text-neutral-400 items-center justify-center w-7 h-7 rounded-lg cursor-pointer z-50"
                >
                    {toggleProtagonistSidebar
                        ? <ChevronsRight className="size-5" />
                        : <ChevronsLeft className="size-5" />
                    }
                </motion.button>

                {/* Protagonist Toggle — Mobile */}
                <motion.button
                    onClick={protagonistToggler}
                    animate={{ right: toggleProtagonistSidebar ? 220 : 4 , top: toggleProtagonistSidebar ? 16:48 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="lg:hidden fixed flex items-center justify-center w-7 h-7 text-neutral-400 rounded-lg cursor-pointer z-60"
                >
                    {toggleProtagonistSidebar
                        ? <ChevronsRight className="size-5" />
                        : <ChevronsLeft className="size-5" />
                    }
                </motion.button>
            </div>
        </div >
    );
}