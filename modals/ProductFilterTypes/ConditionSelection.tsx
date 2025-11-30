import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Text,
  StyleSheet,
  View,
  Platform,
  Image,
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
const ConditionSelection = ({ onClose, onSelect }: ISelectItemSizeModal) => {
  const { t } = useI18n();
  const { itemConditions }: any = useAppSelector(
    (state) => state?.itemConditionsSlice
  );
  const [conditionOptions, setConditionOptions]: any = useState([]);

  useEffect(() => {
    if (itemConditions) {
      setConditionOptions([
        {
          label: t('common.all'),
          value: "",
          id: "",
          name: t('common.all'),
        },
        ...itemConditions,
      ]);
    }
  }, [itemConditions, t]);

  return (
    <View style={[styles.wrapper]}>
      <ScrollView style={styles.body}>
        {conditionOptions?.map((item: any) => (
          <Pressable
            style={({ pressed }) => [
              pressed && styles.pressed,
              styles.bodyWithChildren,
            ]}
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

export default ConditionSelection;

const styles = StyleSheet.create({
  wrapper: {
    // backgroundColor: "#ff9fafc",
    // flex: 1,
    // paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
  },
  //   backwrapper: {
  //     width: 40,
  //     display: "flex",
  //     justifyContent: "center",
  //   },
  //   header: {
  //     flexDirection: "row",
  //     paddingHorizontal: 16,

  //     backgroundColor: "white",
  //     ...Platform.select({
  //       ios: {
  //         shadowColor: "#000",
  //         shadowOffset: { width: 0, height: 4 },
  //         shadowOpacity: 0.1,
  //         shadowRadius: 3,
  //       },
  //       android: {
  //         elevation: 5,
  //       },
  //     }),
  //   },
  //   headerTitle: {
  //     paddingVertical: 12,
  //     flex: 1,
  //     textAlign: "center",
  //     color: "rgba(7, 24, 39, 1)",
  //     fontFamily: "DMSansSemiBold",
  //     fontSize: 14,
  //   },
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
});
