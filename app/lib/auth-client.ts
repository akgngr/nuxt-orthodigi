import { createAuthClient } from "better-auth/vue";

export const authClient = createAuthClient({
    // baseURL can be empty as it defaults to the current origin
    // but we can set it explicitly if needed
    baseURL: typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NUXT_PUBLIC_APP_URL || "http://localhost:3000"
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
