import { UrunlerService } from '../../../services/urunler.service'
import { protect } from '~~/server/utils/protect'

export default defineEventHandler(async (event) => {
  await protect(event)
  const query = getQuery(event)

  return await UrunlerService.getAll({
    page: query.page ? parseInt(query.page as string) : undefined,
    limit: query.limit ? parseInt(query.limit as string) : undefined,
    search: query.search as string,
    sort: query.sort as string,
    order: query.order as 'asc' | 'desc'
  })
})
