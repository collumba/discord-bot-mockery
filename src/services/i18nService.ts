import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

// Type for translation objects
interface TranslationDictionary {
  [key: string]: string;
}

// Object to store loaded translations
const translations: {
  [lang: string]: TranslationDictionary;
} = {};

// Default language to fallback to
const DEFAULT_LANG = 'pt';

/**
 * Loads translations for a specific language
 * @param lang Language code to load
 * @returns Whether the load was successful
 */
function loadTranslations(lang: string): boolean {
  try {
    const localesPath = path.join(__dirname, '../locales', lang);

    // Check if language directory exists
    if (!fs.existsSync(localesPath)) {
      logger.warn(`i18n: Language directory not found: ${lang}`);
      return false;
    }

    // Initialize language if not already loaded
    if (!translations[lang]) {
      translations[lang] = {};
    }

    // Read all JSON files in the language directory
    const files = fs.readdirSync(localesPath).filter((file) => file.endsWith('.json'));

    for (const file of files) {
      try {
        const filePath = path.join(localesPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(content);

        // Merge translations from this file
        translations[lang] = { ...translations[lang], ...parsed };
        logger.debug(`i18n: Loaded ${file} for language ${lang}`);
      } catch (error) {
        logger.error(`i18n: Error loading translation file ${file} for ${lang}`, error as Error);
      }
    }

    return true;
  } catch (error) {
    logger.error(`i18n: Failed to load translations for ${lang}`, error as Error);
    return false;
  }
}

/**
 * Replaces placeholders in a string with provided values
 * @param text Text containing placeholders like {name}
 * @param replacements Object with key-value pairs for replacements
 * @returns Text with replaced placeholders
 */
function replacePlaceholders(text: string, replacements?: Record<string, any>): string {
  if (!replacements) return text;

  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return replacements[key] !== undefined ? String(replacements[key]) : match;
  });
}

/**
 * Get translation for a specific key
 * @param key Translation key (e.g. 'commands.zoar.success')
 * @param lang Language code (defaults to 'pt')
 * @param placeholders Object with values to replace in the translation
 * @returns Translated string
 */
export function t(
  key: string,
  placeholders?: Record<string, any>,
  lang: string = DEFAULT_LANG
): string {
  // Try to load the language if not already loaded
  if (!translations[lang] && !loadTranslations(lang)) {
    // If loading fails and it's not the default language, try to use default
    if (lang !== DEFAULT_LANG) {
      logger.warn(`i18n: Falling back to ${DEFAULT_LANG} for language ${lang}`);
      return t(key, placeholders, lang);
    }
  }

  // Get translation
  const translation = translations[lang]?.[key];

  // If translation doesn't exist
  if (!translation) {
    // Try default language if not already using it
    if (lang !== DEFAULT_LANG) {
      logger.warn(
        `i18n: Key "${key}" not found in language ${lang}, falling back to ${DEFAULT_LANG}`
      );
      return t(key, placeholders, DEFAULT_LANG);
    }

    // No translation found even in default language, return the key itself
    logger.warn(`i18n: Translation key not found: ${key}`);
    return key;
  }

  // Replace placeholders and return the translation
  return replacePlaceholders(translation, placeholders);
}

/**
 * Initialize the i18n service by preloading specified languages
 * @param languages Array of language codes to preload
 */
export function initI18n(languages: string[] = [DEFAULT_LANG]): void {
  logger.info('Initializing i18n service...');

  for (const lang of languages) {
    if (loadTranslations(lang)) {
      logger.info(`i18n: Loaded translations for ${lang}`);
    } else {
      logger.error(`i18n: Failed to load translations for ${lang}`);
    }
  }
}

export default {
  t,
  initI18n,
};
