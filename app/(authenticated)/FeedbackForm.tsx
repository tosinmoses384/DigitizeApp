import AppTextInput from "@components/AppTextInput";
import CheckboxInput from "@components/CheckboxInput";
import CustomButton from "@components/CustomButton";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { router } from "expo-router";
import { useFormik } from "formik";
import * as Yup from "yup";
import React, { useState, useCallback } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import { useFeedbackSubmission } from "../../hooks/use-feedback-submission";
import { useI18n } from "@hooks/use-i18n";

const FeedbackForm = () => {
  const { t } = useI18n();
  const { isSubmitting, submitFeedback } = useFeedbackSubmission();
  
  const [options, setOptions] = useState([
    {
      id: 1,
      titleKey: 'feedback.selling',
      isSelected: false,
    },
    {
      id: 2,
      titleKey: 'feedback.buying',
      isSelected: false,
    },
  ]);

  const addFeedbackValidationSchema = Yup?.object()?.shape({
    description: Yup.string().required(t('validation.required')),
  });

  const addFeedbackFormik = useFormik({
    validationSchema: addFeedbackValidationSchema,
    initialValues: {
      description: "",
    },
    onSubmit: async (values: any) => {
      await handleSubmitFeedback(values);
    },
  });

  const handleCheck = useCallback((id: number) => {
    const checkIfValueExist = options?.find((list) => list?.id === id);
    if (checkIfValueExist) {
      const updatedOptions = options?.map((list) =>
        list?.id === id ? { ...list, isSelected: !list?.isSelected } : { ...list, isSelected: false }
      );
      setOptions(updatedOptions);
    }
  }, [options]);

  const handleSubmitFeedback = useCallback(async (values: { description: string }) => {
    const selectedOption = options.find(option => option.isSelected);
    if (!selectedOption) {
      Alert.alert("Error", t('feedback.selectOption'));
      return;
    }

    const payload = {
      feedback: values.description,
      categoryId: t(selectedOption.titleKey as any),
    };

    await submitFeedback(payload);
  }, [options, submitFeedback, t]);

  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={t('feedback.sendYourFeedback')}
          onPress={() => router.back()}
          isShowHeaderShadow
        />
      </View>

      <ScrollView style={styles.bodyContainer}>
        <Text style={styles.title}>{t('feedback.mostlyUseFor')}</Text>
        <View style={styles.container}>
          {options?.map((option) => (
            <View key={option?.id} style={styles.optionView}>
              <Text style={styles.optionTitle}>{t(option?.titleKey as any)}</Text>
              <Pressable
                style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                onPress={() => handleCheck(option?.id)}
              >
                <CheckboxInput checked={option?.isSelected} />
              </Pressable>
            </View>
          ))}
        </View>
        <View style={{ marginVertical: 16 }}>
          <AppTextInput
            isMultiline
            onChangeText={addFeedbackFormik.handleChange("description")}
            value={addFeedbackFormik?.values?.description}
            error={
              addFeedbackFormik.submitCount > 0 &&
              addFeedbackFormik.errors.description
            }
            placeholder={t('feedback.enterDetails')}
            label={t('feedback.tellUsMore')}
          />
        </View>
      </ScrollView>
      <View style={styles.bottomView}>
        <CustomButton
          title={isSubmitting ? t('feedback.submitting') : t('feedback.submit')}
          buttonStyle={[
            styles.btnContainer,
            isSubmitting && styles.btnContainerDisabled
          ]}
          textStyle={styles.btnText}
          onPress={addFeedbackFormik.handleSubmit}
          disabled={isSubmitting}
        />
      </View>
    </View>
  );
};

export default FeedbackForm;

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
    backgroundColor: "#F9FAFC",
  },
  title: {
    fontSize: 14,
    color: "#393939",
    fontFamily: "DMSansSemiBold",
    marginBottom: 16,
    marginTop: 24,
  },
  subtitle: {
    fontSize: 14,
    color: "#5C6F7F",
    marginBottom: 24,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
  },

  bottomView: {
    padding: 16,
  },
  btnContainer: {
    backgroundColor: "#FF3B4A",
    padding: 14,
    borderRadius: 12,
  },
  btnContainerDisabled: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  btnText: {
    width: "100%",
    textAlign: "center",
    color: "white",
    fontSize: 16,
    fontFamily: "DMSansMedium",
  },
  optionView: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#EDF2F7",
    flex: 1,
    alignItems: "center",
  },
  optionTitle: {
    fontSize: 12,
    color: "#393939",
    fontFamily: "DMSansMedium",
    flex: 1,
  },
});
