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
        user: authStore.user?.email
    })

    // Admin sayfalarına erişim kontrolü
    if (to.path.startsWith('/admin') && !authStore.isAuthenticated) {
        console.warn('[AuthMiddleware] Restricted access - Redirecting to login')
        return navigateTo('/login')
    }

    // Login sayfasındayken zaten giriş yapılmışsa admin'e at
    if (to.path === '/login' && authStore.isAuthenticated) {
        console.log('[AuthMiddleware] Already logged in - Redirecting to admin')
        return navigateTo('/admin')
    }
})
