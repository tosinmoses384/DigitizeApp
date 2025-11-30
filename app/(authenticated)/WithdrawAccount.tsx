import CustomButton from "@components/CustomButton";
import StackHeader from "@components/StackHeader";
import DynamicFormField from "@components/DynamicFormField";
import { SkeletonBox } from "@components/purchase/SkeletonComponents";
import { Colors, SIZES } from "@constants/Colors";
import { router } from "expo-router";
import React, { useState, useCallback, useMemo, useRef } from "react";
import { Platform, ScrollView, StyleSheet, Text, View, TextInput, KeyboardAvoidingView } from "react-native";
import { useI18n } from "@hooks/use-i18n";
import { usePayoutRequirements } from "@hooks/use-payout-requirements";
import { useAppSelector } from "@redux/store";
import walletService from "@services/walletService";
import { useToast } from "react-native-toast-notifications";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const WithdrawAccount = () => {
  const { t } = useI18n();
  const { allFields, loading } = usePayoutRequirements();
  const { token } = useAppSelector((state) => state.userProfileSlice);
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitCount, setSubmitCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<Record<string, TextInput | null>>({});

  const handleFieldChange = useCallback((fieldName: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [errors]);

  const handleFieldBlur = useCallback((fieldName: string, value: string) => {
    const field = allFields.find((f) => f.fieldName === fieldName);
    if (!field) return;

    if (field.isRequired && !value?.trim()) {
      setErrors((prev) => ({ ...prev, [fieldName]: t('validation.required') }));
      return;
    }

    if (value && field.validationPattern) {
      const regex = new RegExp(field.validationPattern);
      if (!regex.test(value)) {
        setErrors((prev) => ({ ...prev, [fieldName]: t('validation.invalidFormat') }));
      }
    }
  }, [allFields, t]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    allFields.forEach((field) => {
      const value = formValues[field.fieldName] || '';

      if (field.isRequired && !value.trim()) {
        newErrors[field.fieldName] = t('validation.required');
        return;
      }

      if (value && field.validationPattern) {
        const regex = new RegExp(field.validationPattern);
        if (!regex.test(value)) {
          newErrors[field.fieldName] = t('validation.invalidFormat');
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [allFields, formValues, t]);

  const firstInvalidFieldName = useCallback((): string | null => {
    for (const field of allFields) {
      const value = formValues[field.fieldName] || '';
      if (field.isRequired && !value.trim()) return field.fieldName;
      if (value && field.validationPattern) {
        const regex = new RegExp(field.validationPattern);
        if (!regex.test(value)) return field.fieldName;
      }
    }
    return null;
  }, [allFields, formValues]);

  const handleSubmit = useCallback(async () => {
    setSubmitCount((prev) => prev + 1);

    if (!validateForm()) {
      const target = firstInvalidFieldName();
      if (target && inputRefs.current[target]) {
        inputRefs.current[target]?.focus();
      }
      toast.show('Please fix highlighted fields', { type: 'warning', duration: 3000 });
      return;
    }

    if (!token) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await walletService.createPayoutAccount(token, formValues);

      if (response?.status === 200 || response?.status === 201) {
        toast.show("Withdrawal account saved", { type: "success", duration: 3000 });
        router.back();
      } else {
        // Parse API error payload and surface to user
        const apiMessage =
          (response as any)?.message ||
          (response as any)?.detail ||
          "An error has occurred";

        // Map any field-level errors we recognize
        const fieldErrors = (response as any)?.errors as Record<string, string[]> | undefined;
        if (fieldErrors) {
          const newFieldErrors: Record<string, string> = {};
          Object.entries(fieldErrors).forEach(([name, arr]) => {
            if (allFields.some((f) => f.fieldName === name) && arr?.length) {
              newFieldErrors[name] = arr[0];
            }
          });
          if (Object.keys(newFieldErrors).length > 0) {
            setErrors((prev) => ({ ...prev, ...newFieldErrors }));
          }
        }

        toast.show(apiMessage, { type: "danger", duration: 4000 });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
      setErrors({ general: errorMessage });
      toast.show(errorMessage, { type: 'danger', duration: 4000 });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, token, formValues, firstInvalidFieldName, toast, allFields]);

  const textFieldNames = useMemo(
    () => allFields.filter((f) => f.fieldType === 'Text').map((f) => f.fieldName),
    [allFields]
  );

  

  const renderSkeleton = useMemo(() => (
    <>
      <SkeletonBox width="100%" height={60} marginBottom={16} borderRadius={8} />
      <SkeletonBox width="100%" height={60} marginBottom={16} borderRadius={8} />
      <SkeletonBox width="100%" height={60} marginBottom={16} borderRadius={8} />
    </>
  ), []);

  return (
    <KeyboardAvoidingView style={styles.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={t('payments.withdrawalAccount')}
          onPress={() => router.back()}
          isShowHeaderShadow
        />
      </View>

      <ScrollView
        style={styles.bodyContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'on-drag'}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('payments.withdrawalAccount')}</Text>
        <Text style={styles.subtitle}>
          {t('payments.withdrawalAccountDescription')}
        </Text>

        {loading ? (
          renderSkeleton
        ) : (
          <>
            {allFields.map((field) => {
              const isTextField = field.fieldType === 'Text';
              const index = textFieldNames.indexOf(field.fieldName);
              const isLastText = index === textFieldNames.length - 1;
              const onSubmitEditing = () => {
                if (!isLastText) {
                  const nextName = textFieldNames[index + 1];
                  inputRefs.current[nextName]?.focus();
                }
              };

              return (
              <DynamicFormField
                key={field.fieldName}
                field={field}
                value={formValues[field.fieldName] || ''}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                error={errors[field.fieldName]}
                submitCount={submitCount}
                ref={(ref) => { if (isTextField) { inputRefs.current[field.fieldName] = ref; } }}
                returnKeyType={isTextField && !isLastText ? 'next' : 'done'}
                onSubmitEditing={isTextField ? onSubmitEditing : undefined}
              />
            );})}

            {errors.general && (
              <Text style={styles.errorText}>{errors.general}</Text>
            )}
          </>
        )}
      </ScrollView>

      <View style={[styles.bottomView, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <CustomButton
          title={t('common.save')}
          buttonStyle={[
            styles.btnContainer,
            (isSubmitting || loading) && styles.btnDisabled,
          ]}
          textStyle={styles.btnText}
          onPress={handleSubmit}
          disabled={isSubmitting || loading}
          loader={isSubmitting}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default WithdrawAccount;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
    paddingBottom: 30,
  },
  bodyContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flex: 1,
  },
  title: {
    fontSize: 18,
    color: "#071827",
    fontFamily: "DMSansSemiBold",
    marginBottom: 8,
    marginTop: 24,
  },
  subtitle: {
    fontSize: 14,
    color: "#5C6F7F",
    marginBottom: 24,
  },
  container: {
    borderWidth: 1,
    borderColor: "#919EAB33",
    padding: 12,
    borderRadius: 8,
  },
  containerTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  containerTitleText: {
    fontSize: 15,
    color: "#212B36",
    marginLeft: 16,
  },
  bottomView: {
    padding: 16,
  },
  btnContainer: {
    backgroundColor: "#FF3B4A",
    padding: 14,
    borderRadius: 12,
  },
  btnText: {
    width: "100%",
    textAlign: "center",
    color: "white",
    fontSize: 16,
    fontFamily: "DMSansMedium",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: "#D4313E",
    fontSize: 12,
    marginTop: 8,
    fontFamily: "DMSansRegular",
  },
});
