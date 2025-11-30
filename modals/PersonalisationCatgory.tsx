import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Text,
  StyleSheet,
  View,
  Platform,
  Image,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SIZES } from "../constants/Colors";
import { useAppSelector } from "../redux/store";
import FilterIcon from "../assets/images/svg/Filter.svg";
import { TouchableOpacity } from "react-native-gesture-handler";
import SeeAllIcon from "../assets/images/svg/seeAllIcon.svg";
import { ScrollView } from "react-native";
import SearchInput from "../components/SearchInput";
import configurationServices from "../services/features/configuration-service/configurationService";
import CategoryList from "../components/CategoryList";
import wardrobeServices from "../services/features/wardrobe-service/wardrobeServices";
import { router } from "expo-router";
import SelectItemCategoryModal from "./SelectItemCategoryModal";
import CustomButton from "../components/CustomButton";
import PersonalisationCategoryFilterModal from "./PersonalisationCategoryFilterModal";
import { SafeAreaView } from "react-native-safe-area-context";
interface IPersonalisationCategoryModal {
  onClose: any;
  isShow: boolean;
  name: string;
  onSelect: any;
  activeCategory: any;
  refetch: any;
}
const PersonalisationCategoryModal = ({
  onClose,
  isShow,
  name,
  onSelect,
  activeCategory,
  refetch,
}: IPersonalisationCategoryModal) => {
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  // TODO: Replace `any` with precise ItemSize type once backend contract is stabilised
  const [details, setDetails] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageToken, setPageToken] = useState("");
  const [activeSizeId, setActiveSizeId] = useState("");
  const [loader, setLoader] = useState(false);
  const [isShowSelectOptionModal, setIsShowSelectOptionModal] = useState(false);
  const [filterOption, setFilterOption] = useState(null);
  const [selectedCategoryAns, setSelectedCategoryAns] = useState(null);

  const isCatrgoryChecked = (size: string) => {
    if (activeCategory) {
      const getIfSizesExist = activeCategory?.dropdownData?.find(
        (value) => value?.size === size
      );
      if (getIfSizesExist) {
        return true;
      } else {
        return false;
      }
    }
  };

  const getCategorySizeById = (id: string) => {
    // setLoading(true);
    configurationServices
      .itemCategoriesSizeById(
        token,
        id,
        search || "",
        "100",
        pageToken || "",
        selectedCategoryAns?.id || ""
      )
      .then((res: any) => {
        setLoading(false);
        if (res?.data?.hasNextPage) {
          res?.data?.dataset?.map((list) => {
            let getNewData = {
              ...list,
              isChecked: isCatrgoryChecked(list?.size),
            };
            setDetails([...details, getNewData]);
          });
        }

        if (res?.data?.hasNextPage) {
          setPageToken(res?.data?.pageToken);
        }

        if (res?.responseCode === "401" || res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  const getInitialItems = (id: string) => {
    setPageToken("");
    setDetails([]);
    setLoading(true);
    configurationServices
      .itemCategoriesSizeById(
        token,
        id,
        search || "",
        "100",
        pageToken || "",
        selectedCategoryAns?.id || ""
      )
      .then((res: any) => {
        setLoading(false);

        let getData = res?.data?.dataset?.map((list) => {
          let getNewData = {
            ...list,
            isChecked: isCatrgoryChecked(list?.size),
          };

          return getNewData;
        });
        setDetails(getData);
        if (res?.data?.hasNextPage) {
          setPageToken(res?.data?.pageToken);
        }
        if (res?.responseCode === "401" || res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (token && activeCategory?.id) {
      getInitialItems(activeCategory?.id);
    }
  }, [token, activeCategory?.id, search]);

  const handleUpdateChange = (data: any) => {
    const updatedDetails = details.map((item) => {
      if (item.id === data?.id) {
        return { ...item, isChecked: !item.isChecked };
      }
      return item;
    });
    setDetails(updatedDetails);
  };

  const handleChange = (data) => {
    // Determine if currently checked
    const alreadyChecked = data?.isChecked;

    // For UI feedback
    setActiveSizeId(data?.id);
    setLoader(true);

    if (alreadyChecked) {
      // find preferenceId to remove
      const pref = activeCategory?.dropdownData?.find((p) => p?.sizeId === data?.id || p?.size === data?.size);
      const preferenceId = pref?.preferenceId || pref?.id;
      if (!preferenceId) {
        // Fallback: stop loader
        setActiveSizeId("");
        setLoader(false);
        return;
      }
      wardrobeServices
        .removeItemCategoriesSizeById(preferenceId, token)
        .then((res) => {
          setActiveSizeId("");
          setLoader(false);
          if (String(res?.status).startsWith("2")) {
            refetch?.();
            handleUpdateChange(data);
          } else if (res?.responseCode === "401" || res?.responseCode === 401) {
            router.push("/Onboarding");
          }
        })
        .catch(() => {
          setActiveSizeId("");
          setLoader(false);
        });
      return;
    }

    // else: add preference
    let dataSent = {
      categoryId: data?.categoryId,
      sizeId: data?.id,
    };

    wardrobeServices
      ?.updateItemCategoriesSizeById(dataSent, token)
      .then((res) => {
        setActiveSizeId("");
        setLoader(false);
        if (res?.status === 200) {
          refetch?.();
          handleUpdateChange(data);
          return;
        }
        if (res?.responseCode === "401" || res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
      })
      .catch((error) => {
        setActiveSizeId("");
        setLoader(false);
      });
  };

  // item?.description

  const renderTemplate = (item) => {
    return (
      <CategoryList
        title={item?.size}
        subtitle={"Sizes"}
        isChecked={item?.isChecked}
        onPress={() => handleChange(item)}
        loader={item?.id === activeSizeId && loader ? true : false}
        subtitleTextStyle={{ fontSize: 10 }}
      />
    );
  };

  const handleSelectFilterOption = (data: any) => {
    setFilterOption(data?.id);
  };

  return (
    <Modal visible={isShow} animationType="slide" onRequestClose={onClose}>
      {/* <SafeAreaView style={{ flex: 1 }}> */}
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
          <Text style={styles.headerTitle}>{activeCategory?.drawerTitle}</Text>
        </View>

        <View style={styles.searchView}>
          <SearchInput
            value={search}
            onChangeText={(value) => setSearch(value)}
            placeholder="Search Sizes"
          />
        </View>

        <View style={styles.filterView}>
          <Text style={styles.titleTag}>
            {activeCategory?.drawerTitle} Sizes
          </Text>
          <CustomButton
            title="Filter"
            buttonStyle={styles.filterBtn}
            textStyle={styles.filterBtnText}
            icon={<FilterIcon />}
            onPress={() => setIsShowSelectOptionModal(true)}
          />
        </View>

        {loading && (
          <View style={{ marginTop: 20 }}>
            <ActivityIndicator size="large" color="silver" />
          </View>
        )}

        <FlatList
          data={details}
          renderItem={({ item }) => renderTemplate(item)}
          keyExtractor={(item) => item?.id}
          onEndReached={() => getCategorySizeById(activeCategory?.id)}
          onEndReachedThreshold={0.1}
        />

        {/* <ScrollView style={styles.body}>

          <CategoryList />
        </ScrollView> */}
      </View>
      {/* </SafeAreaView> */}

      {isShowSelectOptionModal && (
        <PersonalisationCategoryFilterModal
          handleSelect={handleSelectFilterOption}
          handleClose={() => setIsShowSelectOptionModal(false)}
          selectedCategoryAns={selectedCategoryAns?.value}
          handleClear={() => {
            setSelectedCategoryAns(null);
            setIsShowSelectOptionModal(false);
          }}
          handleApply={() => {
            getInitialItems(activeCategory?.id);
            setIsShowSelectOptionModal(false);
          }}
        />
      )}

      {filterOption === 1 && (
        <SelectItemCategoryModal
          onClose={() => setFilterOption(null)}
          onSelect={(data) => {
            setSelectedCategoryAns(data?.target);
            setFilterOption(null);
            // setIsShowSelectOptionModal(false);
          }}
          isShow
          name="personalisation"
        />
      )}
      {/* {isShowSelectCategoryModal && (
        <SelectItemCategoryModal
          onClose={() => setIsShowSelectCategoryModal(false)}
          onSelect={() => {}}
          isShow
          name="personalisation"
        />
      )} */}
    </Modal>
  );
};

export default PersonalisationCategoryModal;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#ff9fafc",
    flex: 1,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
    paddingBottom: 30,
  },
  backwrapper: {
    width: 40,
    display: "flex",
    justifyContent: "center",
    position: "absolute",
    top: 10,
    left: 15,
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    position: "relative",
    backgroundColor: "white",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
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
    textTransform: "capitalize",
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
  searchView: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  filterView: {
    flexDirection: "row",
    backgroundColor: "#F9FaFc",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  titleTag: {
    fontSize: 14,
    color: "rgba(70, 79, 93, 1)",
    textTransform: "capitalize",
  },
  filterBtn: {
    backgroundColor: "rgba(237, 242, 247, 1)",
    borderRadius: 16,
  },
  filterBtnText: {
    color: "rgba(30, 52, 72, 1)",
    textAlign: "center",
    fontSize: 10,
  },
});
