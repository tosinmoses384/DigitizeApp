import React from 'react';
import { StyleSheet, View } from 'react-native';
import SearchInput from '@components/SearchInput';
import { Colors } from '../../constants/Colors';

interface WardrobeSearchHeaderProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

const WardrobeSearchHeader = React.memo<WardrobeSearchHeaderProps>(({
  value,
  onChangeText,
  placeholder,
}) => {
  return (
    <View style={styles.searchStickyContainer}>
      <SearchInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
      />
    </View>
  );
});

WardrobeSearchHeader.displayName = 'WardrobeSearchHeader';

export default WardrobeSearchHeader;

const styles = StyleSheet.create({
  searchStickyContainer: {
    backgroundColor: Colors.light.background,
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
});

