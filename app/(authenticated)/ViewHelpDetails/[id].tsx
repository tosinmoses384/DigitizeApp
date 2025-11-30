import ListWithChevronRight from "@components/ListWithChevronRight";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Platform } from "react-native";
import { WebView } from "react-native-webview";

const ViewHelpDetails = () => {
  const { id, pageUrl }: any = useLocalSearchParams();

  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the HTML content from the provided pageUrl
  useEffect(() => {
    if (pageUrl) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await axios.get(pageUrl);

          setHtmlContent(response.data);
        } catch (err: any) {
          console.error("Error fetching data:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
      setLoading(false);
      setError("Page URL not provided.");
    }
  }, [pageUrl]);

  // Loading screen
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={"#FF3B4A"} />
      </View>
    );
  }

  // Error handling if the content or pageUrl fails to load
  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  // Render WebView with the fetched HTML content
  const renderWebView = () => {
    if (htmlContent) {
      return (
        <WebView
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          style={{ flex: 1, height: 400 }} // Ensuring WebView has a height
        />
      );
    }

    // Fallback content if HTML content is empty
    return (
      <View style={styles.centered}>
        <Text>No content available</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StackHeader
        title={id || ""}
        onPress={() => router.back()}
        isShowHeaderShadow
      />
      <ScrollView style={styles.wrapper}>{renderWebView()}</ScrollView>
    </View>
  );
};

export default ViewHelpDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
  },
  wrapper: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: "white",
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  webView: {
    flex: 1,
  },
});
