import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import profileService, { UserProfile } from '../services/profileService';
import apiService from '../services/api';

/**
 * Example component demonstrating JWT refresh token handling
 * 
 * This component shows how:
 * 1. API calls automatically handle token refresh
 * 2. Multiple API calls work seamlessly
 * 3. Error handling for authentication failures
 * 4. Login/logout functionality
 */
const ProfileExample: React.FC = () => {
  const { isAuthenticated, login, logout, profile, isCheckingAuth } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example: Load user profile on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadUserProfile();
    }
  }, [isAuthenticated]);

  // Example: API call that benefits from automatic token refresh
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This call will automatically refresh tokens if needed
      const profile = await profileService.getUserProfile();
      setUserProfile(profile);
    } catch (error: any) {
      setError(error.message);
      console.error('Profile load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Example: Multiple API calls that all benefit from token refresh
  const loadAllUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // All these calls will automatically refresh tokens if needed
      const userData = await profileService.getUserData();
      setUserProfile(userData.profile);
      
      Alert.alert('Success', 'All user data loaded successfully!');
    } catch (error: any) {
      setError(error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Example: Direct API call using apiService
  const makeDirectApiCall = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Direct API call - will also benefit from automatic token refresh
      const response = await apiService.get('/identity/v1/user/profile');
      console.log('Direct API call response:', response.data);
      
      Alert.alert('Success', 'Direct API call completed!');
    } catch (error: any) {
      setError(error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Example: Login function
  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace with actual credentials or get from form
      const credentials = {
        emailAddress: 'user@example.com',
        password: 'password123'
      };
      
      await login(credentials);
      Alert.alert('Success', 'Logged in successfully!');
    } catch (error: any) {
      setError(error.message);
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Example: Logout function
  const handleLogout = async () => {
    try {
      await logout();
      setUserProfile(null);
      Alert.alert('Success', 'Logged out successfully!');
    } catch (error: any) {
      Alert.alert('Logout Error', error.message);
    }
  };

  if (isCheckingAuth) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Checking authentication...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>JWT Refresh Token Demo</Text>
        <Text style={styles.text}>Please log in to test the JWT refresh functionality</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Logging in...' : 'Login (Demo)'}
          </Text>
        </TouchableOpacity>
        
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JWT Refresh Token Demo</Text>
      
      {/* User Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current User</Text>
        <Text style={styles.text}>
          Redux Profile: {profile?.firstName || 'Loading...'} {profile?.lastName || ''}
        </Text>
        {userProfile && (
          <Text style={styles.text}>
            API Profile: {userProfile.firstName} {userProfile.lastName}
          </Text>
        )}
      </View>

      {/* API Test Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test API Calls</Text>
        <Text style={styles.description}>
          These API calls will automatically refresh your JWT tokens if they're expired:
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={loadUserProfile} disabled={loading}>
          <Text style={styles.buttonText}>Load User Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={loadAllUserData} disabled={loading}>
          <Text style={styles.buttonText}>Load All User Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={makeDirectApiCall} disabled={loading}>
          <Text style={styles.buttonText}>Direct API Call</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      {/* Loading/Error States */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" />
          <Text style={styles.text}>Making API call...</Text>
        </View>
      )}
      
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FFE5E5',
    borderRadius: 5,
  },
});

export default ProfileExample;
