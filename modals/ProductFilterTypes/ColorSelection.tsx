import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  View,
  Platform,
  Image,
  FlatList,
  Pressable,
} from "react-native";
import { SIZES } from "../../constants/Colors";
import { useAppSelector } from "../../redux/store";
import SearchInput from "../../components/SearchInput";
import { useI18n } from "../../hooks/use-i18n";
interface ISelectItemSizeModal {
  onClose: any;
  onSelect: any;
}
const ColorSelection = ({ onClose, onSelect }: ISelectItemSizeModal) => {
  const { t } = useI18n();
  const { colors }: any = useAppSelector((state) => state?.colorSlice);
  const [search, setSearch] = useState("");
  const [colorOptions, setColorOptions]: any = useState([]);
  const newColorOptions = colorOptions?.filter((list: any) =>
    list?.label?.toLocaleLowerCase()?.includes(search?.toLocaleLowerCase())
  );

  useEffect(() => {
    if (colors) {
      setColorOptions([
        {
          code: "#007BFF",
          colour: t('common.all'),
          id: "",
          label: t('common.all'),
          value: "",
        },
        ...colors,
      ]);
    }
  }, [colors, t]);

  const handleRenderTemplate = (item: any) => {
    return (
      <Pressable
        style={({ pressed }) => [
          pressed && styles.pressed,
          styles.bodyWithChildren,
        ]}
        onPress={() => {
          onSelect({ value: item.label, id: item.id });
          onClose?.();
        }}
      >
        <View
          style={[styles?.colorContainer, { backgroundColor: item?.code }]}
        />

        <View style={styles.bodyWithChildrenName}>
          <Text style={styles.categoryName}>{item.label}</Text>
        </View>
        <View style={styles.categoryRadio} />
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrapper]}>
      <View style={styles.searchContainer}>
        <SearchInput value={search} onChangeText={(e: any) => setSearch(e)} />
      </View>

      <FlatList
        data={newColorOptions}
        keyExtractor={(item) => item?.id}
        renderItem={({ item }) => handleRenderTemplate(item)}
      />
    </View>
  );
};

export default ColorSelection;

const styles = StyleSheet.create({
  wrapper: {
    // height: 700,
    height: "100%",
  },

  pressed: {
    opacity: 0.7,
  },
  body: {
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
  colorContainer: {
    width: 16,
    height: 16,

    borderRadius: 100,
    marginRight: 8,
  },
  searchContainer: {
    marginTop: 10,
  },
});
