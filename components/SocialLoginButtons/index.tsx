import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
// Import Ionicons from @expo/vector-icons
import { Ionicons } from "@expo/vector-icons";
// Import the Google SVG logo
import GoogleLogo from "@assets/images/svg/google.svg";
// Import the social authentication hook
import { useSocialAuth } from "@hooks/use-social-auth";

const SocialLoginButtons = ({ onSuccess, onError, mode = 'login' }: { onSuccess?: (data: any) => void, onError?: (error: string) => void, mode?: 'login' | 'signup' }) => {
  const isIOS = Platform.OS === 'ios';
  const {
    loading,
    googleLoading,
    appleLoading,
    signInWithGoogle,
    signInWithApple,
    isAppleAvailable,
  } = useSocialAuth();

  const handleGoogleSignIn = async () => {
    if (mode === 'login') {
      try {
        await signInWithGoogle(onSuccess, onError);
      } catch (err) {
        if (onError) onError('Google login error');
      }
    } else {
      await signInWithGoogle(onSuccess, onError);
    }
  };

  const handleAppleSignIn = async () => {
    if (mode === 'login') {
      try {
        await signInWithApple(onSuccess, onError);
      } catch (err) {
        if (onError) onError('Apple login error');
      }
    } else {
      await signInWithApple(onSuccess, onError);
    }
  };

  return (
    <View style={styles.container}>
      {/* Title for the login section */}
      <Text style={styles.loginText}>Login with</Text>

      {/* Container for the social media buttons */}
      <View style={styles.buttonContainer}>
        {/* Apple Login Button - Only show on iOS */}
        {isAppleAvailable && (
          <TouchableOpacity 
            style={[
              styles.socialButton, 
              (loading || appleLoading || googleLoading) && styles.buttonDisabled
            ]} 
            onPress={handleAppleSignIn}
            disabled={loading || appleLoading || googleLoading}
            accessibilityLabel="Sign in with Apple"
            accessibilityRole="button"
            accessibilityState={{ disabled: loading || appleLoading || googleLoading }}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="logo-apple" size={40} color="#000000" />
              {appleLoading && (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="small" color="#000000" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Google Login Button */}
        <TouchableOpacity 
          style={[
            styles.socialButton, 
            !isIOS && styles.fullWidthButton,
            (loading || googleLoading || appleLoading) && styles.buttonDisabled
          ]}
          onPress={handleGoogleSignIn}
          disabled={loading || googleLoading || appleLoading}
          accessibilityLabel="Sign in with Google"
          accessibilityRole="button"
          accessibilityState={{ disabled: loading || googleLoading || appleLoading }}
        >
          <View style={styles.buttonContent}>
            <GoogleLogo width={35} height={35} />
            {googleLoading && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color="#4285F4" />
              </View>
            )}
          </View>
          {!isIOS && (
            <Text style={styles.buttonText}>
              {googleLoading ? "Signing in..." : "Continue with Google"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loginText: {
    fontSize: 18,
    fontFamily: "DMSansBold", // Ensure this font is available in your project
    fontWeight: "500",
    marginBottom: 30, // Space below the text
    color: "#1E2226", // Darker text color
  },
  buttonContainer: {
    flexDirection: "row", // Arrange buttons horizontally
    justifyContent: "center", // Center the buttons
    alignItems: "center",
    gap: 30, // Space between buttons
    width: "80%", // Occupy 80% of the container width
  },
  socialButton: {
    backgroundColor: "#FFFFFF", // White background for buttons
    width: 70, // Fixed width for square buttons
    height: 70, // Fixed height for square buttons
    borderRadius: 15, // Rounded corners
    justifyContent: "center",
    alignItems: "center",
    // Shadow properties for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // Elevation for Android
    elevation: 3,
    borderWidth: 1, // Border to match the image
    borderColor: "#D3D3D3", // Light grey border
  },
  fullWidthButton: {
    width: "100%", // Full width on Android when it's the only button
    flexDirection: "row", // Horizontal layout for icon and text
    paddingHorizontal: 20, // Add padding for better text spacing
    gap: 15, // Space between icon and text
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "DMSans", // Match your app's font family
    fontWeight: "700",
    color: "#333", // Dark text color
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loaderContainer: {
    marginLeft: 4,
  },
});

export default SocialLoginButtons;
