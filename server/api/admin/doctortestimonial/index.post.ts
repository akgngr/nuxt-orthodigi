import { DoctorTestimonialService } from '../../../services/doctortestimonial.service';
import { requirePermission } from '../../../utils/protect';

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'doctortestimonial:write');
  const body = await readBody(event);
  return await DoctorTestimonialService.create(body);
});
