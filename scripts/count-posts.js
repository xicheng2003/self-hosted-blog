const { PrismaClient } = require("@prisma/client"); const prisma = new PrismaClient(); async function count() { const c = await prisma.post.count(); console.log("Post count:", c); } count();
