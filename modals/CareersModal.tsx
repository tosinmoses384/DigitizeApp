import React, { useMemo } from "react";
import { View, Text, ScrollView, Platform, StyleSheet, TextInput, TouchableOpacity, Linking, Image, Modal, SafeAreaView, KeyboardAvoidingView } from "react-native";
import { Colors, SIZES } from "../constants/Colors";
import StackHeader from "../components/StackHeader";
import { useI18n } from "@hooks/use-i18n";
import { fontSz } from "../constants";

interface CareersModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const CareersModal = ({ isVisible, onClose }: CareersModalProps) => {
  const { t } = useI18n();

  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    linkedInProfile: "",
    email: "",
    phone: "",
    interest: "",
    message: "",
  });
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const phoneRegex = /^\+?[1-9]\d{1,14}$/;

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.linkedInProfile.trim()) e.linkedInProfile = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!phoneRegex.test(form.phone)) e.phone = "Phone number is not valid";
    if (!form.interest.trim()) e.interest = "Required";
    if (!form.message.trim()) e.message = "Required";
    return e;
  }, [form]);

  const setField = (key: keyof typeof form, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = () => {
    setTouched({ firstName: true, lastName: true, linkedInProfile: true, email: true, phone: true, interest: true, message: true });
    if (Object.keys(errors).length > 0) return;

    const subject = 'Interested in Joining';
    const body = `First Name: ${form.firstName}\nLast Name: ${form.lastName}\nEmail: ${form.email}\nPhone: ${form.phone}\nLinkedIn Profile: ${form.linkedInProfile}\nInterest: ${form.interest}\nMessage: ${form.message}`;
    const mailtoLink = `mailto:joseph@digitizeapp.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(mailtoLink);
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
            <StackHeader title={t('aboutPages.careers')} onPress={onClose} />

            <ScrollView 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              {/* Hero */}
              <View style={styles.heroWrapper}>
                <Text style={styles.heroTitle}>Careers at DigitizeApp</Text>
                <Text style={styles.heroSubtitle}>Join Our Team!</Text>
                <Text style={styles.heroContent}>
                  At DigitizeApp, we're dedicated to transforming the way people interact with their wardrobes while promoting sustainability and creativity. We believe that a passionate and talented team is essential to our mission.
                  {"\n\n"}
                  Even if we don't have any open positions right now, we're always interested in connecting with individuals who share our vision. If you're passionate about fashion, sustainability, and innovation, we encourage you to reach out!
                </Text>
                <Image 
                  source={require("../assets/images/career-banner.png")} 
                  style={styles.heroBanner}
                  resizeMode="cover"
                />
              </View>

              {/* Form */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Interested in Joining Us?</Text>
                <Text style={styles.sectionSubtitle}>Please fill out the form, and we'll keep your information on file for future opportunities.</Text>

                <View style={styles.inputRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>First Name</Text>
                    <TextInput
                      value={form.firstName}
                      onChangeText={(v) => setField('firstName', v)}
                      onBlur={() => setTouched((p) => ({ ...p, firstName: true }))}
                      placeholder="First Name"
                      style={[styles.input, touched.firstName && errors.firstName ? styles.inputError : null]}
                    />
                    {touched.firstName && errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Last Name</Text>
                    <TextInput
                      value={form.lastName}
                      onChangeText={(v) => setField('lastName', v)}
                      onBlur={() => setTouched((p) => ({ ...p, lastName: true }))}
                      placeholder="Last Name"
                      style={[styles.input, touched.lastName && errors.lastName ? styles.inputError : null]}
                    />
                    {touched.lastName && errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>LinkedIn Profile</Text>
                    <TextInput
                      value={form.linkedInProfile}
                      onChangeText={(v) => setField('linkedInProfile', v)}
                      onBlur={() => setTouched((p) => ({ ...p, linkedInProfile: true }))}
                      placeholder="LinkedIn Profile"
                      style={[styles.input, touched.linkedInProfile && errors.linkedInProfile ? styles.inputError : null]}
                    />
                    {touched.linkedInProfile && errors.linkedInProfile ? <Text style={styles.errorText}>{errors.linkedInProfile}</Text> : null}
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
                    <Text style={styles.inputLabel}>Phone Number</Text>
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
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Area of Interest</Text>
                    <TextInput
                      value={form.interest}
                      onChangeText={(v) => setField('interest', v)}
                      onBlur={() => setTouched((p) => ({ ...p, interest: true }))}
                      placeholder="Area of Interest"
                      style={[styles.input, touched.interest && errors.interest ? styles.inputError : null]}
                    />
                    {touched.interest && errors.interest ? <Text style={styles.errorText}>{errors.interest}</Text> : null}
                  </View>
                </View>

                <View style={styles.inputColFull}>
                  <Text style={styles.inputLabel}>Message/Why You Want to Join Us</Text>
                  <TextInput
                    value={form.message}
                    onChangeText={(v) => setField('message', v)}
                    onBlur={() => setTouched((p) => ({ ...p, message: true }))}
                    placeholder="Message/Why You Want to Join Us"
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

export default CareersModal;

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
  heroContent: {
    marginTop: 16,
    fontSize: fontSz(16),
    lineHeight: fontSz(22),
    color: "#1E2226",
    fontFamily: "DMSansRegular",
  },
  heroBanner: {
    marginTop: 16,
    height: 180,
    borderRadius: 12,
    width: '100%',
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

