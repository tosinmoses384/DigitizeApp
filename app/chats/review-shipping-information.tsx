import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import StackHeader from '../../components/StackHeader';
import CustomButton from '../../components/CustomButton';
import ShippingAddressCard from '../../components/ShippingAddressCard';

const ReviewShippingInformationScreen = () => {
  const router = useRouter();

  // Dummy data - in production this would come from the shipping store or API
  const shippingData = {
    buyer: {
      name: "Timileyin Adedeji",
      address: "23, Olam Street, Kosofe, Ogudu, Lagos"
    },
    shippingProvider: {
      name: "Petty Parcel Express",
      instruction: "Drop at the nearest post office"
    },
    returnAddress: {
      street: "33, James Holton Street",
      city: "Ikeja, Lagos State"
    },
    contact: {
      phone: "+2349012345678"
    }
  };

  const handleConfirmShipping = () => {
    Alert.alert('Confirm Shipping', 'Shipping information has been confirmed.');
  };

  const handleEditShippingProvider = () => {
    Alert.alert('Edit Shipping Provider', 'Navigate to edit shipping provider screen.');
  };

  const handleEditReturnAddress = () => {
    Alert.alert('Edit Return Address', 'Navigate to edit return address screen.');
  };

  const handleEditContact = () => {
    Alert.alert('Edit Contact Details', 'Navigate to edit contact details screen.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StackHeader title="Set Shipping Information" onPress={() => router.back()} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Review Shipping Information</Text>
          <Text style={styles.description}>
            Review the information and correct where needed to confirm shipping.
          </Text>
        </View>

        {/* Buyer/Recipient Details - No Edit Button */}
        <ShippingAddressCard
          title="Buyer/Recipient Details"
          name={shippingData.buyer.name}
          address={shippingData.buyer.address}
          avatarColor="#3EC1EA"
        />

        {/* Shipping Provider - With Edit Icon */}
        <ShippingAddressCard
          title="Shipping Provider"
          name={shippingData.shippingProvider.name}
          address={shippingData.shippingProvider.instruction}
          onEdit={handleEditShippingProvider}
          avatarColor="#3EC1EA"
        />

        {/* Your Return Address - With Edit Icon */}
        <ShippingAddressCard
          title="Your Return Address"
          name={shippingData.returnAddress.street}
          address={shippingData.returnAddress.city}
          onEdit={handleEditReturnAddress}
          avatarColor="#3EC1EA"
        />

        {/* Your Contact Details - With Edit Icon */}
        <ShippingAddressCard
          title="Your Contact Details"
          name={shippingData.contact.phone}
          address=""
          onEdit={handleEditContact}
          avatarColor="#3EC1EA"
        />
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Confirm Shipping"
          onPress={handleConfirmShipping}
          buttonStyle={styles.confirmButton}
          textStyle={styles.confirmButtonText}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  titleContainer: {
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 24,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#393939',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '400',
    color: '#637381',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 5,
  },
  confirmButton: {
    backgroundColor: '#FF3B4A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'DMSans',
    fontWeight: '500',
    lineHeight: 20,
  },
});

export default ReviewShippingInformationScreen;
