import type { TranslationMessages } from '../types/i18n';

export const flattenMessages = (
  nestedMessages: TranslationMessages,
  prefix = ''
): Record<string, string> => {
  return Object.keys(nestedMessages).reduce((messages, key) => {
    const value = nestedMessages[key];
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      messages[prefixedKey] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(messages, flattenMessages(value as TranslationMessages, prefixedKey));
    }

    return messages;
  }, {} as Record<string, string>);
};

export default flattenMessages;

