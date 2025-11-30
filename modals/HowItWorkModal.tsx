import React, { useMemo } from "react";
import { View, Text, ScrollView, Platform, StyleSheet, TouchableOpacity, Image, Modal, SafeAreaView } from "react-native";
import { Colors, SIZES } from "../constants/Colors";
import StackHeader from "../components/StackHeader";
import { router } from "expo-router";
import { useI18n } from "@hooks/use-i18n";
import { fontSz } from "../constants";

interface HowItWorkModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const HowItWorkModal = ({ isVisible, onClose }: HowItWorkModalProps) => {
  const { t } = useI18n();

  const steps = useMemo(() => ([
    {
      id: 1,
      topTitle: "Digitize Your Wardrobe (App Exclusive)",
      title: "Upload Your Items",
      subtitle: "Start by snapping photos of your clothing using the DigitizeApp app. Easily catalog your wardrobe and create a digital inventory of everything you own—all from your phone!",
      tip: "Ensure good lighting and capture different angles for the best results!",
      bg: "#FFE5E5",
      image: require("../assets/images/digitize.png"),
    },
    {
      id: 2,
      topTitle: "Create Stylish Outfits (App Exclusive)",
      title: "Mix and Match",
      subtitle: "With your wardrobe uploaded in the app, use our styling features to experiment with different outfits. Save your favorites and get inspired by tailored outfit suggestions that fit your style.",
      tip: "Combine pieces in new ways to discover fresh looks!",
      bg: "#E5F3FF",
      image: require("../assets/images/style.png"),
    },
    {
      id: 3,
      topTitle: "Shop Preloved Fashion",
      title: "Explore the Marketplace",
      subtitle: "Browse a wide selection of preloved items from other users. Each purchase helps promote sustainability and gives quality clothing a second life.",
      tip: "Use filters to narrow your search by size, brand, or style to find exactly what you want!",
      bg: "#FFF4E5",
      image: require("../assets/images/shop.png"),
    },
    {
      id: 4,
      topTitle: "Buy and Sell with Ease",
      title: "List Your Items",
      subtitle: "Ready to declutter? List your preloved items for sale directly in the app. Set your price, add a description, and connect with buyers who will appreciate your pieces.",
      tip: "Be honest in your listings and include clear photos to attract more buyers!",
      bg: "#F0E5FF",
      image: require("../assets/images/buy.png"),
    },
  ]), []);

  const whyChoose = useMemo(() => ([
    {
      id: 1,
      title: "Sustainable Fashion",
      subtitle: "Make a positive impact on the environment by embracing preloved clothing.",
    },
    {
      id: 2,
      title: "Community Connection",
      subtitle: "Join a vibrant community of fashion lovers who value creativity and sustainability.",
    },
    {
      id: 3,
      title: "User-Friendly Experience",
      subtitle: "Our intuitive app simplifies managing your wardrobe and shopping with confidence.",
    },
  ]), []);

  const handleStartSelling = () => {
    onClose();
    router.push('/(authenticated)/(tabs)/add');
  };

  const handleStartShopping = () => {
    onClose();
    router.push('/(authenticated)/(tabs)/home');
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.light.background,
            paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
          }}
        >
          <StackHeader title={t('aboutPages.howItWorks')} onPress={onClose} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Top Section */}
            <View style={styles.topSection}>
              <Text style={styles.topTitle}>How DigitizeApp Works</Text>
              <Text style={styles.topSubtitle}>
                At DigitizeApp, we make it easy to refresh your wardrobe sustainably. Here's how it works:
              </Text>
              <Image 
                source={require("../assets/images/how-it-works.png")} 
                style={styles.topBanner}
                resizeMode="cover"
              />
            </View>

            {/* Read About - Steps */}
            <View style={styles.section}>
              {steps.map((step) => (
                <View key={step.id} style={styles.stepCard}>
                  <Text style={styles.stepTopTitle}>{step.topTitle}</Text>
                  <Image 
                    source={step.image} 
                    style={styles.stepImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                  <View style={styles.tipContainer}>
                    <Text style={styles.tipLabel}>Tip:</Text>
                    <Text style={styles.tipText}> {step.tip}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Why Choose DigitizeApp */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Why Choose DigitizeApp?</Text>
              <View style={styles.whyChooseRow}>
                <Image 
                  source={require("../assets/images/choose.png")} 
                  style={styles.whyChooseImage}
                  resizeMode="cover"
                />
                <View style={styles.whyChooseContent}>
                  {whyChoose.map((item) => (
                    <View key={item.id} style={styles.whyChooseCard}>
                      <Text style={styles.whyChooseTitle}>{item.title}</Text>
                      <Text style={styles.whyChooseSubtitle}>{item.subtitle}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Ready for DigitizeApp life */}
            <View style={styles.ctaSection}>
              <Text style={styles.ctaTitle}>Ready for the DigitizeApp life?</Text>
              <View style={styles.ctaButtons}>
                <TouchableOpacity style={[styles.ctaButton, styles.ctaButtonSell]} onPress={handleStartSelling}>
                  <Text style={styles.ctaButtonText}>Start selling</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.ctaButton, styles.ctaButtonShop]} onPress={handleStartShopping}>
                  <Text style={styles.ctaButtonText}>Start shopping</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default HowItWorkModal;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  topSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  topTitle: {
    fontSize: fontSz(28),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 8,
  },
  topSubtitle: {
    fontSize: fontSz(16),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(22),
    marginBottom: 16,
  },
  topBanner: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: fontSz(22),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 16,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  stepTopTitle: {
    fontSize: fontSz(14),
    color: "#1E2226",
    fontFamily: "DMSansMedium",
    marginBottom: 12,
  },
  stepImage: {
    width: '100%',
    height: 173,
    borderRadius: 8,
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: fontSz(20),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: fontSz(14),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(20),
    marginBottom: 8,
  },
  tipContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  tipLabel: {
    fontSize: fontSz(14),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
  },
  tipText: {
    fontSize: fontSz(14),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    flex: 1,
  },
  whyChooseRow: {
    flexDirection: 'row',
    gap: 12,
  },
  whyChooseImage: {
    width: 120,
    height: 200,
    borderRadius: 12,
  },
  whyChooseContent: {
    flex: 1,
  },
  whyChooseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  whyChooseTitle: {
    fontSize: fontSz(18),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 6,
  },
  whyChooseSubtitle: {
    fontSize: fontSz(14),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(20),
  },
  ctaSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  ctaTitle: {
    fontSize: fontSz(22),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 20,
    textAlign: 'center',
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  ctaButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  ctaButtonSell: {
    backgroundColor: '#1E2226',
  },
  ctaButtonShop: {
    backgroundColor: '#FF3B4A',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: fontSz(14),
    fontFamily: 'DMSansSemiBold',
  },
});

