const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function testConnection() {
    const connectionString = process.env.DATABASE_URL || '';
    const maskedConnectionString = connectionString.replace(/:[^:@]+@/, ':****@');

    console.log('Testing connection to:', maskedConnectionString);

    try {
        const client = await pool.connect();
        console.log('Successfully connected to database!');
        const res = await client.query('SELECT NOW()');
        console.log('Current time from DB:', res.rows[0]);
        client.release();
    } catch (err) {
        console.error('Connection failed:', err.message);
        if (err.code) console.error('Error code:', err.code);
        if (err.detail) console.error('Error detail:', err.detail);
        // Print full error object for debugging
        // console.error(err);
    } finally {
        await pool.end();
    }
}

testConnection();
