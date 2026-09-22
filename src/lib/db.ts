import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL!

export const pool = new pg.Pool({
  connectionString,
  max: 5,
})

// Enable unaccent extension (safe to run multiple times)
pool.query('CREATE EXTENSION IF NOT EXISTS unaccent').catch(() => {})

const adapter = new PrismaPg(pool)
export const db = new PrismaClient({ adapter })
