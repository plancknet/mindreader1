export interface Theme {
  id: string;
  name: string;
  words: string[];
  emoji: string;
}

export const themes: Theme[] = [
  {
    id: 'countries',
    name: 'Países',
    emoji: '🌍',
    words: [
      'Brasil', 'Argentina', 'França', 'Itália',
      'Japão', 'China', 'Canadá', 'México',
      'Portugal', 'Espanha', 'Alemanha', 'Inglaterra',
      'Austrália', 'Índia', 'Rússia', 'Egito'
    ]
  },
  {
    id: 'fruits',
    name: 'Frutas',
    emoji: '🍎',
    words: [
      'Maçã', 'Banana', 'Laranja', 'Uva',
      'Morango', 'Abacaxi', 'Manga', 'Melancia',
      'Pera', 'Kiwi', 'Limão', 'Pêssego',
      'Cereja', 'Melão', 'Framboesa', 'Amora'
    ]
  },
  {
    id: 'animals',
    name: 'Animais',
    emoji: '🦁',
    words: [
      'Leão', 'Tigre', 'Elefante', 'Girafa',
      'Cachorro', 'Gato', 'Cavalo', 'Coelho',
      'Panda', 'Urso', 'Lobo', 'Raposa',
      'Águia', 'Golfinho', 'Baleia', 'Tartaruga'
    ]
  }
];
