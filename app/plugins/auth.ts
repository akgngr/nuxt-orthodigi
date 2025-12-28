export default defineNuxtPlugin((nuxtApp) => {
    // Better Auth: Initial session check on client
    if (import.meta.client) {
        const authStore = useAuthStore()
        if (!authStore.initialized) {
            console.log('[AuthPlugin] Better Auth: Initializing store...')
            authStore.refreshSession()
        }
    }
})
