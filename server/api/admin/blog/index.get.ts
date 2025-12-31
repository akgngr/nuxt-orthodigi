import { BlogService } from '../../../services/blog.service';
import { requirePermission } from '../../../utils/protect';
import { PERMISSIONS } from '../../../utils/permissions';

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.BLOG.READ);
  return await BlogService.getAll();
});
