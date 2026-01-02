import type { NavigationItem } from './navigation'

export interface ModuleConfig {
  name: string
  permissions?: Record<string, string>
  navigation?: NavigationItem | NavigationItem[]
}

export function defineModule(config: ModuleConfig): ModuleConfig {
  return config
}
