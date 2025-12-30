const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const { hash } = require('bcryptjs')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = 'admin@example.com'
  const password = 'password123' // Default password
  const hashedPassword = await hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN'
    },
    create: {
      email,
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN'
    }
  })

  console.log(`Admin user created/updated: ${user.email}`)
  console.log(`Password: ${password}`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
