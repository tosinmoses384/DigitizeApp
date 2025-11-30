import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ModalContainer from '../components/ModalContainer';
import CountryFlag from 'react-native-country-flag';
import { useSetItemToStorage } from '../hooks/set-item';
import SearchInput from '@components/SearchInput';
import { useAppDispatch, useAppSelector } from '@redux/store';
import { setUserCountryId } from '@redux/slice/user-country-id/userCountryIdSlice';
import { ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import CloseIcon from '../assets/images/svg/x-close.svg';
import { useConfigurationData } from '@hooks/use-configuration-data';
interface ISelectCountryModal {
  onClose: any;
  onSelect?: (country: any) => void;
}
const SelectCountryModal = ({ onClose, onSelect }: ISelectCountryModal) => {
  const [search, setSearch] = useState('');
  const { setItem } = useSetItemToStorage();
  const dispatch = useAppDispatch();
  const { queries } = useConfigurationData();
  const countries = queries.countries.data;
  const isCountryLoading = queries.countries.isLoading;

  const newCountryValues = countries?.filter((country: any) =>
    country?.label?.toLowerCase()?.includes(search?.toLowerCase()),
  );

  const renderTemplate = (item: any) => {
    return (
      <Pressable
        style={({ pressed }) => [pressed && styles.pressed, styles.countryList]}
        key={item?.id}
        onPress={() => {
          // Always save to AsyncStorage and Redux for app-wide usage

          dispatch(setUserCountryId(item?.id));

          setItem('countryId', item?.id);

          if (onSelect) {
            // Custom handler for form-specific logic

            onSelect(item);
          } else {
            // Default behavior - navigate to home

            router.push('/home');
          }
        }}>
        <View style={styles.countryFlagAndList}>
          <CountryFlag isoCode={item?.code} size={15} />
          <Text style={styles.countryInnerList}>{item?.label}</Text>
        </View>
      </Pressable>
    );
  };
  return (
    <ModalContainer>
      {isCountryLoading ? (
        <ActivityIndicator size="large" color="silver" />
      ) : (
        <View style={styles.wrapper}>
          <Pressable
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 1,
            }}
            onPress={onClose}>
            <CloseIcon width={25} height={25} />
          </Pressable>
          <Text style={styles.title}>Where do you live?</Text>
          <View style={styles.searchView}>
            <SearchInput
              value={search}
              onChangeText={(text: any) => setSearch(text)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <ScrollView>
              {newCountryValues?.map((list: any, index: any) =>
                renderTemplate(list),
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </ModalContainer>
  );
};

export default SelectCountryModal;

const styles = StyleSheet.create({
  wrapper: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    boxShadow: '0px 2.79px 20.91px 0px rgba(0, 0, 0, 0.15)',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  pressed: {
    opacity: 0.5,
  },
  title: {
    fontSize: 16,
    fontFamily: 'DMSansSemiBold',
    marginBottom: 20,
  },
  searchView: {
    marginBottom: 10,
  },
  countryList: {
    marginBottom: 4,
    paddingVertical: 5,
  },
  countryInnerList: {
    fontSize: 14,
    color: 'rgba(7, 24, 39, 1)',
    textTransform: 'capitalize',
    marginLeft: 10,
  },
  countryFlagAndList: {
    flexDirection: 'row',
  },
});
