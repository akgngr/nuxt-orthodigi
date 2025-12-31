import { UrunlerService } from '../../../services/urunler.service';
import { protect } from '../../../utils/protect';

export default defineEventHandler(async (event) => {
  await protect(event);
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  if (!id) throw createError({ statusCode: 400, message: 'ID missing' });
  return await UrunlerService.update(id, body);
});
