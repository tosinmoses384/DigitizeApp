/**
 * Inline Country Code Picker Component
 * A dropdown-style country code selector that appears below the input field
 * No modal overlays - better UX and no stacking issues
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import CountryFlag from 'react-native-country-flag';
import { COUNTRY_CODES, Country } from './CountryCodeSelector';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const DROPDOWN_MAX_HEIGHT = 200;
const DROPDOWN_WIDTH = SCREEN_WIDTH - 40; // Full width minus horizontal padding

interface InlineCountryCodePickerProps {
  selectedCountryCode: string; // ISO code (e.g., "NG")
  selectedDialCode: string; // Dial code (e.g., "234")
  onSelect: (country: Country) => void;
  disabled?: boolean;
}

/**
 * Inline Country Code Picker
 * Displays a button with flag and dial code, opens dropdown below when clicked
 */
const InlineCountryCodePicker: React.FC<InlineCountryCodePickerProps> = React.memo(
  ({ selectedCountryCode, selectedDialCode, onSelect, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownHeight = useRef(new Animated.Value(0)).current;
    const dropdownOpacity = useRef(new Animated.Value(0)).current;

    // Find selected country
    const selectedCountry = useMemo(() => {
      return COUNTRY_CODES.find((c) => c.code === selectedCountryCode);
    }, [selectedCountryCode]);

    // Filter countries based on search
    const filteredCountries = useMemo(() => {
      if (!searchQuery.trim()) return COUNTRY_CODES;

      const query = searchQuery.toLowerCase();
      return COUNTRY_CODES.filter(
        (country) =>
          country.name.toLowerCase().includes(query) ||
          country.dialCode.includes(query) ||
          country.code.toLowerCase().includes(query)
      );
    }, [searchQuery]);

    // Toggle dropdown
    const handleToggle = useCallback(() => {
      if (disabled) return;

      if (isOpen) {
        // Close
        Animated.parallel([
          Animated.timing(dropdownHeight, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(dropdownOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsOpen(false);
          setSearchQuery('');
        });
      } else {
        // Open
        setIsOpen(true);
        Animated.parallel([
          Animated.timing(dropdownHeight, {
            toValue: DROPDOWN_MAX_HEIGHT,
            duration: 250,
            useNativeDriver: false,
          }),
          Animated.timing(dropdownOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [isOpen, disabled, dropdownHeight, dropdownOpacity]);

    // Handle country selection
    const handleSelect = useCallback(
      (country: Country) => {
        onSelect(country);
        handleToggle(); // Close dropdown
      },
      [onSelect, handleToggle]
    );

    // Render country item
    const renderCountryItem = useCallback(
      ({ item }: { item: Country }) => {
        const isSelected = item.code === selectedCountryCode;

        return (
          <Pressable
            style={({ pressed }) => [
              styles.countryItem,
              isSelected && styles.countryItemSelected,
              pressed && styles.countryItemPressed,
            ]}
            onPress={() => handleSelect(item)}
            accessibilityRole="button"
            accessibilityLabel={`${item.name} +${item.dialCode}`}
          >
            <CountryFlag isoCode={item.code} size={20} />
            <Text style={styles.countryName}>{item.name}</Text>
            <Text style={styles.countryDialCode}>+{item.dialCode}</Text>
          </Pressable>
        );
      },
      [selectedCountryCode, handleSelect]
    );

    const keyExtractor = useCallback((item: Country) => item.code, []);

    return (
      <View style={styles.container}>
        {/* Country Code Button */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            isOpen && styles.buttonOpen,
            pressed && styles.buttonPressed,
            disabled && styles.buttonDisabled,
          ]}
          onPress={handleToggle}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Select country code"
          accessibilityHint="Opens country code dropdown"
        >
          <View style={styles.buttonContent}>
            {selectedCountry && (
              <CountryFlag isoCode={selectedCountry.code} size={18} />
            )}
            <Text style={styles.dialCodeText}>+{selectedDialCode}</Text>
            <Text style={[styles.arrow, isOpen && styles.arrowOpen]}>▼</Text>
          </View>
        </Pressable>

        {/* Dropdown */}
        {isOpen && (
          <Animated.View
            style={[
              styles.dropdown,
              {
                height: dropdownHeight,
                opacity: dropdownOpacity,
              },
            ]}
          >
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search country..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Search countries"
              />
            </View>

            {/* Country List */}
            <FlatList
              data={filteredCountries}
              renderItem={renderCountryItem}
              keyExtractor={keyExtractor}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No countries found</Text>
                </View>
              }
              initialNumToRender={15}
              maxToRenderPerBatch={15}
              windowSize={5}
            />
          </Animated.View>
        )}

        {/* Backdrop - closes dropdown when clicking outside */}
        {isOpen && (
          <Pressable
            style={styles.backdrop}
            onPress={handleToggle}
            accessibilityLabel="Close dropdown"
          />
        )}
      </View>
    );
  }
);

InlineCountryCodePicker.displayName = 'InlineCountryCodePicker';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 999,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    minWidth: 85,
  },
  buttonOpen: {
    backgroundColor: '#F9FAFB',
  },
  buttonPressed: {
    backgroundColor: '#F3F4F6',
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: '#F9FAFB',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dialCodeText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'DMSans',
    color: '#1C1C1E',
  },
  arrow: {
    fontSize: 10,
    color: '#637381',
    marginLeft: 2,
  },
  arrowOpen: {
    transform: [{ rotate: '180deg' }],
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: -20, // Extend beyond the input container
    width: DROPDOWN_WIDTH,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10000,
    overflow: 'hidden',
  },
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'DMSans',
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  countryItemSelected: {
    backgroundColor: '#FEF2F2',
  },
  countryItemPressed: {
    backgroundColor: '#F9FAFB',
  },
  countryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'DMSans',
    color: '#1C1C1E',
  },
  countryDialCode: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'DMSans',
    color: '#637381',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'DMSans',
    color: '#9CA3AF',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: -9999,
    right: -9999,
    bottom: -9999,
    zIndex: 9999,
  },
});

export default InlineCountryCodePicker;

