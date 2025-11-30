import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Text,
  StyleSheet,
  View,
  Platform,
  Pressable,
} from "react-native";
import { SIZES } from "../../constants/Colors";
import { useAppSelector } from "../../redux/store";
import { ScrollView } from "react-native";
import SearchInput from "../../components/SearchInput";
import { useI18n } from "../../hooks/use-i18n";
interface ISelectItemSizeModal {
  onClose: any;
  onSelect: any;
}
const SizeSelection = ({ onClose, onSelect }: ISelectItemSizeModal) => {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const { itemSize }: any = useAppSelector((state) => state?.itemSizeSlice);
  const [itemSizeOptions, setItemSizeOptions]: any = useState([]);

  useEffect(() => {
    if (itemSize) {
      setItemSizeOptions([{ label: t('common.all'), id: "" }, ...itemSize]);
    }
  }, [itemSize, t]);

  const newSizeOptions = itemSizeOptions?.filter((list: any) =>
    list?.label?.toLocaleLowerCase()?.includes(search?.toLocaleLowerCase())
  );

  return (
    <View style={[styles.wrapper]}>
      <View style={styles.searchContainer}>
        <SearchInput value={search} onChangeText={(e: any) => setSearch(e)} />
      </View>

      <ScrollView style={styles.body}>
        {newSizeOptions?.map((item: any) => (
          <Pressable
            style={({ pressed }) => [styles.pressed, styles.bodyWithChildren]}
            key={item.id}
            onPress={() => {
              onSelect({ value: item.label, id: item.id });
              onClose?.();
            }}
          >
            <View style={styles.bodyWithChildrenName}>
              <Text style={styles.categoryName}>{item.label}</Text>
            </View>
            <View style={styles.categoryRadio} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default SizeSelection;

const styles = StyleSheet.create({
  wrapper: {
    // height: 700,
    height: "100%",
  },

  pressed: {
    opacity: 0.7,
  },
  body: {
    // paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  bodyWithChildren: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: "rgba(237, 242, 247, 1)",
  },
  bodyWithChildrenName: {
    flex: 1,
    flexDirection: "row",
  },
  categoryName: {
    fontSize: 12,
    color: "rgba(30, 34, 38, 1)",
    fontFamily: "DMSansMedium",
    textTransform: "capitalize",
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
    borderColor: "rgba(107, 114, 126, 1)",
  },
  searchContainer: {
    marginTop: 10,
    // marginHorizontal: 16,
  },
});
