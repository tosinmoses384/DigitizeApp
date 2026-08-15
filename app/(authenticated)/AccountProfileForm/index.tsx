import { useFormik } from "formik";
import * as Yup from "yup";
import AppTextInput from "@components/AppTextInput";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import SearchDropdown from "@components/SearchDropdown";
import { DropdownSelect } from "@components/dropdownSelect";
import configurationServices from "@services/features/configuration-service/configurationService";
import { useAppSelector } from "@redux/store";
import { capitalizeFirstLetter } from "@helper/capitalize-first-letter";
import { useToast } from "react-native-toast-notifications";

const AccountProfileForm = () => {
  const toast = useToast();
  const { token } = useAppSelector((state) => state.userProfileSlice);
  const [selected, setSelected] = React.useState("");

  const [selectedMonth, setSelectedMonth] = useState("");

  const [selectedYear, setSelectedYear] = useState("");

  const years = [];

  const currentYear = new Date().getFullYear();
  const minAge = 12; // Minimum age for selection (adjust as needed)
  const maxAge = 100; // Maximum age for selection (adjust as needed)

  const startYear = currentYear - maxAge;
  const endYear = currentYear - minAge;

  for (let year = startYear; year <= endYear; year++) {
    years.push({ label: year.toString(), value: year.toString() });
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

  const accountProfileValidationSchema = Yup?.object()?.shape({
    fullName: Yup.string().required("Required"),
  });

  const accountProfileFormik = useFormik({
    validationSchema: accountProfileValidationSchema,
    initialValues: {
      fullName: "",
    },
    onSubmit: async (values: any) => {
      if (selected === "") {
        return toast.show(`Select gender.`, {
          type: "danger",
          duration: 4000,
        });
      }
    },
  });

  return (
    <View style={styles.wrapper}>
      <View style={[styles.inputViewWrapper, { marginTop: 16 }]}>
        <AppTextInput
          isShowInnerLabel
          onChangeText={accountProfileFormik.handleChange("fullName")}
          value={accountProfileFormik?.values?.fullName}
          error={
            accountProfileFormik.submitCount > 0 &&
            accountProfileFormik.errors.fullName
          }
          placeholder="Full Name"
          label="Full Name"
        />
      </View>
      <View style={styles.inputViewWrapper}>
        <DropdownSelect
          data={genders}
          setSelected={setSelected}
          selected={selected}
          // label="Gender"
          placeholder="Gender"
        />
      </View>
      <View style={[styles.inputViewWrapper, styles.dateOfBirthWrapper]}>
        <View style={{ minWidth: 60 }}>
          <AppTextInput
            isShowInnerLabel
            onChangeText={accountProfileFormik.handleChange("day")}
            value={accountProfileFormik?.values?.day}
            // error={
            //   accountProfileFormik.submitCount > 0 &&
            //   accountProfileFormik.errors.day
            // }
            placeholder="Day"
            label="Day"
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
      </View>
    </View>
  );
};

export default AccountProfileForm;

const styles = StyleSheet.create({
  wrapper: {
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
});
