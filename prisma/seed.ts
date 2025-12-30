import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Create Admin User
  const adminEmail = 'admin@example.com'
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  let adminId = existingAdmin?.id

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        password: 'hashed_password_placeholder', // In real app, use bcrypt
        role: 'ADMIN',
      }
    })
    adminId = admin.id
    console.log('Created Admin User:', admin.email)
  } else {
    console.log('Admin User already exists')
  }

  if (!adminId) return

  // 2. Create Categories
  const categories = [
    { name: 'Technology', slug: 'tech' },
    { name: 'Life', slug: 'life' },
    { name: 'Ideas', slug: 'ideas' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('Categories seeded')

  // 3. Create Posts
  const posts = [
    {
      title: '那些「酷，但用不着」的 self-hosted 应用',
      slug: 'cool-but-unnecessary-self-hosted-apps',
      content: 'Self-host 即「自部署」...',
      published: true,
      viewCount: 209,
      categorySlug: 'tech'
    },
    {
      title: '我眼中的 AdventureX 2025',
      slug: 'adventurex-2025',
      content: 'AdventureX 是一个...',
      published: true,
      viewCount: 105,
      categorySlug: 'life'
    },
    {
      title: 'Weekly #34: 22 岁，我要成为什么样的人',
      slug: 'weekly-34',
      content: '本周思考...',
      published: false, // Draft
      viewCount: 0,
      categorySlug: 'life'
    }
  ]

  for (const post of posts) {
    const category = await prisma.category.findUnique({ where: { slug: post.categorySlug } })
    
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        title: post.title,
        slug: post.slug,
        content: post.content,
        published: post.published,
        viewCount: post.viewCount,
        authorId: adminId,
        categoryId: category?.id,
      }
    })
  }
  console.log('Posts seeded')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
