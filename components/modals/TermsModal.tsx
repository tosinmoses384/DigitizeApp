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

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = React.memo(({ visible, onClose }) => {
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
            <Text style={styles.title}>Terms & Conditions</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityLabel="Close Terms and Conditions"
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
              By using this application, you agree to be bound by these Terms and Conditions. 
              Please read them carefully before using our services.
              {'\n\n'}
              <Text style={styles.subtitle}>1. Acceptance of Terms</Text>
              {'\n'}
              By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.
              {'\n\n'}
              <Text style={styles.subtitle}>2. Use License</Text>
              {'\n'}
              Permission is granted to temporarily download one copy of the materials on this application for personal, non-commercial transitory viewing only.
              {'\n\n'}
              <Text style={styles.subtitle}>3. Disclaimer</Text>
              {'\n'}
              The materials on this application are provided on an &apos;as is&apos; basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties.
              {'\n\n'}
              <Text style={styles.subtitle}>4. Limitations</Text>
              {'\n'}
              In no event shall the company or its suppliers be liable for any damages arising out of the use or inability to use the materials on this application.
              {'\n\n'}
              <Text style={styles.subtitle}>5. Privacy Policy</Text>
              {'\n'}
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the application.
              {'\n\n'}
              <Text style={styles.subtitle}>6. Contact Information</Text>
              {'\n'}
              If you have any questions about these Terms and Conditions, please contact us at support@digitizeapp.com.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </View>
      </SafeAreaProvider>
    </Modal>
  );
});

TermsModal.displayName = 'TermsModal';

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

export default TermsModal;
