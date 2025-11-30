import React, { useState, useEffect } from "react";
import { View, Text, Platform, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Colors, SIZES } from "../constants/Colors";
import StackHeader from "../components/StackHeader";
import ContentSwitch from "../components/ContentSwitch";
import { router } from "expo-router";
import privacyService from "../services/privacyService";
import { useAppSelector } from "../redux/store";
import { useI18n } from "@hooks/use-i18n";

const WardrobePrivacy = () => {
  const { t } = useI18n();
  const [outfitsVisibility, setOutfitsVisibility] = useState(true);
  const [itemsVisibility, setItemsVisibility] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { token, profile } = useAppSelector((state) => state?.userProfileSlice);


  // Load privacy settings on component mount
  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      setLoading(true);
      if (!profile?.id || !token) {
        return;
      }
      const response = await privacyService.getPrivacySettings(token);
      if (!response.data) {
        throw new Error(response.message || 'Failed to load privacy settings');
      }
      setOutfitsVisibility(response.data.outfitsVisibility);
      setItemsVisibility(response.data.itemsVisibility);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load privacy settings");
    } finally {
      setLoading(false);
    }
  };

  const handleOutfitsToggle = async (value: boolean) => {
    try {
      if (!profile?.id || !token) {
        Alert.alert("Error", "User not authenticated");
        return;
      }
      
      // Update UI immediately for better UX
      setOutfitsVisibility(value);
      
      // Call the API to update the setting
      const response = await privacyService.toggleOutfitsVisibility(
        token,
        value
      );
      
      if (!response.data) {
        throw new Error(response.message || 'Failed to update outfits visibility');
      }
    } catch (error: any) {
      // Revert on error
      setOutfitsVisibility(!value);
      Alert.alert("Error", error.message || "Failed to update outfits visibility");
    }
  };

  const handleItemsToggle = async (value: boolean) => {
    try {
      if (!profile?.id || !token) {
        Alert.alert("Error", "User not authenticated");
        return;
      }
      
      // Update UI immediately for better UX
      setItemsVisibility(value);
      
      // Call the API to update the setting
      const response = await privacyService.toggleItemsVisibility(
        token,
        value
      );
      
      if (!response.data) {
        throw new Error(response.message || 'Failed to update items visibility');
      }
    } catch (error: any) {
      // Revert on error
      setItemsVisibility(!value);
      Alert.alert("Error", error.message || "Failed to update items visibility");
    }
  };

  const handleSave = () => {
    // Just navigate back since toggles are now independent
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('privacy.privacy')}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.settingItem}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingTitle}>{t('privacy.outfitsVisibility')}</Text>
            <Text style={styles.settingDescription}>
              {t('privacy.outfitsVisibilityDescription')}
            </Text>
          </View>
          <View style={{ transform: [{ scale: 0.7 }] }}>
            <ContentSwitch
              switchValue={outfitsVisibility}
              handleSwitch={handleOutfitsToggle}
              title=""
            />
          </View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingTitle}>{t('privacy.itemsVisibility')}</Text>
            <Text style={styles.settingDescription}>
              {t('privacy.itemsVisibilityDescription')}
            </Text>
          </View>
          <View style={{ transform: [{ scale: 0.7 }] }}>
            <ContentSwitch
              switchValue={itemsVisibility}
              handleSwitch={handleItemsToggle}
              title=""
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default WardrobePrivacy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.light.background,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    fontSize: 24,
    color: "#1E2226",
    fontWeight: "300",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "DMSansBold",
    color: "#1E2226",
  },
  saveText: {
    fontSize: 14,
    fontFamily: "DMSansSemiBold",
    color: "#212C3D",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  settingItem: {
    flexDirection: "row",
    // alignItems: "flex-start",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingHeader: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 14,
    fontFamily: "DMSansSemiBold",
    color: "#1E2226",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 10,
    fontFamily: "DMSansRegular",
    color: "#6B7280",
    lineHeight: 20,
  },
});
