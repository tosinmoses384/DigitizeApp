import React, { useState, useCallback, useEffect } from "react";
import { Modal, InteractionManager } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ToastProvider } from "react-native-toast-notifications";
import { useAuthManager } from "../hooks/use-auth-manager";
import { useSignInMethods } from "../hooks/use-sign-in-methods";
import {
  EmailScreen,
  LoginOtpScreen,
  PasswordScreen,
  SignupScreen,
  SignupOtpScreen,
  ForgotPasswordScreen,
  authStyles,
  ForgotPasswordOtp,
  SetPasswordScreen,
} from "./auth";
import identityServices from "../services/features/identity-service/loginService";
import { robustApiClient } from "../utils/robustApiClient";
import { networkErrorHandler } from "../utils/networkErrorHandler";
import { useAppDispatch } from "../redux/store";
import { setResetCodeDuration } from "../redux/slice/profile/profileSlice";
import authNavigationEvents from "@utils/authNavigationEvents";

interface ModalAuthProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}




const ModalAuth: React.FC<ModalAuthProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { saveToken, saveTokens } = useAuthManager();
  const { checkSignInMethods } = useSignInMethods();
  const [currentScreen, setCurrentScreen] = useState<
    | "email"
    | "loginOtp"
    | "password"
    | "signup"
    | "signupOtp"
    | "forgotPassword"
    | "forgotPasswordOtp"
    | "setPassword"
  >("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordFlow, setPasswordFlow] = useState<'signup' | 'reset'>('reset');
  const [loginError, setLoginError] = useState<string>("");
  const [otpContext, setOtpContext] = useState<'login' | 'signup'>('login');

  const handlePasswordChange = useCallback((newPassword: string) => {
    setPassword(newPassword);
    if (loginError) {
      setLoginError("");
    }
  }, [loginError]);

  const handleEmailContinue = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoginError("");
      
      const result = await checkSignInMethods(email);

      if (result) {
        if (result.userExists) {
          const otpResponse = await identityServices.requestLoginOtp({
            emailAddress: email,
          });

          if (otpResponse.responseCode === "0" && otpResponse.data?.succeeded) {
            setOtpContext('login');
            setCurrentScreen('loginOtp');
          } else {
            setLoginError(otpResponse.message || "Failed to send OTP. Please try again.");
          }
        } else {
          setCurrentScreen('signup');
        }
      } else {
        setLoginError("Unable to validate email. Please try again.");
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Email validation error:", error);
      }
      
      setLoginError("Unable to validate email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [email, checkSignInMethods]);

  const handleLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoginError("");
      
      const response = await robustApiClient.post(
        '/identity/v1/signin/user',
        {
          emailAddress: email,
          password: password,
        },
        {
          context: 'User Login',
          retryConfig: {
            maxAttempts: 2,
            baseDelay: 2000,
            maxDelay: 5000
          }
        }
      );

      if (response.status === 200 && response.responseCode === "0") {
        
        const accessToken = response.data.accessToken;
        const refreshToken = response.data.refreshToken;
        
        if (accessToken && refreshToken) {
          await saveTokens({ accessToken, refreshToken });
        } else if (accessToken) {
          await saveToken(accessToken);
        } else {
          throw new Error('No access token received from server');
        }

        // Navigation will be performed by auth manager; modal closes on navigation complete event
      } else {
        setLoginError(response.data?.detail || response.message || "Invalid email address or password");
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Login error:", error);
      }
      
      const networkError = await networkErrorHandler.handleError(error, 'User Login');
      
      if (networkError.code === 'REQUEST_CANCELED') {
        return;
      } else if (networkError.code === 'CLIENT_ERROR_401') {
        setLoginError("Invalid email address or password");
      } else {
        setLoginError(networkError.userMessage || "Unable to login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, password, saveToken, saveTokens]);

  const handleClose = useCallback(() => {
    setCurrentScreen('email');
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setLoginError("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    const unsubscribe = authNavigationEvents.subscribeComplete(() => {
      InteractionManager.runAfterInteractions(() => {
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      });
    });
    return unsubscribe;
  }, [onClose, onSuccess]);

  const handleBack = useCallback(() => {
    setLoginError("");
    if (currentScreen === 'loginOtp') {
      setCurrentScreen('email');
    } else if (currentScreen === 'password') {
      setCurrentScreen('email');
    } else if (currentScreen === 'signup') {
      setCurrentScreen('email');
    } else if (currentScreen === 'signupOtp') {
      setCurrentScreen('signup');
    } else if (currentScreen === 'forgotPassword') {
      setCurrentScreen('password');
    } else if (currentScreen === "forgotPasswordOtp") {
      setCurrentScreen("forgotPassword");
    } else if (currentScreen === "setPassword") {
      if (passwordFlow === 'signup') {
        setCurrentScreen("loginOtp");
      } else {
        setCurrentScreen("forgotPasswordOtp");
      }
    }
  }, [currentScreen, passwordFlow]);

  const handleForgotPassword = useCallback(() => {
    setCurrentScreen("forgotPassword");
  }, []);

  const handleForgotPasswordSuccess = useCallback(
    (userEmail: string, duration: number) => {
      dispatch(setResetCodeDuration(duration));
      setEmail(userEmail);
      setCurrentScreen("forgotPasswordOtp");
    },
    [dispatch]
  );

  const handleForgotPasswordOtpSuccess = useCallback(
    (email: string, code: string) => {
      setEmail(email);
      setVerificationCode(code);
      setPasswordFlow('reset');
      setCurrentScreen("setPassword");
    },
    []
  );

  const handleSetPasswordSuccess = useCallback(() => {
    // Reset to login screen within the modal instead of navigating to old login screen
    setCurrentScreen('password');
    setPassword('');
    setShowPassword(false);
  }, []);

  const handleSignupSuccess = useCallback(async (userEmail: string) => {
    setEmail(userEmail);
    
    try {
      const otpResponse = await identityServices.requestLoginOtp({
        emailAddress: userEmail,
      });

      if (otpResponse.responseCode === "0" && otpResponse.data?.succeeded) {
        setOtpContext('signup');
        setCurrentScreen('loginOtp');
      } else {
        setLoginError(otpResponse.message || "Failed to send verification code. Please try again.");
        setOtpContext('login');
        setCurrentScreen('email');
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Post-signup OTP request error:", error);
      }
      setLoginError("Failed to send verification code. Please try again.");
      setOtpContext('login');
      setCurrentScreen('email');
    }
  }, []);

  const handleSignupOtpSuccess = useCallback((verificationCode: string) => {
    setVerificationCode(verificationCode);
    setPasswordFlow('signup');
    setCurrentScreen('setPassword');
  }, []);

  const handleLoginOtpSubmit = useCallback(async (otp: string) => {
    try {
      const response = await identityServices.verifyLoginOtp({
        emailAddress: email,
        oneTimePassword: otp,
      });

      if (response.responseCode === "0" && response.data) {
        const { accessToken, refreshToken } = response.data;
        
        if (accessToken && refreshToken) {
          await saveTokens({ accessToken, refreshToken });
        } else if (accessToken) {
          await saveToken(accessToken);
        }

        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.message || "Invalid OTP. Please try again." 
        };
      }
    } catch (error) {
      if (__DEV__) {
        console.error("OTP verification error:", error);
      }
      return { 
        success: false, 
        message: "Unable to verify OTP. Please try again."
      };
    }
  }, [email, saveToken, saveTokens]);

  const handleLoginOtpResend = useCallback(async () => {
    try {
      const response = await identityServices.requestLoginOtp({
        emailAddress: email,
      });

      if (response.responseCode === "0" && response.data?.succeeded) {
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.message || "Failed to resend OTP." 
        };
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Resend OTP error:", error);
      }
      return { 
        success: false, 
        message: "Failed to resend OTP. Please try again." 
      };
    }
  }, [email]);

  const handleLoginOtpSuccess = useCallback(() => {
  }, []);

  const handleEditEmail = useCallback(() => {
    setCurrentScreen('email');
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <ToastProvider
        placement="top"
        duration={3000}
        animationType="slide-in"
        offset={40}
      >
        <SafeAreaView style={authStyles.container}>
          {currentScreen === 'email' ? (
            <EmailScreen
              email={email}
              setEmail={setEmail}
              onContinue={handleEmailContinue}
              onClose={handleClose}
              isLoading={isLoading}
              errorMessage={loginError}
            />
          ) : currentScreen === 'loginOtp' ? (
            <LoginOtpScreen
              email={email}
              onBack={handleBack}
              onSubmit={handleLoginOtpSubmit}
              onResend={handleLoginOtpResend}
              onSuccess={handleLoginOtpSuccess}
              onEditEmail={handleEditEmail}
              context={otpContext}
              maxCodeLength={6}
            />
          ) : currentScreen === 'password' ? (
            <PasswordScreen
              email={email}
              password={password}
              setPassword={handlePasswordChange}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              onLogin={handleLogin}
              onClose={handleClose}
              onBack={handleBack}
              onForgotPassword={handleForgotPassword}
              isLoading={isLoading}
              errorMessage={loginError}
            />
          ) : currentScreen === 'forgotPassword' ? (
            <ForgotPasswordScreen
              email={email}
              onClose={handleClose}
              onBack={handleBack}
              onSuccess={handleForgotPasswordSuccess}
            />
          ) : currentScreen === "forgotPasswordOtp" ? (
            <ForgotPasswordOtp
              email={email}
              onBack={handleBack}
              onSuccess={handleForgotPasswordOtpSuccess}
            />
          ) : currentScreen === "setPassword" ? (
            <SetPasswordScreen
              email={email}
              verificationCode={verificationCode}
              onBack={handleBack}
              onSuccess={handleSetPasswordSuccess}
              flow={passwordFlow}
            />
          ) : currentScreen === "signupOtp" ? (
            <SignupOtpScreen
              email={email}
              onBack={handleBack}
              onSuccess={handleSignupOtpSuccess}
            />
          ) : (
            <SignupScreen
              email={email}
              onClose={handleClose}
              onBack={handleBack}
              onSignupSuccess={handleSignupSuccess}
            />
          )}
        </SafeAreaView>
      </ToastProvider>
    </Modal>
  );
};


export default ModalAuth;
