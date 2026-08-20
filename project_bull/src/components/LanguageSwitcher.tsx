import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLang = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
    localStorage.setItem('bull_lang', newLang);
  };

  return (
    <button
      onClick={toggleLang}
      title={i18n.language === 'fr' ? 'Switch to English' : 'Passer en Français'}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
    >
      <Globe className="w-4 h-4" />
      <span className="uppercase font-bold text-xs">{i18n.language === 'fr' ? 'EN' : 'FR'}</span>
    </button>
  );
};
