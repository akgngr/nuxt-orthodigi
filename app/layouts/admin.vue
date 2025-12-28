<template>
  <UDashboardGroup>
    <AdminSidebar />

    <UDashboardPanel id="admin-main">
      <slot />
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<style scoped>
/* Dashboard components handle the layout and overflow */
</style>
