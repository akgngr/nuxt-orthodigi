import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'
import dotenv from 'dotenv'

dotenv.config()

neonConfig.webSocketConstructor = ws

const url = process.env.DATABASE_URL
console.log('URL:', url)

if (!url) {
  throw new Error('DATABASE_URL missing')
}

const pool = new Pool({ connectionString: url })
const adapter = new PrismaNeon(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  try {
    console.log('Connecting...')
    await prisma.$connect()
    console.log('Connected!')
    const count = await prisma.user.count()
    console.log('User count:', count)
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
