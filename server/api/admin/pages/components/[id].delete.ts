import { PageService } from "~~/server/services/page.service"

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers })
    if (!session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Component ID is required'
        })
    }
    
    try {
        return await PageService.deleteComponent(id)
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }
})
