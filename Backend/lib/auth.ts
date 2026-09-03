import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
    },
    advanced: {
        defaultCookieAttributes: {
            sameSite: "none",
            secure: true
        },
    },

    trustedOrigins: [
        process.env.FRONTEND_URL! ?? "http://localhost:3002",
        "aicardscan://",             
        "https://*.vercel.app",
    ],

    plugins: [
        admin(),
        nextCookies()],
});
