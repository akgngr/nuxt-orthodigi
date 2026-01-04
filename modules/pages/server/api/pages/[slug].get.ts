import { PageService } from '../../services/page.service'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  try {
    const page = await PageService.getPageBySlug(slug)
    
    if (!page) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Page not found'
      })
    }
    
    return page
  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch page'
    })
  }
})
