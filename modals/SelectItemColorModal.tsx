import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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
import SearchInput from '../components/SearchInput';
import FilledButton from '@components/buttons/Filled_button';

export type ColorItemDataType = {
  code: string;
  colour: string;
  id: string;
  label: string;
  value: string;
};

interface ISelectItemSizeModal {
  onClose: any;
  isShow: boolean;
  name: string;
  onSelect: any;
  selected?: string | Array<string>;
  multipleSelect?: boolean;
  maxSelection?: number;
}
const SelectItemColorModal = ({
  onClose,
  isShow,
  name,
  onSelect,
  ...props
}: ISelectItemSizeModal) => {
  const { colors }: any = useAppSelector((state) => state?.colorSlice);
  const [search, setSearch] = useState('');
  const [filteredColors, setFilteredColors] = useState<
    Array<ColorItemDataType>
  >(colors || []);
  const [multipleSelections, setMultipleSelections] = useState<
    Array<ColorItemDataType>
  >([]);

  const handleSelectItem = (item: ColorItemDataType) => {
    if (props.multipleSelect) {
      setMultipleSelections((prevState) => {
        if (prevState.some((color) => color.id === item.id)) {
          return prevState.filter((color) => color.id !== item.id);
        }
        return [...prevState, item];
      });

      return;
    }

    onSelect({
      target: { value: item.label, name, id: item.id },
    });
  };

  const handleSubmitSelection = () => {
    onSelect(
      multipleSelections.map((item) => ({
        target: { value: item.label, name, id: item.id },
      })),
    );
  };

  const handleSearch = (searchText: string) => {
    setSearch(searchText);
    const filtered = colors?.filter((item: ColorItemDataType) =>
      item.label.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()),
    );
    setFilteredColors(filtered);
  };

  const renderItem: ListRenderItem<ColorItemDataType> = ({ item }) => {
    const isSelected = props.multipleSelect
        ? multipleSelections?.some((selection) => selection.id === item.id)
        : props.selected === item.id,
      isDisabled =
        props.multipleSelect &&
        multipleSelections.length === props.maxSelection;
    return (
      <Pressable
        style={({ pressed }) => [
          pressed && styles.pressed,
          styles.bodyWithChildren,
          isDisabled && !isSelected && { opacity: 0.3 },
        ]}
        onPress={() => handleSelectItem(item)}
        disabled={!isSelected && isDisabled}
      >
        <View
          style={[styles?.colorContainer, { backgroundColor: item?.code }]}
        />

        <View style={styles.bodyWithChildrenName}>
          <Text style={styles.categoryName}>{item.label}</Text>
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

  useEffect(() => {
    setFilteredColors(colors || []);
  }, [colors]);

  useEffect(() => {
    if (Array.isArray(props.selected)) {
      setMultipleSelections(
        filteredColors.filter((item: ColorItemDataType) =>
          props.selected?.includes?.(item?.id),
        ),
      );
    }
  }, []);

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
          <Text style={styles.headerTitle}>Colour</Text>
        </View>

        <View style={styles.searchContainer}>
          <SearchInput value={search} onChangeText={handleSearch} />
        </View>

        <FlatList
          data={filteredColors}
          keyExtractor={(item) => item?.id}
          renderItem={renderItem}
        />
      </View>
      {props.multipleSelect ? (
        <View style={{ padding: 20 }}>
          <FilledButton title={'Submit'} onPress={handleSubmitSelection} />
        </View>
      ) : null}
    </Modal>
  );
};

export default SelectItemColorModal;

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
