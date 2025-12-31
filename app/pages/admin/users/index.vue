<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-6">Kullanıcı Yönetimi Paneli</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UCard class="hover:shadow-lg transition-shadow cursor-pointer" @click="navigateTo('/admin/users/users')">
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-users" class="w-6 h-6 text-primary" />
            <h3 class="text-lg font-semibold">Kullanıcılar</h3>
          </div>
        </template>
        <p class="text-gray-600 dark:text-gray-300">Kullanıcıları yönetin, rollerini atayın</p>
      </UCard>

      <UCard class="hover:shadow-lg transition-shadow cursor-pointer" @click="navigateTo('/admin/users/roles')">
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-user-cog" class="w-6 h-6 text-primary" />
            <h3 class="text-lg font-semibold">Roller</h3>
          </div>
        </template>
        <p class="text-gray-600 dark:text-gray-300">Rolleri oluşturun ve izinleri yönetin</p>
      </UCard>

      <UCard class="hover:shadow-lg transition-shadow cursor-pointer" @click="navigateTo('/admin/users/permissions')">
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-key" class="w-6 h-6 text-primary" />
            <h3 class="text-lg font-semibold">İzinler</h3>
          </div>
        </template>
        <p class="text-gray-600 dark:text-gray-300">İzinleri tanımlayın ve yönetin</p>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})
</script>