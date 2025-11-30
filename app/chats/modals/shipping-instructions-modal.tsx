import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useI18n } from "@hooks/use-i18n";

/**
 * ShippingInstructionsModal Component
 * 
 * Full-page modal displaying detailed shipping instructions for sellers.
 * Shows provider-specific guidance on how to pack, label, and ship items.
 * 
 * @section Architecture Requirements - Modal component layer
 * @section Performance - Uses React.memo for optimization
 * @section Accessibility - Includes proper accessibility labels and roles
 */

interface ShippingInstructionsModalProps {
  visible: boolean;
  onClose: () => void;
  shippingProvider?: string;
  shippingType?: string;
}

const ShippingInstructionsModal: React.FC<ShippingInstructionsModalProps> = ({
  visible,
  onClose,
  shippingProvider = "InPost",
  shippingType = "Locker",
}) => {
  const { t } = useI18n();

  /**
   * Format provider name for display
   * Combines provider and type (e.g., "24/7 InPost Locker | Shop Pick-up")
   */
  const providerDisplayName = useMemo(() => {
    // If provider is InPost, show the full formatted name
    if (shippingProvider?.toLowerCase() === "inpost") {
      return t("shippingInstructions.inpostFullName");
    }
    
    // For other providers, use a generic format
    return `${shippingProvider} ${shippingType}`;
  }, [shippingProvider, shippingType, t]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.backButton}
            accessibilityLabel={t("common.back")}
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={24} color="#07090C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t("shippingInstructions.title")}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Provider Section */}
          <View style={styles.providerSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="cube" size={32} color="#F59E0B" />
            </View>
            <Text style={styles.providerName}>{providerDisplayName}</Text>
            <Text style={styles.providerSubtitle}>
              {t("shippingInstructions.selectedByBuyer")}
            </Text>
          </View>

          {/* Instructions Section */}
          <View style={styles.instructionsSection}>
            <Text style={styles.sectionTitle}>
              {t("shippingInstructions.instructions")}
            </Text>

            {/* Step 1: Pack your item(s) */}
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>
                {t("shippingInstructions.step1Title")}
              </Text>
              <Text style={styles.stepDescription}>
                {t("shippingInstructions.step1Description")}
              </Text>
            </View>

            {/* Step 2: Check your label */}
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>
                {t("shippingInstructions.step2Title")}
              </Text>
              <Text style={styles.stepDescription}>
                {t("shippingInstructions.step2DescriptionDigital")}
              </Text>
              <Text style={[styles.stepDescription, styles.stepDescriptionSpaced]}>
                {t("shippingInstructions.step2DescriptionPrintable")}
              </Text>
            </View>

            {/* Step 3: Bring the parcel to the drop-off point */}
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>
                {t("shippingInstructions.step3Title")}
              </Text>
              <Text style={styles.stepDescription}>
                {t("shippingInstructions.step3Description")}
              </Text>
              <Text style={[styles.stepDescription, styles.stepDescriptionSpaced]}>
                {t("shippingInstructions.step3DescriptionProcess")}
              </Text>
            </View>

            {/* Step 4: Track your parcel's journey */}
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>
                {t("shippingInstructions.step4Title")}
              </Text>
              <Text style={styles.stepDescription}>
                {t("shippingInstructions.step4Description")}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

/**
 * Memoize component to prevent unnecessary rerenders
 * 
 * @section Performance - Memoization for optimization
 */
export default React.memo(ShippingInstructionsModal);

/**
 * Styles following DigitizeApp design system
 * 
 * @section Styling - StyleSheet.create for performance
 * @section Code Quality - No inline styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E9EAEB",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "DMSansBold",
    color: "#07090C",
    fontWeight: "700",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  providerSection: {
    alignItems: "center",
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#E9EAEB",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  providerName: {
    fontSize: 16,
    fontFamily: "DMSansBold",
    color: "#07090C",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  providerSubtitle: {
    fontSize: 14,
    fontFamily: "DMSansRegular",
    color: "#6B7280",
    textAlign: "center",
  },
  instructionsSection: {
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "DMSansBold",
    color: "#07090C",
    fontWeight: "700",
    marginBottom: 24,
  },
  stepContainer: {
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: "DMSansBold",
    color: "#07090C",
    fontWeight: "700",
    marginBottom: 12,
    lineHeight: 22,
  },
  stepDescription: {
    fontSize: 15,
    fontFamily: "DMSansRegular",
    color: "#374151",
    lineHeight: 24,
  },
  stepDescriptionSpaced: {
    marginTop: 16,
  },
});

