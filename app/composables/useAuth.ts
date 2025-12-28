import { useAuthStore } from '~/stores/auth'
import { storeToRefs } from 'pinia'

/**
 * useAuth hook provides a simple interface to the auth store.
 * It ensures all components share the same reactive state.
 */
export const useAuth = () => {
    const authStore = useAuthStore()
    const { user, session, loading, isAuthenticated, initialized } = storeToRefs(authStore)

    return {
        user,
        session,
        loading,
        isAuthenticated,
        initialized,
        refreshSession: authStore.refreshSession,
        signIn: authStore.signIn,
        logout: authStore.logout
    }
}
