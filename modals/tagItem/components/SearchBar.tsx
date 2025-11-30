import React, { useCallback } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const SearchBar = React.memo<SearchBarProps>(
  ({ value, onChangeText, placeholder = 'Search Brand, Name' }) => {
    const handleClear = useCallback(() => {
      onChangeText('');
    }, [onChangeText]);

    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#90959E"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#B5B9BE"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search input"
            accessibilityHint="Type to search items by brand or name"
          />
          {value.length > 0 && (
            <TouchableOpacity
              onPress={handleClear}
              style={styles.clearButton}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={20} color="#90959E" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  },
);

SearchBar.displayName = 'SearchBar';

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F7F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'DMSansRegular',
    color: '#07090C',
  },
  clearButton: {
    padding: 4,
  },
});
