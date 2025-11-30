import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  ActivityIndicator,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface DropdownOption {
  key: string;
  value: string | number;
  label: string;
  description?: string;
}

interface EnhancedDropdownProps {
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
}

const EnhancedDropdown: React.FC<EnhancedDropdownProps> = ({
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
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.description?.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const handleOpen = () => {
    if (disabled || loading) return;
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
    setSearchQuery("");
  };

  const handleSelect = (val: string | number) => {
    onChange(val);
    handleClose();
  };

  const renderItem = ({ item }: { item: DropdownOption }) => {
    const isSelected = item.value === value;
    return (
      <TouchableOpacity
        style={[
          styles.optionItem,
          isSelected && styles.optionItemSelected,
        ]}
        onPress={() => handleSelect(item.value)}
        accessibilityRole="button"
        accessibilityLabel={item.label}
      >
        <View style={styles.optionContent}>
          <Text
            style={[
              styles.optionLabel,
              isSelected && styles.optionLabelSelected,
            ]}
          >
            {item.label}
          </Text>
          {item.description && (
            <Text style={styles.optionDescription}>{item.description}</Text>
          )}
        </View>
        {isSelected && (
          <Ionicons name="checkmark" size={20} color="#FF3B4A" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.trigger,
          error ? styles.triggerError : null,
          disabled ? styles.triggerDisabled : null,
        ]}
        onPress={handleOpen}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
      >
        <Text
          style={[
            styles.triggerText,
            !selectedOption && styles.placeholderText,
            disabled && styles.disabledText,
          ]}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color="#90959E" />
        ) : (
          <Ionicons name="chevron-down" size={20} color="#90959E" />
        )}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.backdrop} onPress={handleClose} />
          
          <View style={styles.modalContent}>
            <View style={styles.dragHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || "Select Option"}</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#07090C" />
              </TouchableOpacity>
            </View>

            {searchable && (
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#90959E" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#90959E"
                  autoCorrect={false}
                />
              </View>
            )}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.key}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>{emptyText}</Text>
                </View>
              }
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#07090C",
    marginBottom: 8,
  },
  trigger: {
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
  triggerError: {
    borderColor: "#FF3B4A",
  },
  triggerDisabled: {
    backgroundColor: "#F0F0F0",
    opacity: 0.6,
  },
  triggerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "#07090C",
  },
  placeholderText: {
    color: "#90959E",
  },
  disabledText: {
    color: "#C4C4C4",
  },
  errorText: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    color: "#FF3B4A",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: Platform.OS === "ios" ? 34 : 24, // Safe area
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E9EAEB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9EAEB",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "DMSans-Bold",
    color: "#07090C",
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F7F8F9",
    margin: 16,
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: "DMSans-Regular",
    fontSize: 14,
    color: "#07090C",
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F7F8F9",
  },
  optionItemSelected: {
    backgroundColor: "#FFF5F6",
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  optionContent: {
    flex: 1,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    color: "#07090C",
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: "#FF3B4A",
    fontFamily: "DMSans-Bold",
  },
  optionDescription: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    color: "#90959E",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "DMSans-Regular",
    color: "#90959E",
    textAlign: "center",
  },
});

export default EnhancedDropdown;

