import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Text,
  StyleSheet,
  View,
  Platform,
  Image,
  Pressable,
} from "react-native";
import { SIZES } from "../constants/Colors";
import { useAppSelector } from "../redux/store";
import { TouchableOpacity } from "react-native-gesture-handler";
import SeeAllIcon from "../assets/images/svg/seeAllIcon.svg";
import { ScrollView } from "react-native";
import SearchInput from "../components/SearchInput";
interface ISelectItemSizeModal {
  onClose: any;
  isShow: boolean;
  name: string;
  onSelect: any;
  sizes?: any[]; // Optional custom sizes array
  onSearch?: (query: string) => void; // Optional search callback
}
const SelectItemSizeModal = ({
  onClose,
  isShow,
  name,
  onSelect,
  sizes,
  onSearch,
}: ISelectItemSizeModal) => {
  const [search, setSearch] = useState("");
  const { itemSize }: any = useAppSelector((state) => state?.itemSizeSlice);

  // Use custom sizes if provided, otherwise fall back to Redux store
  const availableSizes = sizes && sizes.length > 0 ? sizes : itemSize;

  

  const newSizeOptions = availableSizes?.filter((list: any) =>
    list?.label?.toLocaleLowerCase()?.includes(search?.toLocaleLowerCase())
  );

  

  const displaySizes = newSizeOptions || [];
 

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
              color={"rgba(70, 79, 84, 1)"}
              size={20}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Sizes</Text>
        </View>

        <View style={styles.searchContainer}>
          <SearchInput 
            value={search} 
            onChangeText={(e: string) => {
              setSearch(e);
              onSearch?.(e);
            }} 
          />
        </View>

        <ScrollView style={styles.body}>
          {displaySizes?.length === 0 && (
            <Text style={{ padding: 20, textAlign: 'center', color: 'red' }}>
              DEBUG: No sizes available - displaySizes is empty
            </Text>
          )}
          {displaySizes?.map((item: any) => (
            <Pressable
              style={({ pressed }) => [styles.pressed, styles.bodyWithChildren]}
              key={item.id}
              onPress={() => {
                onSelect({
                  target: { value: item.label, name, id: item.id },
                });
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
    </Modal>
  );
};

export default SelectItemSizeModal;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#ff9fafc",
    flex: 1,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
  },
  backwrapper: {
    width: 40,
    display: "flex",
    justifyContent: "center",
    position: "absolute",
    zIndex: 1,
    left: 20,
    top: "30%",
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,

    backgroundColor: "white",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
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
    flex: 1,
    paddingVertical: 12,
    textAlign: "center",
    color: "rgba(7, 24, 39, 1)",
    fontFamily: "DMSansSemiBold",
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
    marginHorizontal: 16,
  },
});
