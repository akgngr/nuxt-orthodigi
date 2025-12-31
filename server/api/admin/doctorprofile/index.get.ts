import { DoctorProfileService } from '../../../services/doctorprofile.service';
import { requirePermission } from '../../../utils/protect';

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'doctorprofile:read');
  return await DoctorProfileService.getAll();
});
