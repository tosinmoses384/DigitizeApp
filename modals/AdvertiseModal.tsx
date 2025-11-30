import React, { useMemo } from "react";
import { View, Text, ScrollView, Platform, StyleSheet, TextInput, TouchableOpacity, Linking, Image, Modal, SafeAreaView, KeyboardAvoidingView } from "react-native";
import { Colors, SIZES } from "../constants/Colors";
import StackHeader from "../components/StackHeader";
import { useI18n } from "@hooks/use-i18n";
import { fontSz } from "../constants";

interface AdvertiseModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const AdvertiseModal = ({ isVisible, onClose }: AdvertiseModalProps) => {
  const { t } = useI18n();

  const whyPartner = useMemo(() => ([
    {
      id: 1,
      title: "Engaged Audience",
      subtitle:
        "Our users are fashion-conscious individuals who actively seek unique and sustainable options, making them ideal customers for your brand.",
      bg: "#FFE5E5",
      image: require("../assets/images/partner1.png"),
    },
    {
      id: 2,
      title: "Brand Alignment",
      subtitle:
        "Join us in promoting ethical fashion and responsible consumption. Partnering with DigitizeApp aligns your brand with sustainability and innovation.",
      bg: "#E5F3FF",
      image: require("../assets/images/partner2.png"),
    },
    {
      id: 3,
      title: "Flexible Ad Options",
      subtitle:
        "We offer various advertising slots and formats to fit your marketing goals, whether you're looking for banner ads, sponsored content, or exclusive promotions.",
      bg: "#FFF4E5",
      image: require("../assets/images/partner3.png"),
    },
  ]), []);

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    companyName: "",
    website: "",
    interest: "",
    message: "",
  });
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.companyName.trim()) e.companyName = "Required";
    if (!form.website.trim()) e.website = "Required";
    if (!form.interest.trim()) e.interest = "Required";
    if (!form.message.trim()) e.message = "Required";
    return e;
  }, [form]);

  const handleSubmit = () => {
    setTouched({ name: true, email: true, companyName: true, website: true, interest: true, message: true });
    if (Object.keys(errors).length > 0) return;

    const subject = 'New Advertising Inquiry';
    const body = `Name: ${form.name}\nEmail: ${form.email}\nCompany Name: ${form.companyName}\nWebsite: ${form.website}\nInterest: ${form.interest}\nMessage: ${form.message}`;
    const encodedBody = encodeURIComponent(body);
    const mailtoLink = `mailto:joseph@digitizeapp.com?subject=${encodeURIComponent(subject)}&body=${encodedBody}`;
    Linking.openURL(mailtoLink);
  };

  const setField = (key: keyof typeof form, value: string) => setForm((p) => ({ ...p, [key]: value }));

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
            <StackHeader title={t('aboutPages.advertise')} onPress={onClose} />

            <ScrollView 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              {/* Hero */}
              <View style={styles.heroWrapper}>
                <Text style={styles.heroTitle}>Advertise with DigitizeApp</Text>
                <Text style={styles.heroSubtitle}>Grow Your Brand with Us!</Text>
                <Image 
                  source={require("../assets/images/advertise.png")} 
                  style={styles.heroImage}
                  resizeMode="cover"
                />
                <Text style={styles.heroBottom}>
                  At DigitizeApp, we&apos;re passionate about connecting fashion enthusiasts with sustainable choices. Our platform not only helps users digitize their wardrobes and buy and sell preloved items but also fosters a community that values creativity and responsible fashion. By partnering with us, you can reach a targeted audience that cares about style and sustainability.
                </Text>
              </View>

              {/* Why Partner */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Why Partner with DigitizeApp?</Text>
                <View>
                  {whyPartner.map((item) => (
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

              {/* Form */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Get Started Today!</Text>
                <Text style={styles.sectionSubtitle}>
                  If you&apos;re interested in exploring advertising opportunities with DigitizeApp, please fill out the form below, and our team will get back to you shortly.
                </Text>

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

                <View style={styles.inputRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Company Name</Text>
                    <TextInput
                      value={form.companyName}
                      onChangeText={(v) => setField('companyName', v)}
                      onBlur={() => setTouched((p) => ({ ...p, companyName: true }))}
                      placeholder="Company Name"
                      style={[styles.input, touched.companyName && errors.companyName ? styles.inputError : null]}
                    />
                    {touched.companyName && errors.companyName ? <Text style={styles.errorText}>{errors.companyName}</Text> : null}
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Website</Text>
                    <TextInput
                      autoCapitalize="none"
                      value={form.website}
                      onChangeText={(v) => setField('website', v)}
                      onBlur={() => setTouched((p) => ({ ...p, website: true }))}
                      placeholder="Website"
                      style={[styles.input, touched.website && errors.website ? styles.inputError : null]}
                    />
                    {touched.website && errors.website ? <Text style={styles.errorText}>{errors.website}</Text> : null}
                  </View>
                </View>

                <View style={styles.inputColFull}>
                  <Text style={styles.inputLabel}>Advertising Interest</Text>
                  <TextInput
                    value={form.interest}
                    onChangeText={(v) => setField('interest', v)}
                    onBlur={() => setTouched((p) => ({ ...p, interest: true }))}
                    placeholder="Area of Interest"
                    style={[styles.input, touched.interest && errors.interest ? styles.inputError : null]}
                  />
                  {touched.interest && errors.interest ? <Text style={styles.errorText}>{errors.interest}</Text> : null}
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
                  <Text style={styles.submitText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default AdvertiseModal;

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
    borderRadius: 8,
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

