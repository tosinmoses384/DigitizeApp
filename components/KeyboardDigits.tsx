import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface KeypadProps {
  onKeyPress: (key: string) => void;
}

const Keypad: React.FC<KeypadProps> = ({ onKeyPress }) => {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.keypad}>
        {keys.map((key) => (
          <TouchableOpacity
            key={key}
            style={styles.key}
            onPress={() => onKeyPress(key)}
          >
            <Text style={styles.keyText}>{key}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.key} onPress={() => onKeyPress(".")}>
            <Text style={styles.keyText}>.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => onKeyPress("0")}>
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.key}
            onPress={() => onKeyPress("delete")}
          >
            <Ionicons name="backspace-outline" size={24} color="#FF3B4A" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? -10 : -10,
    left: -10,
    right: -10,
    borderColor: "#D3D5D8",
    borderBottomColor: "transparent",
    borderWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "white",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: Platform.OS === "ios" ? 10 : 4,
    marginVertical: Platform.OS === "ios" ? 20 : 0,
  },
  key: {
    width: "28%",
    padding: 10,
    backgroundColor: "#FFF7F8",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    margin: 4,
  },
  keyText: {
    fontSize: 21,
    fontFamily: "DMSansMedium",
    color: "#FF3B4A",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});

export default Keypad;
