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

    trustedOrigins: [
        "http://localhost:3001",
        "http://192.168.137.1:3001",
        "aicardscan://",             
        "https://*.vercel.app",
        "exp://192.168.137.1:8081",
    ],

    plugins: [
        admin(),
        nextCookies()],
});