export default defineNuxtConfig({
  components: [
    {
      path: 'app/components',
      pathPrefix: true
    }
  ],
  imports: {
    dirs: ['composables']
  }
})
