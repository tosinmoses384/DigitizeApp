import { fontSz } from "../constants";
import { Colors, SIZES } from "../constants/Colors";
import { defaultStyles } from "../constants/Styles";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from "react-native";
import FeatherIcon from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome5";
// import { countries } from "../constants";
import CountryFlag from "react-native-country-flag";
import { useAppSelector } from "@redux/store";
import SearchInput from "@components/SearchInput";
import { useI18n } from "@hooks/use-i18n";
import { useConfigurationData } from "@hooks/use-configuration-data";

export default function Country() {
  const { t } = useI18n();
  const { queries } = useConfigurationData();
  const countries = queries.countries.data;
  const isCountryLoading = queries.countries.isLoading;
  const [search, setSearch] = useState("");
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleCountrySelect = async (id: any) => {
    // setLoading(true);
    setValue(id);

    // await new Promise((resolve) => setTimeout(resolve, 500));
    router.push({
      pathname: "/Signup",
      params: { countryCode: id },
    });
    // setLoading(false);
  };

  const renderTemplate = (item: any) => {
    const isActive = value === item?.code;

    return (
      <Pressable
        style={({ pressed }) => [pressed && styles.pressed, styles.countryList]}
        key={item?.id}
        onPress={() => {
          handleCountrySelect(item?.code);
        }}
      >
        <View style={styles.countryFlagAndList}>
          <CountryFlag isoCode={item?.code} size={15} />
          <Text style={styles.countryInnerList}>{item?.label}</Text>
        </View>
        <View style={[styles.radioCheck, isActive && styles.radioCheckActive]}>
          <FontAwesome
            color="#fff"
            name="check"
            style={!isActive && { display: "none" }}
            size={12}
          />
        </View>
      </Pressable>
    );
  };

  const newCountryValues = countries?.filter((country: any) =>
    country?.label?.toLowerCase()?.includes(search?.toLowerCase())
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.light.background }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
        }}
      >
        <TouchableOpacity
          onPress={() => router.replace({ pathname: "/Onboarding" } as any)}
          style={styles.headerClose}
        >
          <FeatherIcon color="#1d1d1d" name="x" size={24} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={defaultStyles.header}>{t('country.whereAreYouLocated')}</Text>
          <Text style={defaultStyles.descriptionText}>
            {t('country.selectCountryCurrentlyLocated')}
          </Text>
        </View>
        <View style={styles.searchView}>
          <SearchInput
            value={search}
            onChangeText={(text: any) => setSearch(text)}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {newCountryValues?.map((list: any, index: any) => {
            // const isActive = value === index;
            return renderTemplate(list);
            // <TouchableOpacity
            //   key={id}
            //   onPress={() => handleCountrySelect(id)}
            //   style={styles.radioWrapper}
            // >
            //   <Image
            //     alt={`Flag of ${name}`}
            //     style={styles.radioImage}
            //     source={{ uri: `https://flagsapi.com/${id}/flat/64.png` }}
            //   />
            //   <View style={[styles.radio]}>
            //     <Text style={styles.radioLabel}>{name}</Text>
            //     <View
            //       style={[
            //         styles.radioCheck,
            //         isActive && styles.radioCheckActive,
            //       ]}
            //     >
            //       <FontAwesome
            //         color="#fff"
            //         name="check"
            //         style={!isActive && { display: "none" }}
            //         size={12}
            //       />
            //     </View>
            //   </View>
            // </TouchableOpacity>
          })}
          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator
                size="small"
                color={Colors.light.primaryBase}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 12,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerClose: {
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 16,
  },
  radio: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 54,
    paddingRight: 24,
  },
  radioWrapper: {
    paddingLeft: 24,
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  radioImage: {
    width: 30,
    height: 30,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  radioLabel: {
    fontSize: fontSz(18),
    color: "#6B778C",
    fontFamily: "DMSansMedium",
  },
  radioCheck: {
    width: 22,
    height: 22,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
    borderWidth: 2,
    borderColor: "#90959E",
  },
  radioCheckActive: {
    borderColor: Colors.light.primaryBase,
    backgroundColor: Colors.light.primaryBase,
  },
  loader: {
    marginVertical: 20,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.5,
  },
  countryList: {
    marginBottom: 4,
    paddingVertical: 5,
    flexDirection: "row",
  },
  countryFlagAndList: {
    flexDirection: "row",
    flex: 1,
  },
  countryInnerList: {
    fontSize: 14,
    color: "rgba(107, 119, 140, 1)",
    textTransform: "capitalize",
    marginLeft: 10,
  },
  searchView: {
    marginBottom: 10,
    paddingHorizontal: 16,
  },
});
