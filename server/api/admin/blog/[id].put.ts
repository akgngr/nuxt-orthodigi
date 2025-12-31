import { BlogService } from '../../../services/blog.service';
import { protect } from '../../../utils/protect';

export default defineEventHandler(async (event) => {
  await protect(event);
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  if (!id) throw createError({ statusCode: 400, message: 'ID missing' });
  return await BlogService.update(id, body);
});
