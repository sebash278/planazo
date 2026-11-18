export type EventCategory =
  | 'todos'
  | 'musica'
  | 'cine'
  | 'gastronomia'
  | 'deportes'
  | 'arte'
  | 'cultura'
  | 'entretenimiento'
  | 'actividad_fisica'
  | 'teatro'
  | 'ecologia';

export interface Category {
  id: EventCategory;
  name: string;
  label: string;
  icon: string;
  materialIcon: string;
  description?: string;
}

export const PLANAZO_CATEGORIES: Category[] = [
  {
    id: 'musica',
    name: 'Música',
    label: 'Música en Vivo',
    icon: '🎵',
    materialIcon: 'music_note',
    description: 'Conciertos, festivales y presentaciones musicales en vivo.',
  },
  {
    id: 'cine',
    name: 'Cine',
    label: 'Cine',
    icon: '🎬',
    materialIcon: 'movie',
    description: 'Proyecciones al aire libre, ciclos de cine y estrenos.',
  },
  {
    id: 'gastronomia',
    name: 'Gastronomía',
    label: 'Gastronomía',
    icon: '🥘',
    materialIcon: 'restaurant',
    description: 'Ferias gastronómicas, degustaciones y cocina local.',
  },
  {
    id: 'deportes',
    name: 'Deportes',
    label: 'Deportes',
    icon: '⚽',
    materialIcon: 'directions_run',
    description: 'Carreras atléticas, torneos y encuentros deportivos.',
  },
  {
    id: 'arte',
    name: 'Arte',
    label: 'Arte & Exposiciones',
    icon: '🎨',
    materialIcon: 'palette',
    description: 'Galerías, exposiciones visuales y talleres artísticos.',
  },
  {
    id: 'cultura',
    name: 'Cultura',
    label: 'Cultura',
    icon: '🏛️',
    materialIcon: 'museum',
    description: 'Patrimonio, ferias tradicionales y memoria histórica.',
  },
  {
    id: 'entretenimiento',
    name: 'Entretenimiento',
    label: 'Entretenimiento',
    icon: '🎡',
    materialIcon: 'celebration',
    description: 'Espectáculos familiares, comedia y eventos recreativos.',
  },
  {
    id: 'actividad_fisica',
    name: 'Actividad física',
    label: 'Actividad Física',
    icon: '🧘',
    materialIcon: 'fitness_center',
    description: 'Jornadas de bienestar, caminatas, yoga y ciclovías.',
  },
  {
    id: 'teatro',
    name: 'Teatro',
    label: 'Danza & Teatro',
    icon: '🎭',
    materialIcon: 'theater_comedy',
    description: 'Obras teatrales, danza folclórica y artes escénicas.',
  },
  {
    id: 'ecologia',
    name: 'Ecología',
    label: 'Ecología & Naturaleza',
    icon: '🌾',
    materialIcon: 'nature_people',
    description: 'Avistamiento de aves, senderismo y cuidado ambiental.',
  },
];
