import React, { useMemo } from 'react';
import { Text, TextProps } from 'react-native';
import { useI18n } from '../hooks/use-i18n';

interface TranslatedTextProps extends TextProps {
  translationKey: string;
  values?: Record<string, any>;
}

export const TranslatedText: React.FC<TranslatedTextProps> = React.memo(({
  translationKey,
  values,
  style,
  ...textProps
}) => {
  const { t, locale } = useI18n();

  const translatedText = useMemo(
    () => t(translationKey, values),
    [t, translationKey, values, locale]
  );

  return (
    <Text style={style} {...textProps}>
      {translatedText}
    </Text>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.translationKey === nextProps.translationKey &&
    JSON.stringify(prevProps.values) === JSON.stringify(nextProps.values) &&
    prevProps.style === nextProps.style
  );
});

TranslatedText.displayName = 'TranslatedText';

export default TranslatedText;

