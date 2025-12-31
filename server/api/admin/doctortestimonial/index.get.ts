import { DoctorTestimonialService } from '../../../services/doctortestimonial.service';
import { requirePermission } from '../../../utils/protect';

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'doctortestimonial:read');
  return await DoctorTestimonialService.getAll();
});
