import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
    Pressable,
  } from "react-native";
  import React, { useState } from "react";
  import { defaultStyles } from "../constants/Styles";
  import { Colors } from "../constants/Colors";
  import { useRouter } from "expo-router";
  import { Ionicons } from "@expo/vector-icons";
  import axios from "axios";
  import * as yup from "yup";
  import { useToast } from "react-native-toast-notifications";
  import FilledButton from "../components/buttons/Filled_button";
  import TextButton from "../components/buttons/Text_button";
  import { useAppDispatch, useAppSelector } from "../redux/store";
  import SelectCountryModal from "modals/SelectCountryModal";
  import { useAuthManager } from "../hooks/use-auth-manager";
  import { useAuth } from "@providers/AuthProvider";
  import SocialLoginButtons from "@components/SocialLoginButtons";
import Signup from "./Signup";
  
  enum SignInType {
    Phone,
    Email,
    Google,
    Facebook,
  }
  
  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .required("Email or Phone number is required")
      .test("emailOrPhone", "Invalid email or phone number", (value) => {
        const isPhoneNumber = /^\d{11,15}$/.test(value || "");
        const isEmail = /\S+@\S+\.\S+/.test(value || "");
        return isPhoneNumber || isEmail;
      }),
    password: yup
      .string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters long"),
  });
  
  const Auth = () => {
    const toast = useToast();
    const { saveToken } = useAuthManager();
    const { login: authLogin } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [errors, setErrors]: any = useState({ email: "", password: "" });
    const [showCountryList, setShowCountryList] = useState(false);
    const dispatch = useAppDispatch();
    const { countryId } = useAppSelector((state) => state?.userCountryId);
    ////----
    const [tab, setTab] = useState<'login' | 'signup'>('signup');
    const [showPassword, setShowPassword] = useState(false);
    const [showCountryModal, setShowCountryModal] = useState(false);
    const [country, setCountry] = useState('');
    const [loginFields, setLoginFields] = useState({ email: '', password: '' });
    const [signupFields, setSignupFields] = useState({ email: '', firstName: '', lastName: '', country: '', password: '', policy: false });
    const [loginErrors, setLoginErrors] = useState<any>({});
    const [signupErrors, setSignupErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);
    ////-------
  
    const handleTabSwitch = (selected: 'login' | 'signup') => {
        ///-------
        console.log("selete",selected)
      setTab(selected);
      setLoginErrors({});
      setSignupErrors({});
    };
  
    const validateFields = async () => {
      try {
        await validationSchema.validate(
          { email, password },
          { abortEarly: false }
        );
        setErrors({});
        return true;
      } catch (err) {
        if (err instanceof yup.ValidationError) {
          const validationErrors = err.inner.reduce(
            (acc: any, currError: any) => {
              return { ...acc, [currError.path]: currError.message };
            },
            {}
          );
          setErrors(validationErrors);
        }
        return false;
      }
    };
  
    const handleLogin = async () => {
      const isValid = await validateFields();
      if (!isValid) return;
  
      try {
        setIsLoading(true);
        setApiError(null);
        
        // Use the new AuthProvider login method that handles JWT refresh tokens
        const response = await authLogin({
          emailAddress: email,
          password: password,
        });
        
        // Login successful - AuthProvider handles token storage and navigation
        toast.show("Login successful!", {
          type: "success",
          duration: 2000,
        });
        
      } catch (error: any) {
        if (__DEV__) {
          console.error("Login error:", error);
        }
        
        // Handle specific error messages from AuthProvider
        const errorMessage = error.message || "Unable to sign in. Please try again later.";
        toast.show(errorMessage, { 
          type: "danger", 
          duration: 4000 
        });
        setApiError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
  
    function onSignIn(Google: SignInType): void {
      throw new Error("Function not implemented.");
    }
  
    // console.log("working")
  
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.light.background }} behavior="padding" keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      {/* Tab Switcher OUTSIDE ScrollView */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tab, tab === 'login' ? styles.tabActive : styles.tabInactive]}
          onPress={() => handleTabSwitch('login')}
        >
          <Text style={[styles.tabText, tab === 'login' ? styles.tabTextActive : styles.tabTextInactive ]}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'signup' ? styles.tabActive : styles.tabInactive ]}
          onPress={() => handleTabSwitch('signup')}
        >
          <Text style={[styles.tabText, tab === 'signup' ? styles.tabTextActive : styles.tabTextInactive]}>Signup</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
   
          {tab == "login" && <>
            <View style={defaultStyles.container}>
            <Text style={defaultStyles.header}>Welcome back</Text>
            <Text style={defaultStyles.descriptionText}>
              Enter your details to Sign in
            </Text>
            <View style={{ marginTop: 20 }}>
              {/* Email */}
              <View
                style={[
                  styles.inputContainer,
                  errors.email ? styles.errorBorder : {},
                ]}
              >
                <Text
                  style={[
                    styles.placeholder,
                    focusedField === "email" || email
                      ? styles.placeholderFocused
                      : {},
                  ]}
                >
                  Email Address/Phone number
                </Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder={focusedField === "email" || email ? "" : " "}
                  placeholderTextColor={Colors.light.disabled}
                  value={email}
                  onBlur={() => setFocusedField(null)}
                  onFocus={() => setFocusedField("email")}
                  onChangeText={(text) => setEmail(text.toLowerCase())}
                  selectionColor={"#6b6464"}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
  
              {/* Password */}
              <View
                style={[
                  styles.inputContainer,
                  errors.password ? styles.errorBorder : {},
                ]}
              >
                <Text
                  style={[
                    styles.placeholder,
                    focusedField === "password" || password
                      ? styles.placeholderFocused
                      : {},
                  ]}
                >
                  Password
                </Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder={focusedField === "password" || password ? "" : " "}
                  placeholderTextColor={Colors.light.disabled}
                  value={password}
                  onBlur={() => setFocusedField(null)}
                  onFocus={() => setFocusedField("password")}
                  onChangeText={(text) => setPassword(text)}
                  secureTextEntry={!show}
                  selectionColor={"#6b6464"}
                />
                <TouchableOpacity
                  onPress={() => setShow(!show)}
                  style={styles.iconContainer}
                >
                  <Ionicons
                    name={show ? "eye" : "eye-off"}
                    size={24}
                    color={Colors.light.disabled}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>
  
            <TouchableOpacity
              onPress={() => router.push("/ForgotPassword")}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
  
            {/* Sign-in Button */}
            <View style={{ paddingVertical: 10 }}>
              <FilledButton
                title={"Sign in"}
                onPress={handleLogin}
                disable={isLoading}
                loading={isLoading}
              />
            </View>
  
            {/* Guest Sign-in Button */}
            <View style={{ paddingVertical: 5 }}>
              <TextButton
                title={"Continue as guest"}
                onPress={() =>
                  countryId ? router.push("/home") : setShowCountryList(true)
                }
              />
            </View>

 {/* Divider */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 22 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E9EAEB' }} />
            <Text style={{ marginHorizontal: 12, color: '#8A8F98', fontSize: 14, fontFamily: 'DMSansMedium' }}>Or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E9EAEB' }} />
          </View>

          {/* Social Login Buttons */}
          <View style={{ marginTop: 8, marginBottom: 8 }}>
            <Text style={{ fontSize: 15, fontFamily: 'DMSansMedium', color: '#8A8F98', marginBottom: 14, textAlign: 'center' }}>Signup with</Text>
            <SocialLoginButtons />
          </View>






            
          </View>
          {showCountryList && (
            <SelectCountryModal
              onClose={() => {
                setShowCountryList(false);
              }}
            />
          )}
          </>}
          {tab === 'signup' ? (
            <View style={{ marginTop: 12 }}>
              {/* Email */}
              <View style={[styles.inputContainer, signupErrors.email ? styles.errorBorder : {}]}> 
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor={Colors.light.disabled}
                  value={signupFields.email}
                  onChangeText={text => setSignupFields(f => ({ ...f, email: text }))}
                  autoCapitalize="none"
                />
              </View>
              {signupErrors.email && <Text style={styles.errorText}>{signupErrors.email}</Text>}

              {/* First Name & Last Name */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 0 }}>
                <View style={[styles.inputContainer, { flex: 1, marginBottom: 0 }, signupErrors.firstName ? styles.errorBorder : {}]}>
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    placeholderTextColor={Colors.light.disabled}
                    value={signupFields.firstName}
                    onChangeText={text => setSignupFields(f => ({ ...f, firstName: text }))}
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1, marginBottom: 0 }, signupErrors.lastName ? styles.errorBorder : {}]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    placeholderTextColor={Colors.light.disabled}
                    value={signupFields.lastName}
                    onChangeText={text => setSignupFields(f => ({ ...f, lastName: text }))}
                  />
                </View>
              </View>
              {signupErrors.firstName && <Text style={styles.errorText}>{signupErrors.firstName}</Text>}
              {signupErrors.lastName && <Text style={styles.errorText}>{signupErrors.lastName}</Text>}

              {/* Country Dropdown */}
              <Pressable
                style={[styles.inputContainer, { flexDirection: 'row', alignItems: 'center', marginBottom: 0 }, signupErrors.country ? styles.errorBorder : {}]}
                onPress={() => setShowCountryModal(true)}
              >
                <Text style={[styles.input, { flex: 1, color: signupFields.country ? '#222' : '#8A8F98' }]}> {signupFields.country ? signupFields.country : 'Country'} </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.light.iconText} />
              </Pressable>
              {signupErrors.country && <Text style={styles.errorText}>{signupErrors.country}</Text>}

              {/* Password */}
              <View style={[styles.inputContainer, signupErrors.password ? styles.errorBorder : {}]}> 
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Password"
                    placeholderTextColor={Colors.light.disabled}
                    value={signupFields.password}
                    onChangeText={text => setSignupFields(f => ({ ...f, password: text }))}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
                    <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={22} color={Colors.light.iconText} />
                  </TouchableOpacity>
                </View>
              </View>
              {signupErrors.password && <Text style={styles.errorText}>{signupErrors.password}</Text>}

              {/* Policy Checkbox */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setSignupFields(f => ({ ...f, policy: !f.policy }))}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, signupFields.policy && styles.checkboxChecked]}>
                  {signupFields.policy && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.checkboxLabel}>
                  I agree to the <Text style={styles.policyLink}>Terms of Service, Conditions & Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
              {signupErrors.policy && <Text style={styles.errorText}>{signupErrors.policy}</Text>}

              {/* Continue Button */}
              <View style={{ marginTop: 18, marginBottom: 8 }}>
                <FilledButton
                  title="Continue"
                  onPress={handleSignup}
                  disable={
                    !signupFields.email ||
                    !signupFields.firstName ||
                    !signupFields.lastName ||
                    !signupFields.password ||
                    !signupFields.policy ||
                    loading
                  }
                  loading={loading}
                />
              </View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.orText}>Or</Text>
                <View style={styles.divider} />
              </View>

              {/* Social Login Buttons */}
              <View style={{ marginTop: 8, marginBottom: 8 }}>
                <Text style={styles.socialTitle}>Signup with</Text>
                <SocialLoginButtons />
              </View>
            </View>
          ) : (
            <Signup />
          )}
     
  
    
      </ScrollView>
    </KeyboardAvoidingView>
  
  
  
  
  
  
     
    );
  };
  
  export default Auth;
  
  const styles = StyleSheet.create({
    inputContainer: {
      marginTop: 20,
      flexDirection: "row",
      backgroundColor: "#919EAB14",
      borderRadius: 12,
    },
    input: {
      padding: 20,
      fontSize: 19,
      marginRight: 10,
      flexDirection: "row",
      fontFamily: "DMSansBold",
      top: 10,
      color: "#212B36",
    },
    placeholder: {
      position: "absolute",
      top: "45%",
      left: 20,
      fontFamily: "DMSansMedium",
      fontSize: 18,
      color: Colors.light.disabled,
      transform: [{ translateY: -7 }],
    },
    placeholderFocused: {
      top: 15,
      fontSize: 16,
      color: Colors.light.tint,
      fontFamily: "DMSansMedium",
    },
    errorBorder: {
      borderWidth: 1,
      borderColor: "red",
    },
    errorText: {
      color: "red",
      fontSize: 12,
      fontFamily: "DMSansRegular",
      marginTop: 5,
      marginLeft: 20,
    },
    bottomContainer: {
      paddingVertical: 20,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
    },
    newToText: {
      fontSize: 16,
      color: Colors.light.black,
      fontFamily: "DMSansRegular",
    },
    signUpText: {
      fontSize: 16,
      color: Colors.light.colorText,
      fontFamily: "DMSansBold",
      textDecorationLine: "underline",
    },
    forgotPassword: {
      alignSelf: "flex-end",
      marginTop: 20,
      marginBottom: 30,
    },
    forgotPasswordText: {
      color: Colors.light.colorText,
      fontFamily: "DMSansRegular",
      fontSize: 16,
    },
    iconContainer: {
      justifyContent: "center",
      paddingRight: 10,
    },
    ////-----newstyles
    container: {
      flex: 1,
      backgroundColor: Colors.light.background,
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 0,
      justifyContent: 'flex-start',
    },
    tabSwitcher: {
      flexDirection: 'row',
      backgroundColor: '#F5F6F7',
      borderRadius: 16,
      marginBottom: 32,
      marginTop: 64,
      alignSelf: 'center',
      width: '92%',
      height: 48,
      borderWidth: 1,
      borderColor: '#E9EAEB',
      overflow: 'hidden',
      paddingHorizontal: 4,
      paddingTop: 0,
    },
    tab: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 14,
      height: 40,
      margin: 4,
    },
    tabActive: {
      backgroundColor: '#fff',
      borderWidth: 1.5,
      borderColor: Colors.light.colorText,
      zIndex: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    tabInactive: {
      backgroundColor: '#F5F6F7',
      borderWidth: 0,
    },
    tabText: {
      fontSize: 16,
      fontFamily: 'DMSansBold',
      fontWeight: '700',
      letterSpacing: 0.1,
    },
    tabTextActive: {
      color: Colors.light.colorText, // Figma: #D4313E
      fontWeight: '700',
    },
    tabTextInactive: {
      color: '#8A8F98',
      fontWeight: '400',
    },
    header: {
      fontSize: 22,
      fontWeight: '700',
      fontFamily: 'DMSansBold',
      marginBottom: 6,
      marginTop: 8,
      color: '#1E2226',
      textAlign: 'left',
    },
    descriptionText: {
      fontSize: 15,
      color: '#637381',
      fontFamily: 'DMSansRegular',
      marginBottom: 24,
      textAlign: 'left',
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      marginTop: 2,
      flexWrap: 'wrap',
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: '#FF3B4A',
      marginRight: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
    },
    checkboxChecked: {
      backgroundColor: '#FF3B4A',
      borderColor: '#FF3B4A',
    },
    checkboxLabel: {
      fontSize: 13,
      color: '#222',
      fontFamily: 'DMSansRegular',
      flex: 1,
      flexWrap: 'wrap',
      lineHeight: 18,
    },
    policyLink: {
      color: '#D4313E',
      textDecorationLine: 'underline',
      fontWeight: '500',
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 22,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: '#E9EAEB',
    },
    orText: {
      marginHorizontal: 12,
      color: '#8A8F98',
      fontSize: 14,
      fontFamily: 'DMSansMedium',
    },
    socialTitle: {
      fontSize: 15,
      fontFamily: 'DMSansMedium',
      color: '#8A8F98',
      marginBottom: 14,
      textAlign: 'center',
    },
  });
  