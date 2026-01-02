import { DoctorProfileService } from '../../../services/doctorprofile.service'
import { requirePermission } from '~~/server/utils/protect'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'doctorprofile:read')
  const query = getQuery(event)
  return await DoctorProfileService.getAll({
    page: query.page ? parseInt(query.page as string) : undefined,
    limit: query.limit ? parseInt(query.limit as string) : undefined,
    search: query.search as string,
    sort: query.sort as string,
    order: query.order as 'asc' | 'desc'
  })
})
