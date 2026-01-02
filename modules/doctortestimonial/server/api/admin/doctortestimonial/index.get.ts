import { DoctorTestimonialService } from '../../../services/doctortestimonial.service'
import { requirePermission } from '~~/server/utils/protect'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'doctortestimonial:read')
  const query = getQuery(event)
  return await DoctorTestimonialService.getAll({
    page: query.page ? parseInt(query.page as string) : undefined,
    limit: query.limit ? parseInt(query.limit as string) : undefined,
    search: query.search as string,
    sort: query.sort as string,
    order: query.order as 'asc' | 'desc'
  })
})
