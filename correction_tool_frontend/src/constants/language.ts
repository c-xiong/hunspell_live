export const LANGUAGE_OPTIONS = [
  { label: "English", value: "en" },
  { label: "Español", value: "es" },
  { label: "Français", value: "fr" },
  { label: "Deutsch", value: "de" },
  { label: "Italiano", value: "it" },
  { label: "Português", value: "pt" },
] as const;

export const LANGUAGE_CODE_MAP: Record<string, string> = {
  'en': 'en_US',
  'es': 'es_ES',
  'fr': 'fr_FR',
  'de': 'de_DE',
  'it': 'it_IT',
  'pt': 'pt_PT'
};

export const SPECIAL_CHARACTERS: Record<string, string[]> = {
  en: [],
  es: ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü'],
  fr: ['à', 'â', 'ç', 'é', 'è', 'ê', 'ë', 'î', 'ï', 'ô', 'ù', 'û', 'ü', 'ÿ'],
  de: ['ä', 'ö', 'ü', 'ß'],
  it: ['à', 'è', 'é', 'ì', 'î', 'ò', 'ù'],
  pt: ['á', 'â', 'ã', 'ç', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú'],
}; 