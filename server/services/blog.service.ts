import { prisma as db } from '../utils/prisma';

export class BlogService {
  static async getAll() {
    return await db.blog.findMany({
      include: {
        components: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getById(id: string) {
    return await db.blog.findUnique({
      where: { id },
      include: {
        components: {
          orderBy: { order: 'asc' }
        }
      }
    });
  }

  static async getBySlug(slug: string) {
    return await db.blog.findUnique({
      where: { slug },
      include: {
        components: {
          orderBy: { order: 'asc' }
        }
      }
    });
  }

  static async create(data: any) {
    const { id, createdAt, updatedAt, components, ...rest } = data;
    
    // Ensure jsonLd is handled correctly
    if (rest.jsonLd && typeof rest.jsonLd === 'string') {
      try {
        rest.jsonLd = JSON.parse(rest.jsonLd);
      } catch (e) {
        rest.jsonLd = null;
      }
    } else if (rest.jsonLd === '') {
      rest.jsonLd = null;
    }

    return await db.blog.create({
      data: rest
    });
  }

  static async update(id: string, data: any) {
    const { id: _, createdAt, updatedAt, components, ...rest } = data;

    // Ensure jsonLd is handled correctly
    if (rest.jsonLd && typeof rest.jsonLd === 'string') {
      try {
        rest.jsonLd = JSON.parse(rest.jsonLd);
      } catch (e) {
        rest.jsonLd = null;
      }
    } else if (rest.jsonLd === '') {
      rest.jsonLd = null;
    }

    return await db.blog.update({
      where: { id },
      data: rest
    });
  }

  static async delete(id: string) {
    return await db.blog.delete({
      where: { id }
    });
  }

  /**
   * Add a component to a blog post.
   */
  static async addComponent(blogId: string, data: { type: string; content: any; order?: number }) {
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
  static async updateComponent(id: string, data: { type?: string; content?: any; order?: number }) {
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
