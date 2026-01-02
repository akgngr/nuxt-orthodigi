import { CategoryService } from '../../../services/category.service'

export default defineEventHandler(async () => {
  return await CategoryService.getAll()
})
