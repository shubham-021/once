import { CreateStoryInput, Scene, StreamCompleteData } from "@once/shared";
import { apiClient } from "./client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface DraftAcceptResult {
    scene: Scene;
    protagonistUpdates?: StreamCompleteData["protagonistUpdates"];
    echoPlanted: boolean;
    creditsUsed?: number;
}

export const draftsApi = {

    getDraft: (storyId: number) => apiClient<{ id: number; narration: string; userAction: string; turnNumber: number } | null>(
        `/api/stories/draft/${storyId}`
    ),

    createDraft: (data: CreateStoryInput) => apiClient<{ storyId: number; draftId: number }>(`api/stories/draft`, {
        method: "POST",
        body: JSON.stringify(data)
    }),

    continueStream: (
        storyId: number,
        action: string,
        onChunk: (text: string) => void,
        onComplete: (data: { draftId: number }) => void,
        onError?: (error: { code: string }) => void
    ) => {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const response = await fetch(`${API_BASE}/api/stories/draft/${storyId}/continue`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ action })
                })

                if (!response.ok) {
                    const error = await response.json();
                    if (onError) onError(error.error?.code);
                    return reject(new Error(error.error?.code));
                }

                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                if (!reader) return reject(new Error("No reader"));

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    let currentEvent = "";

                    for (const line of chunk.split("\n")) {
                        if (line.startsWith("event: ")) {
                            currentEvent = line.slice(7).trim();
                            continue;
                        }

                        if (line.startsWith("data: ")) {
                            const rawData = line.slice(6);
                            switch (currentEvent) {
                                case "narration":
                                    onChunk(rawData);
                                    break;
                                case "complete":
                                    onComplete(JSON.parse(rawData));
                                    break;
                                case "error":
                                    if (onError) onError(JSON.parse(rawData));
                                    return reject(new Error(rawData));
                            }
                            currentEvent = "";
                        }
                    }
                }
                resolve();
            } catch (error) {
                reject(error);
            }
        })
    },

    reviseStream: (
        draftId: number,
        narration: string,
        comment: string,
        onChunk: (text: string) => void,
        onComplete: () => void,
        onError?: (error: { code: string }) => void
    ) => {
        return new Promise<void>(async (resolve, reject) => {
            try {

                const response = await fetch(`${API_BASE}/api/stories/draft/${draftId}/revise`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ narration, comment })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    if (onError) onError(errorData.error);
                    return reject(new Error(errorData.error?.code));
                }

                const reader = response.body?.getReader();
                const decoder = new TextDecoder();

                if (!reader) return reject(new Error("No reader"));

                while (true) {
                    const { done, value } = await reader.read();

                    if (done) break;

                    const chunk = decoder.decode(value);
                    let currentEvent = "";

                    for (const line of chunk.split("\n")) {
                        if (line.startsWith("event: ")) {
                            currentEvent = line.slice(7).trim();
                            continue;
                        }

                        if (line.startsWith("data: ")) {
                            const rawData = line.slice(6);
                            switch (currentEvent) {
                                case "narration":
                                    onChunk(rawData);
                                    break;
                                case "complete":
                                    onComplete();
                                    break;
                                case "error":
                                    if (onError) onError(JSON.parse(rawData));
                                    return reject(new Error(rawData));
                            }
                            currentEvent = "";
                        }
                    }
                }
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },

    saveEdits: (draftId: number, narration: string) =>
        apiClient<{ draftId: number; narration: string }>(`/api/stories/draft/${draftId}/revise`, {
            method: "PUT",
            body: JSON.stringify({ narration })
        }),

    accept: (draftId: number) =>
        apiClient<DraftAcceptResult>(`/api/stories/draft/${draftId}/accept`, {
            method: "PUT"
        }),

    discard: (draftId: number) =>
        apiClient<{ deleted: boolean }>(`/api/stories/draft/${draftId}`, {
            method: "DELETE"
        }),
}
