import React from "react";
import { View, Text, ScrollView, Platform, StyleSheet, Image, Modal, SafeAreaView } from "react-native";
import { Colors, SIZES } from "../constants/Colors";
import StackHeader from "../components/StackHeader";
import { useI18n } from "@hooks/use-i18n";
import { fontSz } from "../constants";

interface SustainabilityModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const SustainabilityModal = ({ isVisible, onClose }: SustainabilityModalProps) => {
  const { t } = useI18n();

  const whyMatters = [
    {
      id: 1,
      title: "Reduce Waste",
      subtitle:
        "Our preloved marketplace extends the life cycle of garments, minimizing contributions to landfills.",
      bg: "#FFE5E5",
      image: require("../assets/images/why1.png"),
    },
    {
      id: 2,
      title: "Conserve Resources",
      subtitle:
        "By reusing clothing, we lessen the demand for new materials, conserving water, energy, and raw materials.",
      bg: "#E5F3FF",
      image: require("../assets/images/why2.png"),
    },
    {
      id: 3,
      title: "Promote Ethical Fashion",
      subtitle:
        "Our community-focused platform encourages ethical consumption and fair practices.",
      bg: "#FFF4E5",
      image: require("../assets/images/why3.png"),
    },
  ];

  const supports = [
    {
      id: 1,
      title: "Conserve Preloved Marketplace:",
      subtitle:
        "DigitizeApp connects users to buy and sell high-quality secondhand items, promoting circular fashion.",
      bg: "#FFE5E5",
      image: require("../assets/images/how-step1.png"),
    },
    {
      id: 2,
      title: "Wardrobe Digitization:",
      subtitle:
        "Our app helps you organize your wardrobe digitally, empowering better purchasing decisions and reducing impulse buys.",
      bg: "#E5F3FF",
      image: require("../assets/images/how-step2.png"),
    },
    {
      id: 3,
      title: "Styling Inspiration:",
      subtitle:
        "DigitizeApp encourages creativity, helping you mix and match existing pieces instead of constantly seeking new items.",
      bg: "#FFF4E5",
      image: require("../assets/images/how-step3.png"),
    },
  ];

  const joinUs = [
    {
      id: 1,
      title: "Buy Preloved",
      subtitle:
        "DigitizeApp connects users to buy and sell high-quality secondhand items, promoting circular fashion.",
    },
    {
      id: 2,
      title: "Sell Your Clothes",
      subtitle:
        "Give your garments a second life by listing them on our marketplace.",
    },
    {
      id: 3,
      title: "Spread the Word:",
      subtitle:
        "Share your sustainable fashion journey with friends and family to inspire others.",
    },
  ];

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
          <StackHeader title={t('aboutPages.sustainability')} onPress={onClose} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Hero */}
            <View style={styles.heroWrapper}>
              <Text style={styles.heroTitle}>Sustainability at DigitizeApp</Text>
              <Text style={styles.heroSubtitle}>Our Commitment to a Greener Future</Text>
              <Image 
                source={require("../assets/images/about-hero-banner.png")} 
                style={styles.heroImage}
                resizeMode="cover"
              />
              <Text style={styles.heroBottom}>
                At DigitizeApp, we believe that fashion shouldn't come at the expense of our planet. Sustainability is at the core of our mission, and we are dedicated to creating a responsible and eco-friendly fashion ecosystem that empowers our users to make mindful choices.
              </Text>
            </View>

            {/* Why Sustainability Matters */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Why Sustainability Matters</Text>
              <Text style={styles.sectionSubtitle}>
                The fashion industry has a significant impact on the environment, from resource depletion to waste generation. By embracing sustainability, we can:
              </Text>
              <View>
                {whyMatters.map((item) => (
                  <View key={item.id} style={styles.cardContainer}>
                    <Image 
                      source={item.image} 
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                    <View style={styles.cardDetails}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* How DigitizeApp Supports Sustainability */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How DigitizeApp Supports Sustainability</Text>
              <View>
                {supports.map((item) => (
                  <View key={item.id} style={styles.supportCard}>
                    <Image 
                      source={item.image} 
                      style={styles.supportImage}
                      resizeMode="cover"
                    />
                    <Text style={styles.supportTitle}>{item.title}</Text>
                    <Text style={styles.supportSubtitle}>{item.subtitle}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Join Us */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Join Us on Our Sustainability Journey</Text>
              <Text style={styles.sectionSubtitle}>
                At DigitizeApp, we're not just about style; we're committed to making a positive impact. Here are a few ways you can contribute:
              </Text>
              <View style={styles.joinUsRow}>
                <Image 
                  source={require("../assets/images/join-us.png")} 
                  style={styles.joinUsImage}
                  resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                  {joinUs.map((item) => (
                    <View key={item.id} style={styles.joinUsContainer}>
                      <Text style={styles.joinUsTitle}>{item.title}</Text>
                      <Text style={styles.joinUsSubtitle}>{item.subtitle}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default SustainabilityModal;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  heroWrapper: {
    marginTop: 20,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: fontSz(28),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: fontSz(16),
    color: "#1E2226",
    fontFamily: "DMSansMedium",
  },
  heroImage: {
    marginTop: 16,
    height: 180,
    borderRadius: 12,
    width: '100%',
  },
  heroBottom: {
    marginTop: 16,
    fontSize: fontSz(16),
    lineHeight: fontSz(22),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: fontSz(22),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: fontSz(16),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(22),
    marginBottom: 16,
  },
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardImage: {
    width: 78,
    height: 69,
    borderRadius: 20,
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: fontSz(18),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: fontSz(14),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(20),
  },
  supportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  supportImage: {
    width: '100%',
    height: 116,
    borderRadius: 8,
    marginBottom: 12,
  },
  supportTitle: {
    fontSize: fontSz(18),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 6,
  },
  supportSubtitle: {
    fontSize: fontSz(14),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(20),
  },
  joinUsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  joinUsImage: {
    width: 120,
    height: 180,
    borderRadius: 12,
    marginRight: 12,
  },
  joinUsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  joinUsTitle: {
    fontSize: fontSz(16),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 6,
  },
  joinUsSubtitle: {
    fontSize: fontSz(14),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(20),
  },
});

