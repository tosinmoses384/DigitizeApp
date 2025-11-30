import React, { useState, useRef } from "react";
import { View, Text, Platform, StyleSheet, ActivityIndicator } from "react-native";
import WebView, { WebView as WebViewType } from "react-native-webview";
import { Colors } from "../constants/Colors";
import { useI18n } from "@hooks/use-i18n";

/**
 * Custom base64 encoder for React Native
 * Note: We use a custom implementation because btoa() is not available in React Native's native context.
 * btoa() is available in the WebView's JavaScript context (used in injectedJavaScriptBeforeContentLoaded),
 * but for Android headers we need native base64 encoding.
 */
const base64Encode = (str: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let i = 0;
  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = i < str.length ? str.charCodeAt(i++) : 0;
    const c = i < str.length ? str.charCodeAt(i++) : 0;
    const bitmap = (a << 16) | (b << 8) | c;
    output += chars.charAt((bitmap >> 18) & 63);
    output += chars.charAt((bitmap >> 12) & 63);
    output += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
    output += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
  }
  return output;
};

/**
 * Get allowed origins for WebView based on environment
 * In production, restrict to specific domains for security
 */
const getAllowedOrigins = (): string[] => {
  if (process.env.NODE_ENV === 'production') {
    return [
      'https://digitizeapp.com',
      'https://www.digitizeapp.com',
      'https://staging.digitizeapp.com', // Keep staging for production builds that might use it
    ];
  }
  // In development, allow all origins for flexibility
  return ['*'];
};

interface AuthenticatedWebViewProps {
  url: string;
  onError?: (error: string) => void;
}

const AuthenticatedWebView: React.FC<AuthenticatedWebViewProps> = ({ url, onError }) => {
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<WebViewType>(null);

  // HTTP Basic Authentication credentials
  // Use environment variables if available, otherwise fall back to default credentials
  const basicAuthUsername = process.env.EXPO_PUBLIC_STAGING_BASIC_AUTH_USERNAME || 'test_user';
  const basicAuthPassword = process.env.EXPO_PUBLIC_STAGING_BASIC_AUTH_PASSWORD || 'dipgi2-buPnuv-gykvir';

  // Warn in development if using default credentials
  if (__DEV__ && (!process.env.EXPO_PUBLIC_STAGING_BASIC_AUTH_USERNAME || !process.env.EXPO_PUBLIC_STAGING_BASIC_AUTH_PASSWORD)) {
    console.warn('AuthenticatedWebView - Using default credentials. Set EXPO_PUBLIC_STAGING_BASIC_AUTH_USERNAME and EXPO_PUBLIC_STAGING_BASIC_AUTH_PASSWORD environment variables for production.');
  }
  
  // Create base64 encoded auth string
  const authString = `${basicAuthUsername}:${basicAuthPassword}`;
  const auth = base64Encode(authString);
  
  // For iOS, we need to embed credentials in URL format: https://user:pass@domain.com
  const webViewUrlWithAuth = url.replace(
    /^https?:\/\//,
    `https://${encodeURIComponent(basicAuthUsername)}:${encodeURIComponent(basicAuthPassword)}@`
  );

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('webView.errorLoading')}</Text>
        <Text style={styles.errorDetails}>
          {t('webView.errorDetails').replace('{error}', error)}
        </Text>
      </View>
    );
  }

  return (
    <WebView
      ref={webViewRef}
      source={{
        uri: Platform.OS === 'ios' ? webViewUrlWithAuth : url,
        headers: Platform.OS === 'android' ? {
          'Authorization': `Basic ${auth}`
        } : undefined
      }}
      style={{ flex: 1, backgroundColor: Colors.light.background }}
      originWhitelist={getAllowedOrigins()}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      scalesPageToFit={true}
      startInLoadingState={true}
      renderLoading={() => (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B4A" />
          <Text style={styles.loadingText}>{t('webView.loading')}</Text>
        </View>
      )}
      showsVerticalScrollIndicator={true}
      showsHorizontalScrollIndicator={false}
      bounces={false}
      scrollEnabled={true}
      nestedScrollEnabled={true}
      injectedJavaScriptBeforeContentLoaded={`
        (function() {
          const username = '${basicAuthUsername}';
          const password = '${basicAuthPassword}';
          const auth = btoa(username + ':' + password);
          
          // Override fetch to add Basic Auth
          const originalFetch = window.fetch;
          window.fetch = function(url, options = {}) {
            const headers = new Headers(options.headers || {});
            headers.set('Authorization', 'Basic ' + auth);
            return originalFetch(url, { ...options, headers });
          };
          
          // Override XMLHttpRequest to add Basic Auth
          const originalOpen = XMLHttpRequest.prototype.open;
          const originalSend = XMLHttpRequest.prototype.send;
          
          XMLHttpRequest.prototype.open = function(method, url, ...rest) {
            this._url = url;
            return originalOpen.apply(this, [method, url, ...rest]);
          };
          
          XMLHttpRequest.prototype.send = function(...args) {
            try {
              this.setRequestHeader('Authorization', 'Basic ' + auth);
            } catch (e) {}
            return originalSend.apply(this, args);
          };
        })();
        true;
      `}
      onShouldStartLoadWithRequest={(request) => {
        return true;
      }}
      onLoadStart={() => {
        if (__DEV__) {
          console.log('AuthenticatedWebView - WebView started loading:', url);
        }
      }}
      onLoadEnd={() => {
        if (__DEV__) {
          console.log('AuthenticatedWebView - WebView finished loading');
        }
      }}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        if (__DEV__) {
          console.error('AuthenticatedWebView - WebView error:', nativeEvent);
        }
        const errorDescription = nativeEvent.description || t('webView.unknownError');
        handleError(t('webView.errorDetails').replace('{error}', errorDescription));
      }}
      onHttpError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        if (__DEV__) {
          console.error('AuthenticatedWebView - WebView HTTP error:', nativeEvent);
        }
        if (nativeEvent.statusCode === 401) {
          handleError(t('webView.authFailed'));
        } else {
          const errorDescription = `HTTP ${nativeEvent.statusCode}`;
          handleError(t('webView.errorDetails').replace('{error}', errorDescription));
        }
      }}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
    fontFamily: "DMSansMedium",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B4A",
    fontFamily: "DMSansBold",
    marginBottom: 10,
    textAlign: "center",
  },
  errorDetails: {
    fontSize: 14,
    color: "#666",
    fontFamily: "DMSansRegular",
    textAlign: "center",
  },
});

export default AuthenticatedWebView;

