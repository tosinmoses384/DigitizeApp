import AppTextInput from "@components/AppTextInput";
import { useFormik } from "formik";
import * as Yup from "yup";
import CustomButton from "@components/CustomButton";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import TitleAndChevronRight from "@components/TitleAndChevronRight";
import ContentSwitch from "@components/ContentSwitch";
import LocationModal from "modals/LocationModal";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { capitalizeFirstLetter } from "@helper/capitalize-first-letter";
import { useToast } from "react-native-toast-notifications";
import EmailAndPhoneNumber from "@components/EmailAndPhonenumber";
import PhoneNumberUnavailable from "@components/PhoneNumberUnavailable";
import FrameComponent from "@components/FrameComponent";
import AccountProfileForm from "./AccountProfileForm";
import DeleteAccountModal from "modals/DeleteAccountModal";
import configurationServices from "@services/features/configuration-service/configurationService";
import { DropdownSelect } from "@components/dropdownSelect";
import moment from "moment";
import { setRefetchUserState } from "@redux/slice/profile/profileSlice";
import { setTemporaryRoute } from "@redux/slice/temporary-route/temporaryRouteSlice";
import identityServices from "@services/features/identity-service/loginService";
import DeleteItemModal from "modals/DeleteItemModal";
import LogoutModal from "modals/LogoutModal";
import DateTimePicker from "@react-native-community/datetimepicker";
import platform from "./platform";
import { Ionicons } from "@expo/vector-icons";
import CustomToastNotification from "@helper/toast-message";
import { useI18n } from "@hooks/use-i18n";

const AccountDetailsScreen = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const [toastDetails, setToastDetails]: any = useState(null);
  const toast = useToast();
  const { profile, token } = useAppSelector((state) => state.userProfileSlice);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [selected, setSelected] = React.useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [profileUpdateLoader, setProfileUpdateLoader] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);
  const [dateTitle, setDateTitle] = useState("");

  const years = [];

  const currentYear = new Date().getFullYear();
  const minAge = 12; // Minimum age for selection (adjust as needed)
  const maxAge = 100; // Maximum age for selection (adjust as needed)

  const startYear = currentYear - maxAge;
  const endYear = currentYear - minAge;

  for (let year = startYear; year <= endYear; year++) {
    years.push({ key: year.toString(), value: year.toString() });
  }

  const months = [
    { key: "January", value: "January" },
    { key: "February", value: "February" },
    { key: "March", value: "March" },
    { key: "April", value: "April" },
    { key: "May", value: "May" },
    { key: "June", value: "June" },
    { key: "July", value: "July" },
    { key: "August", value: "August" },
    { key: "September", value: "September" },
    { key: "October", value: "October" },
    { key: "November", value: "November" },
    { key: "December", value: "December" },
  ];

  // const data = [
  //   { key: "Male", value: "Male" },
  //   { key: "Female", value: "Female" },
  // ];

  const [genders, setGenders] = useState([]);

  const getGender = () => {
    configurationServices
      ?.gender(token)
      .then((res: any) => {
        const distructureGender = res?.data?.map((list: any) => {
          return {
            key: list?.id,
            value: capitalizeFirstLetter(list?.name),
            ...list,
          };
        });

        setGenders(distructureGender);
      })
      .catch((error) => {});
  };

  useEffect(() => {
    if (token) {
      getGender();
    }
  }, [token]);

  function getCustomMonthNumber(monthName: any) {
    const monthMoment = moment(monthName, "MMMM");

    if (!monthMoment.isValid()) {
      return null; // Invalid month
    }

    let monthNumber = monthMoment.month() + 1; // 1-12

    return String(monthNumber).padStart(2, "0");
  }

  function splitFullName(fullName: string) {
    if (!fullName || typeof fullName !== "string") {
      return { firstName: "", lastName: "" }; // Handle invalid input
    }

    const names = fullName.trim().split(" ");

    if (names.length === 0) {
      return { firstName: "", lastName: "" };
    }

    if (names.length === 1) {
      return { firstName: names[0], lastName: "" };
    }

    const firstName = names[0];
    const lastName = names[names.length - 1];

    return { firstName, lastName };
  }

  const accountProfileValidationSchema = Yup?.object()?.shape({
    fullName: Yup.string().required(t('settings.required')),
  });

  // ("selected>>", selected);

  const accountProfileFormik = useFormik({
    validationSchema: accountProfileValidationSchema,
    initialValues: {
      fullName: "",
    },
    onSubmit: async (values: any) => {
      if (selected === "") {
        // return toast.show(`Select gender.`, {
        //   type: "danger",
        //   duration: 4000,
        // });
        return setToastDetails({
          message: t('settings.selectGender'),
          type: "error",
          duration: 4000,
        });
      }
      if (selectedMonth === "") {
        return setToastDetails({
          message: t('settings.selectMonthOfBirth'),
          type: "error",
          duration: 4000,
        });
        // return toast.show(`Select month of birth.`, {
        //   type: "danger",
        //   duration: 4000,
        // });
      }
      if (selectedYear === "") {
        return setToastDetails({
          message: t('settings.selectYearOfBirth'),
          type: "error",
          duration: 4000,
        });
        // return toast.show(`Select year of birth.`, {
        //   type: "danger",
        //   duration: 4000,
        // });
      }

      setProfileUpdateLoader(true);
      const { firstName, lastName } = splitFullName(values?.fullName);
      // selectedYear
      // const dob = `${selectedYear}-${getCustomMonthNumber(selectedMonth)}-${
      //   values?.day
      // }`;
      const newDb = moment(date).format("YYYY-MM-DD");

      // ("newDb>>", newDb);
      let data = {
        biography: profile?.biography,
        countryId: profile?.countryId,
        locationId: profile?.locationId,
        languageId: profile?.languageId,
        shouldShowLocation: profile?.shouldShowLocation,
        firstName,
        lastName,
        dateOfBirth: newDb,
        gender: selected,
      };

      let uploadUserPicture = identityServices?.updateProfileDetails(
        data,
        token
      );
      uploadUserPicture
        ?.then((res: any) => {
          setProfileUpdateLoader(false);

          if (res?.status === 200) {
            dispatch(setRefetchUserState(true));
            dispatch(setTemporaryRoute("/accountDetails"));

            return setToastDetails({
              message: t('settings.operationSuccessful'),
              type: "success",
              duration: 4000,
            });
          }
          if (res?.responseCode === "401" || res?.responseCode === 401) {
            return router.push("/Onboarding");
          }
          // return toast.show(res?.detail || "Operation failed.", {
          //   type: "danger",
          //   duration: 4000,
          // });
          return setToastDetails({
            message: `${res?.detail || res?.Message || "Operation failed."}`,
            type: "error",
            duration: 4000,
          });
        })
        .catch((error) => {
          setProfileUpdateLoader(false);
        });
    },
  });

  function extractDateComponents(dateString: string) {
    const momentDate = moment(dateString);

    if (!momentDate.isValid()) {
      return { year: null, month: null, day: null }; // Invalid date
    }

    const year = momentDate.year();
    const month = String(momentDate.month()); // Month (1-12, padded)
    const day = String(momentDate.date()).padStart(2, "0"); // Day of the month (padded)

    return { year, month, day };
  }

  useEffect(() => {
    if (profile) {
      const desiredFormat = "YYYY-MM-DDTHH:mm:ss.SSSZ";

      const momentObject = moment.utc(profile?.dateOfBirth);

      const formattedDateString = momentObject.format(desiredFormat);

      const getDate = profile?.dateOfBirth ? formattedDateString : new Date();

      const getDateLabel = profile?.dateOfBirth ? formattedDateString : "";

      setDate(new Date(getDate));
      setDateTitle(getDateLabel);

      const { day, year, month }: any = extractDateComponents(
        profile?.dateOfBirth || ""
      );

      const getGenderDetails: any = genders?.find(
        (list: any) => list?.key === profile?.genderId
      );

      accountProfileFormik.setFieldValue(
        "fullName",
        `${capitalizeFirstLetter(
          profile?.firstName || ""
        )} ${capitalizeFirstLetter(profile?.lastName || "")}`
      );

      setSelected(`${getGenderDetails?.key || ""}`);
      accountProfileFormik.setFieldValue("day", `${day || ""}`);
      setSelectedMonth(`${months[month]?.value}`);
      setSelectedYear(year?.toString() || "");
    }
  }, [profile, genders]);

  const onChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || date;
    const { day, year, month }: any = extractDateComponents(currentDate || "");
    setShowDateModal(false);
    setDate(currentDate);
    setDateTitle(currentDate);
    setSelectedMonth(`${months[month]?.value}`);
    setSelectedYear(year?.toString() || "");
  };

  const showDateTimePicker = () => {
    setShowDateModal(true);
  };

  // Check if phone number exists in the profile
  // isSetPhone = true means phone is NOT set (unavailable) - show PhoneNumberUnavailable
  // isSetPhone = false means phone IS set - show FrameComponent
  const isSetPhone = !profile?.phoneNumber || (typeof profile?.phoneNumber === 'string' && profile.phoneNumber.trim() === '');

  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={t('settings.accountSettings')}
          onPress={() => router.push("/settings")}
          isShowHeaderShadow
        />
        {toastDetails && (
          <View
            style={{
              position: "absolute",
              right: 0,
              left: 0,
              top: "2%",
            }}
          >
            <CustomToastNotification
              message={toastDetails?.message}
              type={toastDetails?.type}
              autoHideDuration={toastDetails?.duration}
            />
          </View>
        )}
        <View style={styles.saveButtonView}>
          <CustomButton
            title={t('common.save')}
            textStyle={styles?.saveText}
            buttonStyle={styles?.saveButton}
            loader={profileUpdateLoader}
            onPress={() => {
              setToastDetails(null);
              accountProfileFormik.handleSubmit();
            }}
          />
        </View>
      </View>
      <ScrollView style={styles.bodyContainer}>
        <EmailAndPhoneNumber
          value={profile?.emailAddress || "**********"}
          btnTitle={profile?.isEmailAddressVerified ? t('settings.change') : t('settings.verify')}
          onPress={() =>
            profile?.isEmailAddressVerified
              ? router.push("/ChangeEmail")
              : router.push("/EmailConfirmation")
          }
        />
        <View style={{ marginTop: 16 }}>
          {isSetPhone ? (
            <PhoneNumberUnavailable />
          ) : (
            <FrameComponent 
              phoneNumber={profile?.phoneNumber}
              isVerified={profile?.isPhoneNumberVerified}
            />
          )}
        </View>
        <View style={styles.formWrapper}>
          <View style={[styles.inputViewWrapper, { marginTop: 16 }]}>
            <AppTextInput
              isShowInnerLabel
              onChangeText={accountProfileFormik.handleChange("fullName")}
              value={accountProfileFormik?.values?.fullName}
              error={
                accountProfileFormik.submitCount > 0 &&
                accountProfileFormik.errors.fullName
              }
              placeholder={t('settings.fullName')}
              label={t('settings.fullName')}
            />
          </View>
          <View style={styles.inputViewWrapper}>
            <DropdownSelect
              data={genders}
              setSelected={setSelected}
              selected={selected}
              // label="Gender"
              placeholder={t('settings.gender')}
            />
          </View>
          <View style={[styles.dateOfBirthDropdownAndroid]}>
            {/* {Platform.OS === "android" && ( */}
            <Pressable
              style={[styles.dateOfBirthDropdownView]}
              onPress={
                Platform.OS === "android"
                  ? showDateTimePicker
                  : () => {
                      setShowDateModal(!showDateModal);
                    }
              }
            >
              <Text style={[styles.dateOfBirthDropdownText]}>{t('settings.birthday')}</Text>
            </Pressable>
            <CustomButton
              title={
                !dateTitle
                  ? t('settings.dateFormatPlaceholder')
                  : moment(dateTitle).format("MM/DD/YYYY")
              }
              onPress={
                Platform.OS === "android"
                  ? showDateTimePicker
                  : () => {
                      setShowDateModal(!showDateModal);
                    }
              }
              buttonStyle={{
                width: "100%",
                paddingVertical: 1,
              }}
              textStyle={{
                fontSize: 14,
              }}
            />
            {/* )} */}
            <Ionicons
              name="chevron-down"
              size={16}
              color="#919EABCC"
              style={styles.dateOfBirthDropdownIcon}
            />

            {showDateModal && Platform.OS === "android" ? (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={"date"}
                is24Hour={true}
                display="default"
                onChange={onChange}
              />
            ) : (
              Platform.OS === "ios" &&
              showDateModal && (
                <View style={{ backgroundColor: "#333333" }}>
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode={"date"}
                    is24Hour={true}
                    display="inline"
                    onChange={onChange}
                    style={{ backgroundColor: "#333333" }} // Attempting to change color
                    textColor="black"
                  />
                </View>
              )
            )}
          </View>
          {/* <View style={[styles.inputViewWrapper, styles.dateOfBirthWrapper]}>
            <View style={{ minWidth: 60 }}>
              <AppTextInput
                // isShowInnerLabel
                onChangeText={accountProfileFormik.handleChange("day")}
                value={accountProfileFormik?.values?.day}
                // error={
                //   accountProfileFormik.submitCount > 0 &&
                //   accountProfileFormik.errors.day
                // }
                placeholder="Day"
                // label="Day"
                // inputHeight={47}
              />
            </View>
            <View style={{ flex: 1, marginHorizontal: 6 }}>
              <DropdownSelect
                data={months}
                setSelected={setSelectedMonth}
                selected={selectedMonth}
                // label="Gender"
                placeholder="Month"
              />
            </View>
            <View style={{ flex: 1 }}>
              <DropdownSelect
                data={years}
                setSelected={setSelectedYear}
                selected={selectedYear}
                // label="Gender"
                placeholder="Year"
              />
            </View>
          </View> */}
        </View>
        {profile?.isEmailAddressVerified && (
          <View style={{ marginTop: 16 }}>
            <EmailAndPhoneNumber
              value={t('settings.emailAddress')}
              onPress={() => {}}
              btnTitle={t('settings.verified')}
              btnStyle={styles.verifiedBtn}
              btnTitleStyle={styles.verifiedTextBtn}
              disabled={profile?.isEmailAddressVerified}
            />
          </View>
        )}

        {/* <View style={{ marginTop: 16 }}>
          <EmailAndPhoneNumber
            value="Facebook"
            onPress={() => {}}
            btnTitle="Verified"
            btnStyle={styles.verifiedBtn}
            btnTitleStyle={styles.verifiedTextBtn}
            disabled
          />
        </View> */}

        {/* <View style={{ marginTop: 16 }}>
          <EmailAndPhoneNumber
            value="Google"
            onPress={() => {}}
            btnTitle="Verified"
            btnStyle={styles.verifiedBtn}
            btnTitleStyle={styles.verifiedTextBtn}
            disabled
          />
          <Text style={styles.googleText}>
            Link to your other accounts to become a trusted verified trifter
          </Text>
        </View> */}
        <View style={styles.changePasswordView}>
          <TitleAndChevronRight
            title={t('profile.changePassword')}
            onPress={() => router.push("/ChangePassword")}
          />
        </View>
        <View style={styles.changePasswordView}>
          <TitleAndChevronRight
            title={
              profile?.isScheduledToBeDeleted
                ? t('settings.cancelDeleteAccountAction')
                : t('settings.deleteMyAccount')
            }
            onPress={() => setIsDeleteModal(!isDeleteModal)}
          />
        </View>
        <View style={[styles.changePasswordView, { paddingBottom: 20 }]}>
          <TitleAndChevronRight
            title={t('settings.logout')}
            onPress={() => setShowLogoutModal(true)}
          />
        </View>
      </ScrollView>
 
      {showLogoutModal && (
        <LogoutModal isShow onClose={() => setShowLogoutModal(false)} />
      )}

      {isDeleteModal && (
        <DeleteAccountModal onClose={() => setIsDeleteModal(false)} isShow />
      )}
    </View>
  );
};

export default AccountDetailsScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
    paddingBottom: 30,
  },
  saveButtonView: {
    position: "absolute",
    top: 12,
    right: 16,
  },
  bodyContainer: {
    paddingHorizontal: 16,
  },

  saveButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  saveText: {
    color: "#212C3D",
    fontSize: 14,
    fontFamily: "DMSansSemiBold",
  },
  googleText: {
    color: "#6B727E",
    fontSize: 10,
    marginTop: 4,
  },
  changePasswordView: {
    padding: 12,
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: 16,
  },
  verifiedBtn: {
    borderWidth: 1,
    borderColor: "#B5B9BE",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  verifiedTextBtn: {
    color: "#B5B9BE",
  },
  formWrapper: {
    marginBottom: 16,
  },
  inputViewWrapper: {
    // marginBottom: 16,
  },
  dateOfBirthWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  dateOfBirthDropdownAndroid: {
    width: "100%",
    backgroundColor: "white",
    marginTop: 16,
    borderRadius: 12,
    position: "relative",
    paddingBottom: 6,
  },
  dateOfBirthDropdownView: {
    paddingTop: 6,
    marginBottom: 2,
    paddingHorizontal: 12,
  },
  dateOfBirthDropdownText: {
    fontSize: 12,
    color: "#919EABCC",
    fontFamily: "DMSansMedium",
  },
  dateOfBirthDropdownIcon: {
    position: "absolute",
    right: 14,
    top: 17,
  },
  // dateOfBirthDropdownText: {
  //   position: "absolute",
  // },
});
