import React, { useRef } from "react";
import { View, TextInput, StyleSheet, TextInputProps } from "react-native";

interface CustomOtpInputProps {
  otpValue: string[];
  onChangeText: (text: string, index: number) => void;
  onFocus: (index: number) => void;
}

const CustomOtpInput: React.FC<CustomOtpInputProps> = ({
  otpValue,
  onChangeText,
  onFocus,
}) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Handle focusing the previous input field
  const handleDelete = (index: number) => {
    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: 4 }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={[
            styles.input,
            otpValue[index] && otpValue[index] !== ""
              ? styles.filledInput
              : null,
          ]}
          maxLength={1}
          keyboardType="numeric"
          value={otpValue[index] || ""}
          onChangeText={(text) => {
            onChangeText(text, index);
            if (text === "" && otpValue[index]) {
              handleDelete(index);
            } else if (text !== "" && index < 3) {
              inputRefs.current[index + 1]?.focus();
            }
          }}
          onFocus={() => onFocus(index)}
          secureTextEntry={true}
          selectionColor={"#FF3B4A"}
          showSoftInputOnFocus={false} // Android
          editable={false} // iOS & Android
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  input: {
    width: 62,
    height: 62,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
  },
  filledInput: {
    borderColor: "#FF3B4A",
  },
});

export default CustomOtpInput;
