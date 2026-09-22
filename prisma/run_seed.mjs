import pg from 'pg'
import fs from 'fs'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
await pool.query(fs.readFileSync('prisma/seed_full.sql', 'utf8'))
const r = await pool.query('SELECT COUNT(*)::int AS c FROM "Food"')
console.log('total foods:', r.rows[0].c)
await pool.end()
