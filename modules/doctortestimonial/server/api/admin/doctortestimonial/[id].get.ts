import { DoctorTestimonialService } from '../../../services/doctortestimonial.service'
import { requirePermission } from '~~/server/utils/protect'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'doctortestimonial:read')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'ID missing' })
  return await DoctorTestimonialService.getById(id)
})
