<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})
</script>

<template>
  <ClientOnly>
    <UButton
      :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
      color="neutral"
      variant="ghost"
      aria-label="Theme"
      @click="isDark = !isDark"
    />
    <template #fallback>
      <UButton
        icon="i-lucide-sun"
        color="neutral"
        variant="ghost"
        aria-label="Theme"
      />
    </template>
  </ClientOnly>
</template>
