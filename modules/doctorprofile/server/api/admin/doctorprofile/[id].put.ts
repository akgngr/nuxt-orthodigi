import { DoctorProfileService } from '../../../services/doctorprofile.service'
import { requirePermission } from '~~/server/utils/protect'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'doctorprofile:write')
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  if (!id) throw createError({ statusCode: 400, message: 'ID missing' })
  return await DoctorProfileService.update(id, body)
})
