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
        const page = await PageService.getPageById(id)
        if (!page) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Page not found'
            })
        }
        return page
    } catch (error) {
        console.error('Failed to fetch page:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch page'
        })
    }
})
