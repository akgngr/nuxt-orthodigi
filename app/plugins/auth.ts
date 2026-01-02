import { authClient } from '~/lib/auth-client'

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore()

  // Use useAsyncData to fetch session on server and hydrate on client
  const { data: sessionData } = await useAsyncData('auth-session', async () => {
    const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

    console.log('[AuthPlugin] Fetching session...', import.meta.server ? 'Server' : 'Client')
    const { data } = await authClient.getSession({
      fetchOptions: {
        headers: headers as any
      }
    })
    return data
  })

  if (sessionData.value) {
    console.log('[AuthPlugin] Session hydrated:', sessionData.value.user.email)
    authStore.user = sessionData.value.user
    authStore.session = sessionData.value.session

    // Fetch permissions manually since we bypassed refreshSession
    await authStore.fetchPermissions()
  } else {
    console.log('[AuthPlugin] No session found during hydration')
    authStore.user = null
    authStore.session = null
  }

  authStore.initialized = true
})
