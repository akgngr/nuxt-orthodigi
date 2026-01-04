import { prisma as db } from '../../../../server/utils/prisma'

export class BlogService {
  static async getAll(params: {
    page?: number
    limit?: number
    search?: string
    sort?: string
    order?: 'asc' | 'desc'
    categoryId?: string
    tagId?: string
    authorId?: string
    published?: boolean
  } = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      sort = 'createdAt',
      order = 'desc',
      categoryId,
      tagId,
      authorId,
      published
    } = params
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { h1Title: { contains: search, mode: 'insensitive' } },
        { titleTag: { contains: search, mode: 'insensitive' } },
        { metaDescription: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (categoryId) where.categoryId = categoryId
    if (authorId) where.authorId = authorId
    if (published !== undefined) where.published = published
    if (tagId) {
      where.tags = {
        some: { id: tagId }
      }
    }

    const [items, total] = await Promise.all([
      db.blog.findMany({
        where,
        include: {
          category: true,
          tags: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          components: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { [sort]: order },
        skip,
        take: limit
      }),
      db.blog.count({ where })
    ])

    return {
      items,
      total,
      pages: Math.ceil(total / limit)
    }
  }

  static async getById(id: string) {
    return await db.blog.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        components: {
          orderBy: { order: 'asc' }
        }
      }
    })
  }

  static async getBySlug(slug: string) {
    return await db.blog.findUnique({
      where: { slug },
      include: {
        category: true,
        tags: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        components: {
          orderBy: { order: 'asc' }
        }
      }
    })
  }

  static async create(data: any) {
    const { id, createdAt, updatedAt, components, tags, ...rest } = data

    // Ensure jsonLd is handled correctly
    if (rest.jsonLd && typeof rest.jsonLd === 'string') {
      try {
        rest.jsonLd = JSON.parse(rest.jsonLd)
      } catch (e) {
        rest.jsonLd = null
      }
    } else if (rest.jsonLd === '') {
      rest.jsonLd = null
    }

    const createData: any = { ...rest }

    if (tags && Array.isArray(tags)) {
      createData.tags = {
        connect: tags.map((tagId: string) => ({ id: tagId }))
      }
    }

    return await db.blog.create({
      data: createData
    })
  }

  static async update(id: string, data: any) {
    const { id: _, createdAt, updatedAt, components, tags, ...rest } = data

    // Ensure jsonLd is handled correctly
    if (rest.jsonLd && typeof rest.jsonLd === 'string') {
      try {
        rest.jsonLd = JSON.parse(rest.jsonLd)
      } catch (e) {
        rest.jsonLd = null
      }
    } else if (rest.jsonLd === '') {
      rest.jsonLd = null
    }

    const updateData: any = { ...rest }

    if (tags && Array.isArray(tags)) {
      updateData.tags = {
        set: tags.map((tagId: string) => ({ id: tagId }))
      }
    }

    return await db.blog.update({
      where: { id },
      data: updateData
    })
  }

  static async delete(id: string) {
    return await db.blog.delete({
      where: { id }
    })
  }

  /**
   * Add a component to a blog post.
   */
  static async addComponent(blogId: string, data: { type: string, content: any, order?: number }) {
    // If order is not provided, put it at the end
    let order = data.order
    if (order === undefined) {
      const count = await db.blogComponent.count({
        where: { blogId }
      })
      order = count
    }

    return await db.blogComponent.create({
      data: {
        ...data,
        order,
        blogId
      }
    })
  }

  /**
   * Update a blog component.
   */
  static async updateComponent(id: string, data: { type?: string, content?: any, order?: number }) {
    return await db.blogComponent.update({
      where: { id },
      data
    })
  }

  /**
   * Delete a blog component.
   */
  static async deleteComponent(id: string) {
    return await db.blogComponent.delete({
      where: { id }
    })
  }

  /**
   * Reorder components of a blog post.
   */
  static async reorderComponents(blogId: string, componentIds: string[]) {
    const updates = componentIds.map((id, index) => {
      return db.blogComponent.update({
        where: { id },
        data: { order: index }
      })
    })

    return await db.$transaction(updates as any)
  }
}
