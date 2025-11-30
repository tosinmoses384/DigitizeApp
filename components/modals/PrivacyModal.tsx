import React, { useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface PrivacyModalProps {
  visible: boolean;
  onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = React.memo(({ visible, onClose }) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <Text style={styles.title}>Privacy Policy</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityLabel="Close Privacy Policy"
              accessibilityRole="button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#637381" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.text}>
              This Privacy Policy describes how we collect, use, and protect your information when you use our application.
              {'\n\n'}
              <Text style={styles.subtitle}>1. Information We Collect</Text>
              {'\n'}
              We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.
              {'\n\n'}
              <Text style={styles.subtitle}>2. How We Use Your Information</Text>
              {'\n'}
              We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
              {'\n\n'}
              <Text style={styles.subtitle}>3. Information Sharing</Text>
              {'\n'}
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
              {'\n\n'}
              <Text style={styles.subtitle}>4. Data Security</Text>
              {'\n'}
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              {'\n\n'}
              <Text style={styles.subtitle}>5. Your Rights</Text>
              {'\n'}
              You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.
              {'\n\n'}
              <Text style={styles.subtitle}>6. Contact Us</Text>
              {'\n'}
              If you have any questions about this Privacy Policy, please contact us at privacy@digitizeapp.com.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </View>
      </SafeAreaProvider>
    </Modal>
  );
});

PrivacyModal.displayName = 'PrivacyModal';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
    minHeight: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'DMSans-Bold',
    flex: 1,
  },
  closeButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 115, 129, 0.1)',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    fontFamily: 'DMSans-Regular',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'DMSans-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
});

export default PrivacyModal;
