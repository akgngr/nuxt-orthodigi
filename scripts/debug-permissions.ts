import { PrismaClient } from '@prisma/client'
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

    console.log('Checking users and permissions...');
    
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
        });

        for (const user of users) {
            console.log(`User: ${user.email} (${user.id})`);
            if (user.roles.length === 0) {
                console.log('  - No roles assigned');
            }
            for (const ur of user.roles) {
                console.log(`  - Role: ${ur.role.name} (${ur.role.id})`);
                if (ur.role.permissions.length === 0) {
                    console.log('    - No permissions in this role');
                }
                for (const p of ur.role.permissions) {
                    console.log(`    - Permission: ${p.name}`);
                }
            }
        }
    } finally {
        await prisma.$disconnect()
    }
}

main().catch(e => console.error(e));
