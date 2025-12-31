import { UrunlerService } from '../../../services/urunler.service';
import { requirePermission } from '../../../utils/protect';
import { PERMISSIONS } from '../../../utils/permissions';

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.PRODUCTS.WRITE);
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  if (!id) throw createError({ statusCode: 400, message: 'ID missing' });
  return await UrunlerService.update(id, body);
});
