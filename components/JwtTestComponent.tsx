import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@providers/AuthProvider';
import apiService from '../services/api';
import profileService from '../services/profileService';

/**
 * Simple test component to verify JWT refresh token functionality
 * This can be temporarily added to any screen to test the system
 */
const JwtTestComponent: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');

  const testApiCall = async () => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'Please log in first');
      return;
    }

    try {
      setLoading(true);
      setLastResult('Making API call...');
      
      // This call will automatically handle token refresh if needed
      const response = await apiService.get('/identity/v1/user/profile');
      
      setLastResult(`✅ Success: ${JSON.stringify(response.data).substring(0, 100)}...`);
      Alert.alert('Success', 'API call completed successfully!');
    } catch (error: any) {
      const errorMsg = `❌ Error: ${error.message}`;
      setLastResult(errorMsg);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testProfileService = async () => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'Please log in first');
      return;
    }

    try {
      setLoading(true);
      setLastResult('Testing profile service...');
      
      // This call will also automatically handle token refresh
      const profile = await profileService.getUserProfile();
      
      setLastResult(`✅ Profile: ${profile.firstName} ${profile.lastName}`);
      Alert.alert('Success', `Profile loaded: ${profile.firstName} ${profile.lastName}`);
    } catch (error: any) {
      const errorMsg = `❌ Profile Error: ${error.message}`;
      setLastResult(errorMsg);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testMultipleApiCalls = async () => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'Please log in first');
      return;
    }

    try {
      setLoading(true);
      setLastResult('Testing multiple API calls...');
      
      // Test multiple concurrent API calls - all should benefit from token refresh
      const [profile, preferences] = await Promise.all([
        apiService.get('/identity/v1/user/profile'),
        apiService.get('/identity/v1/user/preferences'),
      ]);
      
      setLastResult('✅ Multiple calls successful');
      Alert.alert('Success', 'Multiple API calls completed successfully!');
    } catch (error: any) {
      const errorMsg = `❌ Multiple calls error: ${error.message}`;
      setLastResult(errorMsg);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>JWT Test Component</Text>
        <Text style={styles.subtitle}>Please log in to test JWT refresh functionality</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JWT Refresh Token Test</Text>
      <Text style={styles.subtitle}>Test automatic token refresh functionality</Text>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={testApiCall}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Testing...' : 'Test Direct API Call'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={testProfileService}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Testing...' : 'Test Profile Service'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={testMultipleApiCalls}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Testing...' : 'Test Multiple API Calls'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.logoutButton]} 
        onPress={logout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      {lastResult ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Last Result:</Text>
          <Text style={styles.resultText}>{lastResult}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  resultText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default JwtTestComponent;
