import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL!

const pool = new pg.Pool({
  connectionString,
})
const adapter = new PrismaPg(pool)
export const db = new PrismaClient({ adapter })

// Example type to expose the client singleton if needed
export type DB = typeof db
