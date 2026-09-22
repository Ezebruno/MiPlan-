import pg from 'pg'

// Use local DB to export
const p = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/nutriplan' })

const { rows } = await p.query('SELECT * FROM "Food" ORDER BY "name"')

let sql = '-- Auto-generated food seed for Neon\n\n'

for (const f of rows) {
  const name = f.name.replace(/'/g, "''")
  const brand = (f.brand || '').replace(/'/g, "''")
  const serving = (f.servingSize || '').replace(/'/g, "''")
  sql += `INSERT INTO "Food" ("id","name","brand","calories","protein","carbs","fat","servingSize","createdAt") VALUES (gen_random_uuid(),'${name}','${brand}',${f.calories},${f.protein},${f.carbs},${f.fat},'${serving}',NOW()) ON CONFLICT ("name") DO UPDATE SET "brand"=EXCLUDED."brand","calories"=EXCLUDED."calories","protein"=EXCLUDED."protein","carbs"=EXCLUDED."carbs","fat"=EXCLUDED."fat","servingSize"=EXCLUDED."servingSize";\n`
}

import { writeFileSync } from 'fs'
writeFileSync('prisma/seed_data.sql', sql)
console.log(`Exported ${rows.length} foods from local DB`)

await p.end()
