import { DoctorProfileService } from '../../../services/doctorprofile.service'
import { requirePermission } from '~~/server/utils/protect'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'doctorprofile:delete')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'ID missing' })
  return await DoctorProfileService.delete(id)
})
