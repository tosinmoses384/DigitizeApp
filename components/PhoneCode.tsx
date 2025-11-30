import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fontSz, worldCountries } from "../constants";
interface ICountryCodePicker {
  countryCode?: any;
  getCountryCode: any;
  isSelectCountry: boolean;
  getCountryId?: any;
  selectorHeight?: number;
}
const CountryCodePicker = ({
  countryCode,
  getCountryCode,
  isSelectCountry,
  getCountryId,
  selectorHeight,
}: ICountryCodePicker) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry]: any = useState({
    id: "NG",
    label: "Nigeria",
    value: "+234",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (countryCode) {
      let getCountry = worldCountries?.find(
        (list) => list?.id === countryCode?.toUpperCase()
      );

      setSelectedCountry(getCountry);
      getCountryCode(getCountry?.value);
    }
  }, [countryCode]);

  useEffect(() => {
    const loadData = async () => {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    };
    loadData();
  }, []);

  const selectCountry = (country) => {
    setSelectedCountry(country);
    setModalVisible(false);
    getCountryCode(country?.value);
    getCountryId(country?.id);
  };

  const renderItem = useCallback(({ item }) => {
    return (
      <TouchableOpacity
        style={styles.radioWrapper}
        onPress={() => selectCountry(item)}
      >
        <Image
          alt={`Flag of ${item.label}`}
          style={styles.radioImage}
          source={{
            uri: `https://flagsapi.com/${item.id}/flat/64.png`,
          }}
        />
        <View style={styles.radio}>
          <Text style={styles.radioLabel}>{item.label}</Text>
          <Text style={styles.radioLabel}>{item.value}</Text>
        </View>
      </TouchableOpacity>
    );
  }, []);

  const getItemLayout = (data, index) => ({
    length: 60,
    offset: 60 * index,
    index,
  });

  return (
    <View style={[styles.container, { height: selectorHeight }]}>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={isSelectCountry ? () => setModalVisible(true) : () => {}}
      >
        <Image
          alt={`Flag of ${selectedCountry.label}`}
          style={styles.flagImage}
          source={{
            uri: `https://flagsapi.com/${selectedCountry.id}/flat/64.png`,
          }}
        />
        <Text style={styles.text}>{selectedCountry.value}</Text>
        {/* <Ionicons name="chevron-down" size={20} color="#919EAB" /> */}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.fullModalView}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>

          <Text style={styles.modalText}>Choose a Country Code</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#FF3B4A" />
          ) : (
            <FlatList
              data={worldCountries}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              getItemLayout={getItemLayout}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 65,
    maxWidth: 120,
    backgroundColor: "#919EAB14",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#919EAB14",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  flagImage: {
    width: 30,
    height: 20,
    marginRight: 10,
  },
  text: {
    paddingRight: 5,
    fontSize: 14,
    // fontFamily: "DMSansBold",
    color: "rgba(145, 158, 171, 1)",
  },
  fullModalView: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 50,
    paddingHorizontal: 20,
    padding: 16,
    margin: 10,
    marginTop: 30,
  },
  closeButton: {
    position: "absolute",
    top: 30,
    right: 20,
    zIndex: 1,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  radioWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  radioImage: {
    width: 30,
    height: 20,
    marginRight: 10,
  },
  radio: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 28,
  },
  radioLabel: {
    fontSize: fontSz(16),
    color: "#6B778C",
    fontFamily: "DMSansMedium",
  },
});

export default CountryCodePicker;
