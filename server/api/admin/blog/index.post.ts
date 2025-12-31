import { BlogService } from '../../../services/blog.service';
import { requirePermission } from '../../../utils/protect';
import { PERMISSIONS } from '../../../utils/permissions';

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.BLOG.WRITE);
  const body = await readBody(event);
  return await BlogService.create(body);
});
