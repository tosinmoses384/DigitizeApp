import React, { useMemo } from "react";
import { View, Text, ScrollView, Platform, StyleSheet, TouchableOpacity, Linking, Image, Modal, SafeAreaView } from "react-native";
import { Colors, SIZES } from "../constants/Colors";
import StackHeader from "../components/StackHeader";
import { useI18n } from "@hooks/use-i18n";
import { fontSz } from "../constants";

interface AboutWardrobeModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const AboutWardrobeModal = ({ isVisible, onClose }: AboutWardrobeModalProps) => {
  const { t } = useI18n();

  const howItWorks = useMemo(() => ([
    {
      id: 1,
      title: "Easy Upload",
      subtitle: `Access the "Timeline" feature in the app and images from the camera roll, or snap new pictures to upload.`,
    },
    {
      id: 2,
      title: "Intuitive Guidance",
      subtitle:
        "Follow the app's tips before taking pics of your clothes and accessories, to ensure you capture the best shots every time.",
    },
    {
      id: 3,
      title: "Auto BG Removal",
      subtitle:
        "Our digital wardrobe app's smart technology will automatically remove the background for a clear, clean view of your entire closet.",
    },
    {
      id: 4,
      title: "Get Specific",
      subtitle:
        "Add key deets like size, brands, and color, all warpped up with a unique item name before adding it to your digital DigitizeApp!",
    },
  ]), []);

  const outfitFeatures = useMemo(() => ([
    {
      id: 1,
      title: "Assemble Fab Ensembles",
      subtitle:
        "DigitizeApp is your digital wardrobe organizer and sidekick who wants to look the best. Drag and drop onto your styling board or lets AI powered matching compile outfit suggestions on your behalf. Fashion inspiration that gives you one less thing to worry about everyday.",
    },
    {
      id: 2,
      title: "Plan",
      subtitle:
        "Use your digital wardrobe planner's in-built calender to get organized for upcoming events. Let your trend-savvy AI bestie pre-plan outfits by date,event or mood, so you can always show up with confidence and authenticity.",
    },
  ]), []);

  const features = useMemo(() => ([
    {
      id: 1,
      title: "Rediscover",
      subtitle:
        "A digital wardrobe organizer that helps you resurface hidden gems and assemble genius combos",
    },
    {
      id: 2,
      title: "Get Authentic",
      subtitle:
        "Turn your wardrobe into a reflection of YOU, so you can share your vibe wherever you go",
    },
    {
      id: 3,
      title: "Save Time",
      subtitle:
        "Turn 20 minutes of starring into 5 minutes of intentional dressing.",
    },
  ]), []);

  const handleStorePress = (storeType: 'ios' | 'android') => {
    const urls = {
      ios: 'https://apps.apple.com/gb/app/digitizeapp/id6746652942',
      android: 'https://play.google.com/store/apps/details?id=com.digitizeapp.app'
    };
    Linking.openURL(urls[storeType]);
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
          <StackHeader title={t('aboutPages.aboutWardrobe')} onPress={onClose} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Top Section */}
            <View style={styles.topSection}>
              <Text style={styles.topTitle}>
                Finally: A Stylist That Gets You. That&apos;s DigitizeApp.
              </Text>
              <Text style={styles.topSubtitle}>
                Style It | Save It | Sell It | Rock It
              </Text>
            </View>

            {/* Banner */}
            <View style={styles.bannerSection}>
              <Image 
                source={require("../assets/images/wardrobe-page-hero.png")} 
                style={styles.bannerImage}
                resizeMode="cover"
              />
            </View>

            {/* Get App Section */}
            <View style={styles.section}>
              <Text style={styles.getAppTitle}>
                Imagine choosing your outfit from the palm of your hand, instead of
                scouring your closet for hours. With DigitizeApp, imagine no more. Digitize
                your wardrobe in the app, and DigitizeApp will take it from there, turning
                your entire closet into a smart, searchable digital wardrobe on your
                smartphone.
              </Text>
              <View style={styles.storeButtons}>
                <TouchableOpacity 
                  style={styles.storeButton}
                  onPress={() => handleStorePress('ios')}
                >
                  <Text style={styles.storeButtonText}>App Store</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.storeButton}
                  onPress={() => handleStorePress('android')}
                >
                  <Text style={styles.storeButtonText}>Google Play</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* How It Works */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How it works</Text>
              <View style={styles.howItWorksRow}>
                <View style={styles.howItWorksContent}>
                  {howItWorks.map((item) => (
                    <View key={item.id} style={styles.howItWorksCard}>
                      <Text style={styles.howItWorksTitle}>{item.title}</Text>
                      <Text style={styles.howItWorksSubtitle}>{item.subtitle}</Text>
                    </View>
                  ))}
                </View>
                <Image 
                  source={require("../assets/images/how-it-work-image.png")} 
                  style={styles.howItWorksImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Outfit Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Wardrobe</Text>
              <View style={styles.outfitRow}>
                <Image 
                  source={require("../assets/images/outfit-style-image.png")} 
                  style={styles.outfitImage}
                  resizeMode="cover"
                />
                <View style={styles.outfitContent}>
                  {outfitFeatures.map((item) => (
                    <View key={item.id} style={styles.outfitCard}>
                      <Text style={styles.outfitTitle}>{item.title}</Text>
                      <Text style={styles.outfitSubtitle}>{item.subtitle}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Features Section */}
            <View style={styles.section}>
              <Text style={styles.featuresTitle}>What Makes DigitizeApp Different?</Text>
              <View>
                {features.map((item) => (
                  <View key={item.id} style={styles.featureCard}>
                    <View style={styles.featureIcon} />
                    <Text style={styles.featureTitle}>{item.title}</Text>
                    <Text style={styles.featureSubtitle}>{item.subtitle}</Text>
                  </View>
                ))}
              </View>

              {/* Bottom CTA */}
              <View style={styles.ctaSection}>
                <View style={styles.ctaContent}>
                  <Text style={styles.ctaTitle}>Try DigitizeApp Today. It&apos;s Free</Text>
                  <Text style={styles.ctaSubtitle}>
                    Who wouldn&apos;t want a digital wardrobe planner in their life? Ask any Drber, 
                    and they&apos;ll tell you the same thing: DigitizeApp is a life-saver, a game changer, 
                    and the best decision you can make for your personal style. It&apos;s transformed 
                    thousands of wardrobes worldwide, and it can do the same for yours
                  </Text>
                  <View style={styles.storeButtons}>
                    <TouchableOpacity 
                      style={styles.storeButton}
                      onPress={() => handleStorePress('ios')}
                    >
                      <Text style={styles.storeButtonText}>App Store</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.storeButton}
                      onPress={() => handleStorePress('android')}
                    >
                      <Text style={styles.storeButtonText}>Google Play</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Image 
                  source={require("../assets/images/cut-android2.png")} 
                  style={styles.ctaImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default AboutWardrobeModal;

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
    fontFamily: "DMSansMedium",
  },
  bannerSection: {
    marginBottom: 24,
  },
  bannerImage: {
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
  getAppTitle: {
    fontSize: fontSz(16),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(24),
    marginBottom: 20,
  },
  storeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  storeButton: {
    flex: 1,
    backgroundColor: '#1E2226',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  storeButtonText: {
    fontSize: fontSz(14),
    color: "#FFFFFF",
    fontFamily: "DMSansSemiBold",
  },
  howItWorksRow: {
    flexDirection: 'row',
    gap: 12,
  },
  howItWorksContent: {
    flex: 1,
  },
  howItWorksCard: {
    marginBottom: 20,
  },
  howItWorksTitle: {
    fontSize: fontSz(18),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 8,
  },
  howItWorksSubtitle: {
    fontSize: fontSz(14),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(20),
  },
  howItWorksImage: {
    width: 120,
    height: 300,
    borderRadius: 12,
  },
  outfitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  outfitImage: {
    width: 120,
    height: 250,
    borderRadius: 12,
  },
  outfitContent: {
    flex: 1,
  },
  outfitCard: {
    marginBottom: 20,
  },
  outfitTitle: {
    fontSize: fontSz(18),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 8,
  },
  outfitSubtitle: {
    fontSize: fontSz(14),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(20),
  },
  featuresTitle: {
    fontSize: fontSz(22),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 20,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  featureIcon: {
    width: 60,
    height: 60,
    backgroundColor: "#FFE5E5",
    borderRadius: 30,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: fontSz(18),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 8,
    textAlign: 'center',
  },
  featureSubtitle: {
    fontSize: fontSz(14),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(20),
    textAlign: 'center',
  },
  ctaSection: {
    marginTop: 32,
    backgroundColor: '#FF3B4A',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    gap: 12,
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: fontSz(22),
    color: "#FFFFFF",
    fontFamily: "DMSansSemiBold",
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: fontSz(14),
    color: "#FFFFFF",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(20),
    marginBottom: 20,
  },
  ctaImage: {
    width: 120,
    height: 250,
    borderRadius: 12,
  },
});

