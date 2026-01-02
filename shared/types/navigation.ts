export interface NavigationItem {
  label: string
  icon?: string
  to?: string
  type?: 'label' | 'link'
  defaultOpen?: boolean
  children?: NavigationItem[]
  badge?: string | number
  permission?: string
}
