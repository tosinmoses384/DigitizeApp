import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useOutfitTryOn } from '@hooks/use-outfit-try-on';
import { OutfitSuggestionCard } from './OutfitSuggestionCard';

interface OutfitTryOnInterfaceProps {
  onSetupApiKey: () => void;
}

export const OutfitTryOnInterface: React.FC<OutfitTryOnInterfaceProps> = React.memo(({
  onSetupApiKey,
}) => {
  const { suggestions, isGenerating, generateOutfits, clearSuggestions } = useOutfitTryOn();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [preferences, setPreferences] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);

  const demoWardrobeItems = [
    'Black leather jacket',
    'White t-shirt',
    'Blue jeans',
    'Sneakers',
    'Brown boots',
    'Gray sweater',
    'Black dress pants',
    'White button-up shirt',
  ];

  const handleItemToggle = useCallback((item: string) => {
    setSelectedItems(prev => {
      if (prev.includes(item)) {
        return prev.filter(i => i !== item);
      } else {
        return [...prev, item];
      }
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (selectedItems.length === 0) {
      return;
    }
    await generateOutfits(selectedItems, preferences || undefined);
  }, [selectedItems, preferences, generateOutfits]);

  const handleClear = useCallback(() => {
    clearSuggestions();
    setSelectedItems([]);
    setPreferences('');
    setShowPreferences(false);
  }, [clearSuggestions]);

  const renderWardrobeItem = useCallback(({ item }: { item: string }) => {
    const isSelected = selectedItems.includes(item);

    return (
      <TouchableOpacity
        style={[styles.wardrobeItem, isSelected && styles.wardrobeItemSelected]}
        onPress={() => handleItemToggle(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item}, ${isSelected ? 'selected' : 'not selected'}`}
        accessibilityState={{ selected: isSelected }}
      >
        <MaterialCommunityIcons
          name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={20}
          color={isSelected ? '#c8a2c8' : '#6b727e'}
        />
        <Text style={[styles.wardrobeItemText, isSelected && styles.wardrobeItemTextSelected]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  }, [selectedItems, handleItemToggle]);

  const renderSuggestion = useCallback(({ item, index }: { item: any; index: number }) => (
    <OutfitSuggestionCard
      suggestion={item}
      index={index}
    />
  ), []);

  const keyExtractor = useCallback((item: any, index: number) => `suggestion-${index}`, []);
  const wardrobeKeyExtractor = useCallback((item: string, index: number) => `wardrobe-${index}-${item}`, []);

  if (suggestions.length > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Your Outfit Suggestions</Text>
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear suggestions and start over"
          >
            <MaterialCommunityIcons name="close-circle" size={20} color="#6b727e" />
            <Text style={styles.clearButtonText}>Start Over</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={suggestions}
          renderItem={renderSuggestion}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.suggestionsList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="tshirt-crew" size={24} color="#c8a2c8" />
          <Text style={styles.sectionTitle}>Select Your Items</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Choose items from your wardrobe to create outfit combinations
        </Text>

        <View style={styles.wardrobeContainer}>
          <FlatList
            data={demoWardrobeItems}
            renderItem={renderWardrobeItem}
            keyExtractor={wardrobeKeyExtractor}
            numColumns={2}
            columnWrapperStyle={styles.wardrobeRow}
            scrollEnabled={false}
          />
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.preferencesToggle}
          onPress={() => setShowPreferences(!showPreferences)}
          accessibilityRole="button"
          accessibilityLabel={`${showPreferences ? 'Hide' : 'Show'} style preferences`}
        >
          <View style={styles.preferencesToggleLeft}>
            <MaterialCommunityIcons name="tune" size={20} color="#c8a2c8" />
            <Text style={styles.preferencesToggleText}>Style Preferences (Optional)</Text>
          </View>
          <MaterialCommunityIcons
            name={showPreferences ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#6b727e"
          />
        </TouchableOpacity>

        {showPreferences && (
          <View style={styles.preferencesContainer}>
            <TextInput
              style={styles.preferencesInput}
              value={preferences}
              onChangeText={setPreferences}
              placeholder="e.g., casual, formal, colorful, minimal..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              accessibilityLabel="Style preferences input"
            />
          </View>
        )}
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.generateButton, selectedItems.length === 0 && styles.generateButtonDisabled]}
          onPress={handleGenerate}
          disabled={selectedItems.length === 0 || isGenerating}
          accessibilityRole="button"
          accessibilityLabel="Generate outfit suggestions"
          accessibilityState={{ disabled: selectedItems.length === 0 || isGenerating }}
        >
          <LinearGradient
            colors={selectedItems.length > 0 ? ['#c8a2c8', '#ff6f61'] : ['#ccc', '#999']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="star-outline" size={20} color="#fff" />
                <Text style={styles.generateButtonText}>
                  Generate Outfits ({selectedItems.length} items)
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.helperText}>
          Select at least one item to get AI-powered outfit suggestions
        </Text>
      </View>
    </ScrollView>
  );
});

OutfitTryOnInterface.displayName = 'OutfitTryOnInterface';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafc',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: '#1a1a1a',
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#6b727e',
    marginBottom: 16,
    lineHeight: 20,
  },
  wardrobeContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  wardrobeRow: {
    justifyContent: 'space-between',
    gap: 12,
  },
  wardrobeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  wardrobeItemSelected: {
    backgroundColor: '#f0e6f0',
    borderWidth: 1,
    borderColor: '#c8a2c8',
  },
  wardrobeItemText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: '#4a4a4a',
  },
  wardrobeItemTextSelected: {
    fontFamily: 'DMSans-Medium',
    color: '#1a1a1a',
  },
  preferencesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  preferencesToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preferencesToggleText: {
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    color: '#1a1a1a',
  },
  preferencesContainer: {
    marginTop: 12,
  },
  preferencesInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#1a1a1a',
    minHeight: 80,
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: '#fff',
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: '#6b727e',
    textAlign: 'center',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultsTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: '#1a1a1a',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
    color: '#6b727e',
  },
  suggestionsList: {
    paddingVertical: 16,
  },
});
