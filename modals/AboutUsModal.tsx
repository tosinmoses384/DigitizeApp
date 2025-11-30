import React from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  Platform, 
  StyleSheet, 
  Dimensions,
  Linking,
  TouchableOpacity,
  Image,
  Modal,
  SafeAreaView
} from "react-native";
import { Colors, SIZES } from "../constants/Colors";
import StackHeader from "../components/StackHeader";
import { LinearGradient } from 'expo-linear-gradient';
import { fontSz } from "../constants";
import { useI18n } from "@hooks/use-i18n";

const { width: screenWidth } = Dimensions.get('window');

interface AboutUsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const AboutUsModal = ({ isVisible, onClose }: AboutUsModalProps) => {
  const { t } = useI18n();

  const statisticsData = [
    {
      id: 1,
      title: "100 BILLION",
      subtitle: "Garments are produced every single year",
      image: require("../assets/images/garment-icon.png"),
    },
    {
      id: 2,
      title: "50% OF CLOTHING",
      subtitle: "Is unworn, left to gather dust in our wardrobes",
      image: require("../assets/images/clothing-icon.png"),
    },
    {
      id: 3,
      title: "$500 BILLION is lost",
      subtitle: "every year to under-wearing and not recycling.",
      image: require("../assets/images/money-icon.png"),
    },
  ];

  const teamData = [
    {
      id: 1,
      name: "Product and Design",
      role: "The team dreaming up features, perfecting the experience, and making DigitizeApp beautiful, functional and fun to use.",
      backgroundColor: "#FFE5E5",
      image: require("../assets/images/teamImage1.png"),
    },
    {
      id: 2,
      name: "Engineering",
      role: "From frontend to backend, these are the builders bringing the digital wardrobe, styling tools and marketplace to life.",
      backgroundColor: "#E5F3FF",
      image: require("../assets/images/teamImage2.png"),
    },
    {
      id: 3,
      name: "AI & Innovation",
      role: "The brains behind our smart styling tools and wardrobe automation. They're making DigitizeApp your personal fashion assistant.",
      backgroundColor: "#FFF4E5",
      image: require("../assets/images/teamImage3.png"),
    },
    {
      id: 4,
      name: "Growth and Community",
      role: "The voices connecting with users, building the brand and keeping DigitizeApp buzzing--from socials to support.",
      backgroundColor: "#F0E5FF",
      image: require("../assets/images/teamImage4.png"),
    },
  ];

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
        <View style={styles.container}>
          <StackHeader title={t('about.aboutUs')} onPress={onClose} />

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Top Section */}
            <View style={styles.topSection}>
              <Text style={styles.mainTitle}>
                DigitizeApp: <Text style={styles.highlightedText}>Digitize Your Wardrobe</Text>. Declutter Your Mind.
              </Text>
            </View>

            {/* Banner Section */}
            <View style={styles.bannerSection}>
              <LinearGradient
                colors={['rgba(244, 185, 135, 0.4)', 'rgba(255, 59, 74, 0.67)', '#801E25']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bannerGradient}
              >
                <View style={styles.bannerContent}>
                  <Text style={styles.bannerTitle}>
                    Full Closet, But Nothing To Wear? You&apos;re Not Alone.
                  </Text>
                  <Text style={styles.bannerSubtitle}>
                    How many gorgeous outfits are &quot;sleeping&quot; in your closet without a purpose? 
                    Wake them up and set them free with DigitizeApp, designed for those who crave more 
                    simplicity and less decision fatigue.
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Who We Are Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Our Story</Text>
              <Text style={styles.sectionContent}>
                After witnessing the consequences of fast fashion, our team of style
                innovators and tech pioneers set out on ambitious mission to reduce
                waste in the fashion industry - by empowering every human to transform
                their closet into a wardrobe they love.
              </Text>
            </View>

            {/* What We Offer / Why Now Section */}
            <View style={[styles.section, styles.statisticsSection]}>
              <Text style={styles.sectionTitle}>Why Now?</Text>
              {statisticsData.map((stat) => (
                <View key={stat.id} style={styles.statisticCard}>
                  <Image 
                    source={stat.image} 
                    style={styles.statisticIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.statisticTitle}>{stat.title}</Text>
                  <Text style={styles.statisticSubtitle}>{stat.subtitle}</Text>
                </View>
              ))}
            </View>

            {/* Our Vision Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Our Vision</Text>
              <Text style={styles.sectionContent}>
                DigitizeApp is more than a digital wardrobe app. it&apos;s your partner in
                decluttering your wardrobe, your mind and your life - making space
                for less stress and guilt and more freedom and joy.
                {'\n\n'}
                Weather you&apos;re dressing to slay at work or packing for a last-minute getaway,
                DigitizeApp has your back. And your front. And every other part of you
                for that matter.
              </Text>
              <Image 
                source={require("../assets/images/vision-image.png")} 
                style={styles.visionImage}
                resizeMode="cover"
              />
            </View>

            {/* Our Team Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Our Team</Text>
              <View style={styles.teamGrid}>
                {teamData.map((member) => (
                  <View key={member.id} style={styles.teamCard}>
                    <Image 
                      source={member.image} 
                      style={styles.teamImage}
                      resizeMode="cover"
                    />
                    <Text style={styles.teamName}>{member.name}</Text>
                    <Text style={styles.teamRole}>{member.role}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Get Involved Section */}
            <View style={styles.getInvolvedSection}>
              <View style={styles.getInvolvedContent}>
                <Text style={styles.getInvolvedTitle}>
                  Try DigitizeApp Today. It's Free.
                </Text>
                <Text style={styles.getInvolvedText}>
                  Who wouldn&apos;t want a digital wardrobe planner in their life? Ask any
                  Drber, and they&apos;ll tell you the same thing: DigitizeApp is a life-saver, a
                  game-changer, and the best decision you can make for your personal
                  style. It&apos;s transformed 1000s of wardrobes worldwide, and it can do
                  the same for yours.
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
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default AboutUsModal;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  topSection: {
    marginVertical: 20,
  },
  mainTitle: {
    fontSize: fontSz(28),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    lineHeight: fontSz(36),
  },
  highlightedText: {
    color: "#FF3B4A",
  },
  bannerSection: {
    marginVertical: 20,
  },
  bannerGradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerContent: {
    padding: 24,
  },
  bannerTitle: {
    fontSize: fontSz(24),
    color: "#F9FAFC",
    fontFamily: "DMSansSemiBold",
    marginBottom: 12,
    lineHeight: fontSz(30),
  },
  bannerSubtitle: {
    fontSize: fontSz(16),
    color: "#FFFFFF",
    lineHeight: fontSz(22),
    fontFamily: "DMSansMedium",
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: fontSz(24),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 16,
  },
  sectionContent: {
    fontSize: fontSz(16),
    color: "#1E2226",
    lineHeight: fontSz(24),
    fontFamily: "DMSansRegular",
  },
  statisticsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
  },
  statisticCard: {
    marginBottom: 24,
  },
  statisticIcon: {
    width: 78,
    height: 69,
    marginBottom: 12,
  },
  statisticTitle: {
    fontSize: fontSz(20),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 8,
  },
  statisticSubtitle: {
    fontSize: fontSz(16),
    color: "#1E2226",
    lineHeight: fontSz(22),
    fontFamily: "DMSansRegular",
  },
  visionImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginTop: 20,
  },
  teamGrid: {
    marginTop: 12,
  },
  teamCard: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
  teamImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  teamName: {
    fontSize: fontSz(18),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 8,
  },
  teamRole: {
    fontSize: fontSz(14),
    color: "#1E2226",
    lineHeight: fontSz(20),
    fontFamily: "DMSansRegular",
  },
  getInvolvedSection: {
    marginVertical: 20,
    backgroundColor: '#FF3B4A',
    borderRadius: 16,
    padding: 24,
  },
  getInvolvedContent: {
  },
  getInvolvedTitle: {
    fontSize: fontSz(24),
    color: "#FFFFFF",
    fontFamily: "DMSansSemiBold",
    marginBottom: 16,
  },
  getInvolvedText: {
    fontSize: fontSz(16),
    color: "#FFFFFF",
    lineHeight: fontSz(22),
    marginBottom: 24,
    fontFamily: "DMSansRegular",
  },
  storeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  storeButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  storeButtonText: {
    fontSize: fontSz(14),
    color: "#FF3B4A",
    fontFamily: "DMSansSemiBold",
  },
});

