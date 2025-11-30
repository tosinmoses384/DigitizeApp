import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Platform, StyleSheet, TextInput, TouchableOpacity, Image, Modal, SafeAreaView } from "react-native";
import { Colors, SIZES } from "../constants/Colors";
import StackHeader from "../components/StackHeader";
import { useI18n } from "@hooks/use-i18n";
import { fontSz } from "../constants";

interface AboutFaqModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const AboutFaqModal = ({ isVisible, onClose }: AboutFaqModalProps) => {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaqs, setExpandedFaqs] = useState<Record<number, number | null>>({});

  const faqCategories = useMemo(() => ([
    {
      id: 1,
      title: "General Questions",
      data: [
        {
          id: 1,
          title: "What is DigitizeApp?",
          subtitle:
            "DigitizeApp is a unique platform for buying preloved fashion, managing your wardrobe digitally, and styling outfits with ease. Available on both app and website!",
        },
        {
          id: 2,
          title: "Is DigitizeApp available on both mobile and desktop?",
          subtitle:
            "The preloved shopping experience is available on both platforms, while digital wardrobe and outfit styling features are exclusive to our iOS and Android apps.",
        },
        {
          id: 3,
          title: "How do I contact customer support?",
          subtitle:
            "Visit our Contact Us page or reach us directly from your account settings in the app for quick assistance.",
        },
      ],
    },
    {
      id: 2,
      title: "Buying on DigitizeApp",
      data: [
        {
          id: 1,
          title: "How do I browse and buy preloved items?",
          subtitle:
            "Head to the Preloved section and use filters to narrow down your search by size, category, or style. Once you're ready, add items to your cart and complete checkout.",
        },
        {
          id: 2,
          title: "What is Purchase Cover, and how do I add it?",
          subtitle:
            "Purchase Cover is optional insurance for lost or damaged items. Just select it at checkout to protect your purchase!",
        },
        {
          id: 3,
          title: "Can I return or exchange items?",
          subtitle:
            "Returns and exchanges vary depending on the seller. Be sure to check the seller's return policy on each listing before purchasing.",
        },
      ],
    },
  ]), []);

  const toggleFaq = (categoryId: number, faqId: number) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [categoryId]: prev[categoryId] === faqId ? null : faqId
    }));
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return faqCategories;
    
    const query = searchQuery.toLowerCase();
    return faqCategories.map(category => ({
      ...category,
      data: category.data.filter(faq => 
        faq.title.toLowerCase().includes(query) || 
        faq.subtitle.toLowerCase().includes(query)
      )
    })).filter(category => category.data.length > 0);
  }, [faqCategories, searchQuery]);

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
          <StackHeader
            title={t('aboutPages.faq')?.toUpperCase?.()}
            onPress={onClose}
            titleStyle={styles.appTitle}
          />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>Frequently Asked Questions (FAQs)</Text>
              <Text style={styles.heroSubtitle}>Have Questions? We&apos;re Here to Help!</Text>
              <Image 
                source={require("../assets/images/faq.png")} 
                style={styles.heroImage}
                resizeMode="cover"
              />
              <Text style={styles.heroBottom}>
                Find answers to the most common questions about buying, selling,
                organizing, and styling with WDRBE. If you don&apos;t find what you need
                here, contact our support team for further assistance.
              </Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchSection}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for keywords"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* FAQ Categories */}
            <View style={styles.faqSection}>
              {filteredCategories.map((category) => (
                <View key={category.id} style={styles.categoryCard}>
                  {/* Category Header */}
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryIcon}>
                      <Image 
                        source={require("../assets/images/general.png")} 
                        style={styles.categoryIconInner}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                  </View>

                  {/* FAQ Items */}
                  {category.data.map((faq) => (
                    <View key={faq.id} style={styles.faqCard}>
                      <TouchableOpacity
                        style={styles.faqHeader}
                        onPress={() => toggleFaq(category.id, faq.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.faqHeaderText}>{faq.title}</Text>
                        <Text style={styles.faqToggle}>
                          {expandedFaqs[category.id] === faq.id ? '−' : '+'}
                        </Text>
                      </TouchableOpacity>
                      {expandedFaqs[category.id] === faq.id && (
                        <View style={styles.faqContent}>
                          <Text style={styles.faqText}>{faq.subtitle}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default AboutFaqModal;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  appTitle: {
    textTransform: "uppercase",
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
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  heroBottom: {
    fontSize: fontSz(16),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(24),
  },
  searchSection: {
    marginBottom: 24,
  },
  searchInput: {
    backgroundColor: "#F7F7F9",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: fontSz(14),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
  },
  faqSection: {
    marginTop: 8,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryIcon: {
    width: 44,
    height: 39,
    backgroundColor: "#FFD8DB",
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconInner: {
    width: 44,
    height: 39,
  },
  categoryTitle: {
    fontSize: fontSz(20),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
  },
  faqCard: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F9FAFC',
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
    marginRight: 12,
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

