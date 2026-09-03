import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.BACKEND_URL ?? "https://ai-card-scan-backend.vercel.app",
    fetchOptions: {
        credentials: "include",
    },
    plugins: [
        adminClient()
    ],
})