import { prisma } from "../utils/prisma";
import { ALL_PERMISSIONS } from "../utils/permissions";

export default defineNitroPlugin(async (nitroApp) => {
    console.log('[Permissions] Checking and seeding permissions...');
    
    for (const permissionName of ALL_PERMISSIONS) {
        await prisma.permission.upsert({
            where: { name: permissionName },
            update: {},
            create: {
                name: permissionName,
                description: `Permission to ${permissionName.split(':')[1]} ${permissionName.split(':')[0]}`
            }
        });
    }
    
    // Ensure Admin role exists and has all permissions
    const adminRole = await prisma.role.upsert({
        where: { name: 'admin' },
        update: {},
        create: {
            name: 'admin',
            description: 'System Administrator with full access'
        }
    });

    // Assign all permissions to Admin
    const allPermissions = await prisma.permission.findMany();
    await prisma.role.update({
        where: { id: adminRole.id },
        data: {
            permissions: {
                connect: allPermissions.map(p => ({ id: p.id }))
            }
        }
    });

    console.log('[Permissions] Initialization complete.');
});
