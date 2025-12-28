import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getPrisma } from "./prisma";

let _auth: any = null;

export const getAuth = () => {
    if (!_auth) {
        const prisma = getPrisma()
        _auth = betterAuth({
            database: prismaAdapter(prisma, {
                provider: "postgresql",
            }),
            emailAndPassword: {
                enabled: true
            },
            // Better Auth needs its own URL and SECRET, 
            // Better Auth will look for BETTER_AUTH_URL and BETTER_AUTH_SECRET in process.env
        });
    }
    return _auth;
}

// Export a proxy to maintain the `auth.api...` interface while being lazy
export const auth = new Proxy({} as any, {
    get: (target, prop) => {
        const instance = getAuth()
        return (instance as any)[prop]
    }
})
