import { TagService } from '../../../services/tag.service'

export default defineEventHandler(async () => {
  return await TagService.getAll()
})
