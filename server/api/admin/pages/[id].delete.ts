import { PageService } from '../../../services/page.service'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Page ID is required'
        })
    }

    try {
        await PageService.deletePage(id)
        return { success: true }
    } catch (error) {
        console.error('Failed to delete page:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete page'
        })
    }
})
