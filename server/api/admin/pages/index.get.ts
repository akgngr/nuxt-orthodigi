import { PageService } from '../../../services/page.service'

export default defineEventHandler(async (event) => {
    // Permission check could be added here
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
