import type { ModuleConfig } from './types/module'
import pagesModule from '../modules/pages/module.config'
import blogModule from '../modules/blog/module.config'
import productsModule from '../modules/products/module.config'
import doctorProfileModule from '../modules/doctorprofile/module.config'
import doctorTestimonialModule from '../modules/doctortestimonial/module.config'

export const modules: ModuleConfig[] = [
  pagesModule,
  blogModule,
  productsModule,
  doctorProfileModule,
  doctorTestimonialModule
]

export const allPermissions = modules.reduce((acc, mod) => {
  if (mod.permissions) {
    Object.entries(mod.permissions).forEach(([key, value]) => {
      acc[value] = `${mod.name.toUpperCase()}.${key}`
    })
  }
  return acc
}, {} as Record<string, string>)

export const allNavigation = modules
  .filter(mod => mod.navigation)
  .map(mod => mod.navigation!)
  .flat()
