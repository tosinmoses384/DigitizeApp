import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@constants/Colors';
import { fontSz } from '@constants/Constants';

interface TabSelectorProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabSelector = React.memo<TabSelectorProps>(({ tabs, activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            activeTab === tab && styles.activeTab,
          ]}
          onPress={() => onTabChange(tab)}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === tab }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText,
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

TabSelector.displayName = 'TabSelector';

export default TabSelector;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#EDF2F7',
    borderWidth: 1.5,
    borderColor: '#EDF2F7',
    marginRight: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#FF5C68',
    borderColor: '#FF3B4A',
  },
  tabText: {
    fontSize: fontSz(14),
    fontFamily: 'DMSansMedium',
    color: '#1E3448',
  },
  activeTabText: {
    color: 'white',
    fontFamily: 'DMSansSemiBold',
  },
});

