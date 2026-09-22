/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaPg } = require('@prisma/adapter-pg')
const pg = require('pg')
require('dotenv/config')

async function loadPrisma() {
  const { PrismaClient } = require('./src/generated/prisma/client/default.js')
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return { prisma: new PrismaClient({ adapter }), pool }
}

const commonFoods = [
  { name: 'Huevo entero', brand: 'Genérico', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, servingSize: '1 unidad (50g)' },
  { name: 'Clara de huevo', brand: 'Genérico', calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1, servingSize: '1 clara (33g)' },
  { name: 'Leche entera', brand: 'La Serenísima', calories: 114, protein: 6, carbs: 9.6, fat: 6, servingSize: '1 taza (200ml)' },
  { name: 'Leche descremada', brand: 'La Serenísima', calories: 68, protein: 6.4, carbs: 10, fat: 0, servingSize: '1 taza (200ml)' },
  { name: 'Yogur natural entero', brand: 'Danone', calories: 120, protein: 7, carbs: 9.4, fat: 6.5, servingSize: '1 pote (200g)' },
  { name: 'Yogur descremado firme', brand: 'Danone', calories: 70, protein: 8, carbs: 9, fat: 0, servingSize: '1 pote (190g)' },
  { name: 'Queso descremado untable', brand: 'Casancrem', calories: 34, protein: 2.1, carbs: 1.5, fat: 2.2, servingSize: '1 cucharada (50g)' },
  { name: 'Queso fresco magro', brand: 'Genérico', calories: 78, protein: 7.2, carbs: 0.5, fat: 5.3, servingSize: '1 porción (30g)' },
  { name: 'Queso rallado', brand: 'La Serenísima', calories: 43, protein: 4, carbs: 0.2, fat: 2.9, servingSize: '1 cucharada (10g)' },
  { name: 'Queso port salut', brand: 'Genérico', calories: 84, protein: 5.4, carbs: 0, fat: 7, servingSize: '1 feta (30g)' },
  { name: 'Queso muzarela', brand: 'Genérico', calories: 79, protein: 5.5, carbs: 0.6, fat: 6.1, servingSize: '1 feta (30g)' },
  { name: 'Pechuga de pollo cruda', brand: 'Genérico', calories: 120, protein: 22.5, carbs: 0, fat: 2.6, servingSize: '100g' },
  { name: 'Pechuga de pollo cocida', brand: 'Genérico', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: '100g' },
  { name: 'Muslo de pollo sin piel', brand: 'Genérico', calories: 157, protein: 20.6, carbs: 0, fat: 8, servingSize: '100g' },
  { name: 'Carne vacuna nalga cruda', brand: 'Genérico', calories: 130, protein: 21, carbs: 0, fat: 4.5, servingSize: '100g' },
  { name: 'Carne vacuna lomo crudo', brand: 'Genérico', calories: 148, protein: 20.6, carbs: 0, fat: 7, servingSize: '100g' },
  { name: 'Carne picada magra', brand: 'Genérico', calories: 175, protein: 20, carbs: 0, fat: 10, servingSize: '100g' },
  { name: 'Milanesa de ternera apanada', brand: 'Genérico', calories: 240, protein: 22, carbs: 10, fat: 12, servingSize: '1 milanesa (120g)' },
  { name: 'Atún al natural', brand: 'La Campagnola', calories: 96, protein: 22, carbs: 0, fat: 0.8, servingSize: '1 lata escurrida (120g)' },
  { name: 'Atún en aceite', brand: 'La Campagnola', calories: 184, protein: 20, carbs: 0, fat: 11.4, servingSize: '1 lata escurrida (120g)' },
  { name: 'Filet de merluza', brand: 'Genérico', calories: 90, protein: 19, carbs: 0, fat: 1.2, servingSize: '100g' },
  { name: 'Salmón rosado', brand: 'Genérico', calories: 208, protein: 20, carbs: 0, fat: 13, servingSize: '100g' },
  { name: 'Cerdo carré magro', brand: 'Genérico', calories: 145, protein: 21, carbs: 0, fat: 6, servingSize: '100g' },
  { name: 'Jamón cocido', brand: 'Paladini', calories: 37, protein: 5.5, carbs: 0.7, fat: 1.3, servingSize: '1 feta (30g)' },
  { name: 'Jamón crudo', brand: 'Paladini', calories: 43, protein: 4.5, carbs: 0, fat: 2.8, servingSize: '1 feta (25g)' },
  { name: 'Avena tradicional seca', brand: 'Quaker', calories: 180, protein: 6.5, carbs: 30, fat: 3.5, servingSize: '1/2 taza (50g)' },
  { name: 'Arroz blanco crudo', brand: 'Gallo', calories: 175, protein: 3.5, carbs: 39, fat: 0.2, servingSize: '1/4 taza (50g)' },
  { name: 'Arroz integral crudo', brand: 'Gallo', calories: 170, protein: 4, carbs: 38, fat: 1.5, servingSize: '1/4 taza (50g)' },
  { name: 'Arroz blanco cocido', brand: 'Gallo', calories: 70, protein: 1.4, carbs: 16, fat: 0.1, servingSize: '1/2 taza cocida (100g)' },
  { name: 'Fideos secos', brand: 'Lucchetti', calories: 280, protein: 10, carbs: 58, fat: 1, servingSize: '1 porción seca (80g)' },
  { name: 'Fideos integrales secos', brand: 'Lucchetti', calories: 260, protein: 11, carbs: 53, fat: 1.5, servingSize: '1 porción seca (80g)' },
  { name: 'Pan lactal blanco', brand: 'Fargo', calories: 65, protein: 2.1, carbs: 12.5, fat: 0.6, servingSize: '1 rodaja (25g)' },
  { name: 'Pan integral', brand: 'Fargo', calories: 61, protein: 2.7, carbs: 11, fat: 0.75, servingSize: '1 rodaja (25g)' },
  { name: 'Pan francés mignon', brand: 'Panadería', calories: 140, protein: 4.5, carbs: 29, fat: 0.5, servingSize: '1 unidad (50g)' },
  { name: 'Galletitas de agua', brand: 'Criollitas', calories: 25, protein: 0.6, carbs: 3.8, fat: 0.8, servingSize: '1 galletita (6g)' },
  { name: 'Galletitas integrales', brand: 'Cerealitas', calories: 22, protein: 0.6, carbs: 4, fat: 0.6, servingSize: '1 galletita (6g)' },
  { name: 'Copos de maíz', brand: 'Kelloggs', calories: 110, protein: 2.2, carbs: 26, fat: 0.2, servingSize: '3/4 taza (30g)' },
  { name: 'Granola con frutas', brand: 'Genérico', calories: 140, protein: 3.5, carbs: 22, fat: 4.5, servingSize: '1/4 taza (40g)' },
  { name: 'Lentejas crudas', brand: 'Genérico', calories: 230, protein: 17.9, carbs: 40, fat: 0.8, servingSize: '1/2 taza (100g)' },
  { name: 'Garbanzos cocidos', brand: 'Genérico', calories: 164, protein: 8.9, carbs: 27, fat: 2.6, servingSize: '1/2 taza cocidos (100g)' },
  { name: 'Banana', brand: 'Genérico', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, servingSize: '1 unidad mediana (118g)' },
  { name: 'Manzana roja', brand: 'Genérico', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, servingSize: '1 unidad (180g)' },
  { name: 'Naranja', brand: 'Genérico', calories: 62, protein: 1.2, carbs: 15, fat: 0.2, servingSize: '1 unidad (130g)' },
  { name: 'Pera', brand: 'Genérico', calories: 100, protein: 0.6, carbs: 27, fat: 0.2, servingSize: '1 unidad mediana (178g)' },
  { name: 'Frutillas', brand: 'Genérico', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, servingSize: '1 taza (100g)' },
  { name: 'Palta / Aguacate', brand: 'Genérico', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, servingSize: '1/2 unidad (100g)' },
  { name: 'Melón', brand: 'Genérico', calories: 34, protein: 0.8, carbs: 8, fat: 0.2, servingSize: '1 rodaja (200g)' },
  { name: 'Sandía', brand: 'Genérico', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, servingSize: '1 tajada (200g)' },
  { name: 'Kiwi', brand: 'Genérico', calories: 42, protein: 0.8, carbs: 10, fat: 0.4, servingSize: '1 unidad (76g)' },
  { name: 'Tomate', brand: 'Genérico', calories: 22, protein: 1.1, carbs: 4.8, fat: 0.2, servingSize: '1 unidad mediana (120g)' },
  { name: 'Lechuga', brand: 'Genérico', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, servingSize: '1 plato hondo (100g)' },
  { name: 'Espinaca cruda', brand: 'Genérico', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, servingSize: '1 taza (100g)' },
  { name: 'Zanahoria', brand: 'Genérico', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, servingSize: '1 unidad mediana (61g)' },
  { name: 'Papa hervida', brand: 'Genérico', calories: 90, protein: 2, carbs: 21, fat: 0.1, servingSize: '1 papa mediana cocinada (150g)' },
  { name: 'Batata', brand: 'Genérico', calories: 114, protein: 2.1, carbs: 27, fat: 0.1, servingSize: '1 unidad (130g)' },
  { name: 'Cebolla', brand: 'Genérico', calories: 44, protein: 1.2, carbs: 10, fat: 0.1, servingSize: '1 unidad mediana (110g)' },
  { name: 'Brócoli cocido', brand: 'Genérico', calories: 55, protein: 3.7, carbs: 11, fat: 0.6, servingSize: '1 taza (91g)' },
  { name: 'Choclo cocido', brand: 'Genérico', calories: 143, protein: 4.5, carbs: 31, fat: 2, servingSize: '1 choclo (154g)' },
  { name: 'Zapallo cocido', brand: 'Genérico', calories: 26, protein: 1, carbs: 6.5, fat: 0.1, servingSize: '1 taza (116g)' },
  { name: 'Morrón rojo', brand: 'Genérico', calories: 31, protein: 1, carbs: 7.5, fat: 0.3, servingSize: '1 unidad (119g)' },
  { name: 'Pepino', brand: 'Genérico', calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, servingSize: '1/2 unidad (100g)' },
  { name: 'Aceite de oliva', brand: 'Genérico', calories: 120, protein: 0, carbs: 0, fat: 14, servingSize: '1 cucharada sopera (15ml)' },
  { name: 'Aceite de girasol', brand: 'Natura', calories: 120, protein: 0, carbs: 0, fat: 14, servingSize: '1 cucharada sopera (15ml)' },
  { name: 'Manteca', brand: 'La Serenísima', calories: 72, protein: 0.1, carbs: 0.1, fat: 8.1, servingSize: '1 cucharadita (10g)' },
  { name: 'Maní tostado salado', brand: 'Genérico', calories: 170, protein: 7.7, carbs: 6, fat: 14.5, servingSize: '30g / 1 puñado' },
  { name: 'Almendras', brand: 'Genérico', calories: 164, protein: 6, carbs: 6, fat: 14, servingSize: '28g / 23 unidades' },
  { name: 'Mantequilla de maní', brand: 'Skippy', calories: 190, protein: 7, carbs: 7, fat: 16, servingSize: '2 cucharadas (32g)' },
  { name: 'Café negro sin azúcar', brand: 'Genérico', calories: 2, protein: 0.3, carbs: 0, fat: 0, servingSize: '1 taza (240ml)' },
  { name: 'Jugo de naranja natural', brand: 'Genérico', calories: 112, protein: 1.7, carbs: 26, fat: 0.5, servingSize: '1 vaso (240ml)' },
  { name: 'Azúcar blanco', brand: 'Ledesma', calories: 40, protein: 0, carbs: 10, fat: 0, servingSize: '1 sobre (10g)' },
  { name: 'Miel', brand: 'El Colmenar', calories: 64, protein: 0.1, carbs: 17, fat: 0, servingSize: '1 cucharadita (21g)' },
  { name: 'Mermelada frutilla', brand: 'Arcor', calories: 49, protein: 0.1, carbs: 13, fat: 0, servingSize: '1 cucharada (20g)' },
  { name: 'Alfajor de chocolate triple', brand: 'Jorgito', calories: 225, protein: 3, carbs: 35, fat: 8, servingSize: '1 alfajor (50g)' },
  { name: 'Medialunas de manteca', brand: 'Panadería', calories: 185, protein: 3.5, carbs: 22, fat: 9, servingSize: '1 unidad (50g)' },
  { name: 'Papas fritas de bolsa', brand: 'Lays', calories: 155, protein: 2, carbs: 15, fat: 10, servingSize: '1/4 bolsa (28g)' },
  { name: 'Chocolate amargo 70%', brand: 'Genérico', calories: 170, protein: 3, carbs: 13, fat: 12, servingSize: '1 porción (30g)' },
  { name: 'Barritas de cereal', brand: 'Quaker', calories: 90, protein: 1.5, carbs: 20, fat: 1.5, servingSize: '1 barrita (22g)' },
]

async function main() {
  const { prisma, pool } = await loadPrisma()
  console.log('Iniciando seed de alimentos...')
  let count = 0
  for (const food of commonFoods) {
    await prisma.food.upsert({ where: { name: food.name }, update: {}, create: food })
    count++
  }
  console.log(`✓ Se insertaron o verificaron ${count} alimentos.`)
  await prisma.$disconnect()
  await pool.end()
}

main().catch(e => { console.error(e); process.exit(1) })
