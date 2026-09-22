import pg from 'pg'
import { readFileSync } from 'fs'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

// 1. Enable unaccent
await pool.query('CREATE EXTENSION IF NOT EXISTS unaccent')
console.log('1. unaccent OK')

// 2. Run migration SQL
const migration = readFileSync('prisma/migrations/20260921234545_init/migration.sql', 'utf8')
await pool.query(migration)
console.log('2. Schema created')

// 3. Run seed SQL
const seed = readFileSync('prisma/seed_data.sql', 'utf8')
const statements = seed.split(';').filter(s => s.trim().length > 0)
let n = 0
for (const stmt of statements) {
  try {
    await pool.query(stmt)
    n++
  } catch (e) {
    if (!e.message.includes('duplicate')) console.error('Seed error:', e.message)
  }
}

const { rows } = await pool.query('SELECT COUNT(*)::int AS c FROM "Food"')
console.log(`3. Seeded ${n} foods, total: ${rows[0].c}`)
await pool.end()
console.log('Done!')
