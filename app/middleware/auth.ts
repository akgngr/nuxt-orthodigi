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

    console.log('[AuthMiddleware] Status:', {
        path: to.path,
        isAuthenticated: authStore.isAuthenticated,
        user: authStore.user?.email,
        permissions: authStore.permissions
    })

    // Admin sayfalarına erişim kontrolü
    if (to.path.startsWith('/admin')) {
        if (!authStore.isAuthenticated) {
            console.warn('[AuthMiddleware] Restricted access - Redirecting to login')
            return navigateTo('/login')
        }

        // Permission check
        if (!authStore.hasPermission('dashboard:read')) {
            console.warn('[AuthMiddleware] Missing permission - Redirecting to root')
            return navigateTo('/')
        }
    }

    // Login sayfasındayken zaten giriş yapılmışsa admin'e at
    if (to.path === '/login' && authStore.isAuthenticated) {
        // If has admin access, go to admin, else maybe home?
        if (authStore.hasPermission('dashboard:read')) {
            console.log('[AuthMiddleware] Already logged in (Admin) - Redirecting to admin')
            return navigateTo('/admin')
        } else {
             console.log('[AuthMiddleware] Already logged in (User) - Redirecting to home')
             return navigateTo('/')
        }
    }
})
