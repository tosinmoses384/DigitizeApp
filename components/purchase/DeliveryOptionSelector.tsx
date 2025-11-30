import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface DeliveryOption {
  id: number;
  title: string;
  icon: React.ReactNode;
}

interface DeliveryOptionSelectorProps {
  options: DeliveryOption[];
  selectedId: number;
  onSelect: (id: number) => void;
}

const DeliveryOptionSelector = React.memo(({
  options,
  selectedId,
  onSelect,
}: DeliveryOptionSelectorProps) => {
  return (
    <>
      {options.map((option, index) => (
        <Pressable
          key={option.id}
          style={[
            styles.optionRow,
            index < options.length - 1 && styles.optionRowBorder,
          ]}
          onPress={() => onSelect(option.id)}
        >
          <View>{option.icon}</View>
          <Text style={styles.optionText}>{option.title}</Text>
          <View
            style={
              selectedId !== option.id
                ? styles.radioCircleInactive
                : styles.radioCircleActive
            }
          >
            <View
              style={
                selectedId !== option.id
                  ? styles.radioInnerInactive
                  : styles.radioInnerActive
              }
            />
          </View>
        </Pressable>
      ))}
    </>
  );
});

DeliveryOptionSelector.displayName = 'DeliveryOptionSelector';

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
  },
  optionRowBorder: {
    borderBottomWidth: 1,
    borderColor: '#F4F6F8',
  },
  optionText: {
    color: '#393939',
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
  },
  radioCircleActive: {
    width: 16,
    height: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF3B4A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInnerActive: {
    width: 9,
    height: 9,
    backgroundColor: '#FF3B4A',
    borderRadius: 9,
  },
  radioCircleInactive: {
    width: 16,
    height: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#A0B1C0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInnerInactive: {
    backgroundColor: 'white',
  },
});

export default DeliveryOptionSelector;
