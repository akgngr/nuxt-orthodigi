import { DoctorProfileService } from '../../../services/doctorprofile.service';
import { requirePermission } from '../../../utils/protect';

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'doctorprofile:write');
  const body = await readBody(event);
  return await DoctorProfileService.create(body);
});
