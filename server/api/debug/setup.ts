import { auth } from "../../utils/auth";
import { neon } from '@neondatabase/serverless';

export default defineEventHandler(async (event) => {
    const url = process.env.DATABASE_URL;
    if (!url) return { success: false, message: "ENV URL MISSING" };

    try {
        // Test 1: Direct Neon connection (No Prisma)
        const sql = neon(url);
        const neonTest = await sql`SELECT 1 as result`;

        const query = getQuery(event);
        const email = query.email as string || "admin@orthodigi.com";
        const password = query.password as string || "123qwe123";

        // Test 2: Better Auth (Uses Prisma + Adapter)
        const user = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: "Admin User",
            },
        });

        return {
            success: true,
            neonTest,
            user
        };
    } catch (e: any) {
        return {
            success: false,
            message: e.message,
            error: e
        };
    }
});
