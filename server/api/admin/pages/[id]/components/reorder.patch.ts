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
            statusMessage: 'Page ID is required'
        })
    }

    const body = await readBody(event)
    const { componentIds } = body

    if (!Array.isArray(componentIds)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'componentIds array is required'
        })
    }
    
    try {
        return await PageService.reorderComponents(id, componentIds)
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }
})
