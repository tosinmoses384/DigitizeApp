import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import NewBottomModal from "@components/NewBottomModal";
import CustomButton from "@components/CustomButton";
import CloseIcon from "../../assets/images/svg/x-close.svg";
import CountryFlag from "react-native-country-flag";
import CountryCodeSelector, { Country } from "@components/CountryCodeSelector";
import { sanitizePhoneNumber } from "@utils/phoneValidation";

interface IContactDetailsModal {
  isShow: boolean;
  onClose: () => void;
  initialPhoneNumber?: string;
  initialCountryCode?: string;
  onSave: (phoneNumber: string, countryCode: string) => void;
}

const ContactDetailsModal = ({
  isShow,
  onClose,
  initialPhoneNumber = "",
  initialCountryCode = "234",
  onSave,
}: IContactDetailsModal) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [countryIsoCode, setCountryIsoCode] = useState("NG");
  const [showCountryCodePicker, setShowCountryCodePicker] = useState(false);

  const handleSave = () => {
    if (phoneNumber.trim()) {
      onSave(phoneNumber, countryCode);
      onClose();
    }
  };

  const handleClearAll = () => {
    setPhoneNumber("");
    setCountryCode("234");
    setCountryIsoCode("NG");
  };

  const handleSelectCountryCode = (country: Country) => {
    setCountryCode(country.dialCode);
    setCountryIsoCode(country.code);
  };

  return (
    <>
      <CountryCodeSelector
        isShow={showCountryCodePicker}
        onClose={() => setShowCountryCodePicker(false)}
        onSelect={handleSelectCountryCode}
        selectedCountryCode={countryIsoCode}
      />
      
    
    <NewBottomModal
      isShow={isShow}
      onClose={onClose}
      removeKeybordAvoidingView={false}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.pressed,
            ]}
          >
            <CloseIcon width={20} height={20} />
          </Pressable>
          <Text style={styles.headerTitle}>Your Contact Details</Text>
          <Pressable
            onPress={handleClearAll}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.clearText}>Clear All</Text>
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Add your phone number for smooth delivery</Text>
          <Text style={styles.description}>
            The shipping company may use it to send you shipping updates or contact you. 
            You can always edit or delete your phone number at checkout. Only a local phone 
            number can be used.
          </Text>

          {/* Phone Input */}
          <View style={styles.phoneInputContainer}>
            <Pressable
              style={styles.countryCodeButton}
              onPress={() => setShowCountryCodePicker(true)}
            >
              <View style={styles.flagContainer}>
                <CountryFlag isoCode={countryIsoCode} size={18} />
              </View>
              <Text style={styles.countryCodeText}>+{countryCode}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </Pressable>

            <TextInput
              style={styles.phoneInput}
              placeholder="Enter Phone Number"
              placeholderTextColor="#A0B1C0"
              value={phoneNumber}
              onChangeText={text => setPhoneNumber(sanitizePhoneNumber(text))}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Save"
            buttonStyle={styles.saveButton}
            textStyle={styles.saveButtonText}
            onPress={handleSave}
            disabled={!phoneNumber.trim()}
          />
        </View>
      </View>
    </NewBottomModal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "DMSansSemiBold",
    color: "#212B36",
    flex: 1,
    textAlign: "center",
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 14,
    fontFamily: "DMSansMedium",
    color: "#A0B1C0",
  },
  pressed: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 18,
    fontFamily: "DMSansSemiBold",
    color: "#212B36",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    fontFamily: "DMSansRegular",
    color: "#637381",
    lineHeight: 22,
    marginBottom: 24,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: "#F3F4F6",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  flagContainer: {
    marginRight: 8,
  },
  flag: {
    width: 24,
    height: 18,
    backgroundColor: "#10B981",
    borderRadius: 2,
  },
  countryCodeText: {
    fontSize: 16,
    fontFamily: "DMSansMedium",
    color: "#212B36",
    marginRight: 4,
  },
  dropdownArrow: {
    fontSize: 10,
    color: "#637381",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: "DMSansRegular",
    color: "#212B36",
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 30,
    backgroundColor: "white",
  },
  saveButton: {
    backgroundColor: "#FF3B4A",
    borderRadius: 12,
    paddingVertical: 16,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "DMSansSemiBold",
    textAlign: "center",
  },
});

export default ContactDetailsModal;
