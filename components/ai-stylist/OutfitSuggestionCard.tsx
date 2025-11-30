import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface OutfitSuggestion {
  description: string;
  styleNotes: string;
  occasions: string[];
}

interface OutfitSuggestionCardProps {
  suggestion: OutfitSuggestion;
  index: number;
  onSave?: () => void;
}

export const OutfitSuggestionCard: React.FC<OutfitSuggestionCardProps> = React.memo(({
  suggestion,
  index,
  onSave,
}) => {
  const handleSave = React.useCallback(() => {
    onSave?.();
  }, [onSave]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f9fafc']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Outfit {index + 1}</Text>
          </View>
          {onSave && (
            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveButton}
              accessibilityRole="button"
              accessibilityLabel={`Save outfit ${index + 1}`}
            >
              <MaterialCommunityIcons name="heart-outline" size={24} color="#FF3B4A" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.description}>{suggestion.description}</Text>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="star-outline" size={16} color="#c8a2c8" />
              <Text style={styles.sectionTitle}>Style Notes</Text>
            </View>
            <Text style={styles.sectionText}>{suggestion.styleNotes}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="calendar-check" size={16} color="#c8a2c8" />
              <Text style={styles.sectionTitle}>Perfect For</Text>
            </View>
            <View style={styles.occasionsContainer}>
              {suggestion.occasions.map((occasion, idx) => (
                <View key={idx} style={styles.occasionTag}>
                  <Text style={styles.occasionText}>{occasion}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
});

OutfitSuggestionCard.displayName = 'OutfitSuggestionCard';

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gradient: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  badge: {
    backgroundColor: '#c8a2c8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'DMSans-Bold',
    color: '#fff',
  },
  saveButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  description: {
    fontSize: 15,
    fontFamily: 'DMSans-Medium',
    color: '#1a1a1a',
    lineHeight: 22,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'DMSans-Bold',
    color: '#6b727e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#4a4a4a',
    lineHeight: 20,
  },
  occasionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  occasionTag: {
    backgroundColor: '#f0e6f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  occasionText: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    color: '#c8a2c8',
  },
});
