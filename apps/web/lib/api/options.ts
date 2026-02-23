import { apiClient } from "./client";

export const optionsApi = {
    visibility: (storyId: string, visibility: "public"|"private", publicDescription?: string) => apiClient<{data:string}>(`/api/stories/options/${storyId}/visibility`, {body:JSON.stringify({visibility,publicDescription}), method: "PATCH" , credentials: "include"}),
    status: (storyId: string, status: "completed"|"active") => apiClient<{data:string}>(`/api/stories/options/${storyId}/status`, {body: JSON.stringify({status}), method: "PATCH" , credentials: "include"}),
    fork : (storyId:string, allowForking: boolean) => apiClient<{data:string}>(`/api/stories/options/${storyId}/fork`, {body: JSON.stringify({allowForking}), method: 'PATCH', credentials: 'include'})
}