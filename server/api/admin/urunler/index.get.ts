import { UrunlerService } from '../../../services/urunler.service';
import { protect } from '../../../utils/protect';

export default defineEventHandler(async (event) => {
  await protect(event);
  return await UrunlerService.getAll();
});
