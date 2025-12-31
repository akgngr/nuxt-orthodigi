import { PageService } from '../../../services/page.service'
import { z } from 'zod'

const pageSchema = z.object({
    slug: z.string().min(1).optional(),
    titleTag: z.string().min(1).optional(),
    metaDescription: z.string().optional(),
    canonicalUrl: z.string().optional(),
    h1Title: z.string().min(1).optional(),
    bodyText: z.string().optional(),
    jsonLd: z.any().optional()
})

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Page ID is required'
        })
    }

    try {
        const body = await readBody(event)
        const validatedData = pageSchema.parse(body)
        
        return await PageService.updatePage(id, validatedData)
    } catch (error: any) {
        console.error('Failed to update page:', error)
        throw createError({
            statusCode: error.name === 'ZodError' ? 400 : 500,
            statusMessage: error.message || 'Failed to update page'
        })
    }
})
