import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GoogleLogo from "@assets/images/svg/google.svg";
import { useSocialAuth } from "@hooks/use-social-auth";
import SocialAuthService from "@services/features/social-auth/socialAuthService";


const SocialSignupButtons= ({ onSuccess, onError }: { onSuccess?: (data: any) => void, onError?: (error: string) => void, mode?: 'login' | 'signup' }) => {

  const isIOS = Platform.OS === 'ios';
  const {
    loading,
    googleLoading,
    appleLoading,
    isAppleAvailable,
    setAppleLoading,
    setGoogleLoading,
    setLoading
  } = useSocialAuth();
 
 





  const handleGoogleSignUp = async () => {
   
   
    try {
    

  const  googleAuth = await SocialAuthService.signInWithGoogle();
    setLoading(true);
    setGoogleLoading(true);

    if (!googleAuth) {
      throw new Error("No authentication data received from Apple");
    }

    // Authenticate with backend
    const authData = SocialAuthService.createGoogleAuthRequest(googleAuth);
 
     
if(authData?.token){
  onSuccess?.(authData);
}else{

  onError?.('Sorry you cant sign up with apple now, please try again')
}
    } catch (err) {
      if (onError) onError('Sorry you cant sign up with apple now, please try again');
    }

   

};

const handleAppleSignUp = async () => {
  let appleAuth: any = null;
    try {
    

    appleAuth = await SocialAuthService.signInWithApple();
    setLoading(true);
      setAppleLoading(true);
    if (!appleAuth) {
      throw new Error("No authentication data received from Apple");
    }

    // Authenticate with backend
    const authData = SocialAuthService.createAppleAuthRequest(appleAuth);
 
     
if(authData?.token){
  onSuccess?.(authData);
  setLoading(false);
  setAppleLoading(false);
}else{

  onError?.('Sorry you cant sign up with apple now, please try again')
  setLoading(false);
  setAppleLoading(false);
}
    } catch (err) {
      if (onError) onError('Sorry you cant sign up with apple now, please try again');
      setLoading(false);
      setAppleLoading(false);
    }

};



  return (
    <View style={styles.container}>
      <Text style={styles.signupText}>Signup with</Text>
      <View style={styles.buttonContainer}>
        {isAppleAvailable && (
          <TouchableOpacity 
            style={[
              styles.socialButton, 
              (loading || appleLoading || googleLoading) && styles.buttonDisabled
            ]} 
            onPress={handleAppleSignUp}
            disabled={loading || appleLoading || googleLoading}
            accessibilityLabel="Sign up with Apple"
            accessibilityRole="button"
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
        <TouchableOpacity 
          style={[
            styles.socialButton, 
            !isIOS && styles.fullWidthButton,
            (loading || googleLoading || appleLoading) && styles.buttonDisabled
          ]}
          onPress={handleGoogleSignUp}
          disabled={loading || googleLoading || appleLoading}
          accessibilityLabel="Sign up with Google"
          accessibilityRole="button"
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
              {googleLoading ? "Signing up..." : "Continue with Google"}
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
  signupText: {
    fontSize: 18,
    fontFamily: "DMSansBold",
    fontWeight: "500",
    marginBottom: 30,
    color: "#1E2226",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
    width: "80%",
  },
  socialButton: {
    backgroundColor: "#FFFFFF",
    width: 70,
    height: 70,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#D3D3D3",
  },
  fullWidthButton: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 15,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "DMSans",
    fontWeight: "700",
    color: "#333",
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

export default SocialSignupButtons; 