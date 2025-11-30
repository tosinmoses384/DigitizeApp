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
import { SIZES } from "../../constants/Colors";
import { useAppSelector } from "../../redux/store";
import configurationServices from "../../services/features/configuration-service/configurationService";
import ChevronRightIcon from "../../assets/images/svg/chevron-right-arrow.svg";
import { TouchableOpacity } from "react-native-gesture-handler";
import SeeAllIcon from "../../assets/images/svg/seeAllIcon.svg";
import { useI18n } from "../../hooks/use-i18n";
interface ISelectItemCategoryModal {
  onClose: any;
  onSelect: any;
}
const SelectItemCategoryType = ({
  onClose,
  onSelect,
}: ISelectItemCategoryModal) => {
  const { t } = useI18n();
  // const dispatch = useAppDispatch();
  const { token }: any = useAppSelector((state) => state?.userProfileSlice);
  const { categories }: any = useAppSelector((state) => state?.categoriesSlice);

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
    // <View>

    <ScrollView contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}>
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
          <Text style={styles.backwrapperText}>{t('common.back')}</Text>
        </Pressable>
      </View>
      <Pressable
        style={({ pressed }) => [
          pressed && styles.pressed,
          styles.bodyWithChildren,
        ]}
        onPress={() => {
          onSelect({
            value: currentParent?.name || "",
            id: currentParent?.id || "",
          });
          onClose?.();
        }}
      >
        <View style={styles.bodyWithChildrenName}>
          <View style={styles.categoryIconContainer}>
            <SeeAllIcon width={16} height={16} />
          </View>
          <Text style={styles.categoryName}>
            {currentParent?.name || t('common.seeAll')}
          </Text>
        </View>
        <View style={styles.categoryRadio} />
      </Pressable>
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
              onSelect({ value: item.name, id: item.id });
              onClose?.();
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
    // </View>
  );
};

export default SelectItemCategoryType;

const styles = StyleSheet.create({
  backwrapper: {
    // width: 40,
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    marginVertical: 8,
    alignItems: "center",
  },
  backwrapperText: {
    fontSize: 12,
    fontFamily: "DMSansMedium",
  },
  header: {
    flexDirection: "row",
    // paddingHorizontal: 16,

    backgroundColor: "white",
    // ...Platform.select({
    //   ios: {
    //     shadowColor: "#000",
    //     shadowOffset: { width: 0, height: 4 },
    //     shadowOpacity: 0.1,
    //     shadowRadius: 3,
    //   },
    //   android: {
    //     elevation: 5,
    //   },
    // }),
  },
  headerTitle: {
    paddingVertical: 12,
    flex: 1,
    textAlign: "center",
    color: "rgba(7, 24, 39, 1)",
    fontFamily: "DMSansSemiBold",
    fontSize: 14,
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
