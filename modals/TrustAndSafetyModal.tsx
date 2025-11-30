import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Platform, StyleSheet, TextInput, TouchableOpacity, Image, Modal, SafeAreaView, KeyboardAvoidingView } from "react-native";
import { Colors, SIZES } from "../constants/Colors";
import StackHeader from "../components/StackHeader";
import { router } from "expo-router";
import { useI18n } from "@hooks/use-i18n";
import { fontSz } from "../constants";

interface TrustAndSafetyModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const TrustAndSafetyModal = ({ isVisible, onClose }: TrustAndSafetyModalProps) => {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const phoneRegex = /^\+?[1-9]\d{1,14}$/;

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!phoneRegex.test(form.phone)) e.phone = "Phone number is not valid";
    if (!form.message.trim()) e.message = "Required";
    return e;
  }, [form]);

  const buyerProtection = useMemo(() => ([
    {
      id: 1,
      title: "Secure transactions",
      subtitle:
        "Your money is held securely throughout the entire transaction. All DigitizeApp payments are encrypted. They're handled by our trusted payment partners, whose secure technology makes sure money is sent and received safely and reliably.",
      bg: "#E5F3FF",
      image: require("../assets/images/buyer2.png"),
    },
    {
      id: 2,
      title: "Our support",
      subtitle: "You can reach out to us 24/7, and we'll see every issue through to its resolution. For quick tips, visit our ",
      subtitleWithLink: "Help Centre.",
      bg: "#FFF4E5",
      hasLink: true,
      linkRoute: "/helpCenter",
      image: require("../assets/images/buyer3.png"),
    },
  ]), []);

  const platformSecurity = useMemo(() => ([
    {
      id: 1,
      title: "Anti-spam tools",
      subtitle:
        "We proactively run systems that spot inappropriate content. Much like the spam filters in your email, they work to automatically block suspicious content in messages.",
      bg: "#FFE5E5",
      image: require("../assets/images/platform1.png"),
    },
    {
      id: 2,
      title: "Data protection",
      subtitle:
        "We take your privacy seriously. For detailed information on how we handle your personal data and what rights you have in this regard, please read our Privacy Policy.",
      bg: "#E5F3FF",
      image: require("../assets/images/platform2.png"),
    },
    {
      id: 3,
      title: "Risk scoring",
      subtitle:
        "Behind the scenes, we use predictive analysis to try to detect suspicious activities, announcements, or orders, such as illegal or hazardous products. Our team strives to respond early with effective tools.",
      bg: "#FFF4E5",
      image: require("../assets/images/platform3.png"),
    },
  ]), []);

  const buildTrust = useMemo(() => ([
    {
      id: 1,
      title: "Communicate",
      subtitle:
        "DigitizeApp's secure messaging tool helps you find out every detail about the item you'd like to purchase. You can message any member – just remember that you'll instantly increase their trust in you by being polite and considerate.",
      bg: "#FFE5E5",
      image: require("../assets/images/help1.png"),
    },
    {
      id: 2,
      title: "Review",
      subtitle:
        "DigitizeApp members can leave feedback for each other only after a completed order – so the feedback you see on people's profiles is based on actual experiences. Take a close look at the feedback left by other members, and remember to leave feedback after an order to receive it in return.",
      bg: "#E5F3FF",
      image: require("../assets/images/help2.png"),
    },
    {
      id: 3,
      title: "Get verified",
      subtitle:
        "To instantly boost your trustworthiness, take a moment to verify your account on DigitizeApp. If you'd like to see whether another member has verified their account, simply click through to their profile.",
      bg: "#FFF4E5",
      image: require("../assets/images/help3.png"),
    },
    {
      id: 4,
      title: "Be proactive",
      subtitle:
        "Fill out your profile with information – being proactive increases trust, which can also give your sales a boost. And if you see something that falls short of our community standards – report it so our team can take care of things.",
      bg: "#F0E5FF",
      image: require("../assets/images/help4.png"),
    },
  ]), []);

  const setField = (key: keyof typeof form, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = () => {
    setTouched({ name: true, email: true, phone: true, message: true });
    if (Object.keys(errors).length > 0) return;
    // Form submission logic here
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.light.background,
              paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
            }}
          >
            <StackHeader title={t('aboutPages.trustAndSafety')} onPress={onClose} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              {/* Top Section */}
              <View style={styles.topSection}>
                <Text style={styles.topTitle}>We take your safety seriously</Text>
                <Text style={styles.topSubtitle}>
                  DigitizeApp is focused on maintaining a high standard of personal security for
                  our members. We work proactively to create tools and policies that help
                  our community thrive – whether you're buying or selling. Here's what you
                  should know about our key safety processes.
                </Text>
              </View>

              {/* Buyer Protection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Buyer protection</Text>
                <Text style={styles.sectionSubtitle}>
                  When you pay through DigitizeApp, our mandatory Buyer Protection is applied to your order. 
                  It helps ensure safe payments, gives you the right to claim a refund, and access customer support.
                  {' '}
                  <Text style={styles.underlineText}>Learn how we calculate the Buyer Protection fee</Text>
                </Text>
                <View>
                  {buyerProtection.map((item) => (
                    <View key={item.id} style={styles.cardContainer}>
                      <Image 
                        source={item.image} 
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardSubtitle}>
                        {item.subtitle}
                        {item.hasLink && item.subtitleWithLink && (
                          <Text onPress={() => router.push('/helpCenter' as any)} style={styles.linkText}>
                            {item.subtitleWithLink}
                          </Text>
                        )}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Platform Security */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Platform security</Text>
                <Text style={styles.sectionSubtitle}>
                  When you pay through DigitizeApp, our mandatory Buyer Protection is applied to your order. 
                  It helps ensure safe payments, gives you the right to claim a refund, and access customer support.
                  {' '}
                  <Text style={styles.underlineText}>Learn how we calculate the Buyer Protection fee</Text>
                </Text>
                <View>
                  {platformSecurity.map((item) => (
                    <View key={item.id} style={styles.cardContainer}>
                      <Image 
                        source={item.image} 
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* We Help Build Trust */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>We help build trust within our community</Text>
                <View>
                  {buildTrust.map((item) => (
                    <View key={item.id} style={styles.buildTrustCard}>
                      <Image 
                        source={item.image} 
                        style={styles.buildTrustImage}
                        resizeMode="cover"
                      />
                      <View style={styles.buildTrustContent}>
                        <Text style={styles.buildTrustTitle}>{item.title}</Text>
                        <Text style={styles.buildTrustSubtitle}>{item.subtitle}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Contact Form */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact us</Text>
                <View style={styles.contactRow}>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>Africa office</Text>
                    <Text style={styles.contactAddress}>
                      3b Tiamiyu Savage St, Victoria Island 106104, Lagos, Nigeria
                    </Text>
                  </View>
                  <View style={styles.formContainer}>
                    <View style={styles.inputRow}>
                      <View style={styles.inputCol}>
                        <Text style={styles.inputLabel}>Name</Text>
                        <TextInput
                          value={form.name}
                          onChangeText={(v) => setField('name', v)}
                          onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                          placeholder="Name"
                          style={[styles.input, touched.name && errors.name ? styles.inputError : null]}
                        />
                        {touched.name && errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
                      </View>
                      <View style={styles.inputCol}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                          keyboardType="email-address"
                          autoCapitalize="none"
                          value={form.email}
                          onChangeText={(v) => setField('email', v)}
                          onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                          placeholder="Email"
                          style={[styles.input, touched.email && errors.email ? styles.inputError : null]}
                        />
                        {touched.email && errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                      </View>
                    </View>

                    <View style={styles.inputColFull}>
                      <Text style={styles.inputLabel}>Phone number</Text>
                      <TextInput
                        keyboardType="phone-pad"
                        value={form.phone}
                        onChangeText={(v) => setField('phone', v)}
                        onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                        placeholder="Phone number"
                        style={[styles.input, touched.phone && errors.phone ? styles.inputError : null]}
                      />
                      {touched.phone && errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
                    </View>

                    <View style={styles.inputColFull}>
                      <Text style={styles.inputLabel}>Your message</Text>
                      <TextInput
                        value={form.message}
                        onChangeText={(v) => setField('message', v)}
                        onBlur={() => setTouched((p) => ({ ...p, message: true }))}
                        placeholder="Your message"
                        style={[styles.input, styles.textarea, touched.message && errors.message ? styles.inputError : null]}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                      />
                      {touched.message && errors.message ? <Text style={styles.errorText}>{errors.message}</Text> : null}
                    </View>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                      <Text style={styles.submitText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default TrustAndSafetyModal;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
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
    marginBottom: 12,
  },
  topSubtitle: {
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
    marginBottom: 16,
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
  linkText: {
    color: '#FF3B4A',
    textDecorationLine: 'underline',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: fontSz(18),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: fontSz(14),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(20),
  },
  buildTrustCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  buildTrustImage: {
    width: 78,
    height: 69,
    borderRadius: 8,
    marginRight: 12,
  },
  buildTrustContent: {
    flex: 1,
  },
  buildTrustTitle: {
    fontSize: fontSz(18),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 6,
  },
  buildTrustSubtitle: {
    fontSize: fontSz(14),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(20),
  },
  contactRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: fontSz(16),
    color: "#1E2226",
    fontFamily: "DMSansSemiBold",
    marginBottom: 8,
  },
  contactAddress: {
    fontSize: fontSz(14),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
    lineHeight: fontSz(20),
  },
  formContainer: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputCol: {
    flex: 1,
  },
  inputColFull: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: fontSz(14),
    color: '#1E2226',
    marginBottom: 6,
    fontFamily: 'DMSansMedium',
  },
  input: {
    backgroundColor: '#F7F7F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: fontSz(14),
    color: '#1E2226',
  },
  textarea: {
    minHeight: 120,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF3B4A',
  },
  errorText: {
    marginTop: 4,
    color: '#FF3B4A',
    fontSize: fontSz(12),
  },
  submitBtn: {
    marginTop: 8,
    backgroundColor: '#1E2226',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: fontSz(14),
    fontFamily: 'DMSansSemiBold',
  },
});

