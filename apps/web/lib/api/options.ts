import { apiClient } from "./client";

export const optionsApi = {
    visibility: (storyId: string, visibility: "public"|"private") => apiClient<{data:string}>(`/api/stories/options/${storyId}?visibility=${visibility}`, {method: "POST" , credentials: "include"}),
    status: (storyId: string, status: "completed"|"active") => apiClient<{data:string}>(`/api/stories/options/${storyId}?status=${status}`, {method: "POST" , credentials: "include"})
}