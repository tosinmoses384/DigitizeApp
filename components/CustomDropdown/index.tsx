import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface DropdownOption {
  key: string;
  value: string | number;
  label: string;
  description?: string;
}

export interface CustomDropdownProps {
  label?: string;
  placeholder?: string;
  value: string | number;
  options: DropdownOption[];
  onChange: (value: string | number) => void;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  loadingText?: string;
  onSearch?: (query: string) => void;
  onEndReached?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  mode?: "local" | "api";
  labelStyle?: any;
  containerStyle?: any;
  dropdownStyle?: any;
  maxHeight?: number;
}

const CustomDropdown = React.memo<CustomDropdownProps>(({
  label,
  placeholder = "Select an option",
  value,
  options,
  onChange,
  loading = false,
  disabled = false,
  error,
  searchable = false,
  searchPlaceholder = "Search...",
  emptyText = "No options available",
  loadingText = "Loading...",
  onSearch,
  onEndReached,
  hasMore = false,
  loadingMore = false,
  mode = "local",
  labelStyle,
  containerStyle,
  dropdownStyle,
  maxHeight = 300,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<TextInput>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  const dropdownScale = useRef(new Animated.Value(0.95)).current;

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (mode === "api" || !searchQuery.trim()) {
      return options;
    }

    const query = searchQuery.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.description?.toLowerCase().includes(query)
    );
  }, [options, searchQuery, mode]);

  const handleOpen = useCallback(() => {
    if (disabled || loading) return;

    console.log('[CustomDropdown] Opening dropdown', { 
      optionsCount: options.length,
      maxHeight,
      platform: Platform.OS 
    });

    setIsOpen(true);
    
    Animated.parallel([
      Animated.timing(dropdownOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(dropdownScale, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    });
  }, [disabled, loading, dropdownOpacity, dropdownScale]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(dropdownOpacity, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(dropdownScale, {
        toValue: 0.95,
        duration: 150,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false);
      setSearchQuery("");
    });
  }, [dropdownOpacity, dropdownScale]);

  const handleSelect = useCallback(
    (selectedValue: string | number) => {
      onChange(selectedValue);
      handleClose();
    },
    [onChange, handleClose]
  );

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);

      if (mode === "api" && onSearch) {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
          onSearch(text);
        }, 300);
      }
    },
    [mode, onSearch]
  );

  const handleEndReached = useCallback(() => {
    if (hasMore && !loadingMore && onEndReached) {
      onEndReached();
    }
  }, [hasMore, loadingMore, onEndReached]);

  const renderOption = useCallback(
    ({ item }: { item: DropdownOption }) => {
      const isSelected = item.value === value;

      return (
        <Pressable
          style={({ pressed }) => [
            styles.optionItem,
            isSelected && styles.optionItemSelected,
            pressed && styles.optionItemPressed,
          ]}
          onPress={() => handleSelect(item.value)}
          accessibilityLabel={`Select ${item.label}`}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
        >
          <View style={styles.optionContent}>
            <Text
              style={[
                styles.optionLabel,
                isSelected && styles.optionLabelSelected,
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
            {item.description && (
              <Text
                style={[
                  styles.optionDescription,
                  isSelected && styles.optionDescriptionSelected,
                ]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}
          </View>
          {isSelected && (
            <Ionicons name="checkmark" size={20} color="#FF3B4A" />
          )}
        </Pressable>
      );
    },
    [value, handleSelect]
  );

  const renderListEmpty = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="small" color="#FF3B4A" />
          <Text style={styles.emptyText}>{loadingText}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={32} color="#C4C4C4" />
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }, [loading, loadingText, emptyText]);

  const renderListFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#FF3B4A" />
        <Text style={styles.footerLoaderText}>Loading more...</Text>
      </View>
    );
  }, [loadingMore]);

  const keyExtractor = useCallback(
    (item: DropdownOption) => item.key,
    []
  );

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const containerZIndexStyle = useMemo(() => (isOpen ? { zIndex: 10000 } : null), [isOpen]);

  return (
    <>
      <View style={[styles.container, containerStyle, containerZIndexStyle]}>
        {label && (
          <Text style={[styles.label, labelStyle]}>{label}</Text>
        )}

        <View style={styles.selectWrapper}>
          <Pressable
            style={({ pressed }) => [
              styles.selectBox,
              isOpen && styles.selectBoxOpen,
              error && styles.selectBoxError,
              disabled && styles.selectBoxDisabled,
              pressed && !disabled && styles.selectBoxPressed,
            ]}
            onPress={handleOpen}
            disabled={disabled || loading}
            accessibilityLabel={label || placeholder}
            accessibilityRole="button"
            accessibilityState={{
              disabled: disabled || loading,
              expanded: isOpen,
            }}
          >
            <Text
              style={[
                styles.selectText,
                !selectedOption && styles.selectTextPlaceholder,
                disabled && styles.selectTextDisabled,
              ]}
              numberOfLines={1}
            >
              {selectedOption?.label || placeholder}
            </Text>

            {loading ? (
              <ActivityIndicator size="small" color="#90959E" />
            ) : (
              <Ionicons
                name={isOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color={disabled ? "#C4C4C4" : "#90959E"}
              />
            )}
          </Pressable>

          {isOpen && (
            <Animated.View
              style={[
                styles.dropdownContainer,
                dropdownStyle,
                {
                  maxHeight: maxHeight,
                  opacity: dropdownOpacity,
                  transform: [{ scaleY: dropdownScale }],
                },
              ]}
              onLayout={(e) => console.log('[CustomDropdown] Container layout', e.nativeEvent.layout)}
            >
              {searchable && (
                <View style={styles.searchContainer}>
                  <Ionicons
                    name="search-outline"
                    size={18}
                    color="#90959E"
                    style={styles.searchIcon}
                  />
                  <TextInput
                    ref={searchInputRef}
                    style={styles.searchInput}
                    placeholder={searchPlaceholder}
                    placeholderTextColor="#C4C4C4"
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => handleSearchChange("")}
                      style={styles.clearButton}
                      accessibilityLabel="Clear search"
                      accessibilityRole="button"
                    >
                      <Ionicons name="close-circle" size={18} color="#90959E" />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <FlatList
                data={filteredOptions}
                renderItem={renderOption}
                keyExtractor={keyExtractor}
                ListEmptyComponent={renderListEmpty}
                ListFooterComponent={renderListFooter}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={true}
                persistentScrollbar={true}
                keyboardShouldPersistTaps="handled"
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={false}
                style={[styles.optionsList, { maxHeight: maxHeight || 300 }]}
                nestedScrollEnabled
                onScroll={(e) => console.log('[CustomDropdown] Scroll event', e.nativeEvent.contentOffset)}
                onLayout={(e) => console.log('[CustomDropdown] FlatList layout', e.nativeEvent.layout)}
                onContentSizeChange={(w, h) => console.log('[CustomDropdown] Content size', { width: w, height: h })}
                scrollEnabled={true}
              />
            </Animated.View>
          )}
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>

      {isOpen && (
        <Pressable
          style={styles.backdrop}
          onPress={handleClose}
          accessibilityLabel="Close dropdown"
          accessibilityRole="button"
        />
      )}
    </>
  );
});

CustomDropdown.displayName = "CustomDropdown";

export default CustomDropdown;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#07090C",
    marginBottom: 8,
  },
  selectWrapper: {
    position: "relative",
    zIndex: 1000,
  },
  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F8F9",
    borderWidth: 1,
    borderColor: "#E9EAEB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
  },
  selectBoxOpen: {
    borderColor: "#FF3B4A",
    backgroundColor: "#FFFFFF",
  },
  selectBoxError: {
    borderColor: "#FF3B4A",
  },
  selectBoxDisabled: {
    backgroundColor: "#F0F0F0",
    opacity: 0.6,
  },
  selectBoxPressed: {
    opacity: 0.7,
  },
  selectText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "#07090C",
  },
  selectTextPlaceholder: {
    color: "#90959E",
  },
  selectTextDisabled: {
    color: "#C4C4C4",
  },
  errorText: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    color: "#FF3B4A",
    marginTop: 4,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 999,
  },
  dropdownContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9EAEB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    overflow: "hidden",
    zIndex: 10001,
    maxHeight: 200, 
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8F9",
    borderBottomWidth: 1,
    borderBottomColor: "#E9EAEB",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "#07090C",
    paddingVertical: 6,
  },
  clearButton: {
    padding: 4,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F7F8F9",
  },
  optionItemSelected: {
    backgroundColor: "#FFF5F6",
  },
  optionItemPressed: {
    backgroundColor: "#F7F8F9",
  },
  optionContent: {
    flex: 1,
    marginRight: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#07090C",
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: "#FF3B4A",
    fontFamily: "DMSans-Bold",
  },
  optionDescription: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    color: "#90959E",
    lineHeight: 16,
  },
  optionDescriptionSelected: {
    color: "#FF3B4A",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "#90959E",
    marginTop: 12,
    textAlign: "center",
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    color: "#90959E",
  },
});

