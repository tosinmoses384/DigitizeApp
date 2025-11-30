import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import FontAwesome from "react-native-vector-icons/FontAwesome5";
import CustomButton from "@components/CustomButton";
import SearchInput from "@components/SearchInput";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { useI18n } from "@hooks/use-i18n";
import type { SupportedLocale, LanguageOption } from "../../types/i18n";

// Supported languages for the app
const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
];

interface LanguageItemProps {
  item: LanguageOption;
  isSelected: boolean;
  onPress: (code: SupportedLocale) => void;
}

const LanguageItem: React.FC<LanguageItemProps> = React.memo(({ item, isSelected, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(item.code);
  }, [item.code, onPress]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.listView,
        { opacity: pressed ? 0.5 : 1 },
      ]}
      onPress={handlePress}
      accessibilityLabel={`Select ${item.name}`}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
    >
      <View style={styles.languageInfo}>
        <Text style={styles.flag}>{item.flag}</Text>
        <View>
          <Text style={styles.listText}>{item.name}</Text>
          <Text style={styles.nativeText}>{item.nativeName}</Text>
        </View>
      </View>
      <View
        style={
          isSelected
            ? styles.listSelectionActive
            : styles.listSelection
        }
      >
        <FontAwesome
          color="white"
          name="check"
          style={!isSelected && { display: "none" }}
          size={8}
        />
      </View>
    </Pressable>
  );
});

LanguageItem.displayName = 'LanguageItem';

const SelectLanguages: React.FC = () => {
  const { locale, changeLanguage, t } = useI18n();
  const [search, setSearch] = useState("");
  const [selectedLocale, setSelectedLocale] = useState<SupportedLocale>(locale);
  const [isSaving, setIsSaving] = useState(false);

  // Filter languages based on search
  const filteredLanguages = useMemo(() => {
    if (!search.trim()) {
      return SUPPORTED_LANGUAGES;
    }
    
    const searchLower = search.toLowerCase();
    return SUPPORTED_LANGUAGES.filter((lang) =>
      lang.name.toLowerCase().includes(searchLower) ||
      lang.nativeName.toLowerCase().includes(searchLower)
    );
  }, [search]);

  // Handle language selection
  const handleSelectLanguage = useCallback((code: SupportedLocale) => {
    setSelectedLocale(code);
  }, []);

  // Handle save button
  const handleSave = useCallback(async () => {
    if (selectedLocale === locale) {
      router.push("/settings");
      return;
    }

    setIsSaving(true);
    
    try {
      await changeLanguage(selectedLocale);
      
      if (__DEV__) {
        console.log(`✅ Language changed to: ${selectedLocale}`);
      }
      
      // Navigate back after successful save
      setTimeout(() => {
        router.push("/settings");
      }, 300);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to save language:', error);
      }
    } finally {
      setIsSaving(false);
    }
  }, [selectedLocale, locale, changeLanguage]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.push("/settings");
  }, []);

  // Memoized render item
  const renderItem = useCallback(({ item }: { item: LanguageOption }) => (
    <LanguageItem
      item={item}
      isSelected={selectedLocale === item.code}
      onPress={handleSelectLanguage}
    />
  ), [selectedLocale, handleSelectLanguage]);

  // Memoized key extractor
  const keyExtractor = useCallback((item: LanguageOption) => item.code, []);

  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={t('settings.language')}
          onPress={handleBack}
          isShowHeaderShadow
        />
        <View style={styles.saveButtonView}>
          {isSaving ? (
            <View style={styles.saveButton}>
              <ActivityIndicator size="small" color="#212C3D" />
            </View>
          ) : (
            <CustomButton
              title={t('common.save')}
              textStyle={styles.saveText}
              buttonStyle={styles.saveButton}
              onPress={handleSave}
              disabled={isSaving}
            />
          )}
        </View>
      </View>
      <Text style={styles.selectLanguageTitle}>
        {t('settings.selectPreferredLanguage')}
      </Text>
      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('common.search')}
        />
      </View>
      <View style={styles.bodyContainer}>
        {filteredLanguages.length > 0 ? (
          <FlatList
            style={styles.flatListContainer}
            showsVerticalScrollIndicator={false}
            data={filteredLanguages}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t('common.noResults')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default SelectLanguages;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
    paddingBottom: 10,
  },
  saveButtonView: {
    position: "absolute",
    top: 12,
    right: 16,
  },
  bodyContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flex: 1,
  },
  saveButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  saveText: {
    color: "#212C3D",
    fontSize: 14,
    fontFamily: "DMSansSemiBold",
  },
  selectLanguageTitle: {
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#464F5D",
    fontFamily: "DMSansRegular",
  },
  flatListContainer: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
  },
  listView: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flag: {
    fontSize: 32,
  },
  listText: {
    fontSize: 14,
    color: "#212B36",
    fontFamily: "DMSansMedium",
    marginBottom: 2,
  },
  nativeText: {
    fontSize: 12,
    color: "#90959E",
    fontFamily: "DMSansRegular",
  },
  listSelection: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: "#90959E",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  listSelectionActive: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: "#FF3B4A",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF3B4A",
  },
  emptyContainer: {
    backgroundColor: "white",
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#90959E",
    fontFamily: "DMSansRegular",
    textAlign: "center",
  },
});
