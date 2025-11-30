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
  ScrollView,
} from "react-native";
import { SIZES } from "../constants/Colors";
import { useAppSelector } from "../redux/store";
import configurationServices from "../services/features/configuration-service/configurationService";
import ChevronRightIcon from "../assets/images/svg/chevron-right-arrow.svg";
import { TouchableOpacity } from "react-native-gesture-handler";
import SeeAllIcon from "../assets/images/svg/seeAllIcon.svg";
import { useI18n } from "../hooks/use-i18n";
interface ISelectItemCategoryModal {
  onClose: any;
  isShow: boolean;
  name: string;
  onSelect: any;
}
const SelectItemCategoryModal = ({
  onClose,
  isShow,
  name,
  onSelect,
}: ISelectItemCategoryModal) => {
  // const dispatch = useAppDispatch();
  const { token }: any = useAppSelector((state) => state?.userProfileSlice);
  const { categories }: any = useAppSelector((state) => state?.categoriesSlice);
  const { t } = useI18n();

  const [currentParent, setCurrentParent]: any = useState(null);
  const [history, setHistory]: any = useState([]);

  const [loader, setLoader] = useState(false);

  const handleClick = (item: any) => {
    if (item.children.length > 0) {
      // Save current parent to history stack
      setHistory((prev: any) => [...prev, currentParent]);
      // Set clicked item as the current parent

      setCurrentParent(item);
    }
  };

  const handleClickMore = (moreItem: any) => {
    setLoader(true);
    configurationServices
      ?.itemCategoriesById(token, moreItem?.id)
      .then((res: any) => {
        setLoader(false);
        // Save current parent to history stack
        setHistory((prev: any) => [...prev, currentParent]);
        // Set clicked item as the current parent
        setCurrentParent(res?.data);
      })
      .catch((error) => {});
  };

  const handleBack = () => {
    const previousParent = history.pop(); // Get the last parent from the history
    setCurrentParent(previousParent || null); // Set the last parent or null if empty
    setHistory([...history]); // Update the history stack
  };

  // Initial data to render: either the root (if no parent) or current parent’s children
  const currentData = currentParent ? currentParent?.children : categories;

  return (
    <Modal visible={isShow} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.wrapper]}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              pressed && styles.pressed,
              styles.backwrapper,
            ]}
            onPress={currentParent?.name ? handleBack : onClose}
          >
            <Ionicons
              name="chevron-back"
              color={"rgba(70, 79, 84, 1)"}
              size={20}
            />
          </Pressable>
          <Text style={styles.headerTitle}>{t('common.category')}</Text>
        </View>

        <ScrollView style={styles.body}>
          {currentData?.map((item: any) =>
            item?.children?.length || item?.hasChildren ? (
              <View key={item.id}>
                <Pressable
                  onPress={() =>
                    item?.hasChildren && item?.level === 3
                      ? handleClickMore(item)
                      : handleClick(item)
                  }
                  style={({ pressed }) => [
                    pressed && styles.pressed,
                    styles.bodyWithChildren,
                  ]}
                >
                  <View style={styles.bodyWithChildrenName}>
                    <View style={styles.categoryIconContainer}>
                      {item?.imageUrl ? (
                        <Image
                          src={item?.imageUrl}
                          style={{ width: 16, height: 16 }}
                        />
                      ) : (
                        <SeeAllIcon width={16} height={16} />
                      )}
                    </View>
                    <Text style={styles.categoryName}>{item.name}</Text>
                  </View>
                  {(item?.children?.length || item?.hasChildren) && (
                    <View>
                      <ChevronRightIcon width="16" height="16" />
                    </View>
                  )}
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  pressed && styles.pressed,
                  styles.bodyWithChildren,
                ]}
                key={item.id}
                onPress={() => {
                  onSelect({
                    target: { value: item.name, name, id: item.id },
                  });
                }}
              >
                <View style={styles.bodyWithChildrenName}>
                  <View style={styles.categoryIconContainer}>
                    {item?.imageUrl ? (
                      <Image src={item?.imageUrl} />
                    ) : (
                      <SeeAllIcon width={16} height={16} />
                    )}
                  </View>
                  <Text style={styles.categoryName}>{item.name}</Text>
                </View>
                <View style={styles.categoryRadio} />
              </Pressable>
            )
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default SelectItemCategoryModal;

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
        // overflow: "hidden", // Prevents shadow from appearing on other sides
        // backgroundColor: "transparent",
      },
    }),
  },
  headerTitle: {
    paddingVertical: 12,
    flex: 1,
    textAlign: "center",
    color: "rgba(7, 24, 39, 1)",
    fontFamily: "DMSansSemiBold",
    fontSize: 14,
  },
  body: {
    padding: 16,
  },
  pressed: {
    opacity: 0.7,
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
