import * as React from "react";
import { memo } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CountryFlag from "react-native-country-flag";

interface IEnterPhoneNumber1 {
  flag?: string;
  dialingCode?: string;
  phone: string;
  onSelectCountry: () => void;
  onPhoneChange: (text: string) => void;
  hasError?: boolean;
}

const EnterPhoneNumber1 = memo(({ 
  flag, 
  dialingCode, 
  phone, 
  onSelectCountry, 
  onPhoneChange,
  hasError = false 
}: IEnterPhoneNumber1) => {
  return (
    <View style={styles.enterphonenumber}>
      <View style={styles.echild1}>
        <View style={styles.echild2}>
          <View style={styles.phoneNumber}>
            <View style={styles.textfield}>
              <TouchableOpacity
                style={[styles.wrap, hasError && styles.errorBorder]}
                onPress={onSelectCountry}
                activeOpacity={0.7}
              >
                {flag ? (
                  <CountryFlag isoCode={flag} size={16} />
                ) : (
                  <View style={styles.startAdornmentIcon} />
                )}
                <Text style={styles.value} numberOfLines={1}>
                  {(() => {
                    if (!dialingCode) return '';
                    // Don't display if it looks like a UUID (very long with hyphens, >15 chars)
                    if (dialingCode.length > 15 && dialingCode.includes('-')) {
                      return '';
                    }
                    // Format dial code - ensure it has + prefix
                    if (dialingCode.startsWith('+')) {
                      return dialingCode;
                    }
                    // Add + prefix if missing
                    return `+${dialingCode.replace(/^\+/, '')}`;
                  })()}
                </Text>
                <Ionicons 
                  name="chevron-down" 
                  size={14} 
                  color="#919eab" 
                  style={styles.selectArrowIcon}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.textfield2}>
              <View style={[styles.wrap2, hasError && styles.errorBorder]}>
                <TextInput
                  style={styles.value2}
                  placeholder="Phone Number"
                  placeholderTextColor="#919eab"
                  value={phone}
                  onChangeText={onPhoneChange}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  enterphonenumber: {
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
  echild1: {
    width: "100%",
    alignItems: "flex-start",
  },
  echild2: {
    alignSelf: "stretch",
    alignItems: "flex-start",
  },
  phoneNumber: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },
  textfield: {
    height: 53,
    width: 99,
    alignItems: "flex-start",
  },
  wrap: {
    alignSelf: "stretch",
    flex: 1,
    borderRadius: 8,
    backgroundColor: "rgba(145, 158, 171, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
    paddingRight: 18,
    position: "relative",
  },
  startAdornmentIcon: {
    height: 16,
    width: 30,
    zIndex: 0,
  },
  value: {
    position: "relative",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "DMSansRegular",
    color: "#919eab",
    textAlign: "left",
    overflow: "hidden",
    zIndex: 1,
    marginLeft: 4,
    maxWidth: 45,
    marginRight: 16,
  },
  selectArrowIcon: {
    position: "absolute",
    marginTop: -10,
    top: "50%",
    right: 2,
    zIndex: 2,
  },
  textfield2: {
    flex: 1,
    alignItems: "flex-start",
  },
  wrap2: {
    alignSelf: "stretch",
    height: 53,
    borderRadius: 8,
    backgroundColor: "rgba(145, 158, 171, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
    paddingRight: 10,
  },
  value2: {
    flex: 1,
    position: "relative",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "DMSansRegular",
    color: "#222",
    textAlign: "left",
    overflow: "hidden",
    padding: 0,
    backgroundColor: "transparent",
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: "#FF3B4A",
  },
});

export default EnterPhoneNumber1;

