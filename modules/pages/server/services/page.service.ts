import { prisma as db } from '~~/server/utils/prisma'

/**
 * PageService handles all page-related database operations.
 */
export class PageService {
  /**
     * Get all pages with pagination, search and sorting.
     */
  static async getAllPages(params: {
    page?: number
    limit?: number
    search?: string
    sort?: string
    order?: 'asc' | 'desc'
  } = {}) {
    const { page = 1, limit = 10, search, sort = 'createdAt', order = 'desc' } = params
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { titleTag: { contains: search, mode: 'insensitive' } },
        { h1Title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [items, total] = await Promise.all([
      db.page.findMany({
        where,
        include: {
          components: {
            orderBy: {
              order: 'asc'
            }
          }
        },
        orderBy: { [sort]: order },
        skip,
        take: limit
      }),
      db.page.count({ where })
    ])

    return {
      items,
      total,
      pages: Math.ceil(total / limit)
    }
  }

  /**
     * Get a single page by ID.
     */
  static async getPageById(id: string) {
    return await db.page.findUnique({
      where: { id },
      include: {
        components: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })
  }

  /**
     * Get a single page by slug.
     */
  static async getPageBySlug(slug: string) {
    return await db.page.findUnique({
      where: { slug },
      include: {
        components: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })
  }

  /**
     * Create a new page.
     */
  static async createPage(data: {
    slug: string
    titleTag: string
    metaDescription?: string
    canonicalUrl?: string
    h1Title: string
    bodyText?: string
    jsonLd?: any
    featuredImage?: string
    featuredImageAlt?: string
  }) {
    return await db.page.create({
      data
    })
  }

  /**
     * Update an existing page.
     */
  static async updatePage(id: string, data: {
    slug?: string
    titleTag?: string
    metaDescription?: string
    canonicalUrl?: string
    h1Title?: string
    bodyText?: string
    jsonLd?: any
    featuredImage?: string
    featuredImageAlt?: string
  }) {
    return await db.page.update({
      where: { id },
      data
    })
  }

  /**
     * Delete a page.
     */
  static async deletePage(id: string) {
    return await db.page.delete({
      where: { id }
    })
  }

  /**
     * Add a component to a page.
     */
  static async addComponent(pageId: string, data: { type: string, content: any, order?: number }) {
    // If order is not provided, put it at the end
    let order = data.order
    if (order === undefined) {
      const count = await db.pageComponent.count({
        where: { pageId }
      })
      order = count
    }

    return await db.pageComponent.create({
      data: {
        ...data,
        order,
        pageId
      }
    })
  }

  /**
     * Update a page component.
     */
  static async updateComponent(id: string, data: { type?: string, content?: any, order?: number }) {
    return await db.pageComponent.update({
      where: { id },
      data
    })
  }

  /**
     * Delete a page component.
     */
  static async deleteComponent(id: string) {
    return await db.pageComponent.delete({
      where: { id }
    })
  }

  /**
     * Reorder components of a page.
     */
  static async reorderComponents(pageId: string, componentIds: string[]) {
    const updates = componentIds.map((id, index) => {
      return db.pageComponent.update({
        where: { id },
        data: { order: index }
      })
    })

    return await db.$transaction(updates)
  }
}
