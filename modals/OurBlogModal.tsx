import React, { useMemo } from "react";
import { View, Text, ScrollView, Platform, StyleSheet, Image, Modal, SafeAreaView } from "react-native";
import { Colors, SIZES } from "../constants/Colors";
import StackHeader from "../components/StackHeader";
import { useI18n } from "@hooks/use-i18n";
import { fontSz } from "../constants";

interface OurBlogModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const OurBlogModal = ({ isVisible, onClose }: OurBlogModalProps) => {
  const { t } = useI18n();

  const whatToExpect = useMemo(() => ([
    {
      id: 1,
      title: "Sustainable Fashion Tips",
      subtitle:
        "Learn how to make eco-friendly choices in your wardrobe and embrace preloved clothing.",
    },
    {
      id: 2,
      title: "Styling Inspiration",
      subtitle:
        "Get creative ideas on how to mix and match your favorite pieces from your DigitizeApp wardrobe.",
    },
    {
      id: 3,
      title: "User Stories",
      subtitle:
        "Read about how our community is making a difference through sustainable fashion and innovative wardrobe solutions",
    },
    {
      id: 4,
      title: "App Updates",
      subtitle:
        "Stay informed about the latest features and enhancements in the DigitizeApp app.",
    },
  ]), []);

  const categories = useMemo(() => ([
    {
      id: 1,
      title: "Sustainability",
      subtitle:
        "Explore articles that dive deep into the importance of sustainable fashion and how you can contribute.",
      bg: "#FFE5E5",
      image: require("../assets/images/category1.png"),
    },
    {
      id: 2,
      title: "Style Guides",
      subtitle:
        "Discover tips and tricks for styling outfits for various occasions, from casual brunches to formal events.",
      bg: "#E5F3FF",
      image: require("../assets/images/category2.png"),
    },
    {
      id: 3,
      title: "Wardrobe Hacks",
      subtitle:
        "Learn how to maximize your wardrobe's potential with creative organization and outfit planning strategies.",
      bg: "#FFF4E5",
      image: require("../assets/images/category3.png"),
    },
    {
      id: 4,
      title: "DigitizeApp Community",
      subtitle:
        "Get inspired by stories from fellow DigitizeApp users who are making an impact through their fashion choices.",
      bg: "#F0E5FF",
      image: require("../assets/images/category4.png"),
    },
    {
      id: 5,
      title: "Fashion Trends",
      subtitle:
        "Stay updated on the latest trends in preloved and sustainable fashion, and see how to incorporate them into your wardrobe.",
      bg: "#E5FFE5",
      image: require("../assets/images/category5.png"),
    },
  ]), []);

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
          <StackHeader title={t('aboutPages.ourBlog')} onPress={onClose} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Top Section */}
            <View style={styles.topSection}>
              <Text style={styles.topTitle}>DigitizeApp Blog</Text>
              <Text style={styles.topSubtitle}>Welcome to the DigitizeApp Blog!</Text>
              <Text style={styles.topContent}>
                At DigitizeApp, we believe that fashion is more than just clothing; it's a way
                to express yourself while making conscious choices for our planet. Our
                blog is your go-to source for all things fashion, sustainability, and
                style inspiration. Whether you're looking for tips on how to curate your
                digital wardrobe, advice on sustainable fashion practices, or the latest
                trends in preloved clothing, you'll find it here.
              </Text>
              <Image 
                source={require("../assets/images/welcome.png")} 
                style={styles.topBanner}
                resizeMode="cover"
              />
            </View>

            {/* What to Expect */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What to Expect</Text>
              <View style={styles.whatToExpectRow}>
                <View style={styles.whatToExpectContent}>
                  {whatToExpect.map((item) => (
                    <View key={item.id} style={styles.whatToExpectCard}>
                      <Text style={styles.whatToExpectTitle}>{item.title}</Text>
                      <Text style={styles.whatToExpectSubtitle}>{item.subtitle}</Text>
                    </View>
                  ))}
                </View>
                <Image 
                  source={require("../assets/images/whatToExpect.png")} 
                  style={styles.whatToExpectImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Featured Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Featured Categories</Text>
              <View>
                {categories.map((item) => (
                  <View key={item.id} style={styles.categoryCard}>
                    <Image 
                      source={item.image} 
                      style={[styles.categoryImage, item.id === 5 && styles.categoryImageTall]}
                      resizeMode={item.id === 5 ? "contain" : "cover"}
                    />
                    <View style={styles.categoryContent}>
                      <Text style={styles.categoryTitle}>{item.title}</Text>
                      <Text style={styles.categorySubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Join the Conversation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Join the Conversation</Text>
              <Text style={styles.joinSubtitle}>
                We want to hear from you! Share your thoughts, tips, and experiences in
                the comments section of our blog posts. Together, we can build a
                community that values creativity, sustainability, and style.
              </Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default OurBlogModal;

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
    fontSize: fontSz(18),
    color: "#1E2226",
    fontFamily: "DMSansMedium",
    marginBottom: 12,
  },
  topContent: {
    fontSize: fontSz(16),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(24),
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
  whatToExpectRow: {
    flexDirection: 'row',
    gap: 12,
  },
  whatToExpectContent: {
    flex: 1,
  },
  whatToExpectCard: {
    marginBottom: 20,
  },
  whatToExpectTitle: {
    fontSize: fontSz(18),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 8,
  },
  whatToExpectSubtitle: {
    fontSize: fontSz(14),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(20),
  },
  whatToExpectImage: {
    width: 120,
    height: 300,
    borderRadius: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  categoryImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryImageTall: {
    height: 120,
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: fontSz(18),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 6,
  },
  categorySubtitle: {
    fontSize: fontSz(14),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(20),
  },
  joinSubtitle: {
    fontSize: fontSz(16),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(24),
  },
});

