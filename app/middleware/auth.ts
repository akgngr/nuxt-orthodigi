import { navigationItems, type NavigationItem } from '~/constants/navigation'

/**
 * Auth middleware protects routes from unauthorized access.
 * If no session is found, it redirects to /login.
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
    const authStore = useAuthStore()

    // Eğer henüz başlatılmadıysa veya bir session yoksa yenilemeyi dene
    if (!authStore.initialized) {
        console.log('[AuthMiddleware] First run, refreshing session...')
        await authStore.refreshSession()
    }

    // Admin sayfalarına erişim kontrolü
    if (to.path.startsWith('/admin')) {
        if (!authStore.isAuthenticated) {
            console.warn('[AuthMiddleware] Restricted access - Redirecting to login')
            return navigateTo('/login')
        }

        // 1. Basic check: Does user have at least dashboard access?
        if (!authStore.hasPermission('dashboard:read')) {
            console.warn('[AuthMiddleware] Missing basic admin permission - Redirecting to home')
            return navigateTo('/')
        }

        // 2. Granular check: Find permission for this specific route from navigationItems
        const findPermissionForPath = (items: NavigationItem[]): string | undefined => {
            for (const item of items) {
                if (item.to === to.path && item.permission) {
                    return item.permission
                }
                if (item.children) {
                    const childPerm = findPermissionForPath(item.children)
                    if (childPerm) return childPerm
                }
            }
            return undefined
        }

        const requiredPermission = findPermissionForPath(navigationItems.flat())
        
        if (requiredPermission && !authStore.hasPermission(requiredPermission)) {
            console.warn(`[AuthMiddleware] Missing granular permission: ${requiredPermission} - Redirecting to dashboard`)
            return navigateTo('/admin')
        }
    }

    // Login sayfasındayken zaten giriş yapılmışsa admin'e at
    if (to.path === '/login' && authStore.isAuthenticated) {
        if (authStore.hasPermission('dashboard:read')) {
            return navigateTo('/admin')
        } else {
             return navigateTo('/')
        }
    }
})
