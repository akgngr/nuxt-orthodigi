import { BlogService } from '../../../services/blog.service';
import { protect } from '../../../utils/protect';

export default defineEventHandler(async (event) => {
  await protect(event);
  return await BlogService.getAll();
});
