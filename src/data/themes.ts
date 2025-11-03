export interface Theme {
  id: string;
  emoji: string;
  name: Record<string, string>;
  words: Record<string, string[]>;
}

export const themes: Theme[] = [
  {
    id: 'countries',
    emoji: '🌍',
    name: {
      'pt-BR': 'Países',
      'en': 'Countries',
      'es': 'Países',
      'zh-CN': '国家',
      'fr': 'Pays',
      'it': 'Paesi',
    },
    words: {
      'pt-BR': [
        'Brasil', 'Argentina', 'França', 'Itália',
        'Japão', 'China', 'Canadá', 'México',
        'Portugal', 'Espanha', 'Alemanha', 'Inglaterra',
        'Austrália', 'Índia', 'Rússia', 'Egito'
      ],
      'en': [
        'Brazil', 'Argentina', 'France', 'Italy',
        'Japan', 'China', 'Canada', 'Mexico',
        'Portugal', 'Spain', 'Germany', 'England',
        'Australia', 'India', 'Russia', 'Egypt'
      ],
      'es': [
        'Brasil', 'Argentina', 'Francia', 'Italia',
        'Japón', 'China', 'Canadá', 'México',
        'Portugal', 'España', 'Alemania', 'Inglaterra',
        'Australia', 'India', 'Rusia', 'Egipto'
      ],
      'zh-CN': [
        '巴西', '阿根廷', '法国', '意大利',
        '日本', '中国', '加拿大', '墨西哥',
        '葡萄牙', '西班牙', '德国', '英国',
        '澳大利亚', '印度', '俄罗斯', '埃及'
      ],
      'fr': [
        'Brésil', 'Argentine', 'France', 'Italie',
        'Japon', 'Chine', 'Canada', 'Mexique',
        'Portugal', 'Espagne', 'Allemagne', 'Angleterre',
        'Australie', 'Inde', 'Russie', 'Égypte'
      ],
      'it': [
        'Brasile', 'Argentina', 'Francia', 'Italia',
        'Giappone', 'Cina', 'Canada', 'Messico',
        'Portogallo', 'Spagna', 'Germania', 'Inghilterra',
        'Australia', 'India', 'Russia', 'Egitto'
      ],
    }
  },
  {
    id: 'fruits',
    emoji: '🍎',
    name: {
      'pt-BR': 'Frutas',
      'en': 'Fruits',
      'es': 'Frutas',
      'zh-CN': '水果',
      'fr': 'Fruits',
      'it': 'Frutta',
    },
    words: {
      'pt-BR': [
        'Maçã', 'Banana', 'Laranja', 'Uva',
        'Morango', 'Abacaxi', 'Manga', 'Melancia',
        'Pera', 'Kiwi', 'Limão', 'Pêssego',
        'Cereja', 'Melão', 'Framboesa', 'Amora'
      ],
      'en': [
        'Apple', 'Banana', 'Orange', 'Grape',
        'Strawberry', 'Pineapple', 'Mango', 'Watermelon',
        'Pear', 'Kiwi', 'Lemon', 'Peach',
        'Cherry', 'Melon', 'Raspberry', 'Blackberry'
      ],
      'es': [
        'Manzana', 'Plátano', 'Naranja', 'Uva',
        'Fresa', 'Piña', 'Mango', 'Sandía',
        'Pera', 'Kiwi', 'Limón', 'Durazno',
        'Cereza', 'Melón', 'Frambuesa', 'Mora'
      ],
      'zh-CN': [
        '苹果', '香蕉', '橙子', '葡萄',
        '草莓', '菠萝', '芒果', '西瓜',
        '梨', '猕猴桃', '柠檬', '桃子',
        '樱桃', '甜瓜', '覆盆子', '黑莓'
      ],
      'fr': [
        'Pomme', 'Banane', 'Orange', 'Raisin',
        'Fraise', 'Ananas', 'Mangue', 'Pastèque',
        'Poire', 'Kiwi', 'Citron', 'Pêche',
        'Cerise', 'Melon', 'Framboise', 'Mûre'
      ],
      'it': [
        'Mela', 'Banana', 'Arancia', 'Uva',
        'Fragola', 'Ananas', 'Mango', 'Anguria',
        'Pera', 'Kiwi', 'Limone', 'Pesca',
        'Ciliegia', 'Melone', 'Lampone', 'Mora'
      ],
    }
  },
  {
    id: 'animals',
    emoji: '🦁',
    name: {
      'pt-BR': 'Animais',
      'en': 'Animals',
      'es': 'Animales',
      'zh-CN': '动物',
      'fr': 'Animaux',
      'it': 'Animali',
    },
    words: {
      'pt-BR': [
        'Leão', 'Tigre', 'Elefante', 'Girafa',
        'Cachorro', 'Gato', 'Cavalo', 'Coelho',
        'Panda', 'Urso', 'Lobo', 'Raposa',
        'Águia', 'Golfinho', 'Baleia', 'Tartaruga'
      ],
      'en': [
        'Lion', 'Tiger', 'Elephant', 'Giraffe',
        'Dog', 'Cat', 'Horse', 'Rabbit',
        'Panda', 'Bear', 'Wolf', 'Fox',
        'Eagle', 'Dolphin', 'Whale', 'Turtle'
      ],
      'es': [
        'León', 'Tigre', 'Elefante', 'Jirafa',
        'Perro', 'Gato', 'Caballo', 'Conejo',
        'Panda', 'Oso', 'Lobo', 'Zorro',
        'Águila', 'Delfín', 'Ballena', 'Tortuga'
      ],
      'zh-CN': [
        '狮子', '老虎', '大象', '长颈鹿',
        '狗', '猫', '马', '兔子',
        '熊猫', '熊', '狼', '狐狸',
        '鹰', '海豚', '鲸鱼', '乌龟'
      ],
      'fr': [
        'Lion', 'Tigre', 'Éléphant', 'Girafe',
        'Chien', 'Chat', 'Cheval', 'Lapin',
        'Panda', 'Ours', 'Loup', 'Renard',
        'Aigle', 'Dauphin', 'Baleine', 'Tortue'
      ],
      'it': [
        'Leone', 'Tigre', 'Elefante', 'Giraffa',
        'Cane', 'Gatto', 'Cavallo', 'Coniglio',
        'Panda', 'Orso', 'Lupo', 'Volpe',
        'Aquila', 'Delfino', 'Balena', 'Tartaruga'
      ],
    }
  }
];
