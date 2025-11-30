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

import { useAppSelector } from "../../redux/store";

import { ScrollView } from "react-native";
import SearchInput from "../../components/SearchInput";
import { useI18n } from "../../hooks/use-i18n";
interface ISelectItemConditionModal {
  onClose: any;
  onSelect: any;
}
const MaterialSelection = ({
  onClose,
  onSelect,
}: ISelectItemConditionModal) => {
  const { t } = useI18n();
  const { itemMaterials }: any = useAppSelector(
    (state) => state?.itemMaterialsSlice
  );

  const [materialsOption, setMaterialsOption]: any = useState([]);

  useEffect(() => {
    if (itemMaterials) {
      setMaterialsOption([
        {
          name: t('common.all'),
          label: t('common.all'),
          id: "",
          value: "",
        },
        ...itemMaterials,
      ]);
    }
  }, [itemMaterials, t]);

  return (
    <View style={[styles.wrapper]}>
      <ScrollView style={styles.body}>
        {materialsOption?.map((item: any, index: number) => (
          <Pressable
            style={({ pressed }) => [
              pressed && styles.pressed,
              styles.bodyWithChildren,
            ]}
            key={index}
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

export default MaterialSelection;

const styles = StyleSheet.create({
  wrapper: {
    // height: 500,
    height: "100%",
  },
  backwrapper: {
    width: 40,
    display: "flex",
    justifyContent: "center",
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
});
