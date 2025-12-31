import { DoctorProfileService } from '../../../services/doctorprofile.service';
import { requirePermission } from '../../../utils/protect';

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'doctorprofile:read');
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID missing' });
  return await DoctorProfileService.getById(id);
});
