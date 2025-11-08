import { useLanguageContext } from '@/contexts/LanguageContext';
import { DEFAULT_LANGUAGE } from '@/i18n/languages';
import { ptBR } from '@/i18n/translations/pt-BR';
import { en } from '@/i18n/translations/en';
import { es } from '@/i18n/translations/es';
import { zhCN } from '@/i18n/translations/zh-CN';
import { fr } from '@/i18n/translations/fr';
import { it } from '@/i18n/translations/it';

const translations: Record<string, typeof ptBR> = {
  'pt-BR': ptBR,
  'en': en,
  'es': es,
  'zh-CN': zhCN,
  'fr': fr,
  'it': it,
};

export const useTranslation = () => {
  const { language } = useLanguageContext();
  const fallbackLanguage = DEFAULT_LANGUAGE;

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language] || translations[fallbackLanguage];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to default language
        value = translations[fallbackLanguage];
        for (const fallbackKey of keys) {
          value = value?.[fallbackKey];
          if (value === undefined) return key;
        }
        break;
      }
    }

    if (typeof value !== 'string') return key;

    // Replace variables
    if (vars) {
      return Object.entries(vars).reduce((str, [varKey, varValue]) => {
        return str.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(varValue));
      }, value);
    }

    return value;
  };

  return { t, language };
};
