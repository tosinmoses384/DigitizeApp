import React, { useCallback, useMemo, useState, memo, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import NativeInput from "./NativeInput";
import { DropdownSelect } from "@components/dropdownSelect";
import { useShippingStore, shippingSelectors } from "@stores/shippingStore";
import type { ReturnAddressValues } from "@stores/types";
import { useI18n } from "@hooks/use-i18n";

export type ReturnAddressFormProps = {
  orderId?: string;
  value?: Partial<ReturnAddressValues>;
  onChange?: (val: ReturnAddressValues) => void;
  onSubmit?: (val: ReturnAddressValues) => void;
  isSubmitting?: boolean;
  stateOptions?: Array<{ key: string | number; value: string }>;
  loadingStates?: boolean;
  userCountryId?: string;
};

const DEFAULT_VALUES: ReturnAddressValues = {
  streetNumber: "",
  streetName: "",
  location: "",
  countryId: "",
};

const ReturnAddressForm: React.FC<ReturnAddressFormProps> = memo(({ 
  orderId,
  value, 
  onChange,
  onSubmit,
  isSubmitting,
  stateOptions,
  loadingStates,
  userCountryId,
}) => {
  const { t } = useI18n();
  const { 
    setReturnAddress, 
    updateReturnAddress,
    setDefaultReturnAddress,
    clearError,
  } = useShippingStore();
  
  const currentOrder = useShippingStore(shippingSelectors.currentOrder);
  
  // Initialize form with store data or props
  const [form, setForm] = useState<ReturnAddressValues>(() => {
    if (orderId && currentOrder?.returnAddress) {
      return { ...DEFAULT_VALUES, ...currentOrder.returnAddress };
    }
    return { ...DEFAULT_VALUES, ...(value || {}) };
  });

  // Update form when store data changes
  useEffect(() => {
    if (orderId && currentOrder?.returnAddress) {
      setForm(prev => ({ ...prev, ...currentOrder.returnAddress }));
    }
  }, [orderId, currentOrder?.returnAddress]);

  const isValid = useMemo(() => {
    return (
      form.streetNumber.trim().length > 0 &&
      form.streetName.trim().length > 0 &&
      form.location.trim().length > 0 &&
      (userCountryId || form.countryId.trim().length > 0)
    );
  }, [form.streetNumber, form.streetName, form.location, form.countryId, userCountryId]);

  const setField = useCallback(
    <K extends keyof ReturnAddressValues>(key: K, v: ReturnAddressValues[K]) => {
      setForm((prev) => {
        const next = { ...prev, [key]: v } as ReturnAddressValues;
        
        // Update store if orderId is provided
        if (orderId) {
          updateReturnAddress(orderId, { [key]: v });
        }
        
        // Call onChange prop for backward compatibility
        onChange?.(next);
        return next;
      });
    },
    [onChange, orderId, updateReturnAddress]
  );

  const handleSubmit = useCallback(() => {
    if (!isValid) return;
    
    const finalFormData = {
      ...form,
      countryId: userCountryId || form.countryId,
    };
    
    if (orderId) {
      setReturnAddress(orderId, finalFormData);
      setDefaultReturnAddress(finalFormData);
    }
    
    onSubmit?.(finalFormData);
  }, [isValid, onSubmit, form, orderId, userCountryId, setReturnAddress, setDefaultReturnAddress]);

  return (
    <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBlock}>
        <Text style={styles.headerTitle}>{t('returnAddressForm.title')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('returnAddressForm.subtitle')}
        </Text>
      </View>

      <View style={styles.fieldBlock}>
        <NativeInput
          label={t('returnAddressForm.streetNumber')}
          value={form.streetNumber}
          onChangeText={(t) => setField("streetNumber", t)}
          keyboardType="number-pad"
          placeholder={t('returnAddressForm.streetNumberPlaceholder')}
        />
        <NativeInput
          label={t('returnAddressForm.streetName')}
          value={form.streetName}
          onChangeText={(t) => setField("streetName", t)}
          placeholder={t('returnAddressForm.streetNamePlaceholder')}
        />
        <View style={styles.dropdownWrapper}>
          <Text style={styles.dropdownLabel}>{t('returnAddressForm.locationCity')}</Text>
          {stateOptions?.length || loadingStates ? (
            <DropdownSelect
              data={stateOptions || []}
              setSelected={(val: any) => {
                // Ensure we're saving the location NAME (value), not ID (key)
                // The dropdown library should return value when save="value", but we double-check
                const selectedOption = stateOptions?.find(opt => opt.value === val || opt.key === val);
                const locationName = selectedOption?.value || val;
                setField("location", locationName);
              }}
              selected={form.location}
              placeholder={t('returnAddressForm.selectLocation')}
              loading={loadingStates}
              customStyles={{
                container: form.location ? styles.dropdownFilledContainer : styles.dropdownEmptyContainer,
                boxStyles: form.location ? styles.dropdownFilledBox : styles.dropdownEmptyBox,
                inputStyles: form.location ? styles.dropdownFilledInput : styles.dropdownEmptyInput,
                labelStyles: styles.hiddenLabel, 
              }}
            />
          ) : (
            <NativeInput
              label=""
              value={form.location}
              onChangeText={(t) => setField("location", t)}
              placeholder={t('returnAddressForm.enterLocation')}
            />
          )}
        </View>
      </View>

      <View style={styles.footerSpacer} />
      <View style={styles.footerBar}>
        <Pressable
          style={[styles.saveButton, (!isValid || isSubmitting) ? styles.saveButtonDisabled : undefined]}
          disabled={!isValid || isSubmitting}
          onPress={handleSubmit}
          accessibilityRole="button"
          accessibilityLabel={t('returnAddressForm.saveReturnAddress')}
        >
          <Text style={[styles.saveButtonText, (!isValid || isSubmitting) ? styles.saveButtonTextDisabled : undefined]}>
            {t('returnAddressForm.save')}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 24,
  },
  headerBlock: {
    gap: 8,
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
    lineHeight: 20,
  },
  fieldBlock: {
    gap: 16,
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
  saveButtonTextDisabled: {
    color: "#FF9DA7",
  },
  dropdownWrapper: {
    gap: 8,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E2226",
    lineHeight: 20,
  },
  dropdownEmptyContainer: {
    backgroundColor: "#E9EAEB",
    borderRadius: 8,
  },
  dropdownEmptyBox: {
    backgroundColor: "#E9EAEB",
    borderWidth: 0,
    borderColor: "transparent",
    height: 56,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  dropdownEmptyInput: {
    fontSize: 14,
    color: "#464F5D",
    fontWeight: "500",
  },
  dropdownFilledContainer: {
    backgroundColor: "#F6F7F7",
    borderWidth: 1,
    borderColor: "#D3D5D8",
    borderRadius: 8,
  },
  dropdownFilledBox: {
    backgroundColor: "#F6F7F7",
    borderWidth: 0,
    borderColor: "transparent",
    height: 58,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  dropdownFilledInput: {
    fontSize: 14,
    color: "#141417",
    fontWeight: "500",
  },
  hiddenLabel: {
    height: 0,
    marginBottom: 0,
    fontSize: 0,
    lineHeight: 0,
    opacity: 0,
  },
  errorText: {
    color: "#FF3B4A",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});

ReturnAddressForm.displayName = 'ReturnAddressForm';

export default ReturnAddressForm;
