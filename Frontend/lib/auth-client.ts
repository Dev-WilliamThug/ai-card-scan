import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.BACKEND_URL ?? "http://localhost:3001",
    plugins: [
        adminClient()
    ],
})