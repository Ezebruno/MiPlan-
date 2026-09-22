const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const commonFoods = [
  // Lácteos y huevos
  { name: 'Huevo entero', brand: 'Genérico', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, servingSize: '1 unidad (50g)' },
  { name: 'Clara de huevo', brand: 'Genérico', calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1, servingSize: '1 clara (33g)' },
  { name: 'Leche entera', brand: 'La Serenísima', calories: 114, protein: 6, carbs: 9.6, fat: 6, servingSize: '1 taza (200ml)' },
  { name: 'Leche descremada', brand: 'La Serenísima', calories: 68, protein: 6.4, carbs: 10, fat: 0, servingSize: '1 taza (200ml)' },
  { name: 'Yogur natural entero', brand: 'Genérico', calories: 120, protein: 7, carbs: 9.4, fat: 6.5, servingSize: '1 pote (200g)' },
  { name: 'Yogur descremado firme', brand: 'Genérico', calories: 70, protein: 8, carbs: 9, fat: 0, servingSize: '1 pote (190g)' },
  { name: 'Queso descremado untable', brand: 'Casancrem', calories: 34, protein: 2.1, carbs: 1.5, fat: 2.2, servingSize: '1 cucharada (50g)' },
  { name: 'Queso fresco magro', brand: 'Por Salut', calories: 78, protein: 7.2, carbs: 0.5, fat: 5.3, servingSize: '1 porción (30g)' },
  { name: 'Queso rallado', brand: 'La Serenísima', calories: 43, protein: 4, carbs: 0.2, fat: 2.9, servingSize: '1 cucharada (10g)' },
  
  // Carnes
  { name: 'Pechuga de pollo (cruda)', brand: 'Genérico', calories: 120, protein: 22.5, carbs: 0, fat: 2.6, servingSize: '100g' },
  { name: 'Carne vacuna magra (nalga)', brand: 'Genérico', calories: 130, protein: 21, carbs: 0, fat: 4.5, servingSize: '100g' },
  { name: 'Carne picada magra', brand: 'Genérico', calories: 175, protein: 20, carbs: 0, fat: 10, servingSize: '100g' },
  { name: 'Atún al natural', brand: 'La Campagnola', calories: 96, protein: 22, carbs: 0, fat: 0.8, servingSize: '1 lata escurrida (120g)' },
  { name: 'Filet de merluza', brand: 'Genérico', calories: 90, protein: 19, carbs: 0, fat: 1.2, servingSize: '100g' },
  { name: 'Cerdo (carré magro)', brand: 'Genérico', calories: 145, protein: 21, carbs: 0, fat: 6, servingSize: '100g' },
  
  // Cereales y Panificados
  { name: 'Avena tradicional', brand: 'Quaker', calories: 180, protein: 6.5, carbs: 30, fat: 3.5, servingSize: '1/2 taza (50g)' },
  { name: 'Arroz blanco (crudo)', brand: 'Gallo', calories: 175, protein: 3.5, carbs: 39, fat: 0.2, servingSize: '1/4 taza (50g)' },
  { name: 'Arroz integral (crudo)', brand: 'Gallo', calories: 170, protein: 4, carbs: 38, fat: 1.5, servingSize: '1/4 taza (50g)' },
  { name: 'Fideos secos (crudos)', brand: 'Lucchetti', calories: 280, protein: 10, carbs: 58, fat: 1, servingSize: '1 plato (80g)' },
  { name: 'Pan lactal blanco', brand: 'Fargo', calories: 130, protein: 4.2, carbs: 25, fat: 1.2, servingSize: '2 rodajas (50g)' },
  { name: 'Pan integral', brand: 'Fargo', calories: 123, protein: 5.5, carbs: 22, fat: 1.5, servingSize: '2 rodajas (50g)' },
  { name: 'Pan francés / Mignon', brand: 'Panadería', calories: 140, protein: 4.5, carbs: 29, fat: 0.5, servingSize: '1 miñón (50g)' },
  { name: 'Galletitas de agua', brand: 'Criollitas', calories: 125, protein: 3, carbs: 19, fat: 4, servingSize: '5 galletitas (30g)' },
  
  // Frutas
  { name: 'Banana', brand: 'Genérico', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, servingSize: '1 unidad mediana (118g)' },
  { name: 'Manzana', brand: 'Genérico', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, servingSize: '1 unidad mediana (180g)' },
  { name: 'Naranja', brand: 'Genérico', calories: 62, protein: 1.2, carbs: 15, fat: 0.2, servingSize: '1 unidad (130g)' },
  { name: 'Frutillas', brand: 'Genérico', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, servingSize: '1 taza (100g)' },
  { name: 'Palta / Aguacate', brand: 'Genérico', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, servingSize: '1/2 unidad (100g)' },
  
  // Verduras
  { name: 'Tomate', brand: 'Genérico', calories: 22, protein: 1.1, carbs: 4.8, fat: 0.2, servingSize: '1 unidad mediana (120g)' },
  { name: 'Lechuga', brand: 'Genérico', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, servingSize: '1 plato hondo (100g)' },
  { name: 'Papa', brand: 'Genérico', calories: 161, protein: 4.3, carbs: 37, fat: 0.2, servingSize: '1 unidad mediana (213g)' },
  { name: 'Batata', brand: 'Genérico', calories: 114, protein: 2.1, carbs: 27, fat: 0.1, servingSize: '1 unidad (130g)' },
  { name: 'Cebolla', brand: 'Genérico', calories: 44, protein: 1.2, carbs: 10, fat: 0.1, servingSize: '1 unidad mediana (110g)' },
  
  // Otros
  { name: 'Aceite de oliva', brand: 'Genérico', calories: 120, protein: 0, carbs: 0, fat: 14, servingSize: '1 cucharada sopera (15ml)' },
  { name: 'Aceite de girasol', brand: 'Natura', calories: 120, protein: 0, carbs: 0, fat: 14, servingSize: '1 cucharada sopera (15ml)' },
  { name: 'Manteca', brand: 'La Serenísima', calories: 72, protein: 0.1, carbs: 0.1, fat: 8.1, servingSize: '1 cucharadita (10g)' },
  { name: 'Azúcar blanco', brand: 'Ledesma', calories: 40, protein: 0, carbs: 10, fat: 0, servingSize: '1 sobrecito (10g)' },
  { name: 'Alfajor de chocolate', brand: 'Jorgito', calories: 225, protein: 3, carbs: 35, fat: 8, servingSize: '1 alfajor (50g)' },
];

async function main() {
  console.log('Iniciando seed de alimentos...')
  for (const food of commonFoods) {
    await prisma.food.upsert({
      where: { id: food.name },
      update: {},
      create: {
        id: food.name, // temporal id
        name: food.name,
        brand: food.brand,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        servingSize: food.servingSize
      },
    })
  }
  console.log(`Se insertaron o verificaron ${commonFoods.length} alimentos.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
