import { PrismaClient } from '../server/generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is missing')
  }

  console.log('Connecting to DB...')
  const pool = new Pool({ connectionString: url })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  console.log('Checking users and permissions...')

  // Seed Logic
  const resources = [
      { name: 'dashboard', actions: ['read'] },
      { name: 'users', actions: ['read', 'write', 'delete'] },
      { name: 'roles', actions: ['read', 'write', 'delete'] },
      { name: 'pages', actions: ['read', 'write', 'delete'] },
      { name: 'blog', actions: ['read', 'write', 'delete'] },
      { name: 'products', actions: ['read', 'write', 'delete'] },
      { name: 'doctortestimonial', actions: ['read', 'write', 'delete'] },
      { name: 'doctorprofile', actions: ['read', 'write', 'delete'] },
      { name: 'appointments', actions: ['read', 'write', 'delete'] },
      { name: 'messages', actions: ['read', 'write', 'delete'] },
      { name: 'settings', actions: ['read', 'write'] },
      { name: 'reports', actions: ['read'] },
      { name: 'components', actions: ['read', 'write', 'delete'] }
  ]

  console.log('Seeding Permissions...')
  for (const res of resources) {
      for (const action of res.actions) {
          const permName = `${res.name}:${action}`
          await prisma.permission.upsert({
              where: {
                  action_resource: {
                      action,
                      resource: res.name
                  }
              },
              update: {},
              create: {
                  action,
                  resource: res.name,
                  description: `Permission to ${action} ${res.name}`
              }
          })
          // console.log(`  - Upserted permission: ${permName}`)
      }
  }

  console.log('Seeding Admin Role...')
  const adminRole = await prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
          name: 'admin',
          description: 'Administrator with full access'
      }
  })
  console.log('  - Admin role ready:', adminRole.id)

  // Assign all permissions to admin role
  const allPermissions = await prisma.permission.findMany()
  console.log(`  - Assigning ${allPermissions.length} permissions to admin role...`)
  
  for (const p of allPermissions) {
      // Check if already assigned (prisma doesn't have createMany for implicit/explicit many-to-many easily with extra fields, 
      // but here it is implicit? No, schema says Permission[] and Roles[])
      // Wait, schema:
      // model Role { permissions Permission[] }
      // model Permission { roles Role[] }
      // It is an implicit m-n relationship.
      
      // Update role to connect permission
      await prisma.role.update({
          where: { id: adminRole.id },
          data: {
              permissions: {
                  connect: { id: p.id }
              }
          }
      })
  }

  try {
    const users = await prisma.user.findMany({
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

    for (const user of users) {
      console.log(`User: ${user.email} (${user.id})`)
      if (user.roles.length === 0) {
        console.log('  - No roles assigned')
        if (user.email === 'admin@orthodigi.com') {
             console.log('  - Attempting to assign admin role...')
             const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } })
             if (adminRole) {
                 await prisma.userRole.create({
                     data: {
                         userId: user.id,
                         roleId: adminRole.id
                     }
                 })
                 console.log('  - Admin role assigned successfully!')
             } else {
                 console.log('  - Admin role not found!')
             }
        }
      }
      for (const ur of user.roles) {
        console.log(`  - Role: ${ur.role.name} (${ur.role.id})`)
        if (ur.role.permissions.length === 0) {
          console.log('    - No permissions in this role')
        }
        for (const p of ur.role.permissions) {
          console.log(`    - Permission: ${p.resource}:${p.action}`)
        }
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(e => console.error(e))
