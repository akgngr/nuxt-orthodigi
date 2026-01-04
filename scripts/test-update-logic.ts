
import { PrismaClient } from '../server/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const { Pool } = pg
const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // 1. Create a category if not exists
  let category = await prisma.category.findFirst()
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category'
      }
    })
    console.log('Created category:', category.id)
  } else {
    console.log('Using existing category:', category.id)
  }

  // 2. Find a blog
  const blog = await prisma.blog.findFirst()
  if (!blog) {
    console.log('No blog found')
    return
  }
  console.log('Found blog:', blog.id)

  // 3. Update blog with category
  console.log('Updating blog with categoryId:', category.id)
  const updatedBlog = await prisma.blog.update({
    where: { id: blog.id },
    data: {
      categoryId: category.id
    },
    include: {
      category: true
    }
  })
  console.log('Updated blog category:', updatedBlog.categoryId)
  console.log('Updated blog category relation:', updatedBlog.category?.name)

  // 4. Update blog with EMPTY string category (simulate frontend sending "")
  // This simulates what happens BEFORE my service logic kicks in.
  // My service logic converts "" to null.
  // Direct prisma call with "" should fail or set it to "" if allowed?
  // Prisma schema says `categoryId String?`. String means it CAN be "". But usually FK must be valid ID or null.
  // If I try to set it to "", it should fail FK constraint if "" is not a valid ID.
  
  console.log('Attempting to set categoryId to "" directly (should fail if FK constraint)')
  try {
    await prisma.blog.update({
      where: { id: blog.id },
      data: {
        categoryId: ""
      }
    })
    console.log('Success setting empty string (Unexpected)')
  } catch (e) {
    console.log('Failed setting empty string (Expected):', e.code)
  }

  // 5. Simulate Service Logic: null
  console.log('Updating blog with categoryId: null')
  const nullCatBlog = await prisma.blog.update({
    where: { id: blog.id },
    data: {
      categoryId: null
    }
  })
  console.log('Updated blog category:', nullCatBlog.categoryId)

}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
