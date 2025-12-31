import { UrunlerService } from '../../../services/urunler.service';
import { protect } from '../../../utils/protect';

export default defineEventHandler(async (event) => {
  await protect(event);
  const body = await readBody(event);
  return await UrunlerService.create(body);
});
