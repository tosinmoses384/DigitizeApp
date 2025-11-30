import SearchInput from "@components/SearchInput";
import StackHeader from "@components/StackHeader";
import TitleAndChevronRight from "@components/TitleAndChevronRight";
import { Colors, SIZES } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { capitalizeFirstLetter } from "@helper/capiterlize-first-letter";
import { useAppSelector } from "@redux/store";
import configurationServices from "@services/features/configuration-service/configurationService";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Text,
  StyleSheet,
  Platform,
  FlatList,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";

import { SafeAreaView } from "react-native-safe-area-context";
import { useConfigurationData } from "@hooks/use-configuration-data";
interface ILocationModal {
  onClose: any;
  isShow: boolean;
  getSelectedCountry: any;
  getSelectedCity: any;
}
const LocationModal = ({
  onClose,
  isShow,
  getSelectedCountry,
  getSelectedCity,
}: ILocationModal) => {
  const { token, profile } = useAppSelector((state) => state.userProfileSlice);
  const { data } = useConfigurationData();
  const countries = data.countries;
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry]: any = useState(null);
  const [countryLocations, setCountryLocations] = useState([]);
  const [locationLoader, setLocationLoader] = useState(false);
  const [selectedCountryCity, setSelectedCountryCity]: any = useState(null);
  const newCountryValues = countries?.filter((country: any) =>
    country?.label?.toLowerCase()?.includes(search?.toLowerCase())
  );

  const newCityValues = countryLocations?.filter((country: any) =>
    country?.label?.toLowerCase()?.includes(search?.toLowerCase())
  );

  useEffect(() => {
    if (selectedCountry) {
      setLocationLoader(true);
      setCountryLocations([]);
      configurationServices
        ?.countryLocation(token, selectedCountry?.id)
        .then((res: any) => {
          setLocationLoader(false);
          const distructureCountryLocation = res?.data?.map((list: any) => {
            return {
              value: list?.id,
              label: capitalizeFirstLetter(list?.location),
              ...list,
            };
          });

          setCountryLocations(distructureCountryLocation);
        })
        .catch((error) => {
          setLocationLoader(false);
        });
    }
  }, [selectedCountry]);

  const templateView = ({ item }: any) => {
    return selectedCountry ? (
      <TitleAndChevronRight
        title={item?.label}
        customStyle={styles.location}
        onPress={() => {
          getSelectedCountry(selectedCountry);
          getSelectedCity(item);
          setSelectedCountryCity(item);
          onClose?.();
        }}
      />
    ) : (
      <TitleAndChevronRight
        title={
          <View style={styles.countryView}>
            <CountryFlag isoCode={item?.code?.toUpperCase()} size={15} />
            <Text style={styles.countryLabel}>{item?.name}</Text>
          </View>
        }
        customStyle={styles.location}
        onPress={() => {
          setSelectedCountry(item);
          setSearch("");
        }}
      />
    );
  };

  const countryDatas = selectedCountry ? newCityValues : newCountryValues;

  return (
    <Modal
      visible={isShow}
      animationType="slide"
      onRequestClose={onClose}
    // style={{
    //   backgroundColor: Colors.light.background,
    //   // paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
    // }}
    >
      <View
        style={{
          flex: 1,
          paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : 0,
        }}
      >
        <StackHeader
          title={selectedCountry ? "City" : "Country"}
          isShowHeaderShadow
          onPress={
            selectedCountry
              ? () => {
                setSelectedCountry(null);
                setSearch("");
              }
              : onClose
          }
        />
        <View style={styles.searchView}>
          <SearchInput
            value={search}
            onChangeText={(text: any) => setSearch(text)}
          />
        </View>
        <FlatList
          style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 10 }}
          data={countryDatas}
          keyExtractor={({ item }) => item?.id}
          renderItem={(item) => templateView(item)}
        />
      </View>
    </Modal>
  );
};

export default LocationModal;

const styles = StyleSheet.create({
  location: {
    backgroundColor: "transparent",
  },
  countryView: {
    flexDirection: "row",
    alignItems: "center",
  },
  countryLabel: {
    marginLeft: 10,
    textTransform: "capitalize",
    flex: 1,
  },
  searchView: {
    marginTop: 10,
  },
});
