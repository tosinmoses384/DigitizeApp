import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TabSelectorProps {
  activeTab: 'items' | 'outfits';
  onTabChange: (tab: 'items' | 'outfits') => void;
}

const TabSelector = React.memo<TabSelectorProps>(({ activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'items' && styles.activeTab,
          ]}
          onPress={() => onTabChange('items')}
          accessibilityRole="tab"
          accessibilityLabel="Items tab"
          accessibilityState={{ selected: activeTab === 'items' }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'items' && styles.activeTabText,
            ]}
          >
            Items
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'outfits' && styles.activeTab,
          ]}
          onPress={() => onTabChange('outfits')}
          accessibilityRole="tab"
          accessibilityLabel="Outfits tab"
          accessibilityState={{ selected: activeTab === 'outfits' }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'outfits' && styles.activeTabText,
            ]}
          >
            Outfits
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

TabSelector.displayName = 'TabSelector';

export default TabSelector;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E9EAEB',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(2, 2, 2, 0.08)',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 4,
    elevation: 2,
    shadowOpacity: 1,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'DMSansMedium',
    color: '#90959E',
  },
  activeTabText: {
    color: '#07090C',
    fontFamily: 'DMSansSemiBold',
  },
});
