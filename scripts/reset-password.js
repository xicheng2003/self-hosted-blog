const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const readline = require('readline');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function resetPassword() {
    try {
        const email = await askQuestion('请输入要重置的管理员邮箱: ');
        const newPassword = await askQuestion('请输入新密码: ');

        if (!email || !newPassword) {
            console.error('错误: 邮箱和密码不能为空');
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const client = await pool.connect();
        try {
            // Check if user exists
            const checkRes = await client.query('SELECT * FROM "User" WHERE email = $1', [email]);

            if (checkRes.rows.length === 0) {
                console.log('找不到该邮箱的用户。正在创建新管理员用户...');
                // Create new admin user if not exists
                await client.query(
                    `INSERT INTO "User" (id, email, password, role, name, "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, 'ADMIN', 'Admin', NOW(), NOW())`,
                    ['admin-' + Date.now(), email, hashedPassword]
                );
                console.log('✅ 新管理员用户已创建！');
            } else {
                // Update existing user
                await client.query(
                    'UPDATE "User" SET password = $1, role = $2 WHERE email = $3',
                    [hashedPassword, 'ADMIN', email] // Also ensure they are ADMIN
                );
                console.log('✅ 密码已重置，并确保其为管理员权限！');
            }
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('发生错误:', error);
    } finally {
        pool.end();
        rl.close();
    }
}

resetPassword();
