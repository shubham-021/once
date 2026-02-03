"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateStore } from "@/stores/create-store";
import { draftsApi } from "@/lib/api";
import { toast } from "sonner";
import { ConstellationLoader } from "@/components/ui/loader";
import { ManuscriptView } from "@/components/manuscript/manuscript-view";

export default function NewStoryPage() {
    const router = useRouter();
    const formData = useCreateStore(s => s.formData);
    const setFormData = useCreateStore(s => s.setFormData);
    const setIsCreating = useCreateStore(s => s.setIsCreating);

    const [storyId, setStoryId] = useState<number | null>(null);
    const [draftId, setDraftId] = useState<number | null>(null);
    const [narration, setNarration] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [showManuscript, setShowManuscript] = useState(false);

    useEffect(() => {
        if (!formData) {
            router.push("/library");
            return;
        }

        const startCreation = async () => {
            try {
                await draftsApi.createStreamingDraft(
                    formData,
                    // onInit
                    (data) => {
                        setStoryId(data.storyId);
                        router.replace(`/story/${storyId}`);
                    },
                    // onChunk
                    (chunk) => {
                        if (!showManuscript) {
                            setShowManuscript(true);
                            setIsStreaming(true);
                            setIsCreating(false); // change position of this too when replacing loader
                        }

                        setNarration(prev => prev + chunk);
                    },
                    // onComplete - draft created
                    (data) => {
                        setDraftId(data.draftId);
                        setIsStreaming(false);
                        setFormData(null);
                    },
                    // onError
                    (error) => {
                        setIsStreaming(false);
                        setIsCreating(false);
                        setFormData(null);
                    }
                )
            } catch (err) {
                setIsStreaming(false);
                setIsCreating(false);
                setFormData(null);
                toast.error("Failed to create story");
                router.push("/library");
            }
        };

        startCreation();
    }, [formData, router, setFormData, setIsCreating, showManuscript]);


    if (!showManuscript || !storyId) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <ConstellationLoader />
                    <p className="mt-4 text-muted">Creating your story...</p>
                </div>
            </div>
        );
    }

    return (
        <ManuscriptView
            storyId={storyId.toString()}
            initialDraft={draftId ? { id: draftId, narration } : undefined}
            isInitialStreaming={isStreaming}
        />
    );
}