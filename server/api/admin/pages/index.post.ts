import { PageService } from '../../../services/page.service'
import { z } from 'zod'

const pageSchema = z.object({
    slug: z.string().min(1),
    titleTag: z.string().min(1),
    metaDescription: z.string().optional(),
    canonicalUrl: z.string().optional(),
    h1Title: z.string().min(1),
    bodyText: z.string().optional(),
    jsonLd: z.any().optional()
})

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const validatedData = pageSchema.parse(body)
        
        return await PageService.createPage(validatedData)
    } catch (error: any) {
        console.error('Failed to create page:', error)
        throw createError({
            statusCode: error.name === 'ZodError' ? 400 : 500,
            statusMessage: error.message || 'Failed to create page'
        })
    }
})
