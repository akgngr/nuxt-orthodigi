import { PageService } from '../../../services/page.service'
import { requirePermission } from '../../../utils/protect'
import { PERMISSIONS } from '../../../utils/permissions'

export default defineEventHandler(async (event) => {
    await requirePermission(event, PERMISSIONS.PAGES.READ)
    try {
        return await PageService.getAllPages()
    } catch (error) {
        console.error('Failed to fetch pages:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch pages'
        })
    }
})
