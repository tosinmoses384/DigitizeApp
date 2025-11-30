import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

interface SelectionCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
  cardStyle?: object;
}

const SelectionCard: React.FC<SelectionCardProps> = ({
  icon,
  title,
  description,
  isSelected,
  onSelect,
  cardStyle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selectedCard, cardStyle]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.radioContainer}>
        <View style={[styles.radioOuter, isSelected && styles.selectedRadioOuter]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SelectionCard;
