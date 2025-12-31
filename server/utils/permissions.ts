import { prisma } from "./prisma";

export const PERMISSIONS = {
    USERS: {
        READ: 'users:read',
        WRITE: 'users:write',
        DELETE: 'users:delete',
    },
    ROLES: {
        READ: 'roles:read',
        WRITE: 'roles:write',
        DELETE: 'roles:delete',
    },
    DASHBOARD: {
        READ: 'dashboard:read',
    }
} as const;

export const ALL_PERMISSIONS = [
    ...Object.values(PERMISSIONS.USERS),
    ...Object.values(PERMISSIONS.ROLES),
    ...Object.values(PERMISSIONS.DASHBOARD),
];

export async function getUserPermissions(userId: string) {
    const userRoles = await prisma.userRole.findMany({
        where: { userId },
        include: {
            role: {
                include: {
                    permissions: true
                }
            }
        }
    });

    const permissions = new Set<string>();
    userRoles.forEach(ur => {
        ur.role.permissions.forEach(p => {
            permissions.add(p.name);
        });
    });

    return Array.from(permissions);
}

export async function hasPermission(userId: string, permissionName: string) {
    const permissions = await getUserPermissions(userId);
    return permissions.includes(permissionName);
}
