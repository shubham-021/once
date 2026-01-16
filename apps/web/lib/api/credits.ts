import { apiClient } from "./client";

export const creditsApi = {
    get: () => apiClient<{ balance: number }>("/api/credits")
}