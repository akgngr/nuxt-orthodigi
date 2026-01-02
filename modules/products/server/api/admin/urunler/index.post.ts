import { UrunlerService } from '../../../services/urunler.service'
import { requirePermission } from '~~/server/utils/protect'
import { PERMISSIONS } from '~~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.PRODUCTS.WRITE)
  const body = await readBody(event)
  return await UrunlerService.create(body)
})
