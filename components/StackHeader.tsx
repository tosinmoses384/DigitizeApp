import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  GestureResponderEvent,
} from "react-native";
import InfoIcon from "../assets/images/svg/info.svg";

import { Ionicons, FontAwesome } from "@expo/vector-icons";
// import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { Colors } from "../constants/Colors";
import { LinearGradient } from "expo-linear-gradient";

// Define types for props
interface StackHeaderProps {
  onPress?: (event: GestureResponderEvent) => void;
  title: any;
  style?: boolean;
  notificationOnPress?: (event: GestureResponderEvent) => void;
  isShowHeaderShadow?: boolean;
  titleStyle?: any;
  containerStyle?: any;
  headerStyle?: any;
  rightElement?: React.ReactNode;
}

const StackHeader: React.FC<StackHeaderProps> = ({
  onPress,
  title,
  style,
  notificationOnPress,
  isShowHeaderShadow,
  titleStyle,
  containerStyle,
  headerStyle,
  rightElement,
}) => {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: style === true ? 35 : 18,
          paddingBottom: 20,
          backgroundColor: Colors.light.background,
          paddingHorizontal: 30,
        },
        containerStyle,
      ]}
    >
      {onPress && (
        <TouchableOpacity
          onPress={onPress}
          style={{
            backgroundColor: "rgba(237, 242, 244, 0.1)",
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            left: 1,
            top: style === true ? 28 : undefined,
          }}
        >
          <Ionicons name="chevron-back" color={"#071827"} size={25} />
        </TouchableOpacity>
      )}
      <Text style={[styles.text, titleStyle, headerStyle]}>{title}</Text>
      {rightElement && (
        <View
          style={{
            position: "absolute",
            right: 0,
            top: style === true ? 28 : undefined,
          }}
        >
          {rightElement}
        </View>
      )}
      {isShowHeaderShadow && (
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "transparent"]}
          style={styles.shadowGradient}
        />
      )}
    </View>
  );
};

interface StackHeaderDarkProps {
  onPress?: (event: GestureResponderEvent) => void;
  title: string;
  chat?: any; // Adjust type if more information about chat is available
  notificationOnPress?: (event: GestureResponderEvent) => void;
}

export const StackHeaderDark: React.FC<StackHeaderDarkProps> = ({
  onPress,
  title,
  chat,
  notificationOnPress,
}) => {
  return (
    <View style={[styles.header, { backgroundColor: "#000" }]}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.headerContainer,
          { backgroundColor: "rgba(70, 79, 84, 1)" },
        ]}
      >
        <Ionicons
          name="chevron-back"
          color={"rgba(255, 255, 255, 1)"}
          size={20}
        />
      </TouchableOpacity>
      <Text style={[styles.text, { color: "rgba(255, 255, 255, 1)" }]}>
        {title}
      </Text>
    </View>
  );
};

interface ResourcesHeaderProps {
  onPress?: (event: GestureResponderEvent) => void;
  title: string;
  infoRoute?: string;
}

export const ResourcesHeaderMain: React.FC<ResourcesHeaderProps> = ({
  title,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 18,
        paddingBottom: 20,
        // backgroundColor: "#ffffff",
      }}
    >
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};
interface ResourcesHeaderMainProps {
  onPress?: (event: GestureResponderEvent) => void;
  title: string;
  infoRoute?: any;
}

export const ResourcesHeader: React.FC<ResourcesHeaderMainProps> = ({
  onPress,
  title,
  infoRoute,
}) => {
  const router = useRouter();

  return (
    <View style={styles.resourcesHeader}>
      <TouchableOpacity onPress={onPress} style={styles.lowerCotainer}>
        <Ionicons name="chevron-back" color={"rgba(70, 79, 84, 1)"} size={20} />
      </TouchableOpacity>

      <Text style={styles.text}>{title}</Text>

      <TouchableOpacity
        onPress={() => infoRoute && router.push(infoRoute)}
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <InfoIcon width={25} height={25} />
      </TouchableOpacity>
    </View>
  );
};
interface ResourcesHeaderForMissedProps {
  onPress?: (event: GestureResponderEvent) => void;
  title: string;
  rightTitle: string;
  navigation?: (event: GestureResponderEvent) => void;
}

export const ResourcesHeaderForMissed: React.FC<
  ResourcesHeaderForMissedProps
> = ({ onPress, title, rightTitle, navigation }) => {
  return (
    <View style={styles.resourcesHeader}>
      <TouchableOpacity onPress={onPress} style={styles.lowerCotainer}>
        <Ionicons name="chevron-back" color={"rgba(70, 79, 84, 1)"} size={20} />
      </TouchableOpacity>

      <Text style={styles.text}>{title}</Text>
      <TouchableOpacity
        onPress={navigation}
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={styles.textMissed}>{rightTitle}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StackHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 30,
  },
  resourcesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 20,
    // backgroundColor: "#ffffff",
    // paddingHorizontal: 30,
  },
  lowerCotainer: {
    // backgroundColor: "rgba(70, 79, 84, .1)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerContainer: {
    backgroundColor: "rgba(70, 79, 84, .1)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: 24,
  },
  text: {
    fontSize: 16,
    color: "rgba(70, 79, 84, 1)",
    fontFamily: "DMSansBold",
    // Preserve provided casing from callers
    width: "100%",
    textAlign: "center",
  },
  textMissed: {
    fontSize: 14,
    color: "rgba(245, 0, 15, 1)",
  },
  shadowGradient: {
    position: "absolute",
    top: 58,
    left: 0,
    right: 0,
    height: 10, // Height of the shadow
    zIndex: -1,
  },
});
