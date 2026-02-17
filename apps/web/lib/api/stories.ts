import { CodexEntry, Scene, Story, Analytics, StreamCompleteData, ApiResponse } from "@once/shared";
import { apiClient } from "./client";
import type { CreateStoryInput, DiscoverResult, Genre } from "@once/shared/schemas";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const storiesApi = {
    list: () => apiClient<Story[]>("/api/stories"),
    get: (id: string) => apiClient<Story>(`/api/stories/${id}`),
    create: (data: CreateStoryInput) => apiClient<any>("/api/stories", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    discover: (params?: { genre?: string; sortBy?: string; page?: number }) => {
        const searchParams = new URLSearchParams();
        if (params?.genre) searchParams.set("genre", params.genre);
        if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
        if (params?.page) searchParams.set("page", String(params.page));

        const query = searchParams.toString();
        return apiClient<DiscoverResult[]>(`/api/stories/discover${query ? `?${query}` : ""}`)
    },
    discoverStats: () => apiClient<{ storiesPublished: number; activeWriters: number }>("/api/stories/discover/stats"),
    upvote: (id: string) => apiClient<{ upvoted: boolean; upvotes: number }>(`/api/stories/${id}/upvote`, {
        method: "POST"
    }),
    addNote: (id: string, content: string) => apiClient(`/api/stories/${id}/notes`, {
        method: "POST",
        body: JSON.stringify({ content, isPublic: false })
    }),
    fork: (id: string, sceneId: number) => apiClient<Story>(`/api/stories/${id}/fork`, {
        method: "POST",
        body: JSON.stringify({ sceneId })
    }),
    getScenes: (id: string) => apiClient<{ storyScenes: Scene[], storyTitle: string }>(`/api/stories/${id}/scenes`),
    continue: (id: string, action: string) => apiClient<{ scene: Scene; protagonistUpdates?: any }>(`/api/stories/${id}/continue`, {
        method: "POST",
        body: JSON.stringify({ action })
    }),

    getCodex: (id: string) => apiClient<CodexEntry[]>(`/api/stories/${id}/codex`),
    getAnalytics: () => apiClient<Analytics>('/api/stories/analytics'),

    delete: (id: string) => apiClient<{ message: string }>(`/api/stories/${id}`, { method: 'DELETE' }),


    continueStream: (
        id: string,
        action: string,
        onChunk: (text: string) => void,
        onComplete: (data: StreamCompleteData) => void,
        onError?: (error: { code: string; balance?: number }) => void
    ) => {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const response = await fetch(`${API_BASE}/api/stories/${id}/continue/stream`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ action })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    if (onError) onError(errorData.error);
                    return reject(new Error(errorData.error?.code))
                }

                const reader = response.body?.getReader();
                const decoder = new TextDecoder();

                if (!reader) return reject(new Error("No reader"))

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
                                    const errorData = JSON.parse(rawData);
                                    if (onError) onError({ code: errorData.code });
                                    return reject(new Error(errorData.code));
                            }

                            currentEvent = "";
                        }
                    }
                }
                resolve();
            } catch (error) {
                reject(error)
            }
        })
    }
}