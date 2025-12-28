import { createAuthClient } from "better-auth/vue";

export const authClient = createAuthClient({
    // baseURL can be empty as it defaults to the current origin
    // but we can set it explicitly if needed
    baseURL: typeof window !== 'undefined' ? window.location.origin : undefined
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
