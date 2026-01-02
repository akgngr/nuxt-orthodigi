<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

interface DashboardData {
  stats: any[]
  recentUsers: any[]
}

const { data: dashboardData, refresh } = await useFetch<DashboardData>('/api/admin/dashboard')

const stats = computed(() => dashboardData.value?.stats || [
  { label: 'Toplam Kullanıcı', value: '...', icon: 'i-lucide-users', color: 'primary' },
  { label: 'Aktif Randevular', value: '...', icon: 'i-lucide-calendar-check', color: 'success' },
  { label: 'Yeni Mesajlar', value: '...', icon: 'i-lucide-message-square', color: 'warning' },
  { label: 'Ciro (Aylık)', value: '...', icon: 'i-lucide-trending-up', color: 'info' }
])

const recentUsers = computed(() => dashboardData.value?.recentUsers || [
  { name: 'Demo Kullanıcı', email: 'demo@example.com', role: 'Hasta', status: 'Aktif' },
  { name: 'Test Kullanıcı', email: 'test@example.com', role: 'Hasta', status: 'Beklemede' }
])
</script>

<template>
  <UDashboardPanel grow>
    <AdminNavbar />

    <UDashboardNavbar title="Genel Bakış">
      <template #right>
        <UButton
          icon="i-lucide-plus"
          label="Yeni Hasta"
          color="primary"
          class="rounded-xl shadow-lg shadow-primary/20 font-bold"
        />
      </template>
    </UDashboardNavbar>

    <div class="flex-1 overflow-y-auto p-4 sm:p-6">
      <div class="space-y-8">
        <!-- Dashboard Welcome -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-indigo-700 p-8 text-white shadow-2xl">
          <div class="relative z-10 max-w-2xl">
            <h1 class="text-3xl font-bold mb-2">
              Hoş geldin, Dr. Ortho! 👋
            </h1>
            <p class="text-primary-100 text-lg">
              Bugün için 8 aktif randevunuz ve incelenmeyi bekleyen 12 yeni mesajınız var.
            </p>
          </div>
          <div class="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div class="absolute -left-20 -bottom-20 w-60 h-60 bg-primary-400/20 rounded-full blur-2xl" />
        </div>

        <!-- Quick Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <UCard
            v-for="stat in stats"
            :key="stat.label"
            class="group hover:ring-2 hover:ring-primary-500/50 transition-all duration-300 shadow-sm hover:shadow-xl border-none bg-white dark:bg-gray-900"
            :ui="{ body: 'p-6' }"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                :class="[
                  stat.color === 'primary' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400'
                  : stat.color === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                    : stat.color === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                      : 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                ]"
              >
                <UIcon
                  :name="stat.icon"
                  class="w-7 h-7"
                />
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ stat.label }}
                </p>
                <div class="flex items-baseline gap-2">
                  <p class="text-2xl font-black text-gray-900 dark:text-white">
                    {{ stat.value }}
                  </p>
                  <span class="text-xs font-bold text-emerald-500">+12%</span>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Recent Activity Table -->
          <UCard
            class="lg:col-span-2 shadow-sm border-none bg-white dark:bg-gray-900 overflow-hidden"
            :ui="{ header: 'border-b-0 px-8 py-6', body: 'p-0' }"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                    Son Kayıtlar
                  </h3>
                  <p class="text-sm text-gray-500">
                    Platforma son katılan kullanıcıların listesi.
                  </p>
                </div>
                <UButton
                  variant="subtle"
                  color="neutral"
                  size="sm"
                  class="rounded-lg"
                >
                  Tümünü Gör
                </UButton>
              </div>
            </template>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50/50 dark:bg-gray-800/50">
                  <tr>
                    <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 text-left">
                      Hasta Adı
                    </th>
                    <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 text-left">
                      E-posta
                    </th>
                    <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 text-left">
                      Tür
                    </th>
                    <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 text-left">
                      Durum
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="user in recentUsers"
                    :key="user.email"
                    class="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td class="px-8 py-4 text-gray-600 dark:text-gray-300">
                      <div class="flex items-center gap-3">
                        <UAvatar
                          :alt="user.name"
                          size="sm"
                          class="bg-primary/10 text-primary font-bold"
                        />
                        <span class="font-semibold text-gray-900 dark:text-white">{{ user.name }}</span>
                      </div>
                    </td>
                    <td class="px-8 py-4 text-gray-600 dark:text-gray-300">
                      {{ user.email }}
                    </td>
                    <td class="px-8 py-4 text-gray-600 dark:text-gray-300">
                      {{ user.role }}
                    </td>
                    <td class="px-8 py-4 text-gray-600 dark:text-gray-300">
                      <UBadge
                        :color="user.status === 'Aktif' ? 'success' : (user.status === 'Beklemede' ? 'warning' : 'neutral')"
                        variant="subtle"
                        class="rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider"
                      >
                        {{ user.status }}
                      </UBadge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </UCard>

          <!-- Quick Actions -->
          <div class="space-y-6">
            <UCard
              class="shadow-sm border-none bg-white dark:bg-gray-900"
              :ui="{ header: 'border-b-0 px-8 py-6' }"
            >
              <template #header>
                <h3 class="text-xl font-bold">
                  Hızlı İşlemler
                </h3>
              </template>
              <div class="grid grid-cols-1 gap-3">
                <UButton
                  icon="i-lucide-user-plus"
                  label="Yeni Kullanıcı Ekle"
                  block
                  variant="outline"
                  color="neutral"
                  class="justify-start py-3 px-4 rounded-xl hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950"
                />
                <UButton
                  icon="i-lucide-calendar"
                  label="Randevu Oluştur"
                  block
                  variant="outline"
                  color="neutral"
                  class="justify-start py-3 px-4 rounded-xl hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950"
                />
                <UButton
                  icon="i-lucide-file-text"
                  label="Rapor Oluştur"
                  block
                  variant="outline"
                  color="neutral"
                  class="justify-start py-3 px-4 rounded-xl hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950"
                />
                <UButton
                  icon="i-lucide-mail"
                  label="E-posta Gönder"
                  block
                  variant="outline"
                  color="neutral"
                  class="justify-start py-3 px-4 rounded-xl hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950"
                />
              </div>
            </UCard>

            <UCard class="bg-indigo-900 text-white border-none shadow-xl overflow-hidden relative">
              <div class="relative z-10">
                <h4 class="font-bold text-lg mb-2">
                  Pro Versiyona Geçin
                </h4>
                <p class="text-indigo-200 text-sm mb-4">
                  Daha fazla özellik ve sınırsız raporlama için yükseltme yapın.
                </p>
                <UButton
                  color="neutral"
                  variant="outline"
                  block
                  class="bg-white text-indigo-900 font-bold hover:bg-white/90 border-none"
                >
                  Yükselt
                </UButton>
              </div>
              <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/30 rounded-full blur-2xl" />
            </UCard>
          </div>
        </div>
      </div>
    </div>
  </UDashboardPanel>
</template>
