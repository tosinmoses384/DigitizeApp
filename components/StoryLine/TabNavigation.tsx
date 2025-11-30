import React, { memo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { fontSz } from "@constants/Constants";
import CustomButton from "@components/CustomButton/index";

// TypeScript interface for tab data
export interface Tab {
  id: string;
  title: string;
}

// Props interface following coding guide section 3
export interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
  filterByCategory?: string;
}

/**
 * Stateless component for tab navigation
 * Following atomic design principles from section 3 of coding guide
 */
const TabNavigation: React.FC<TabNavigationProps> = memo(({
  tabs,
  activeTab,
  onTabPress,
  filterByCategory,
}) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={[
        styles.container,
        {
          marginTop: filterByCategory ? 10 : 16,
          marginBottom: 16,
          marginHorizontal: filterByCategory ? 10 : 16,
        }
      ]}
    >
      {tabs.map((tab) => (
        <CustomButton
          key={tab.id}
          title={tab.title}
          buttonStyle={
            activeTab === tab.id
              ? styles.tabActive
              : styles.inActiveTabActive
          }
          textStyle={
            activeTab === tab.id
              ? styles.tabActiveText
              : styles.inActiveTabActiveText
          }
          onPress={() => onTabPress(tab.id)}
        />
      ))}
    </ScrollView>
  );
});

TabNavigation.displayName = "TabNavigation";

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  tabActive: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#FF5C68",
    borderWidth: 1.5,
    borderColor: "#FF3B4A",
    marginRight: 10,
    borderRadius: 16,
  },
  tabActiveText: {
    color: "white",
    fontSize: fontSz(14),
  },
  inActiveTabActive: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#EDF2F7",
    borderWidth: 1.5,
    borderColor: "#EDF2F7",
    marginRight: 10,
    borderRadius: 16,
  },
  inActiveTabActiveText: {
    color: "#1E3448",
    fontSize: fontSz(14),
  },
});

export default TabNavigation;
