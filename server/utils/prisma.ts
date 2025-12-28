import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

let _prisma: PrismaClient | null = null

export const getPrisma = () => {
    if (!_prisma) {
        // Standard Nuxt way to get config
        const config = useRuntimeConfig()
        const url = (config.databaseUrl as string) || process.env.DATABASE_URL

        if (!url) {
            throw new Error('[Prisma] DATABASE_URL is missing in runtimeConfig and process.env!')
        }

        const adapter = new PrismaNeon({ connectionString: url })

        _prisma = new PrismaClient({ adapter })
    }
    return _prisma
}

export const prisma = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        const instance = getPrisma()
        return (instance as any)[prop]
    }
})
