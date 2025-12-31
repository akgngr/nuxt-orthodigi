import { DoctorTestimonialService } from '../../../services/doctortestimonial.service';
import { protect } from '../../../utils/protect';

export default defineEventHandler(async (event) => {
  await protect(event);
  const body = await readBody(event);
  return await DoctorTestimonialService.create(body);
});
