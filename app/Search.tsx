import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Colors, SIZES } from "../constants/Colors";
import StackHeader from "@components/StackHeader";
import { router } from "expo-router";
import SearchInput from "@components/SearchInput";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import { useAppDispatch, useAppSelector } from "@redux/store";
import SearchIcon from "../assets/images/svg/search.svg";
import { getEmptyStateCountLoader } from "@helper/get-empty-count-loader/getEmptyCountLoader";
import LineLoader from "@components/LineLoader";
import TrifterCard from "@components/TrifterCard";
import { useToast } from "react-native-toast-notifications";

import {
  setBrandValue,
  setPageTitle,
  setSellerId,
} from "@redux/slice/filters/filterSlice";
import AddCircleSvgComponent from "@assets/images/svg_components/add_circle";
import { useI18n } from "@hooks/use-i18n";

const search = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(1);
  const [itemSearchOptions, setItemSearchOptions]: any = useState([]);
  const { token, profile } = useAppSelector((state) => state?.userProfileSlice);
  const { countryId } = useAppSelector((state) => state.userCountryId);
  const { brands }: any = useAppSelector((state) => state.brandsSlice);
  const [searchLoader, setSearchLoader] = useState(true);
  const [pageToken, setPageToken] = useState("");
  const [items, setItems]: any = useState([]);
  const [trifters, setTrifters]: any = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchedBrand, setSearchedBrand] = useState('');
  const toast = useToast();

  const tabs = [
    {
      id: 1,
      title: t('search.items'),
    },
    {
      id: 2,
      title: t('search.brands'),
    },
    {
      id: 3,
      title: t('search.drbers'),
    },
  ];

  const getItems = () => {
    setSearchLoader(true);
    let query: any = {
      Query: search || "",
      PageSize: "12",
      // PageToken: "",
    };
    marketplaceServices
      ?.marketPlaceItemsQuery(token, profile?.countryId || countryId, query)
      .then((res: any) => {
        setSearchLoader(false);

        setItemSearchOptions([
          {
            title: t('common.seeAll'),
            id: "1",
          },
          ...res?.data?.dataset,
        ]);
        // if (res?.responseCode === 401) {
        //   return push("/");
        // }
      })
      .catch((error) => {
        setSearchLoader(false);
      });
  };

  const getInitBrands = () => {
    setSearchLoader(true);
    marketplaceServices
      .brandsSearch(token, search, "12", "")
      .then((res: any) => {
        setSearchLoader(false);
        setPageToken(res?.data?.pageToken);
        setHasNextPage(res?.data?.hasNextPage);
        setItems(res?.data?.dataset);

        // if (res?.responseCode === 401) {
        //   return push("/");
        // }
      })
      .catch((error) => {
        setSearchLoader(false);
      });
  };


  // const addBrand = async () => {
  //   setSearchLoader(true);

  //   try {
  //     const response = await marketPlaceServices.addBrands(token, searchedBrand);

  //     if (response?.responseCode != 0) {
  //       // console.log("failed====:", response);
  //      toast.show(`${response["detail"] || "Failed to add brand"}`, {
  //       type: "danger",
  //       duration: 4000,
  //     });
  //       throw new Error(response?.message || "Failed to add brand");

  //     }
  //   else{ 
  //     //console.log("Success:==", response);
  //     toast.show("Brand added successfully!", 
  //       {
  //       type: "success",
  //       duration: 4000,
  //     }); 

  //   }

  //     setSearchLoader(false);
  //     setSearchedBrand('');
  //    // getInitBrands(); // Refresh the brand list
  //   } catch (error: any) {
  //     setSearchLoader(false);

  //     if (error.response) {
  //       console.error("Backend Error:", error.response.data);
  //     } else {
  //       console.error("Unknown Error:", error.message);
  //     }
  //   }
  // };






  const getInitialTrifters = () => {
    setSearchLoader(true);
    marketplaceServices
      .membersQuery(token, countryId || profile?.countryId, search, "12", "")
      .then((res: any) => {
        setSearchLoader(false);
        // if (res?.data?.pageToken && res?.data?.hasNextPage) {

        setTrifters(res?.data?.dataset);
        // }
        if (res?.data?.hasNextPage) {
          setHasNextPage(res?.data?.hasNextPage);
          setPageToken(res?.data?.pageToken);
        }
        // if (res?.responseCode === 401) {
        //   return push("/");
        // }
      })
      .catch((error) => {
        setSearchLoader(false);
      });
  };

  useEffect(() => {
    setItemSearchOptions([]);
    setItems([]);
    setPageToken("");
    setTrifters([]);
    setHasNextPage(false);
    if (activeTab === 1) {
      getItems();
      return;
    }
    if (activeTab === 2) {
      getInitBrands();
      return;
    }
    if (countryId || profile?.countryId) {
      getInitialTrifters();
    }
  }, [activeTab, countryId, search, token]);

  const [hasNextPage, setHasNextPage] = useState(false);

  const getTrifters = () => {
    if (pageToken && hasNextPage) {
      setLoadingMore(true);
      marketplaceServices
        .membersQuery(
          token,
          countryId || profile?.countryId,
          search,
          "12",
          pageToken || ""
        )
        .then((res: any) => {
          setLoadingMore(false);
          setPageToken(res?.data?.pageToken);
          setHasNextPage(res?.data?.hasNextPage);
          // if (res?.data?.dataset?.length) {

          const datasets = res?.data?.dataset || [];

          setTrifters((prev: any) => [...trifters, ...datasets]);
          // }
        })
        .catch((error) => {
          setLoadingMore(false);
        });
    }
  };

  const getBrands = () => {
    if (pageToken && hasNextPage) {
      setLoadingMore(true);
      marketplaceServices
        .brandsSearch(token, search, "12", pageToken || "")
        .then((res: any) => {
          setLoadingMore(false);
          setPageToken(res?.data?.pageToken);
          setHasNextPage(res?.data?.hasNextPage);
          const datasets = res?.data?.dataset || [];
          setItems((prev: any) => [...items, ...datasets]);
        })
        .catch((error) => {
          setLoadingMore(false);
        });
    }
  };

  const footerLoader = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator animating size="small" />
      </View>
    );
  };

  const itemTemplate = ({ item }: any) => {
    return (
      <Pressable
        style={({ pressed }) => [
          pressed && { opacity: 0.5 },
          styles.itemTemplateRender,
        ]}
        onPress={() => {
          if (item?.id === "1") {
            dispatch(setPageTitle(""));
            dispatch(setBrandValue(""));
            return router.push("/filterPage");
          }
          router.push(`/ItemDetails/${item?.id}`);
          // dispatch(setItemDetails(item?.id));
        }}
      >
        <View style={styles.itemInnerTemplateRender}>
          <Text style={styles.itemInnerTemplateRenderText}>{item?.title}</Text>
          <View style={styles.itemInnerTemplateRenderIcon}>
            <SearchIcon width={12} height={12} />
          </View>
        </View>
      </Pressable>
    );
  };

  const brandsTemplate = ({ item }: any) => {
    return (
      <Pressable
        style={({ pressed }) => [
          pressed && { opacity: 0.5 },
          styles.itemTemplateRender,
        ]}
        onPress={() => {
          router.push("/filterPage");
          let title = brands?.find((list: any) => list?.id === item?.id);
          dispatch(setPageTitle(title?.label));
          dispatch(setBrandValue({ value: item.name, id: item.id }));
        }}
      >
        <View style={styles.itemInnerTemplateRender}>
          <Text style={styles.itemInnerTemplateRenderText}>{item?.name}</Text>
          <View style={styles.itemInnerTemplateRenderIcon}>
            <SearchIcon width={12} height={12} />
          </View>
        </View>
      </Pressable>
    );
  };

  const triftersTemplate = ({ item }: any) => {
    return (
      <Pressable
        style={({ pressed }) => [
          pressed && { opacity: 0.5 },
          styles.itemTemplateRender,
        ]}
        onPress={() => {
          router.push("/SellerProfile");
          dispatch(setSellerId(item?.id));
        }}
      >
        <TrifterCard
          name={item?.name}
          imageUrl={item?.imageUrl}
          location={item?.location}
          rating={item?.ratings}
        />
      </Pressable>
    );
  };

  const renderScreen = () => {
    if (activeTab === 1) {
      return searchLoader ? (
        <View style={{ paddingHorizontal: 20 }}>
          {getEmptyStateCountLoader(8)?.map((list, index) => {
            return (
              <View
                style={{
                  marginBottom: 8,
                  height: 50,
                }}
                key={index}
              >
                <LineLoader />
              </View>
            );
          })}
        </View>
      ) : (
        <View>
          <View style={styles.renderSearchTitle}>
            <Text style={styles.renderSearchTitleText}>Search results</Text>
          </View>
          <FlatList
            data={itemSearchOptions}
            renderItem={itemTemplate}
            keyExtractor={(item: any, index: number) => item?.id}
          />
        </View>
      );
    }
    if (activeTab === 2) {
      return searchLoader ? (
        <View style={{ paddingHorizontal: 20 }}>
          {getEmptyStateCountLoader(8)?.map((list, index) => {
            return (
              <View
                style={{
                  marginBottom: 8,
                  height: 50,
                }}
                key={index}
              >
                <LineLoader />
              </View>
            );
          })}
        </View>
      ) : (
        <View>




          {/* 
        {searchedBrand !== '' && (
  <Pressable
    onPress={() => {
     addBrand();
      console.log(`Add "${searchedBrand}" to brands`);
    }}
    style={styles.view} // use the view style to align icon/text
  >
    <AddCircleSvgComponent />
    <Text style={styles.addBrandTo}>
      {`Add “${searchedBrand}” to brands`}
    </Text>
  </Pressable>
)} */}






          <View style={styles.renderSearchTitle}>

            <Text style={styles.renderSearchTitleText}>Search results</Text>
          </View>
          <FlatList
            data={items}
            renderItem={brandsTemplate}
            keyExtractor={(item: any) =>
              item?.id?.toString() || item.toString()
            }
            onEndReached={() => {
              if (pageToken && hasNextPage && !loadingMore) {
                getBrands();
              }
            }}
            ListFooterComponent={footerLoader}
            onEndReachedThreshold={0.5}
          />
        </View>
      );
    }

    return searchLoader ? (
      <View style={{ paddingHorizontal: 20 }}>
        {getEmptyStateCountLoader(8)?.map((list, index) => {
          return (
            <View key={index}>
              <TrifterCard
                isLoading
                name={""}
                imageUrl={""}
                location={""}
                rating={0}
              />
            </View>
          );
        })}
      </View>
    ) : (
      <View>
        <View style={styles.renderSearchTitle}>
          <Text style={styles.renderSearchTitleText}>Drbers</Text>
        </View>
        <FlatList
          data={trifters}
          renderItem={triftersTemplate}
          keyExtractor={(item: any) => item?.id?.toString() || item.toString()}
          onEndReached={() => {
            if (pageToken && hasNextPage && !loadingMore) {
              getTrifters();
            }
          }}
          ListFooterComponent={footerLoader}
          onEndReachedThreshold={0.5}
        />
      </View>
    );
  };

  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingVertical:
            Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
        }}
      >
        <StackHeader title="Search" onPress={() => router.back()} />
        <View style={styles.container}>
          <View style={styles.searchContainer}>
            <SearchInput
              value={search}
              onChangeText={(text: string) => {
                console.log("Search text:", text);
                setSearchedBrand(text);
                setSearch(text);
              }
              }
            />
          </View>
          <View style={styles.tabContainerStyle}>
            <View style={styles.tabInnerContainerStyle}>
              {tabs?.map((list) => (
                <Pressable
                  key={list?.id}
                  style={
                    activeTab === list?.id
                      ? styles.pressibleActiveContainer
                      : styles.pressibleContainer
                  }
                  onPress={() => setActiveTab(list?.id)}
                >
                  <Text
                    style={
                      activeTab === list?.id
                        ? styles.actionActiveText
                        : styles.actionText
                    }
                  >
                    {list?.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.renderContainer}>
            <View style={styles.pageRender}>{renderScreen()}</View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

// PERFORMANCE: Wrap with React.memo to prevent unnecessary re-renders
export default React.memo(search);


// import * as React from "react";
// import {StyleSheet, View, Text} from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import Eiplus from "../assets/eiplus.svg";

// const AddBrandCard = () => {

//   	return (
//     		// <SafeAreaView style={styles.viewBg}>
//       			<View style={[styles.view, styles.viewBg]}>
//         				{/* <Eiplus style={styles.eiplusIcon} width={24} height={24} /> */}
//         				<View style={styles.search} />
//         				<Text style={styles.addZaragozaTo}>Add “Zaragoza” to brands</Text>
//       			</View>
//     		// </SafeAreaView>
//         );
// };


//xport default Frame2608535;






const styles = StyleSheet.create({

  parent: {
    flex: 1,
    backgroundColor: "#f6f7f7"
  },
  viewBg: {
    backgroundColor: "#f6f7f7",
    flex: 1
  },
  eiplusIcon: {
    width: 24,
    height: 24
  },
  search: {
    flexDirection: "row",
    marginLeft: 24,
    marginRight: 24,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
    backgroundColor: "#FF3B4A", // optional, match your design
  },
  addBrandTo: {
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "500",
    fontFamily: "DMSans-Medium",
    color: "#464f5d",
    textAlign: "left"
  },
  view: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4
  },





  //
  //
  //
  //
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
  },
  tabContainerStyle: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: "rgba(237, 242, 247, 0.5)",
    height: 70,
  },
  tabInnerContainerStyle: {
    width: "100%",
    backgroundColor: "rgba(237, 242, 247, 0.6)",
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
    gap: 10,
    padding: 5,
  },
  pressibleContainer: {
    flex: 1,
    padding: 6,
    borderRadius: 12,
  },
  actionText: {
    textAlign: "center",
    color: "rgba(33, 44, 61, 1)",
    fontSize: 12,
    fontFamily: "DMSansMedium",
  },
  pressibleActiveContainer: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    flex: 1,
    padding: 6,
    borderRadius: 12,
  },
  actionActiveText: {
    fontSize: 12,
    fontFamily: "DMSansSemiBold",
    color: "rgba(33, 44, 61, 1)",
    textAlign: "center",
  },
  renderContainer: {
    flex: 1,
    paddingBottom: 50,
  },
  renderSearchTitle: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  renderSearchTitleText: {
    color: "rgba(0, 0, 0, 1)",
    fontSize: 12,
    fontFamily: "DMSansMedium",
  },
  pageRender: {
    flex: 1,
  },
  itemTemplateRender: {
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  itemInnerTemplateRender: {
    paddingVertical: 8,
    flexDirection: "row",
  },
  itemInnerTemplateRenderText: {
    flex: 1,
    textTransform: "capitalize",
  },
  itemInnerTemplateRenderIcon: {
    width: 16,
    height: 16,
  },
  loadingFooter: {
    paddingVertical: 20,
    // borderTopWidth: 1,
    // borderTopColor: "#CED0CE",
  },
});
