import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Platform, StyleSheet, TouchableOpacity, Image, Modal, SafeAreaView } from "react-native";
import { Colors, SIZES } from "../constants/Colors";
import StackHeader from "../components/StackHeader";
import { useI18n } from "@hooks/use-i18n";
import { fontSz } from "../constants";

interface PurchaseCoverModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const PurchaseCoverModal = ({ isVisible, onClose }: PurchaseCoverModalProps) => {
  const { t } = useI18n();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const steps = useMemo(() => ([
    {
      id: 1,
      step: "Step 1",
      title: "Choose Purchase Cover at Checkout",
      subtitle:
        "Opt in for Purchase Cover when completing your purchase to add this protection.",
      bg: "#FFE5E5",
      image: require("../assets/images/step1.png"),
    },
    {
      id: 2,
      step: "Step 2",
      title: "Coverage for Loss or Damage",
      subtitle:
        "If your item is lost or arrives damaged, reach out to our team with details and proof to get it resolved.",
      bg: "#E5F3FF",
      image: require("../assets/images/step2.png"),
    },
    {
      id: 3,
      step: "Step 3",
      title: "Simple Refunds or Replacements",
      subtitle:
        "With Purchase Cover, you're eligible for a refund or replacement, ensuring a safe and worry-free shopping experience.",
      bg: "#FFF4E5",
      image: require("../assets/images/step3.png"),
    },
  ]), []);

  const whyChoose = useMemo(() => ([
    {
      id: 1,
      title: "Worry-Free Shopping",
      subtitle: "Shop confidently, knowing your order is protected.",
    },
    {
      id: 2,
      title: "Quick Claims Assistance",
      subtitle:
        "Our team is here to help you with a fast, simple claims process if needed",
    },
    {
      id: 3,
      title: "Value Assurance",
      subtitle: "We guarantee your satisfaction or offer your money back",
    },
  ]), []);

  const faqs = useMemo(() => ([
    {
      id: 1,
      title: "How do I add Purchase Cover?",
      subtitle:
        "Simply select Purchase Cover at checkout to add it to your order.",
    },
    {
      id: 2,
      title: "What does Purchase Cover include?",
      subtitle:
        "Coverage includes protection against loss, damage, and item misrepresentation",
    },
    {
      id: 3,
      title: "How do I make a claim?",
      subtitle:
        "Contact our support team with your order details, and we'll guide you through the claims process",
    },
  ]), []);

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
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
          <StackHeader title={t('aboutPages.purchaseCover')} onPress={onClose} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>Protect Your Purchase with Purchase Cover</Text>
              <Text style={styles.heroSubtitle}>Shop Securely with Purchase Cover</Text>
              <Image 
                source={require("../assets/images/protect-top.png")} 
                style={styles.heroBanner}
                resizeMode="cover"
              />
              <Text style={styles.heroBottomContent}>
                Enjoy peace of mind with Purchase Cover! This optional protection
                ensures your purchases are covered in case of loss or damage.
              </Text>
            </View>

            {/* How Purchase Cover Works */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What is Purchase Cover?</Text>
              <Text style={styles.sectionSubtitle}>
                DigitizeApp's Purchase Cover is an insurance option you can add at checkout,
                covering your item if it's lost, damaged, or doesn't match its
                description.
              </Text>
              <Text style={styles.bottomTitle}>How Purchase Cover Works</Text>
              <View>
                {steps.map((step) => (
                  <View key={step.id} style={styles.stepCard}>
                    <Text style={styles.stepNumber}>{step.step}</Text>
                    <Image 
                      source={step.image} 
                      style={styles.stepImage}
                      resizeMode="cover"
                    />
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Why Choose Us */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Why Choose Purchase Cover?</Text>
              <View style={styles.whyChooseRow}>
                <View style={styles.whyChooseContent}>
                  {whyChoose.map((item) => (
                    <View key={item.id} style={styles.whyChooseCard}>
                      <Text style={styles.whyChooseTitle}>{item.title}</Text>
                      <Text style={styles.whyChooseSubtitle}>{item.subtitle}</Text>
                    </View>
                  ))}
                </View>
                <Image 
                  source={require("../assets/images/why-purchase.png")} 
                  style={styles.whyChooseImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* FAQ Section */}
            <View style={styles.section}>
              <View style={styles.faqTitleContainer}>
                <Image 
                  source={require("../assets/images/faq.png")} 
                  style={styles.faqIcon}
                  resizeMode="contain"
                />
                <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
              </View>
              {faqs.map((faq) => (
                <View key={faq.id} style={styles.faqCard}>
                  <TouchableOpacity
                    style={styles.faqHeader}
                    onPress={() => toggleFaq(faq.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.faqHeaderText}>{faq.title}</Text>
                    <Text style={styles.faqToggle}>
                      {expandedFaq === faq.id ? '−' : '+'}
                    </Text>
                  </TouchableOpacity>
                  {expandedFaq === faq.id && (
                    <View style={styles.faqContent}>
                      <Text style={styles.faqText}>{faq.subtitle}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default PurchaseCoverModal;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  heroSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: fontSz(28),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: fontSz(18),
    color: "#1E2226",
    fontFamily: "DMSansMedium",
    marginBottom: 16,
  },
  heroBanner: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  heroBottomContent: {
    fontSize: fontSz(16),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(24),
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: fontSz(22),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: fontSz(16),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(24),
    marginBottom: 20,
  },
  bottomTitle: {
    fontSize: fontSz(20),
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
  stepNumber: {
    fontSize: fontSz(14),
    color: "#FF3B4A",
    fontFamily: "DMSansMedium",
    marginBottom: 12,
  },
  stepImage: {
    width: '100%',
    height: 137,
    borderRadius: 8,
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: fontSz(18),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: fontSz(14),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(20),
  },
  whyChooseRow: {
    flexDirection: 'row',
    gap: 12,
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
  whyChooseImage: {
    width: 120,
    height: 200,
    borderRadius: 12,
  },
  faqTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  faqIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  faqTitle: {
    fontSize: fontSz(22),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqHeaderText: {
    fontSize: fontSz(16),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    flex: 1,
  },
  faqToggle: {
    fontSize: fontSz(24),
    color: "#FF3B4A",
    fontFamily: "DMSansSemiBold",
  },
  faqContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqText: {
    fontSize: fontSz(14),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(20),
  },
});

