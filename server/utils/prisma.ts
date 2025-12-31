import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const { Pool } = pg

let _prisma: PrismaClient | null = null

export const getPrisma = () => {
  if (!_prisma) {
    const config = useRuntimeConfig()
    const url = (config.databaseUrl as string) || process.env.DATABASE_URL

    if (!url) {
      console.error('[Prisma] DATABASE_URL is missing in runtimeConfig and process.env!')
      throw new Error('[Prisma] DATABASE_URL is missing in runtimeConfig and process.env!')
    }

    console.log('[Prisma] Config databaseUrl:', config.databaseUrl ? 'Present' : 'Missing')
    console.log('[Prisma] Env DATABASE_URL:', process.env.DATABASE_URL ? 'Present' : 'Missing')
    
    // Mask the password in logs
    const maskedUrl = url.replace(/:([^:@]+)@/, ':****@')
    console.log('[Prisma] URL prefix:', maskedUrl.split('@')[1] || maskedUrl)

    console.log('[Prisma] Initializing with PrismaPg adapter...')
    const pool = new Pool({ connectionString: url })
    const adapter = new PrismaPg(pool)
    
    _prisma = new PrismaClient({ adapter })
  }
  return _prisma
}

export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    const instance = getPrisma()
    return Reflect.get(instance, prop)
  }
})
