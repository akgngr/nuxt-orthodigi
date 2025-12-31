import { BlogService } from "~~/server/services/blog.service"
import { protect } from "~~/server/utils/protect"

export default defineEventHandler(async (event) => {
    await protect(event)

    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Blog ID is required'
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
        return await BlogService.reorderComponents(id, componentIds)
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }
})
