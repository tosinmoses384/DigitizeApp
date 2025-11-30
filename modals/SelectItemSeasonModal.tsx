import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SIZES } from '../constants/Colors';
import { useAppSelector } from '../redux/store';
// import configurationServices from "../services/features/configuration-service/configurationService";
// import ChevronRightIcon from "../assets/images/svg/chevron-right-arrow.svg";
import SearchInput from '../components/SearchInput';
import { CountrySeasonItemDataType } from '@redux/slice/countrySeason/types';

interface ISelectItemSizeModal {
  onClose: any;
  isShow: boolean;
  name: string;
  onSelect: any;
  selected?: string;
  mode?: 'all' | 'active';
}

export default function SelectItemSeasonModal({
  onClose,
  isShow,
  name,
  onSelect,
  ...props
}: ISelectItemSizeModal) {
  const countrySeasonStore: any = useAppSelector(
    (state) => state?.countrySeasonSlice,
  );
  const [search, setSearch] = useState('');
  const dataToRender = useMemo(() => {
    if (props.mode === 'all') {
      return countrySeasonStore.seasons ?? [];
    }
    return countrySeasonStore.activeSeasons;
  }, [props.mode]);

  const handleSelectItem = (item: CountrySeasonItemDataType) => {
    onSelect({
      target: { value: item.id, name, id: item.id, label: item.name },
    });
  };

  const renderItem: ListRenderItem<CountrySeasonItemDataType> = ({ item }) => {
    const isSelected = props.selected === item.id;
    return (
      <Pressable
        style={({ pressed }) => [
          pressed && styles.pressed,
          styles.bodyWithChildren,
        ]}
        onPress={() => handleSelectItem(item)}
      >
        <View style={styles.bodyWithChildrenName}>
          <Text style={styles.categoryName}>{item.name}</Text>
        </View>
        <View
          style={[
            styles.categoryRadio,
            isSelected && { backgroundColor: 'rgba(107, 114, 126, 1)' },
          ]}
        />
      </Pressable>
    );
  };

  return (
    <Modal visible={isShow} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.wrapper]}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              pressed && styles.pressed,
              styles.backwrapper,
            ]}
            onPress={onClose}
          >
            <Ionicons
              name="chevron-back"
              color={'rgba(70, 79, 84, 1)'}
              size={20}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Season</Text>
        </View>

        <View style={styles.searchContainer}>
          <SearchInput value={search} onChangeText={setSearch} />
        </View>

        <FlatList
          data={dataToRender}
          keyExtractor={(item) => item?.id}
          renderItem={renderItem}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#ff9fafc',
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? SIZES.height / 22 : SIZES.padding,
  },
  backwrapper: {
    width: 40,
    display: 'flex',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 1,
    left: 20,
    top: '30%',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,

    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  headerTitle: {
    paddingVertical: 12,
    flex: 1,
    textAlign: 'center',
    color: 'rgba(7, 24, 39, 1)',
    fontFamily: 'DMSansSemiBold',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  bodyWithChildren: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: 'rgba(237, 242, 247, 1)',
  },
  bodyWithChildrenName: {
    flex: 1,
    flexDirection: 'row',
  },
  categoryName: {
    fontSize: 12,
    color: 'rgba(30, 34, 38, 1)',
    fontFamily: 'DMSansMedium',
    textTransform: 'capitalize',
  },
  categoryIconContainer: {
    width: 16,
    height: 16,

    marginRight: 8,
  },
  categoryRadio: {
    width: 17,
    height: 17,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 126, 1)',
  },
  colorContainer: {
    width: 16,
    height: 16,

    borderRadius: 100,
    marginRight: 8,
  },
  searchContainer: {
    marginTop: 10,
    marginHorizontal: 16,
  },
});
