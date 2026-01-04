
import { PrismaClient } from '../server/generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is missing')

  const pool = new Pool({ connectionString: url })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const email = 'admin@orthodigi.com'
    console.log(`Checking permissions for ${email}...`)

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      console.log('User not found!')
      return
    }

    console.log(`User ID: ${user.id}`)
    console.log(`Roles count: ${user.roles.length}`)

    const permissions = new Set<string>()
    
    for (const ur of user.roles) {
      console.log(`- Role: ${ur.role.name} (ID: ${ur.role.id})`)
      console.log(`  Permissions count: ${ur.role.permissions.length}`)
      for (const p of ur.role.permissions) {
        const permString = `${p.resource.toLowerCase()}:${p.action.toLowerCase()}`
        permissions.add(permString)
        // console.log(`    * ${permString} (raw: ${p.resource} / ${p.action})`)
      }
    }

    console.log('--- Calculated Permissions ---')
    console.log(Array.from(permissions).sort())

    if (permissions.has('dashboard:read')) {
        console.log('✅ Has dashboard:read')
    } else {
        console.log('❌ MISSING dashboard:read')
    }

  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)
