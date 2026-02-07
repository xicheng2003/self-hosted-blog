import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  console.log('Testing connection to:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')); // Hide password
  try {
    const client = await pool.connect();
    console.log('Successfully connected to database!');
    const res = await client.query('SELECT NOW()');
    console.log('Current time from DB:', res.rows[0]);
    client.release();
  } catch (err: any) {
    console.error('Connection failed:', err.message);
    if (err.code) console.error('Error code:', err.code);
    if (err.detail) console.error('Error detail:', err.detail);
  } finally {
    await pool.end();
  }
}

testConnection();
