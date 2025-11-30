import React, { useMemo } from 'react';
import { Text, TextProps } from 'react-native';
import { useI18n } from '../hooks/use-i18n';

interface SafeTextProps extends TextProps {
  translationKey: string;
  fallbackText?: string;
  values?: Record<string, any>;
}

export const SafeText: React.FC<SafeTextProps> = React.memo(({
  translationKey,
  fallbackText,
  values,
  style,
  ...restProps
}) => {
  const { t } = useI18n();

  const translatedText = useMemo(() => {
    try {
      return t(translationKey, values, fallbackText);
    } catch (error) {
      if (__DEV__) {
        console.error(`SafeText error for key "${translationKey}":`, error);
      }
      return fallbackText || translationKey.split('.').pop() || '';
    }
  }, [t, translationKey, values, fallbackText]);

  return (
    <Text style={style} {...restProps}>
      {translatedText}
    </Text>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.translationKey === nextProps.translationKey &&
    JSON.stringify(prevProps.values) === JSON.stringify(nextProps.values) &&
    prevProps.style === nextProps.style &&
    prevProps.fallbackText === nextProps.fallbackText
  );
});

SafeText.displayName = 'SafeText';

export default SafeText;

