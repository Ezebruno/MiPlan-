export interface Recipe {
  id: string
  name: string
  kcal: number
  protein: number
  carbs: number
  fats: number
  time: string
  tag: string
  servings: string
  ingredients: string[]
  steps: string[]
}

export interface RecipeSection {
  id: string
  label: string
  emoji: string
  mealType: string
  recipes: Recipe[]
}

export const RECIPE_SECTIONS: RecipeSection[] = [
  {
    id: 'desayuno',
    label: 'Desayuno',
    emoji: '🌅',
    mealType: 'breakfast',
    recipes: [
      {
        id: 'd1',
        name: 'Avena proteica con banana',
        kcal: 380, protein: 22, carbs: 55, fats: 8,
        time: '10 min', tag: 'Energético', servings: '1 porción',
        ingredients: [
          '50 g de avena tradicional',
          '200 ml de leche (la que uses)',
          '1 banana madura',
          '1 medida de proteína en polvo (opcional, vainilla)',
          '1 cdta. de miel',
          'Canela a gusto',
        ],
        steps: [
          'Poné la avena con la leche en una ollita a fuego medio.',
          'Revolvé 4-5 minutos hasta que espese.',
          'Apagá el fuego y mezclá la proteína y la miel.',
          'Serví en un bowl con la banana en rodajas y canela por encima.',
        ],
      },
      {
        id: 'd2',
        name: 'Omelette de claras y espinaca',
        kcal: 220, protein: 24, carbs: 6, fats: 11,
        time: '12 min', tag: 'Light', servings: '1 omelette',
        ingredients: [
          '4 claras (o 2 huevos + 2 claras)',
          '1 taza de espinaca fresca',
          '1/4 de cebolla picada',
          '1 cda. de queso untable descremado',
          'Sal, pimienta y rocío vegetal',
        ],
        steps: [
          'Salteá la cebolla y la espinaca 2 minutos con rocío vegetal.',
          'Batí las claras con sal y pimienta y volcalas en la sartén.',
          'Cociná a fuego bajo 3-4 minutos hasta que cuaje.',
          'Agregá el queso untable, doblá por la mitad y serví.',
        ],
      },
      {
        id: 'd3',
        name: 'Yogur griego con granola y miel',
        kcal: 350, protein: 25, carbs: 45, fats: 8,
        time: '5 min', tag: 'Rápido', servings: '1 bowl',
        ingredients: [
          '200 g de yogur griego natural',
          '40 g de granola',
          '1 cdta. de miel',
          'Fruta a elección (frutilla, arándanos o banana)',
        ],
        steps: [
          'Poné el yogur en un bowl.',
          'Sumá la granola y la fruta cortada.',
          'Terminá con un hilo de miel por encima.',
        ],
      },
    ],
  },
  {
    id: 'almuerzo',
    label: 'Almuerzo',
    emoji: '☀️',
    mealType: 'lunch',
    recipes: [
      {
        id: 'a1',
        name: 'Bowl de pollo y quinoa',
        kcal: 450, protein: 38, carbs: 42, fats: 14,
        time: '25 min', tag: 'Alto en proteína', servings: '1 bowl',
        ingredients: [
          '150 g de pechuga de pollo',
          '80 g de quinoa cruda',
          '1/2 palta',
          '1 tomate',
          'Jugo de 1/2 limón',
          '1 cda. de aceite de oliva, sal y pimienta',
        ],
        steps: [
          'Herví la quinoa 15 minutos en agua con sal y colala.',
          'Grillá la pechuga 6-7 minutos por lado y cortala en tiras.',
          'Armá el bowl con la quinoa, el pollo, la palta y el tomate.',
          'Condimentá con limón, oliva, sal y pimienta.',
        ],
      },
      {
        id: 'a2',
        name: 'Ensalada de atún y huevo',
        kcal: 320, protein: 28, carbs: 8, fats: 19,
        time: '15 min', tag: 'Rápida', servings: '1 plato',
        ingredients: [
          '1 lata de atún al natural',
          '2 huevos',
          '2 tazas de lechuga',
          '1 tomate',
          '1/2 lata de choclo',
          '1 cda. de aceite de oliva y limón',
        ],
        steps: [
          'Herví los huevos 9 minutos, enfrialos y cortalos en cuartos.',
          'Escurrí el atún y el choclo.',
          'Mezclá todo en un bowl con la lechuga y el tomate.',
          'Condimentá con oliva, limón y sal.',
        ],
      },
      {
        id: 'a3',
        name: 'Pasta integral con pollo y brócoli',
        kcal: 520, protein: 40, carbs: 62, fats: 12,
        time: '30 min', tag: 'Completo', servings: '1 plato',
        ingredients: [
          '80 g de pasta integral cruda',
          '120 g de pechuga de pollo en cubos',
          '1 taza de brócoli',
          '1 diente de ajo',
          '2 cdas. de queso rallado',
          'Aceite de oliva, sal y pimienta',
        ],
        steps: [
          'Herví la pasta según el paquete y reservá una taza del agua.',
          'Salteá el pollo con el ajo 6-8 minutos.',
          'Agregá el brócoli en arbolitos chicos y un chorrito del agua de cocción, 4 minutos más.',
          'Mezclá con la pasta, el queso rallado y serví.',
        ],
      },
    ],
  },
  {
    id: 'merienda',
    label: 'Merienda',
    emoji: '🌤️',
    mealType: 'snack',
    recipes: [
      {
        id: 'm1',
        name: 'Tostadas integrales con palta y huevo',
        kcal: 340, protein: 16, carbs: 30, fats: 17,
        time: '15 min', tag: 'Clásico', servings: '2 tostadas',
        ingredients: [
          '2 rodajas de pan integral',
          '1/2 palta',
          '1 huevo',
          'Jugo de limón, sal y pimentón',
        ],
        steps: [
          'Tostá el pan de ambos lados.',
          'Pisá la palta con limón y sal y untala en las tostadas.',
          'Hacé el huevo a la plancha o poché y ponelo encima.',
          'Espolvoreá con pimentón y serví.',
        ],
      },
      {
        id: 'm2',
        name: 'Smoothie de frutos rojos y proteína',
        kcal: 250, protein: 24, carbs: 34, fats: 2,
        time: '5 min', tag: 'Post-entreno', servings: '1 vaso grande',
        ingredients: [
          '150 g de frutos rojos (frescos o congelados)',
          '200 ml de leche descremada',
          '1 medida de proteína (vainilla o frutilla)',
          'Hielo a gusto',
        ],
        steps: [
          'Poné todo en la licuadora.',
          'Licuá 1 minuto hasta lograr textura cremosa.',
          'Serví en vaso alto y tomalo en el momento.',
        ],
      },
      {
        id: 'm3',
        name: 'Panqueques de avena y manzana',
        kcal: 310, protein: 12, carbs: 52, fats: 6,
        time: '20 min', tag: 'Dulce', servings: '3-4 panqueques',
        ingredients: [
          '60 g de avena (o harina de avena)',
          '1 huevo',
          '100 ml de leche',
          '1 manzana rallada',
          '1 cdta. de polvo de hornear',
          'Canela y rocío vegetal',
        ],
        steps: [
          'Mezclá la avena, el huevo, la leche, el polvo de hornear y la canela.',
          'Sumá la manzana rallada y dejá reposar 5 minutos.',
          'Cociná porciones en sartén con rocío vegetal, 2 minutos por lado.',
          'Apilá y serví tibios, con miel si querés.',
        ],
      },
    ],
  },
  {
    id: 'cena',
    label: 'Cena',
    emoji: '🌙',
    mealType: 'dinner',
    recipes: [
      {
        id: 'c1',
        name: 'Salteado de tofu y verduras',
        kcal: 300, protein: 18, carbs: 22, fats: 16,
        time: '20 min', tag: 'Veggie', servings: '1 plato',
        ingredients: [
          '150 g de tofu firme en cubos',
          '1/2 morrón',
          '1 zucchini chico',
          '1 zanahoria en juliana',
          '2 cdas. de salsa de soja',
          'Jengibre rallado y aceite',
        ],
        steps: [
          'Dorá el tofu en sartén bien caliente con un poco de aceite, 5 minutos.',
          'Agregá las verduras y salteá 5-6 minutos, que queden crocantes.',
          'Sumá la soja y el jengibre, mezclá 1 minuto.',
          'Serví solo o con arroz integral.',
        ],
      },
      {
        id: 'c2',
        name: 'Merluza al horno con ensalada',
        kcal: 340, protein: 36, carbs: 10, fats: 17,
        time: '25 min', tag: 'Liviano', servings: '1 plato',
        ingredients: [
          '2 filetes de merluza',
          '1 limón',
          '1 diente de ajo picado',
          'Perejil fresco',
          'Ensalada de hojas y tomate para acompañar',
          'Aceite de oliva y sal',
        ],
        steps: [
          'Calentá el horno a 200 °C.',
          'Poné los filetes en una fuente con oliva, ajo, sal y rodajas de limón.',
          'Horneá 12-15 minutos hasta que estén opacos.',
          'Serví con perejil fresco y la ensalada.',
        ],
      },
      {
        id: 'c3',
        name: 'Pechuga grillada con calabaza',
        kcal: 380, protein: 42, carbs: 22, fats: 14,
        time: '30 min', tag: 'Alto en proteína', servings: '1 plato',
        ingredients: [
          '150 g de pechuga de pollo',
          '300 g de calabaza en cubos',
          'Romero fresco',
          '2 cdas. de aceite de oliva',
          'Sal y pimienta',
        ],
        steps: [
          'Calentá el horno a 200 °C y horneá la calabaza con oliva, romero y sal 25 minutos.',
          'Mientras tanto, grillá la pechuga 6-7 minutos por lado.',
          'Dejá reposar el pollo 3 minutos y cortalo en fetas.',
          'Serví junto a la calabaza asada.',
        ],
      },
    ],
  },
]

export function findRecipe(id: string): { section: RecipeSection; recipe: Recipe } | null {
  for (const section of RECIPE_SECTIONS) {
    const recipe = section.recipes.find((r) => r.id === id)
    if (recipe) return { section, recipe }
  }
  return null
}
