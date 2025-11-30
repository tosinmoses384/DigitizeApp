import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useI18n } from "@hooks/use-i18n";

interface IPhotoTips {
  onPhotoTipsPress?: () => void;
  style?: any;
}

const PhotoTips = ({ onPhotoTipsPress, style }: IPhotoTips) => {
  const { t } = useI18n();
  
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.description}>
        {t('photoTips.formatInfo')}
      </Text>
      <Text style={styles.recommendation}>
        {t('photoTips.flatLayInfo')}
      </Text>
      <TouchableOpacity onPress={onPhotoTipsPress}>
        <Text style={styles.photoTipsLink}>{t('photoTips.seePhotoTips')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PhotoTips;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 8,
    flexShrink: 0,
  },
  description: {
    color: "#90959E",
    fontFamily: "DMSans",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
  },
  recommendation: {
    color: "#637381",
    fontFamily: "DMSans",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
  },
  photoTipsLink: {
    color: "#D4313E",
    fontFamily: "DM Sans",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
    textDecorationLine: "underline",
  },
});
