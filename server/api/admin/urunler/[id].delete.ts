import { UrunlerService } from '../../../services/urunler.service';
import { protect } from '../../../utils/protect';

export default defineEventHandler(async (event) => {
  await protect(event);
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID missing' });
  return await UrunlerService.delete(id);
});
