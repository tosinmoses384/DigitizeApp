import CustomButton from "@components/CustomButton";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { TOAST_DURATION, SUCCESS_NAVIGATION_DELAY } from "@constants/Constants";
import { router } from "expo-router";
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
} from "react-native";
import AppTextInput from "@components/AppTextInput";
import { useFormik } from "formik";
import * as Yup from "yup";
import { DropdownSelect } from "@components/dropdownSelect";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { capitalizeFirstLetter } from "@helper/capiterlize-first-letter";
import configurationServices from "@services/features/configuration-service/configurationService";
import identityServices from "@services/features/identity-service/loginService";
import { setRefetchPostageAddress } from "@redux/slice/profile/profileSlice";
import CustomToastNotification from "@helper/toast-message";
import { DropdownOption, ToastDetails } from "@models/CommonTypes";
import { useI18n } from "@hooks/use-i18n";

// Component-specific types
interface AddressFormValues {
  fullName: string;
  locationId: string;
  addressLineOne: string;
  addressLineTwo: string;
  postCode: string;
  city: string;
}

// Address form values interface

const AddPaymentAddress = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const { token, postageAddress } = useAppSelector(
    (state) => state?.userProfileSlice
  );
  const { countries } = useAppSelector((state) => state?.countriesSlice);

  // State
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCountryLocation, setSelectedCountryLocation] = useState("");
  const [countryLocations, setCountryLocations] = useState<DropdownOption[]>([]);
  const [toastDetails, setToastDetails] = useState<ToastDetails | null>(null);
  const [locationLoader, setLocationLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const [countryError, setCountryError] = useState<string>("");
  const [cityError, setCityError] = useState<string>("");

  // Refs for cleanup
  const isMountedRef = useRef(true);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingLocationIdRef = useRef<string | null>(null);

  // Memoized validation schema
  const addItemsValidationSchema = useMemo(
    () =>
      Yup.object().shape({
        fullName: Yup.string()
          .required(t('address.fullNameRequired'))
          .min(2, t('address.fullNameMinLength')),
        addressLineOne: Yup.string()
          .required(t('address.addressLine1Required'))
          .min(5, t('address.addressLine1MinLength')),
        addressLineTwo: Yup.string().optional(),
        postCode: Yup.string()
          .required(t('address.postcodeRequired'))
          .min(3, t('address.postcodeMinLength')),
        city: Yup.string()
          .test('city-required', t('address.cityRequired'), function(value) {
            // City is required only when no location is selected from dropdown
            // We check selectedCountryLocation since that's what actually tracks the dropdown
            if (selectedCountryLocation) return true;
            return !!(value && value.trim().length >= 2);
          }),
        locationId: Yup.string().optional(),
      }),
    [selectedCountryLocation, t]
  );

  // Memoized country options
  const countryOptions = useMemo(() => {
    if (!countries?.length) return [];
    return countries.map((list: any) => ({
      key: list?.id,
      value: capitalizeFirstLetter(list?.name || ""),
    }));
  }, [countries]);

  // Fetch country locations with cleanup
  useEffect(() => {
    if (!selectedCountry) {
      setCountryLocations([]);
      setSelectedCountryLocation(""); // Reset city when country is cleared
      pendingLocationIdRef.current = null;
      return;
    }

    // Only reset city selection if we don't have a pending location to restore
    if (!pendingLocationIdRef.current) {
      setSelectedCountryLocation("");
    }
    
    let cancelled = false;
    setLocationLoader(true);

    const fetchLocations = async () => {
      try {
        const res: any = await configurationServices.countryLocation(token, selectedCountry);
        
        if (!cancelled && isMountedRef.current) {
          const locations = res?.data?.map((list: any) => ({
            key: list?.id,
            value: capitalizeFirstLetter(list?.location),
          })) || [];
          
          setCountryLocations(locations);
          setLocationLoader(false);

          console.log("Fetched locations:", locations, "<pendingLocationIdRef.current>", pendingLocationIdRef.current);
          
          // If we have a pending location ID, set it now that locations are loaded
          if (pendingLocationIdRef.current) {
            setSelectedCountryLocation(pendingLocationIdRef.current);
            pendingLocationIdRef.current = null;
          }
        }
      } catch (error) {
        if (!cancelled && isMountedRef.current) {
          setLocationLoader(false);
          pendingLocationIdRef.current = null;
          setToastDetails({
            message: "Failed to load cities. Please try again.",
            type: "error",
            duration: TOAST_DURATION,
          });
        }
      }
    };

    fetchLocations();

    return () => {
      cancelled = true;
    };
  }, [selectedCountry, token]);

  // Helper function to show toast messages
  const showToast = useCallback((message: string, type: ToastDetails["type"]) => {
    setToastDetails({
      message,
      type,
      duration: TOAST_DURATION,
    });
  }, []);

  // Clear errors when selections are made
  useEffect(() => {
    if (selectedCountry) {
      setCountryError("");
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountryLocation) {
      setCityError("");
    }
  }, [selectedCountryLocation]);

  // Comprehensive validation before submission
  const validateDropdownSelections = useCallback((city: string): boolean => {
    let isValid = true;

    if (!selectedCountry) {
      setCountryError("Country is required");
      showToast("Please select a country.", "error");
      isValid = false;
    }

    // Check if either a city is selected from dropdown OR manual city is entered
    const hasCity = selectedCountryLocation || city.trim();
    if (!hasCity) {
      setCityError("City is required");
      if (isValid) {
        // Only show toast for first error
        showToast("Please select a city or enter it manually.", "error");
      }
      isValid = false;
    }

    return isValid;
  }, [selectedCountry, selectedCountryLocation, showToast]);

  // Form submission handler
  const handleSubmit = useCallback(
    async (values: AddressFormValues) => {
      // Validate dropdown selections
      if (!validateDropdownSelections(values.city)) {
        return;
      }

      setLoader(true);

      const addressData = {
        contactName: values.fullName,
        addressLine1: values.addressLineOne,
        addressLine2: values.addressLineTwo,
        postalCode: values.postCode,
        locationId: selectedCountryLocation || "",
        countryId: selectedCountry,
        deliveryInstructions: "",
        // Add manual city if no location is selected
        ...(selectedCountryLocation ? {} : { city: values.city }),
      };

      try {
        const shippingAddressService = postageAddress
          ? identityServices.editShippingAddress(token, addressData)
          : identityServices.createShippingAddress(token, addressData);

        const res: any = await shippingAddressService;

        if (!isMountedRef.current) return;

        if (res?.status === 200) {
          dispatch(setRefetchPostageAddress(true));
          showToast(
            postageAddress ? "Address updated successfully" : "Address added successfully",
            "success"
          );

          // Navigate back after showing success message
          navigationTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              router.back();
            }
          }, SUCCESS_NAVIGATION_DELAY);
        } else if (res?.responseCode === 401) {
          router.push("/Onboarding");
        } else {
          showToast(res?.detail || res?.Message || "Failed to save address", "error");
        }
      } catch (error: any) {
        if (isMountedRef.current) {
          showToast(
            error?.message || "An error occurred while saving the address",
            "error"
          );
        }
      } finally {
        if (isMountedRef.current) {
          setLoader(false);
        }
      }
    },
    [selectedCountry, selectedCountryLocation, postageAddress, token, dispatch, showToast]
  );

  const addItemFormik = useFormik<AddressFormValues>({
    validationSchema: addItemsValidationSchema,
    initialValues: {
      fullName: "",
      locationId: "",
      addressLineOne: "",
      addressLineTwo: "",
      postCode: "",
      city: "",
    },
    onSubmit: handleSubmit,
    enableReinitialize: false,
  });

  // Clear manual city when a location is selected from dropdown and vice versa
  useEffect(() => {
    if (selectedCountryLocation && addItemFormik.values.city) {
      addItemFormik.setFieldValue("city", "");
    }
  }, [selectedCountryLocation]);

  useEffect(() => {
    if (addItemFormik.values.city.trim() && selectedCountryLocation) {
      setSelectedCountryLocation("");
    }
  }, [addItemFormik.values.city]);

  // Populate form with existing address data
  useEffect(() => {
    if (postageAddress) {
      const { contactName, countryId, addressLine1, addressLine2, postalCode, locationId } = postageAddress;

      addItemFormik.setValues({
        fullName: capitalizeFirstLetter(contactName || ""),
        locationId: locationId || "",
        addressLineOne: capitalizeFirstLetter(addressLine1 || ""),
        addressLineTwo: capitalizeFirstLetter(addressLine2 || ""),
        postCode: postalCode || "",
        city: "",
      });

      // Store the location ID to be set after country locations are loaded
      if (locationId) {
        pendingLocationIdRef.current = locationId;
      }
      
      setSelectedCountry(countryId || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postageAddress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.wrapper}>
      <View style={{position: 'relative'}}>
        <StackHeader
          title={t('address.address')}
          onPress={() => router.back()}
          isShowHeaderShadow
        />
      </View>

      {toastDetails && (
        <View style={styles.toastContainer}>
          <CustomToastNotification
            message={toastDetails.message}
            type={toastDetails.type}
            autoHideDuration={toastDetails.duration as any}
          />
        </View>
      )}

      <ScrollView style={styles.bodyContainer}>
        <View style={{ flex: 1 }}>
          <AppTextInput
            onChangeText={addItemFormik.handleChange("fullName")}
            value={addItemFormik.values.fullName}
            error={
              addItemFormik.submitCount > 0
                ? addItemFormik.errors.fullName
                : undefined
            }
            placeholder={t('address.fullName')}
            label={t('address.fullName')}
            isShowInnerLabel
          />

          <View style={{marginVertical: 8}}>
            <DropdownSelect
              data={countryOptions}
              setSelected={setSelectedCountry}
              selected={selectedCountry}
              placeholder={t('address.country')}
              customStyles={{
                boxStyles: countryError ? styles.dropdownError : undefined,
              }}
            />
            {countryError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{countryError}</Text>
              </View>
            )}
          </View>

          {countryLocations.length > 0 && !locationLoader && (
            <View style={{ marginBottom: 16 }}>
              <DropdownSelect
                data={countryLocations}
                setSelected={setSelectedCountryLocation}
                selected={selectedCountryLocation}
                placeholder={t('address.city')}
                customStyles={{
                  boxStyles: cityError ? styles.dropdownError : undefined,
                }}
              />
              {cityError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{cityError}</Text>
                </View>
              )}
            </View>
          )}

          {selectedCountry && countryLocations.length === 0 && !locationLoader && (
             <View style={{ marginVertical: 16 }}>
              <AppTextInput
                onChangeText={addItemFormik.handleChange("city")}
                value={addItemFormik.values.city}
                error={
                  addItemFormik.submitCount > 0
                    ? addItemFormik.errors.city
                    : undefined
                }
                placeholder={t('address.city')}
                label={t('address.city')}
                isShowInnerLabel
              />
            </View>
          )}

          <View style={{marginVertical: 16}}>
            <AppTextInput
              onChangeText={addItemFormik.handleChange("addressLineOne")}
              value={addItemFormik.values.addressLineOne}
              error={
                addItemFormik.submitCount > 0
                  ? addItemFormik.errors.addressLineOne
                  : undefined
              }
              placeholder={t('address.addressLine1')}
              label={t('address.addressLine1')}
              isShowInnerLabel
            />
          </View>

          <View style={{marginVertical: 16}}>
            <AppTextInput
              onChangeText={addItemFormik.handleChange("addressLineTwo")}
              value={addItemFormik.values.addressLineTwo}
              error={
                addItemFormik.submitCount > 0
                  ? addItemFormik.errors.addressLineTwo
                  : undefined
              }
              placeholder={t('address.addressLine2')}
              label={t('address.addressLine2')}
              isShowInnerLabel
            />
          </View>

          <View style={{ marginVertical: 16 }}>
            <AppTextInput
              onChangeText={addItemFormik.handleChange("postCode")}
              value={addItemFormik.values.postCode}
              error={
                addItemFormik.submitCount > 0
                  ? addItemFormik.errors.postCode
                  : undefined
              }
              placeholder={t('address.postcode')}
              label={t('address.postcode')}
              isShowInnerLabel
            />
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomView}>
        <CustomButton
          title={t('common.save')}
          buttonStyle={styles.btnContainer}
          textStyle={styles.btnText}
          onPress={() => {
            addItemFormik.handleSubmit();
            setToastDetails(null);
          }}
          loader={loader}
        />
      </View>
    </View>
  );
};

export default AddPaymentAddress;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === 'ios' ? SIZES.height / 22 : SIZES.padding,
    paddingBottom: 30,
  },
  bodyContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flex: 1,
  },
  toastContainer: {
    position: "absolute",
    right: 0,
    top: "2%",
    left: 0,
    zIndex: 1000,
  },
  title: {
    fontSize: 18,
    color: '#071827',
    fontFamily: 'DMSansSemiBold',
    marginBottom: 8,
    marginTop: 24,
  },
  subtitle: {
    fontSize: 14,
    color: '#5C6F7F',
    marginBottom: 24,
  },
  container: {
    borderWidth: 1,
    borderColor: '#919EAB33',
    padding: 12,
    borderRadius: 8,
  },
  containerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  containerTitleText: {
    fontSize: 15,
    color: '#212B36',
    marginLeft: 16,
  },
  bottomView: {
    padding: 16,
  },
  btnContainer: {
    backgroundColor: '#FF3B4A',
    padding: 14,
    borderRadius: 12,
  },
  btnText: {
    width: '100%',
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    fontFamily: 'DMSansMedium',
  },
  dropdownError: {
    borderColor: "#FF3B4A",
    borderWidth: 1,
  },
  errorContainer: {
    marginTop: 4,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#FF3B4A",
    fontFamily: "DMSansRegular",
  },
  noCitiesText: {
    fontSize: 14,
    color: "#868E96",
    fontFamily: "DMSansRegular",
    textAlign: "center",
    padding: 12,
  },
});
