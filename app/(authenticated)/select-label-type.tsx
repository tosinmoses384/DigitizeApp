import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import StackHeader from '../../components/StackHeader';
import CustomButton from '../../components/CustomButton';

type LabelType = 'printable' | 'digital';

const SelectLabelTypeScreen = () => {
  const [selectedLabel, setSelectedLabel] = useState<LabelType>('printable');
  const router = useRouter();

  const handleContinue = () => {
    if (selectedLabel) {
      router.push({
        pathname: '/(authenticated)/confirm-shipping-details',
        params: { labelType: selectedLabel },
      });
    }
  };

  const RadioButton = ({ isSelected }: { isSelected: boolean }) => (
    <View style={[styles.radioOuter, isSelected && styles.selectedRadioOuter]}>
      {isSelected && <View style={styles.radioInner} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StackHeader 
        title="Get shipping label" 
        titleStyle={styles.headerTitle}
        onPress={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCardContainer}>
          <View style={styles.packageIcon} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>24/7 InPost Locker | Shop Pick-up</Text>
            <Text style={styles.infoDescription}>Selected and paid for by buyer</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>How will you send this parcel?</Text>

        <View style={styles.selectionContainer}>
          <TouchableOpacity
            style={styles.selectionRow}
            onPress={() => setSelectedLabel('printable')}
            activeOpacity={0.7}
          >
            <Feather name="map-pin" size={20} color="#6B7280" style={styles.selectionIcon} />
            <View style={styles.selectionTextContainer}>
              <Text style={styles.selectionTitle}>Printable label</Text>
              <Text style={styles.selectionDescription}>
                Print out your own label and attach it to the parcel before sending it.
              </Text>
            </View>
            <RadioButton isSelected={selectedLabel === 'printable'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selectionRow, { borderBottomWidth: 0 }]}
            onPress={() => setSelectedLabel('digital')}
            activeOpacity={0.7}
          >
            <Feather name="home" size={20} color="#6B7280" style={styles.selectionIcon} />
            <View style={styles.selectionTextContainer}>
              <Text style={styles.selectionTitle}>Digital label</Text>
              <Text style={styles.selectionDescription}>
                No printer required. Our shipping instructions explain which drop-off points accept digital labels.
              </Text>
            </View>
            <RadioButton isSelected={selectedLabel === 'digital'} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedLabel}
          buttonStyle={styles.continueButton}
          textStyle={styles.continueButtonText}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerTitle: {
    color: '#071827',
    textAlign: 'center',
    fontFamily: 'DMSans',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 24,
    textTransform: 'none',
  },
  scrollContent: {
    padding: 20,
  },
  infoCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  packageIcon: {
    width: 24,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#EAC43E',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    color: '#1F2937',
    fontFamily: 'DMSans',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  infoDescription: {
    color: '#6B7280',
    fontFamily: 'DMSans',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#071827',
    fontFamily: 'DMSans',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  selectionContainer: {
    borderRadius: 8,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    alignSelf: 'stretch',
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Corrected from 'center'
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  selectionIcon: {
    marginRight: 12,
    marginTop: 2, // Added to align with the first line of text
  },
  selectionTextContainer: {
    flex: 1,
  },
  selectionTitle: {
    color: '#393939',
    fontFamily: 'DMSans',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  selectionDescription: {
    color: '#393939',
    fontFamily: 'DMSans',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    marginTop: 2,
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    // Removed marginTop to rely on flexbox centering
  },
  selectedRadioOuter: {
    borderColor: '#D4313E',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4313E',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#FF3B4A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SelectLabelTypeScreen;
