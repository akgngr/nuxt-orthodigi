export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  return {
    PROCESS_ENV_URL_EXISTS: !!process.env.DATABASE_URL,
    RUNTIME_CONFIG_URL_EXISTS: !!config.public.databaseUrl,
    URL_VAL: config.public.databaseUrl ? (config.public.databaseUrl as string).substring(0, 15) : 'NONE',
    CWD: process.cwd(),
    ENV_KEYS: Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('AUTH'))
  }
})
