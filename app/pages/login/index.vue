<script setup lang="ts">
/**
 * Premium Login Page for OrthoDigi
 * Features: Glassmorphism, Modern Typography, Responsive Design
 */
definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { isAuthenticated, signIn } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    const { data, error: signInError } = await signIn(email.value, password.value)
    
    if (signInError) {
      error.value = signInError.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.'
    } else if (data) {
      console.log('[Login] Success, navigating to admin...')
      await navigateTo('/admin')
    }
  } catch (e) {
    console.error('Login error:', e)
    error.value = 'Bir hata oluştu. Lütfen tekrar deneyin.'
  } finally {
    loading.value = false
  }
}

// Redirect if already logged in
onMounted(() => {
  if (isAuthenticated.value) {
    navigateTo('/admin')
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 font-sans leading-relaxed">
    <!-- Background Accents -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
      <div class="absolute top-1/2 -right-48 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      <div class="absolute -bottom-24 left-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
    </div>

    <!-- Login Card -->
    <div class="relative w-full max-w-md z-10 transition-all duration-700 ease-out-expo scale-in">
      <div class="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-800/50 rounded-[2.5rem] shadow-2xl p-8 md:p-12 overflow-hidden group">
        <!-- Logo & Branding -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-600 to-indigo-700 text-white shadow-xl shadow-primary-500/20 mb-6 transition-transform group-hover:scale-110 duration-500">
            <UIcon name="i-lucide-stethoscope" class="w-10 h-10" />
          </div>
          <h1 class="text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-2">OrthoDigi</h1>
          <p class="text-gray-500 dark:text-gray-400 font-medium tracking-wide">Yönetim Paneli Girişi</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <UFormField label="E-posta Adresi" :error="error && !email">
            <UInput
              v-model="email"
              type="email"
              placeholder="doktor@orthodigi.com"
              size="xl"
              icon="i-lucide-mail"
              :ui="{ 
                root: 'rounded-2xl transition-all duration-300',
                base: 'bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-950 px-4 py-4'
              }"
            />
          </UFormField>

          <UFormField label="Şifre" :error="error">
            <UInput
              v-model="password"
              type="password"
              placeholder="••••••••"
              size="xl"
              icon="i-lucide-lock"
              :ui="{ 
                root: 'rounded-2xl transition-all duration-300',
                base: 'bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-950 px-4 py-4 font-mono'
              }"
            />
          </UFormField>

          <div v-if="error" class="bg-destructive/10 text-destructive text-sm font-bold p-4 rounded-2xl border border-destructive/20 flex items-center gap-3 animate-head-shake">
            <UIcon name="i-lucide-alert-circle" class="w-5 h-5 flex-shrink-0" />
            <span>{{ error }}</span>
          </div>

          <UButton
            type="submit"
            label="Giriş Yap"
            block
            size="xl"
            icon="i-lucide-log-in"
            :loading="loading"
            class="rounded-2xl h-14 font-black uppercase italic tracking-widest bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 shadow-xl shadow-primary-500/25 border-none transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          />
        </form>

        <!-- Footer Actions -->
        <div class="mt-8 flex items-center justify-between text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">
          <ULink to="#" class="hover:text-primary-500 transition-colors">Şifremi Unuttum</ULink>
          <div class="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700" />
          <ULink to="#" class="hover:text-primary-500 transition-colors">Yardım Al</ULink>
        </div>
      </div>

      <!-- Copyright Info -->
      <p class="mt-8 text-center text-xs font-medium text-gray-400 dark:text-gray-600 tracking-wide">
        &copy; 2025 OrthoDigi. Tüm hakları saklıdır.
      </p>
    </div>
  </div>
</template>

<style scoped>
.ease-out-expo {
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.scale-in {
  animation: scale-in-anim 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scale-in-anim {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes head-shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
  100% { transform: translateX(0); }
}

.animate-head-shake {
  animation: head-shake 0.4s ease-in-out;
}
</style>
