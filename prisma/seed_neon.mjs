import pg from 'pg'
import { readFileSync } from 'fs'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 60000 })
const client = await pool.connect()

const seed = readFileSync('prisma/seed_data.sql', 'utf8')
const statements = seed.split(';').filter(s => s.trim().length > 0)

await client.query('BEGIN')
let n = 0
for (const stmt of statements) {
  try { await client.query(stmt); n++ } catch {}
}
await client.query('COMMIT')

const { rows } = await client.query('SELECT COUNT(*)::int AS c FROM "Food"')
console.log(`Inserted ${n}, total: ${rows[0].c}`)
client.release()
await pool.end()
