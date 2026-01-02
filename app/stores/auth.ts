import { defineStore } from 'pinia'
import { authClient } from '~/lib/auth-client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const session = ref<any>(null)
  const permissions = ref<string[]>([])
  const loading = ref(false)
  const initialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!session.value)
  const hasPermission = (permission: string) => permissions.value.includes(permission)

  // Actions
  const fetchPermissions = async () => {
    try {
      console.log('[AuthStore] Fetching permissions...')
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : {}
      const { permissions: perms } = await $fetch<{ permissions: string[] }>('/api/auth/permissions', {
        headers: headers as any
      })
      console.log('[AuthStore] Permissions fetched:', perms)
      permissions.value = perms
    } catch (e) {
      console.error('[AuthStore] Failed to fetch permissions:', e)
      permissions.value = []
    }
  }

  const refreshSession = async () => {
    if (loading.value) return
    loading.value = true
    console.log('[AuthStore] Better Auth: Refreshing session...')

    try {
      const { data, error } = await authClient.getSession({
        fetchOptions: {
          // Pass cookies if needed (Nuxt will handle this usually)
          headers: useRequestHeaders(['cookie']) as any
        }
      })

      if (data?.session) {
        console.log('[AuthStore] Session found:', data.user.email)
        user.value = data.user
        session.value = data.session
        await fetchPermissions()
      } else {
        console.log('[AuthStore] No session found')
        user.value = null
        session.value = null
        permissions.value = []
      }
    } catch (e) {
      console.error('[AuthStore] Session check failed:', e)
      user.value = null
      session.value = null
      permissions.value = []
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  const signInAction = async (email: string, password: string) => {
    loading.value = true
    console.log('[AuthStore] Better Auth: Signing in...')
    try {
      const response = await authClient.signIn.email({
        email,
        password
      })

      console.log('[AuthStore] Raw Sign In Response:', response)

      const { data, error } = response as any

      if (error) {
        console.error('[AuthStore] Sign in error:', error)
        return { error }
      }

      // Better Auth usually returns { data: { user, session } }
      // but let's be safe and check both levels
      const userData = data?.user || (response as any).user

      if (userData) {
        user.value = userData
        // Session is handled by refreshSession usually or we set it manually
        // But calling refreshSession ensures permissions are fetched
        await refreshSession()
        initialized.value = true
        console.log('[AuthStore] Sign in success handled')
        return { data: response }
      }
      return { error: { message: 'Giriş başarılı ancak veri alınamadı. (Raw:' + JSON.stringify(response) + ')' } }
    } catch (e: any) {
      console.error('[AuthStore] Sign in exception:', e)
      return { error: { message: e.message || 'Giriş başarısız.' } }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      await authClient.signOut()
      user.value = null
      session.value = null
      permissions.value = []
      initialized.value = true
      await navigateTo('/login')
    } catch (e) {
      console.error('[AuthStore] Logout failed:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    session,
    permissions,
    loading,
    initialized,
    isAuthenticated,
    hasPermission,
    fetchPermissions,
    refreshSession,
    signIn: signInAction,
    logout
  }
})
