// src/lib/constants.ts

export const ONBOARDING_GOALS = [
  { id: 'lose_weight', label: 'Perder peso' },
  { id: 'healthy_eating', label: 'Comer más sano sin perder peso' },
  { id: 'gain_weight', label: 'Ganar peso' },
  { id: 'muscle_gain', label: 'Ganar masa muscular' },
  { id: 'other', label: 'Otro' },
];

export const ONBOARDING_QUESTIONS: Record<string, any[]> = {
  lose_weight: [
    {
      id: 'reason_lose_weight',
      type: 'multiple_choice',
      question: '¿Por qué elegiste perder peso?',
      options: ['Salud', 'Estética', 'Rendimiento', 'Recomendación médica', 'Otro']
    },
    {
      id: 'expectations',
      type: 'multiple_choice',
      multiple: true,
      question: '¿Qué esperás conseguir además del cambio de peso?',
      options: ['Más energía', 'Dormir mejor', 'Sentirme más ligero', 'Mejorar mi digestión']
    },
    {
      id: 'experience',
      type: 'multiple_choice',
      question: '¿Tenés experiencia intentando perder peso anteriormente?',
      options: ['Sí, lo conseguí', 'Sí, pero recuperé el peso', 'Lo intenté sin éxito', 'Nunca lo intenté']
    },
    {
      id: 'hardest_part',
      type: 'multiple_choice',
      multiple: true,
      question: '¿Qué fue lo más difícil? (Podés elegir varias)',
      options: ['Controlar el hambre', 'Organizar comidas', 'Ser constante', 'Eventos sociales']
    },
    {
      id: 'timeframe',
      type: 'multiple_choice',
      question: '¿En cuánto tiempo te gustaría empezar a notar cambios?',
      options: ['1 mes', '3 meses', '6 meses', '1 año', 'Personalizado']
    }
  ],
  healthy_eating: [
    {
      id: 'reason_healthy',
      type: 'multiple_choice',
      question: '¿Por qué querés comer más sano?',
      options: ['Mejorar la salud a largo plazo', 'Sentirme con más vitalidad', 'Problemas digestivos', 'Otro']
    },
    {
      id: 'meaning_healthy',
      type: 'multiple_choice',
      multiple: true,
      question: '¿Qué es lo que más te cuesta al intentar comer mejor?',
      options: ['Falta de tiempo', 'No sé qué cocinar', 'Antojos dulces', 'Comer por ansiedad']
    },
    {
      id: 'habits_to_improve',
      type: 'multiple_choice',
      multiple: true,
      question: '¿Qué hábitos te gustaría cambiar?',
      options: ['Comer muchos ultraprocesados', 'Poca verdura', 'Comer a deshoras', 'Exceso de azúcar']
    }
  ],
  gain_weight: [
    {
      id: 'reason_gain_weight',
      type: 'multiple_choice',
      question: '¿Por qué querés ganar peso?',
      options: ['Por salud', 'Para sentirme mejor con mi cuerpo', 'Por un deporte', 'Otro']
    },
    {
      id: 'hardest_part_gain',
      type: 'multiple_choice',
      multiple: true,
      question: '¿Te cuesta comer suficiente cantidad? (Podés elegir varias)',
      options: ['Sí, enseguida me lleno', 'Sí, me olvido de comer', 'No, pero no subo de peso']
    }
  ],
  muscle_gain: [
    {
      id: 'training_status',
      type: 'multiple_choice',
      question: '¿Entrenás actualmente?',
      options: ['Sí', 'No, pero voy a empezar', 'No']
    },
    {
      id: 'training_type',
      type: 'multiple_choice',
      question: '¿Qué tipo de entrenamiento realizás?',
      options: ['Pesas en gimnasio', 'Calistenia / Peso corporal', 'Crossfit / Funcional', 'Otro']
    },
    {
      id: 'hardest_part_muscle',
      type: 'multiple_choice',
      multiple: true,
      question: '¿Qué es lo que más te cuesta? (Podés elegir varias)',
      options: ['Consumir suficiente proteína', 'Comer suficientes calorías', 'Ser constante con el entrenamiento', 'Descansar bien']
    }
  ],
  other: [
    {
      id: 'other_goal_desc',
      type: 'text',
      question: 'Contanos qué querés conseguir.'
    },
    {
      id: 'other_motivation',
      type: 'multiple_choice',
      question: '¿Qué te motiva?',
      options: ['Salud general', 'Deporte', 'Bienestar mental', 'Otro']
    }
  ]
};

// Preguntas comunes
export const COMMON_QUESTIONS = {
  secondary_goals: {
    id: 'secondary_goals',
    type: 'multiple_choice',
    multiple: true,
    question: 'Además de tu objetivo principal, ¿qué te gustaría mejorar?',
    options: [
      'Dormir mejor', 'Tener más energía', 'Comer más saludable', 
      'Mejorar mi rendimiento deportivo', 'Beber más agua', 'Crear mejores hábitos',
      'Ser más constante', 'Mejorar mi relación con la comida', 
      'Reducir el consumo de ultraprocesados', 'Otro'
    ]
  },
  motivation: {
    id: 'motivation',
    type: 'multiple_choice',
    question: '¿Qué te motiva a conseguir este objetivo?',
    options: [
      'Sentirme mejor conmigo mismo', 'Salud', 'Rendimiento deportivo', 
      'Un evento especial', 'Ropa', 'Cambiar mis hábitos', 
      'Recomendación profesional', 'Otro'
    ]
  },
  review_date: {
    id: 'review_date',
    type: 'multiple_choice',
    question: '¿Cuándo querés revisar tu progreso?',
    options: ['4 semanas', '8 semanas', '12 semanas', '6 meses', '1 año', 'Elegir fecha']
  }
};
