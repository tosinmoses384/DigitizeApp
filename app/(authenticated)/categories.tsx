import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import StackHeader from "../../components/StackHeader";
import { router } from "expo-router";
import { defaultStyles } from "../../constants/Styles";
import { fontSz } from "../../constants";
import { Colors, SIZES } from "../../constants/Colors";
import SeeAllIcon from "../../assets/images/svg/seeAllIcon.svg";
import SearchBarWithAutocomplete1 from "../../components/SearchWithAutocomplete";
import ChevronRightArrow from "../../assets/images/svg/chevron-right-arrow.svg";
import { Platform } from "react-native";
import CheckboxInput from "../../components/CheckboxInput";
import wardrobeServices from "../../services/features/wardrobe-service/wardrobeServices";
import { useAppSelector } from "../../redux/store";
import PersonalisationCategoryModal from "../../modals/PersonalisationCatgory";
import { useI18n } from "@hooks/use-i18n";

const Categories = () => {
  const { t } = useI18n();
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  const [items, setItems]: any = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  const getCategory = () => {
    setLoading(true);
    wardrobeServices
      .categoryQuery(token)
      .then((res: any) => {
        setLoading(false);
        if (res?.status === 200) {
          const distructureData = res?.data?.map((list: any) => {
            return {
              id: list?.categoryId,
              title: list?.categoryName,
              icon: list?.categoryImageUrl,
              dropdownData: list?.preferences,
              sizes: "",
              drawerTitle: list?.categoryName,
            };
          });
          setItems(distructureData);
          return;
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
    if (token) {
      getCategory();
    }
  }, [token]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
        paddingBottom: 20,
      }}
    >
      <View
        style={{
          width: "100%",
        }}
      >
        <StackHeader
          title={t('home.categories')}
          onPress={() => router.back()}
          isShowHeaderShadow
        />
      </View>
      {/* <SearchBarWithAutocomplete1 /> */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={defaultStyles.header}>{t('categories.seeOnlyGoodFits')}</Text>
        <Text style={[defaultStyles.descriptionText, { marginBottom: 8 }]}>
          {t('categories.selectCategoriesAndSizes')}
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="silver" />
        ) : (
          items.map((store: any, index: number) => (
          
            <Pressable
              key={index}
              style={({ pressed }) => [
                pressed && styles.pressed,
                {
                  borderBottomColor: "rgba(237, 242, 247, 1)",
                  borderBottomWidth: 1,
                  paddingBottom: 8,
                },
              ]}
              onPress={() => setShowCategoryModal(store)}
            >
              {/* First Row: Love Icon + Store Name */}
              <View style={[styles.sectionContainer]}>
                <View style={styles.textContainer}>
                  {store?.icon ? (
                    <Image
                      source={{ uri: store?.icon }}
                      width={16}
                      height={16}
                      style={{ marginRight: 8 }}
                    />
                  ) : (
                    <SeeAllIcon
                      width={16}
                      height={16}
                      fill={"#464F5D"}
                      style={styles.loveIcon}
                    />
                  )}

                  <Text style={styles.storeName}>{store.title}</Text>
                  <View>
                    <CheckboxInput
                      checked={selectedCategories.has(store.id)}
                      onPress={() => toggleCategory(store.id)}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.sectionContainer2}>
                <Text style={styles.storeItems}>{t('categories.sizes')}</Text>

                <View style={styles.sizesAndRightIconContainer}>
                  <Text style={styles.storeSizes}>{store.sizes}</Text>

                  <TouchableOpacity 
                    style={styles.arrowContainer}
                    onPress={() => setShowCategoryModal(store)}
                  >
                    <ChevronRightArrow />
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
      {showCategoryModal && (
        <PersonalisationCategoryModal
          isShow
          name={t('categories.category')}
          activeCategory={showCategoryModal}
          onSelect={(data: any) => {
            data;
            setShowCategoryModal(null);
          }}
          onClose={() => setShowCategoryModal(null)}
          refetch={getCategory}
        />
      )}
    </View>
  );
};

export default Categories;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 23,
    flex: 1,
  },
  pressed: {
    opacity: 0.4,
  },
  sectionContainer: {
    marginVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionContainer2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loveIcon: {
    marginRight: 8,
  },
  storeName: {
    fontFamily: "DMSansMedium",
    fontSize: fontSz(16),
    marginRight: 10,
    flex: 1,
    color: "#464F5D",
    textTransform: "capitalize",
  },
  storeItems: {
    fontFamily: "DMSansRegular",
    fontSize: fontSz(14),
    color: "#888",
  },
  storeSizes: {
    fontFamily: "DMSansRegular",
    fontSize: fontSz(14),
    color: "#888",
    marginRight: 10,
  },
  sizesAndRightIconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrowContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  checkboxContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -100,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#464F5D",
    borderRadius: 4,
    backgroundColor: "white",
  },

  checkboxChecked: {},
  checkmark: {
    color: Colors.light.primaryBase,
    fontSize: 18,
    textAlign: "center",
    fontWeight: 900,
    fontFamily: "DMSanExtraBold",
  },
});
