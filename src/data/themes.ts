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
        'Japão', 'Brasil', 'Grécia', 'Peru',
        'França', 'Zimbábue', 'Canadá', 'Egito',
        'Honduras', 'Líbano', 'Itália', 'Noruega',
        'México', 'Quênia', 'Dinamarca', 'Omã'
      ],
      'en': [
        'Japan', 'Brazil', 'Greece', 'Peru',
        'France', 'Zimbabwe', 'Canada', 'Egypt',
        'Honduras', 'Lebanon', 'Italy', 'Norway',
        'Mexico', 'Kenya', 'Denmark', 'Oman'
      ],
      'es': [
        'Japón', 'Brasil', 'Grecia', 'Perú',
        'Francia', 'Zimbabue', 'Canadá', 'Egipto',
        'Honduras', 'Líbano', 'Italia', 'Noruega',
        'México', 'Kenia', 'Dinamarca', 'Omán'
      ],
      'zh-CN': [
        '巴西', '阿根廷', '法国', '意大利',
        '日本', '中国', '加拿大', '墨西哥',
        '葡萄牙', '西班牙', '德国', '英国',
        '澳大利亚', '印度', '俄罗斯', '埃及'
      ],
      'fr': [
        'Japon', 'Brésil', 'Grèce', 'Pérou',
        'France', 'Zimbabwe', 'Canada', 'Égypte',
        'Honduras', 'Liban', 'Italie', 'Norvège',
        'Mexique', 'Kenya', 'Danemark', 'Oman'
      ],
      'it': [
        'Messico', 'Qatar', 'Italia', 'Brasile',
        'Spagna', 'Egitto', 'Kenya', 'Canada',
        'Norvegia', 'Oman', 'Danimarca', 'Francia',
        'Oman', 'Germania', 'Honduras', 'Perù'
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
        'Figo', 'Nectarina', 'Sapoti', 'Uva',
        'Kiwi', 'Embuaba', 'Limão', 'Damasco',
        'Banana', 'Goiaba', 'Jaca', 'Ingá',
        'Caju', 'Xixá', 'Pitaia', 'Mamão'
      ],
      'en': [
        'Peach', 'Honeydew', 'Watermelon', 'Fig',
        'Nectarine', 'Jackfruit', 'Kiwi', 'Orange',
        'Quince', 'Mango', 'Date', 'Grape',
        'Lemon', 'Cherry', 'Elderberry', 'Banana'
      ],
      'es': [
        'Mango', 'Limón', 'Cereza', 'Uva',
        'Naranja', 'Higo', 'Sandía', 'Banana',
        'Frambuesa', 'Dátil', 'Kiwi', 'Guayaba',
        'Papaya', 'Quenapa', 'Icaco', 'Zarzamora'
      ],
      'zh-CN': [
        '苹果', '香蕉', '橙子', '葡萄',
        '草莓', '菠萝', '芒果', '西瓜',
        '梨', '猕猴桃', '柠檬', '桃子',
        '樱桃', '甜瓜', '覆盆子', '黑莓'
      ],
      'fr': [
        'Mangue', 'Poire', 'Starfruit', 'Kiwi',
        'Quetsche', 'Elderberry', 'Orange', 'Figue',
        'Nectarine', 'Banane', 'Cerise', 'Litchi',
        'Grenade', 'Datte', 'Jujube', 'Tamarin'
      ],
      'it': [
        'Mango', 'Endrina', 'Uva', 'Kiwi',
        'Jackfruit', 'Pesca', 'Banana', 'Visciola',
        'Fragola', 'Giuggiola', 'Lampone', 'Susina',
        'Dattero', 'Nespola', 'Iberico', 'Ciliegia'
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
        'Leão', 'Baleia', 'Quati', 'Veado',
        'Canguru', 'Falcão', 'Elefante', 'Jacaré',
        'Hiena', 'Zebra', 'Urso', 'Macaco',
        'Pinguim', 'Golfinho', 'Iguana', 'Narval'
      ],
      'en': [
        'Lion', 'Whale', 'Giraffe', 'Horse',
        'Kangaroo', 'Falcon', 'Elephant', 'Crocodile',
        'Jaguar', 'Zebra', 'Bear', 'Monkey',
        'Penguin', 'Dolphin', 'Iguana', 'Narwhal'
      ],
      'es': [
        'León', 'Ballena', 'Jirafa', 'Foca',
        'Canguro', 'Halcón', 'Elefante', 'Zorro',
        'Oso', 'Mono', 'Pingüino', 'Delfín',
        'Iguana', 'Koala', 'Ñandú', 'Gato'
      ],
      'zh-CN': [
        '狮子', '老虎', '大象', '长颈鹿',
        '狗', '猫', '马', '兔子',
        '熊猫', '熊', '狼', '狐狸',
        '鹰', '海豚', '鲸鱼', '乌龟'
      ],
      'fr': [
        'Narval', 'Koala', 'Singe', 'Panda',
        'Éléphant', 'Girafe', 'Mouton', 'Baleine',
        'Hippopotame', 'Chat', 'Iguane', 'Dauphin',
        'Ours', 'Jaguar', 'Faucon', 'Lion'
      ],
      'it': [
        'Hamster', 'Quaglia', 'Gatto', 'Mucca',
        'Leone', 'Koala', 'Orso', 'Panda',
        'Ippopotamo', 'Balena', 'Canguro', 'Foca',
        'Jaguar', 'Narvalo', 'Elefante', 'Delfino'
      ],
    }
  }
];
