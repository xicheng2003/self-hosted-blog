
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const assets = await prisma.asset.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  })
  
  console.log('Latest 5 assets:')
  assets.forEach(asset => {
    console.log(`ID: ${asset.id}`)
    console.log(`Created At: ${asset.createdAt}`)
    console.log(`URL: ${asset.url}`)
    console.log(`Key: ${asset.key}`)
    console.log('---')
  })
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
