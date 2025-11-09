export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const languages: Language[] = [
  { code: 'pt-BR', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  // Uncomment to reactivate other languages:
  // { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  // { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  // { code: 'zh-CN', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  // { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  // { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];

export const DEFAULT_LANGUAGE = 'pt-BR';

export const START_WORDS: Record<string, string> = {
  'pt-BR': 'INICIAR',
  'en': 'START',
  'es': 'INICIAR',
  'zh-CN': '开始',
  'fr': 'INITIER',
  'it': 'INIZIA',
};
