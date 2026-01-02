import { DoctorTestimonialService } from '../../../services/doctortestimonial.service'
import { requirePermission } from '~~/server/utils/protect'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'doctortestimonial:write')
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  if (!id) throw createError({ statusCode: 400, message: 'ID missing' })
  return await DoctorTestimonialService.update(id, body)
})
