import React, { useCallback, useMemo, useState, memo, useEffect } from "react";
import { View, Text, StyleSheet, Image, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import type { LayoutChangeEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NativeInput from "./NativeInput";
import { useShippingStore, shippingSelectors } from "@stores/shippingStore";
import type { ShippingProviderValues } from "@stores/types";
import { useOptimizedImagePicker } from "@hooks/useOptimizedImagePicker";
import { sanitizePhoneNumber } from "@utils/phoneValidation";

export type ShippingProviderFormProps = {
  orderId?: string; // Order ID for tracking in store
  value?: Partial<ShippingProviderValues>;
  onChange?: (val: ShippingProviderValues) => void;
  onSubmit?: (val: ShippingProviderValues) => void;
  isSubmitting?: boolean;
};

const DEFAULT_VALUES: ShippingProviderValues = {
  providerName: "",
  trackingNumber: "",
  estimatedTimeValue: "",
  estimatedTimeUnit: "Days",
  notes: "",
  images: [],
};

const ShippingProviderForm: React.FC<ShippingProviderFormProps> = memo(({ 
  orderId, 
  value, 
  onChange, 
  onSubmit, 
  isSubmitting 
}) => {
  // Zustand store integration
  const { 
    setShippingProvider, 
    updateShippingProvider, 
    submitShippingProvider,
    uploadShippingImages,
    isSubmitting: storeIsSubmitting,
    error: storeError 
  } = useShippingStore();
  
  const currentOrder = useShippingStore(shippingSelectors.currentOrder);
  
  // Initialize form with store data or props
  const [form, setForm] = useState<ShippingProviderValues>(() => {
    if (orderId && currentOrder?.shippingProvider) {
      return { ...DEFAULT_VALUES, ...currentOrder.shippingProvider };
    }
    return { ...DEFAULT_VALUES, ...(value || {}) };
  });

  // Local state for image upload
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Update form when store data changes
  useEffect(() => {
    if (orderId && currentOrder?.shippingProvider) {
      setForm(prev => ({ ...prev, ...currentOrder.shippingProvider }));
    }
  }, [orderId, currentOrder?.shippingProvider]);

  const isValid = useMemo(() => {
    return form.providerName.trim().length > 0 && form.trackingNumber.trim().length > 0;
  }, [form.providerName, form.trackingNumber]);

  const setField = useCallback(
    <K extends keyof ShippingProviderValues>(key: K, v: ShippingProviderValues[K]) => {
      setForm((prev) => {
        const next = { ...prev, [key]: v } as ShippingProviderValues;
        
        // Update store if orderId is provided
        if (orderId) {
          updateShippingProvider(orderId, { [key]: v });
        }
        
        // Call onChange prop for backward compatibility
        onChange?.(next);
        return next;
      });
    },
    [onChange, orderId, updateShippingProvider]
    
  );

  // Stable field change handlers (avoid inline functions in JSX)
  const handleChangeProviderName = useCallback((t: string) => {
    setField("providerName", t);
  }, [setField]);

  const handleChangeTrackingNumber = useCallback((t: string) => {
    setField("trackingNumber", t);
  }, [setField]);

  const handleChangeEstimatedValue = useCallback((t: string) => {
    setField("estimatedTimeValue", t.replace(/[^0-9]/g, ""));
  }, [setField]);

  const handleChangePhoneNumber = useCallback((t: string) => {
    setField("contactPhoneNumber", sanitizePhoneNumber(t));
  }, [setField]);

  const handleChangeNotes = useCallback((t: string) => {
    setField("notes", t);
  }, [setField]);

  const {
    pickMultipleImages,
    error: pickerError,
    clearError: clearPickerError,
  } = useOptimizedImagePicker({
    maxResolution: null,
    maxFileSize: 1.9 * 1024 * 1024,
    quality: 0.9,
    format: 'auto',
    enableCropping: false,
    processing: {
      enableProgressiveJPEG: true,
      preserveTransparency: true,
      stripMetadata: true,
      enableSmartCropping: false,
      compressionAlgorithm: 'balanced',
      enableEnhancement: false,
      enableBackgroundRemoval: false,
    },
  });

  const handlePickImages = useCallback(async () => {
    try {
      clearPickerError();
      setIsUploadingImages(true);

      // Use optimized image picker
      const results = await pickMultipleImages({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.9,
        selectionLimit: 4,
      });

      if (!results || results.length === 0) {
        setIsUploadingImages(false);
        return;
      }

      // Format images for upload
      const formattedImages = results.map((result) => ({
        uri: result.uri,
        mimeType: `image/${result.format || 'jpeg'}`,
        type: result.format || 'jpeg',
      }));

      // Upload images if orderId is available
      if (orderId) {
        const uploadedImages = await uploadShippingImages(orderId, formattedImages);
        
        // Store uploaded images with their URIs
        const newImages = uploadedImages.map((img) => ({ uri: img.uri }));
        
        setForm((prev) => {
          const next = { 
            ...prev, 
            images: [...prev.images, ...newImages].slice(0, 8) 
          };
          
          // Update store if orderId is provided
          updateShippingProvider(orderId, { images: next.images });
          
          // Call onChange prop for backward compatibility
          onChange?.(next);
          return next;
        });
      } else {
        // Fallback: Store local URIs without upload
        const picked = formattedImages.map((img) => ({ uri: img.uri }));
        setForm((prev) => {
          const next = { 
            ...prev, 
            images: [...prev.images, ...picked].slice(0, 8) 
          };
          onChange?.(next);
          return next;
        });
      }

      setIsUploadingImages(false);
    } catch (error) {
      setIsUploadingImages(false);
      if (__DEV__) {
        console.error('Failed to pick/upload images:', error);
      }
      // Error is shown via pickerError or storeError
    }
  }, [
    pickMultipleImages, 
    clearPickerError, 
    orderId, 
    uploadShippingImages, 
    updateShippingProvider, 
    onChange
  ]);

  const handleRemoveImage = useCallback(
    (index: number) => {
      setForm((prev) => {
        const next = { ...prev, images: prev.images.filter((_, i) => i !== index) };
        onChange?.(next);
        return next;
      });
    },
    [onChange]
  );

  const handleSubmit = useCallback(async () => {
    if (!isValid) return;
    
    // Update store with final form data
    if (orderId) {
      setShippingProvider(orderId, form);
      
      // Submit to API via store action
      try {
        await submitShippingProvider(orderId);
        
        // Call onSubmit prop for backward compatibility
        onSubmit?.(form);
      } catch (error) {
        // Error is handled by the store
        if (__DEV__) {
          console.error('Failed to submit shipping provider:', error);
        }
      }
    } else {
      // Fallback to prop-based submission
      onSubmit?.(form);
    }
  }, [isValid, onSubmit, form, orderId, setShippingProvider, submitShippingProvider]);

  const insets = useSafeAreaInsets();
  const [footerHeight, setFooterHeight] = useState(0);
  const handleFooterLayout = useCallback((e: LayoutChangeEvent) => {
    setFooterHeight(e.nativeEvent.layout.height);
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={insets.top}
    >
      <ScrollView
        contentContainerStyle={[styles.formContainer, { paddingBottom: 24 + insets.bottom + footerHeight }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        automaticallyAdjustKeyboardInsets
      >
      <View style={styles.headerBlock}>
        <Text style={styles.headerTitle}>Add Shipping Provider</Text>
        <Text style={styles.headerSubtitle}>
          Please enter the details of the delivery or courier service delivering this product
        </Text>
      </View>

      <View style={styles.fieldBlock}>
        <NativeInput
          label="Name of courier service/provider"
          value={form.providerName}
          onChangeText={handleChangeProviderName}
          placeholder="Enter courier service name"
        />
        <NativeInput
          label="Shipping Tracking Number"
          value={form.trackingNumber}
          onChangeText={handleChangeTrackingNumber}
          placeholder="Enter tracking number"
        />
        <NativeInput
          label="Estimated Shipping Time"
          value={form.estimatedTimeValue}
          onChangeText={handleChangeEstimatedValue}
          keyboardType="number-pad"
          placeholder="Enter estimated days"
          rightAccessory={<Text style={styles.estimatedUnit}>{form.estimatedTimeUnit}</Text>}
        />
        <NativeInput
          label="Contact Phone Number"
          value={form.contactPhoneNumber || ""}
          onChangeText={handleChangePhoneNumber}
          keyboardType="phone-pad"
          placeholder="Enter contact phone number"
        />
        <NativeInput
          label="Add Shipping notes"
          value={form.notes}
          onChangeText={handleChangeNotes}
          multiline
          placeholder="Add any additional shipping notes"
        />
      </View>

      <View style={styles.imagesBlock}>
        <Text style={styles.imagesTitle}>Add image Evidence</Text>
        <Pressable 
          style={[
            styles.uploadButton,
            isUploadingImages && styles.uploadButtonDisabled
          ]} 
          onPress={handlePickImages} 
          disabled={isUploadingImages}
          accessibilityRole="button"
          accessibilityLabel="Upload shipping evidence images from gallery"
        >
          {isUploadingImages ? (
            <>
              <ActivityIndicator size="small" color="#464F5D" />
              <Text style={styles.uploadButtonText}>Uploading...</Text>
            </>
          ) : (
            <>
              <Ionicons name="image-outline" size={18} color="#464F5D" />
              <Text style={styles.uploadButtonText}>Upload from gallery</Text>
            </>
          )}
        </Pressable>

        {/* Show picker error if any */}
        {pickerError && (
          <Text style={styles.errorText}>{pickerError.message}</Text>
        )}

        {form.images.length > 0 && (
          <View style={styles.imagesGrid}>
            {form.images.map((img, idx) => (
              <View key={`${img.uri}-${idx}`} style={styles.imageCard}>
                <Image source={{ uri: img.uri }} style={styles.imageThumb} />
                <Pressable 
                  style={styles.removeBadge} 
                  onPress={() => handleRemoveImage(idx)} 
                  disabled={isUploadingImages}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove image ${idx + 1}`}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>

      </ScrollView>
      <View style={styles.footerBar} onLayout={handleFooterLayout}>
        <Pressable
          style={[styles.saveButton, !isValid ? styles.saveButtonDisabled : undefined]}
          disabled={!isValid || isSubmitting || storeIsSubmitting}
          onPress={handleSubmit}
          accessibilityRole="button"
          accessibilityLabel="Save Shipping Provider Details"
        >
          <Text style={styles.saveButtonText}>
            {storeIsSubmitting ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
        {storeError && (
          <Text style={styles.errorText}>{storeError}</Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
});


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 24,
  },
  headerBlock: {
    gap: 4,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "600",
    color: "#071827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#464F5D",
  },
  fieldBlock: {
    gap: 16,
  },
  estimatedUnit: {
    color: "#90959E",
    fontSize: 12,
    fontWeight: "500",
  },
  imagesBlock: {
    gap: 12,
  },
  imagesTitle: {
    fontSize: 14,
    color: "#07090C",
    fontWeight: "500",
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: "#464F5D",
    height: 56,
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontSize: 14,
    color: "#464F5D",
  },
  imagesGrid: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  imageCard: {
    width: "48%",
    aspectRatio: 1.6,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  imageThumb: {
    width: "100%",
    height: "100%",
  },
  removeBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#141417",
    alignItems: "center",
    justifyContent: "center",
  },
  footerSpacer: {
    height: 24,
  },
  footerBar: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0,0,0,0.04)",
  },
  saveButton: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3B4A",
  },
  saveButtonDisabled: {
    backgroundColor: "#FFD8DB",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#FF3B4A",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});

ShippingProviderForm.displayName = 'ShippingProviderForm';

export default ShippingProviderForm;


