import pg from 'pg'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

const foods = [
  ['Huevo entero', 'Genérico', 72, 6.3, 0.4, 4.8, '1 unidad (50g)'],
  ['Pechuga de pollo cocida', 'Genérico', 165, 31, 0, 3.6, '100g'],
  ['Carne vacuna nalga cruda', 'Genérico', 130, 21, 0, 4.5, '100g'],
  ['Atún al natural', 'La Campagnola', 96, 22, 0, 0.8, '1 lata escurrida (120g)'],
  ['Arroz blanco cocido', 'Gallo', 70, 1.4, 16, 0.1, '1/2 taza (100g)'],
  ['Avena tradicional seca', 'Quaker', 180, 6.5, 30, 3.5, '1/2 taza (50g)'],
  ['Banana', 'Genérico', 105, 1.3, 27, 0.4, '1 unidad mediana (118g)'],
  ['Manzana roja', 'Genérico', 95, 0.5, 25, 0.3, '1 unidad (180g)'],
  ['Leche descremada', 'La Serenísima', 68, 6.4, 10, 0, '1 taza (200ml)'],
  ['Yogur descremado firme', 'Danone', 70, 8, 9, 0, '1 pote (190g)'],
  ['Pan integral', 'Fargo', 61, 2.7, 11, 0.75, '1 rodaja (25g)'],
  ['Aceite de oliva', 'Genérico', 120, 0, 0, 14, '1 cucharada sopera (15ml)'],
  ['Brócoli cocido', 'Genérico', 55, 3.7, 11, 0.6, '1 taza (91g)'],
  ['Papa hervida', 'Genérico', 90, 2, 21, 0.1, '1 papa mediana (150g)'],
  ['Almendras', 'Genérico', 164, 6, 6, 14, '28g / 23 unidades'],
  ['Café negro sin azúcar', 'Genérico', 2, 0.3, 0, 0, '1 taza (240ml)'],
]

async function main() {
  let n = 0
  for (const [name, brand, calories, protein, carbs, fat, servingSize] of foods) {
    await pool.query(
      `INSERT INTO "Food" ("id", "name", "brand", "calories", "protein", "carbs", "fat", "servingSize", "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT ("name") DO NOTHING`,
      [name, brand, calories, protein, carbs, fat, servingSize]
    )
    n++
  }
  const { rows } = await pool.query('SELECT COUNT(*)::int AS c FROM "Food"')
  console.log(`Seed OK: procesados ${n}, total en DB: ${rows[0].c}`)
  await pool.end()
}
main().catch(async (e) => { console.error(e); await pool.end(); process.exit(1) })
