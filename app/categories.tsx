// import StackHeader from "@components/StackHeader";
// import React, { useEffect, useRef, useState } from "react";
// import { Colors, SIZES } from "../constants/Colors";
// import {
//   Dimensions,
//   Platform,
//   Pressable,
//   SafeAreaView,
//   ScrollView,
//   Text,
//   View,
//   Image,
// } from "react-native";
// import { router } from "expo-router";
// import { useRoute } from "@react-navigation/native";
// import { useAppSelector } from "@redux/store";
// import SearchInput from "@components/SearchInput";
// import { StyleSheet } from "react-native";
// import CustomButton from "@components/CustomButton";
// import FilterIcon from "../assets/images/svg/Filter.svg";
// import ProductFilterModal from "modals/ProductFilterModal";
// import marketPlaceServices from '@services/features/marketplace/marketplaceServices';
// import RecommendedCard from "@components/RecommendedCard";
// import MyResponsiveGrid from "@components/MyResponsiveGrid";
// import FlatListResponsiveGrid from "@components/FlatListResponsiveGrid";
// import { getEmptyStateCountLoader } from "@helper/get-empty-count-loader/getEmptyCountLoader";
// import EmptyState from "@components/EmptyState";
// import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
// import { useToast } from "react-native-toast-notifications";
// import { useApiService } from "@hooks/use-auth-guard/useApiService";
// const CategoriesPage = () => {
 
//   const route = useRoute();
//   const {
//     pageTitle,
//     categoryValue,
//     sizeValue,
//     brandValue,
//     conditionValue,
//     colourValue,
//     materialValue,
//   } = useAppSelector((state) => state.productFilter);
//   const { countryId } = useAppSelector((state) => state.userCountryId);
//   const { token, profile } = useAppSelector((state) => state.userProfileSlice);
//   const [isShowFilterModal, setIsShowFilterModal] = useState(false);
//   const [products, setProducts]: any = useState([]);
//   const [pageToken, setPageToken] = useState("");
//   const [search, setSearch] = useState("");
//   const [screenLoader, setScreenLoader] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const { width } = Dimensions.get("window");
//   const [cardWidth, setCardWidth] = useState(172);

//   const [numColumns, setNumColumns] = useState(2);
//   const [followBtnLoader, setFollowBtnLoader] = useState(false);
//   const [activeFollowId, setActiveFollowId] = useState("");
//   const [brandFollowStatus, setBrandFollowStatus] = useState<any>(null);
//   const toast = useToast();
//   const { callApi } = useApiService();

//   const getMoreItems = () => {
//     if (pageToken) {
//       setLoadingMore(true);

//       let query: any = {
//         Query: search || "", 

//         ...(conditionValue?.id ? { ConditionIds: [conditionValue?.id] } : ""),
//         ...(brandValue?.id ? { BrandIds: [brandValue?.id] } : ""),
//         ...(categoryValue?.id ? { CategoryId: categoryValue?.id } : ""),
//         ...(colourValue?.id ? { ColourIds: [colourValue?.id] } : ""),
//         ...(sizeValue?.id ? { SizeIds: [sizeValue?.id] } : ""),
//         ...(materialValue?.id ? { MaterialIds: [materialValue?.id] } : ""),
//         // ...(getTrifterId ? { TrifterIds: [getTrifterId] } : ""),

//         price: {
//           Minimum: "",
//           Maximum: "",
//         },
//         // PageQuery: "",
//         PageSize: "12",
//         PageToken: pageToken,
//       };

//       marketPlaceServices
//         ?.marketPlaceItemsQuery(token, profile?.countryId || countryId, query)
//         .then((res: any) => {
//           setLoadingMore(false);
//           // if (res?.data?.pageToken && res?.data?.hasNextPage) {
//           const distructure =
//             res?.data?.dataset?.map((list: any) => {
//               return {
//                 id: list?.id,
//                 title: `${list?.brandName}`,
//                 size: list?.size,
//                 amount: list?.price,
//                 image: list?.defaultImageUrl,
//                 ...list,
//               };
//             }) || [];

//           //   ("hasNext>>", res?.data?.hasNextPage);
//           // distructure?.map((list: any) => {
//           //   setProducts((prev: any) => [...prev, list]);
//           // });
//           setProducts((prev: any) => [...prev, ...distructure]);

//           setPageToken(res?.data?.pageToken);
//         })
//         .catch((error) => {
//           setLoadingMore(false);
//         });
//     }
//   };

//   const getItemFromServer = () => {
//     setProducts([]);
//     setPageToken("");
//     setScreenLoader(true);

//     let query: any = {
//       Query: search || "",

//       ...(conditionValue?.id ? { ConditionIds: [conditionValue?.id] } : ""),
//       ...(brandValue?.id ? { BrandIds: [brandValue?.id] } : ""),
//       ...(categoryValue?.id ? { CategoryId: categoryValue?.id } : ""),
//       ...(colourValue?.id ? { ColourIds: [colourValue?.id] } : ""),
//       ...(sizeValue?.id ? { SizeIds: [sizeValue?.id] } : ""),
//       ...(materialValue?.id ? { MaterialIds: [materialValue?.id] } : ""),

//       //   ...(getTrifterId ? { TrifterIds: [getTrifterId] } : ""),
//       price: {
//         Minimum: "",
//         Maximum: "",
//       },
//       PageQuery: "",
//       PageSize: "12",
//       PageToken: "",
//     };
//     marketPlaceServices
//       ?.marketPlaceItemsQuery(token, profile?.countryId || countryId, query)
//       .then((res: any) => {
//         setScreenLoader(false);

//         const distructure = res?.data?.dataset?.map((list: any) => {
//           return {
//             id: list?.id,
//             title: `${list?.brandName}`,
//             size: list?.size,
//             amount: list?.price,
//             image: list?.defaultImageUrl,

//             ...list,
//           };
//         });

//         setProducts(distructure);
//         setPageToken(res?.data?.pageToken);
//       })
//       .catch((error) => {
//         setScreenLoader(false);
//       });
//   };

//   const checkBrandFollowStatus = async () => {
//     if (!brandValue?.id || !token) return;

//     await callApi(
//       (token) => {
//         return wardrobeServices.brandQueryFollow(
//           token,
//           brandValue.value || "",
//           "1", // Just need one result to check status
//           "",
//           0 // All brands
//         );
//       },
//       {
//         onSuccess: (res: any) => {
//           const brandData = res?.data?.dataset?.find(
//             (brand: any) => brand.id === brandValue.id
//           );
//           if (brandData) {
//             setBrandFollowStatus(brandData);
//           }
//         },
//         onError: (error) => {
//           console.error('Error checking brand follow status:', error);
//         }
//       }
//     );
//   };

//   const handleFollowBrand = async () => {
//     if (!brandValue?.id) return;
    
//     setFollowBtnLoader(true);
//     setActiveFollowId(brandValue.id);
//     let data = {
//       brandId: brandValue.id,
//     };

//     const isCurrentlyFollowing = brandFollowStatus?.isFollowing || false;

//     await callApi(
//       (token) => {
//         return isCurrentlyFollowing
//           ? wardrobeServices.unfollowBrands(data, token)
//           : wardrobeServices.followBrands(data, token);
//       },
//       {
//         onSuccess: (res: any) => {
//           setFollowBtnLoader(false);
//           if (res?.status === 200) {
//             // Update the local brand follow status
//             setBrandFollowStatus({
//               ...brandFollowStatus,
//               isFollowing: !isCurrentlyFollowing
//             });
//             console.log('Brand follow status updated successfully');
//             return;
//           }
//           toast.show(`${res?.message || res?.detail}`, {
//             type: "danger",
//             duration: 4000,
//           });
//         },
//         onError: (error) => {
//           console.error('Error following/unfollowing brand:', error);
//           setFollowBtnLoader(false);
//           toast.show("An error occurred. Please try again.", {
//             type: "danger",
//             duration: 4000,
//           });
//         }
//       }
//     );
//   };

//   const renderBrandHeader = () => {
//     if (!brandValue?.value) return null;

//     return (
//       <View style={styles.brandHeaderContainer}>
//         <View style={styles.brandInfo}>
//           {/* <View style={styles.brandImageContainer}>
//             <Text style={styles.brandInitial}>
//               {brandValue.value.charAt(0).toUpperCase()}
//             </Text>
//           </View> */}
//           <View style={styles.brandTextContainer}>
//             <Text style={styles.brandName}>{brandValue.value}</Text>
//             {/* <Text style={styles.brandSubtext}>Brand</Text> */}
//           </View>
//         </View>
//         <CustomButton
//           loader={activeFollowId === brandValue.id && followBtnLoader}
//           title={
//             activeFollowId === brandValue.id && followBtnLoader
//               ? "Loading"
//               : brandFollowStatus?.isFollowing
//               ? "Following"
//               : "Follow"
//           }
//           buttonStyle={[
//             styles.followButton,
//             brandFollowStatus?.isFollowing && styles.followingButton,
//             { width: brandFollowStatus?.isFollowing ? 80 : 80 },
//           ]}
//           textStyle={[
//             styles.followButtonText,
//             brandFollowStatus?.isFollowing && styles.followingButtonText,
//           ]}
//           onPress={handleFollowBrand}
//         />
//       </View>
//     );
//   };

//   useEffect(() => {
//     getItemFromServer();
//     if (brandValue?.id) {
//       checkBrandFollowStatus();
//     }
//   }, [profile, countryId, token, search, pageTitle, brandValue?.id]);

//   const updateItemState = (id: any) => {
//     const findExistingItems = products?.find((list: any) => list?.id === id);

//     if (findExistingItems) {
//       const getNewUpdate = products?.map((list: any) =>
//         list?.id === id
//           ? {
//               ...list,
//               isUserFavorite: list?.isUserFavorite ? false : true,
//               favouriteCount: list?.isUserFavorite
//                 ? list?.favouriteCount - 1
//                 : list?.favouriteCount + 1,
//             }
//           : list
//       );

//       setProducts(getNewUpdate);
//     }
//   };

//   useEffect(() => {
//     if (width >= 1200) {
//       setNumColumns(4);
//     } else if (width >= 768) {
//       setNumColumns(3);
//     } else {
//       setNumColumns(2);
//     }
//   }, [width]);

//   const template = ({ item }: any) => {
//     return (
//       <View
//         style={[
//           styles.card,
//           {
//             width: Dimensions.get("window").width / numColumns - 0 * 2,
//           },
//         ]}
//       >
//         <RecommendedCard
//           imageSource={item?.image}
//           size={item?.size}
//           title={item.brandName}
//           price={item.price}
//           isServerImage
//           itemId={item?.id}
//           width={"90%"}
//           isUserFavorite={item?.isUserFavorite}
//           handleIsFavourite={(data: any) => updateItemState(data)}
//           count={item?.favouriteCount}
//           currency={item?.currencySymbol?.toUpperCase()}
//         />
//       </View>
//     );
//   };

//   const emptyTemplate = getEmptyStateCountLoader(8)?.map((list, index) => {
//     return (
//       <View
//         key={index}
//         style={[
//           styles.card,
//           {
//             width: Dimensions.get("window").width / numColumns - 0 * 2,
//             paddingHorizontal: 15,
//           },
//         ]}
//       >
//         <RecommendedCard
//           imageSource={""}
//           size={""}
//           title={""}
//           price={""}
//           width={"100%"}
//           isServerImage
//           itemId={""}
//           loader
//         />
//       </View>
//     );
//   });

//   return (
//     <>
//       <SafeAreaView
//         style={{
//           flex: 1,
//           backgroundColor: Colors.light.background,
//           paddingVertical:
//             Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
//         }}
//       >
//         <StackHeader
//           title={pageTitle || "Products"}
//           onPress={() => router.back()}
//         />
//         <View style={styles.searchContainer}>
//           <SearchInput value={search} onChangeText={(e: any) => setSearch(e)} />
//         </View>
//         {renderBrandHeader()}
//         <View style={styles.pageContainer}>
//           <View style={styles.filterContainer}>
//             <View style={styles.filter}>
//               <Text>Results</Text>
//             </View>
//             <View style={styles.actionView}>
//               <CustomButton
//                 title="Filter"
//                 icon={<FilterIcon width={13} height={16} />}
//                 buttonStyle={styles.actionBtnBody}
//                 textStyle={styles.actionTextBtnBody}
//                 onPress={() => setIsShowFilterModal(true)}
//               />
//             </View>
//           </View>

//           {screenLoader ? (
//             <MyResponsiveGrid
//               template={emptyTemplate}
//               getNumberOfRows={(data: any) => setCardWidth(data)}
//             />
//           ) : products?.length ? (
//             <FlatListResponsiveGrid
//               data={products}
//               renderItem={template}
//               onEndReached={getMoreItems}
//               loadingMore={loadingMore}
//             />
//           ) : (
//             <EmptyState
//               title="Oops! No Products Found"
//               subtitle="Try adjusting your filters or clearing your search to explore more options. We're sure you'll find something that suits your needs!"
//             />
//           )}
//         </View>
//         {isShowFilterModal && (
//           <ProductFilterModal
//             onClose={() => setIsShowFilterModal(false)}
//             isShow={isShowFilterModal}
//             handleApply={() => {
//               getItemFromServer();
//               setIsShowFilterModal(false);
//             }}
//           />
//         )}
//       </SafeAreaView>
//     </>
//   );
// };

// export default CategoriesPage;

// const styles = StyleSheet.create({
//   searchContainer: {
//     padding: 16,
//   },
//   subcategoryContainer: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     backgroundColor: "white",
//   },
//   subcategoryScrollContent: {
//     paddingRight: 16,
//   },
//   subcategoryPill: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     marginRight: 8,
//     borderRadius: 20,
//     backgroundColor: "#F1F5F9",
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//   },
//   selectedSubcategoryPill: {
//     backgroundColor: Colors.light.primaryBase,
//     borderColor: Colors.light.primaryBase,
//   },
//   subcategoryText: {
//     fontSize: 12,
//     fontFamily: "DMSansMedium",
//     color: "#64748B",
//   },
//   selectedSubcategoryText: {
//     color: "white",
//     fontFamily: "DMSansSemiBold",
//   },
//   pageContainer: {
//     backgroundColor: "#F8FAFC",
//     flex: 1,
//   },
//   filterContainer: {
//     flexDirection: "row",
//     padding: 16,
//   },
//   filter: {
//     flex: 1,
//   },
//   actionView: {
//     width: 72,
//   },
//   actionBtnBody: {
//     backgroundColor: "rgba(237, 242, 247, 1)",
//     paddingVertical: 8,
//     paddingHorizontal: 8,
//     borderRadius: 16,
//   },
//   actionTextBtnBody: {
//     color: "rgba(30, 52, 72, 1)",
//     fontSize: 10,
//     fontFamily: "DMSansMedium",
//   },
//   card: {
//     marginBottom: 20,
//     borderRadius: 8,
//   },
// });





import StackHeader from "@components/StackHeader";
import React, { useEffect, useRef, useState } from "react";
import { Colors, SIZES } from "../constants/Colors";
import {
  Dimensions,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useRoute } from "@react-navigation/native";
import { useAppSelector } from "@redux/store";
import SearchInput from "@components/SearchInput";
import { StyleSheet } from "react-native";
import CustomButton from "@components/CustomButton";
import FilterIcon from "../assets/images/svg/Filter.svg";
import ProductFilterModal from "modals/ProductFilterModal";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import RecommendedCard from "@components/RecommendedCard";
import MyResponsiveGrid from "@components/MyResponsiveGrid";
import FlatListResponsiveGrid from "@components/FlatListResponsiveGrid";
import { getEmptyStateCountLoader } from "@helper/get-empty-count-loader/getEmptyCountLoader";
import EmptyState from "@components/EmptyState";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { useToast } from "react-native-toast-notifications";
import { useApiService } from "@hooks/use-auth-guard/useApiService";
const CategoriesPage = () => {
  const route = useRoute();
  const { source } = route.params as { source?: string } || {};
  const {
    pageTitle,
    categoryValue,
    sizeValue,
    brandValue,
    conditionValue,
    colourValue,
    materialValue,
  } = useAppSelector((state) => state.productFilter);
  const { countryId } = useAppSelector((state) => state.userCountryId);
  const { token, profile } = useAppSelector((state) => state.userProfileSlice);
  const [isShowFilterModal, setIsShowFilterModal] = useState(false);
  const [products, setProducts]: any = useState([]);
  const [pageToken, setPageToken] = useState("");
  const [search, setSearch] = useState("");
  const [screenLoader, setScreenLoader] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { width } = Dimensions.get("window");
  const [cardWidth, setCardWidth] = useState(172);

  const [numColumns, setNumColumns] = useState(2);
  const [followBtnLoader, setFollowBtnLoader] = useState(false);
  const [activeFollowId, setActiveFollowId] = useState("");
  const [brandFollowStatus, setBrandFollowStatus] = useState<any>(null);
  const toast = useToast();
  const { callApi } = useApiService();

  const getMoreItems = () => {
    if (pageToken) {
      setLoadingMore(true);

      let query: any = {
        Query: search || "", 

        ...(conditionValue?.id ? { ConditionIds: [conditionValue?.id] } : ""),
        ...(brandValue?.id ? { BrandIds: [brandValue?.id] } : ""),
        ...(categoryValue?.id ? { CategoryId: categoryValue?.id } : ""),
        ...(colourValue?.id ? { ColourIds: [colourValue?.id] } : ""),
        ...(sizeValue?.id ? { SizeIds: [sizeValue?.id] } : ""),
        ...(materialValue?.id ? { MaterialIds: [materialValue?.id] } : ""),
        // ...(getTrifterId ? { TrifterIds: [getTrifterId] } : ""),

        price: {
          Minimum: "",
          Maximum: "",
        },
        // PageQuery: "",
        PageSize: "12",
        PageToken: pageToken,
      };

      marketplaceServices
        ?.marketPlaceItemsQuery(token, profile?.countryId || countryId, query)
        .then((res: any) => {
          setLoadingMore(false);
          // if (res?.data?.pageToken && res?.data?.hasNextPage) {
          const distructure =
            res?.data?.dataset?.map((list: any) => {
              return {
                id: list?.id,
                title: `${list?.brandName}`,
                size: list?.size,
                amount: list?.price,
                image: list?.defaultImageUrl,
                ...list,
              };
            }) || [];

          //   ("hasNext>>", res?.data?.hasNextPage);
          // distructure?.map((list: any) => {
          //   setProducts((prev: any) => [...prev, list]);
          // });
          setProducts((prev: any) => [...prev, ...distructure]);

          setPageToken(res?.data?.pageToken);
        })
        .catch((error) => {
          setLoadingMore(false);
        });
    }
  };

  const getItemFromServer = () => {
    setProducts([]);
    setPageToken("");
    setScreenLoader(true);

    let query: any = {
      Query: search || "",

      ...(conditionValue?.id ? { ConditionIds: [conditionValue?.id] } : ""),
      ...(brandValue?.id ? { BrandIds: [brandValue?.id] } : ""),
      ...(categoryValue?.id ? { CategoryId: categoryValue?.id } : ""),
      ...(colourValue?.id ? { ColourIds: [colourValue?.id] } : ""),
      ...(sizeValue?.id ? { SizeIds: [sizeValue?.id] } : ""),
      ...(materialValue?.id ? { MaterialIds: [materialValue?.id] } : ""),

      //   ...(getTrifterId ? { TrifterIds: [getTrifterId] } : ""),
      price: {
        Minimum: "",
        Maximum: "",
      },
      PageQuery: "",
      PageSize: "12",
      PageToken: "",
    };
    
    // Debug: Log the query to see what's being sent
    console.log("CategoriesPage Query:", JSON.stringify(query, null, 2));
    console.log("CategoryValue:", categoryValue);
    console.log("Source:", source);
    marketplaceServices
      ?.marketPlaceItemsQuery(token, profile?.countryId || countryId, query)
      .then((res: any) => {
        setScreenLoader(false);

        const distructure = res?.data?.dataset?.map((list: any) => {
          return {
            id: list?.id,
            title: `${list?.brandName}`,
            size: list?.size,
            amount: list?.price,
            image: list?.defaultImageUrl,

            ...list,
          };
        });

        setProducts(distructure);
        setPageToken(res?.data?.pageToken);
      })
      .catch((error) => {
        setScreenLoader(false);
      });
  };

  const checkBrandFollowStatus = async () => {
    if (!brandValue?.id || !token) return;

    await callApi(
      (token) => {
        return wardrobeServices.brandQueryFollow(
          token,
          brandValue.value || "",
          "1", // Just need one result to check status
          "",
          0 // All brands
        );
      },
      {
        onSuccess: (res: any) => {
          const brandData = res?.data?.dataset?.find(
            (brand: any) => brand.id === brandValue.id
          );
          if (brandData) {
            setBrandFollowStatus(brandData);
          }
        },
        onError: (error) => {
          console.error('Error checking brand follow status:', error);
        }
      }
    );
  };

  const handleFollowBrand = async () => {
    if (!brandValue?.id) return;
    
    setFollowBtnLoader(true);
    setActiveFollowId(brandValue.id);
    let data = {
      brandId: brandValue.id,
    };

    const isCurrentlyFollowing = brandFollowStatus?.isFollowing || false;

    await callApi(
      (token) => {
        return isCurrentlyFollowing
          ? wardrobeServices.unfollowBrands(data, token)
          : wardrobeServices.followBrands(data, token);
      },
      {
        onSuccess: (res: any) => {
          setFollowBtnLoader(false);
          if (res?.status === 200) {
            // Update the local brand follow status
            setBrandFollowStatus({
              ...brandFollowStatus,
              isFollowing: !isCurrentlyFollowing
            });
            console.log('Brand follow status updated successfully');
            return;
          }
          toast.show(`${res?.message || res?.detail}`, {
            type: "danger",
            duration: 4000,
          });
        },
        onError: (error) => {
          console.error('Error following/unfollowing brand:', error);
          setFollowBtnLoader(false);
          toast.show("An error occurred. Please try again.", {
            type: "danger",
            duration: 4000,
          });
        }
      }
    );
  };

  const renderBrandHeader = () => {
    // Show header for both brand and category navigation
    const headerValue = source === "category" ? categoryValue : brandValue;
    if (!headerValue?.value) return null;

    // Hide follow button when navigated from category
    const showFollowButton = source !== "category";

    return (
      <View style={styles.brandHeaderContainer}>
        <View style={styles.brandInfo}>
          {/* <View style={styles.brandImageContainer}>
            <Text style={styles.brandInitial}>
              {headerValue.value.charAt(0).toUpperCase()}
            </Text>
          </View> */}
          <View style={styles.brandTextContainer}>
            <Text style={styles.brandName}>{headerValue.value}</Text>
            {/* <Text style={styles.brandSubtext}>{source === "category" ? "Category" : "Brand"}</Text> */}
          </View>
        </View>
        {showFollowButton && (
          <CustomButton
            loader={activeFollowId === brandValue.id && followBtnLoader}
            title={
              activeFollowId === brandValue.id && followBtnLoader
                ? "Loading"
                : brandFollowStatus?.isFollowing
                ? "Following"
                : "Follow"
            }
            buttonStyle={[
              styles.followButton,
              brandFollowStatus?.isFollowing && styles.followingButton,
              { width: brandFollowStatus?.isFollowing ? 80 : 80 },
            ]}
            textStyle={[
              styles.followButtonText,
              brandFollowStatus?.isFollowing && styles.followingButtonText,
            ]}
            onPress={handleFollowBrand}
          />
        )}
      </View>
    );
  };

  useEffect(() => {
    getItemFromServer();
    if (brandValue?.id && source === "brand") {
      checkBrandFollowStatus();
    }
  }, [profile, countryId, token, search, pageTitle, brandValue?.id, categoryValue?.id]);

  const updateItemState = (id: any) => {
    const findExistingItems = products?.find((list: any) => list?.id === id);

    if (findExistingItems) {
      const getNewUpdate = products?.map((list: any) =>
        list?.id === id
          ? {
              ...list,
              isUserFavorite: list?.isUserFavorite ? false : true,
              favouriteCount: list?.isUserFavorite
                ? list?.favouriteCount - 1
                : list?.favouriteCount + 1,
            }
          : list
      );

      setProducts(getNewUpdate);
    }
  };

  useEffect(() => {
    if (width >= 1200) {
      setNumColumns(4);
    } else if (width >= 768) {
      setNumColumns(3);
    } else {
      setNumColumns(2);
    }
  }, [width]);

  const template = ({ item }: any) => {
    return (
      <View
        style={[
          styles.card,
          {
            width: Dimensions.get("window").width / numColumns - 0 * 2,
          },
        ]}
      >
        <RecommendedCard
          imageSource={item?.image}
          size={item?.size}
          title={item.brandName}
          price={item.price}
          isServerImage
          itemId={item?.id}
          width={"90%"}
          isUserFavorite={item?.isUserFavorite}
          handleIsFavourite={(data: any) => updateItemState(data)}
          count={item?.favouriteCount}
          currency={item?.currencySymbol?.toUpperCase()}
        />
      </View>
    );
  };

  const emptyTemplate = getEmptyStateCountLoader(8)?.map((list, index) => {
    return (
      <View
        key={index}
        style={[
          styles.card,
          {
            width: Dimensions.get("window").width / numColumns - 0 * 2,
            paddingHorizontal: 15,
          },
        ]}
      >
        <RecommendedCard
          imageSource={""}
          size={""}
          title={""}
          price={""}
          width={"100%"}
          isServerImage
          itemId={""}
          loader
        />
      </View>
    );
  });

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
        <StackHeader
          title={pageTitle || "Products"}
          onPress={() => router.back()}
        />
        <View style={styles.searchContainer}>
          <SearchInput value={search} onChangeText={(e: any) => setSearch(e)} />
        </View>
        {renderBrandHeader()}
        <View style={styles.pageContainer}>
          <View style={styles.filterContainer}>
            <View style={styles.filter}>
              <Text>Results</Text>
            </View>
            <View style={styles.actionView}>
              <CustomButton
                title="Filter"
                icon={<FilterIcon width={13} height={16} />}
                buttonStyle={styles.actionBtnBody}
                textStyle={styles.actionTextBtnBody}
                onPress={() => setIsShowFilterModal(true)}
              />
            </View>
          </View>

          {screenLoader ? (
            <MyResponsiveGrid
              template={emptyTemplate}
              getNumberOfRows={(data: any) => setCardWidth(data)}
            />
          ) : products?.length ? (
            <FlatListResponsiveGrid
              data={products}
              renderItem={template}
              onEndReached={getMoreItems}
              loadingMore={loadingMore}
            />
          ) : (
            <EmptyState
              title="Oops! No Products Found"
              subtitle="Try adjusting your filters or clearing your search to explore more options. We're sure you'll find something that suits your needs!"
            />
          )}
        </View>
        {isShowFilterModal && (
          <ProductFilterModal
            onClose={() => setIsShowFilterModal(false)}
            isShow={isShowFilterModal}
            handleApply={() => {
              getItemFromServer();
              setIsShowFilterModal(false);
            }}
          />
        )}
      </SafeAreaView>
    </>
  );
};

export default CategoriesPage;

const styles = StyleSheet.create({
  searchContainer: {
    padding: 16,
  },
  pageContainer: {
    backgroundColor: "#F8FAFC",
    flex: 1,
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
  },
  filter: {
    flex: 1,
  },
  actionView: {
    width: 72,
  },
  actionBtnBody: {
    backgroundColor: "rgba(237, 242, 247, 1)",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  actionTextBtnBody: {
    color: "rgba(30, 52, 72, 1)",
    fontSize: 10,
    fontFamily: "DMSansMedium",
  },
  card: {
    marginBottom: 20,
    borderRadius: 8,
  },
  brandHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  brandInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  brandImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  brandInitial: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
    fontFamily: "DMSansSemiBold",
  },
  brandTextContainer: {
    flex: 1,
  },
  brandName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1E293B",
    fontFamily: "DMSansSemiBold",
    textTransform: "capitalize",
  },
  brandSubtext: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "DMSansMedium",
    marginTop: 2,
  },
  buyButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    justifyContent: "center",
    borderWidth: 1,
    alignItems: "center",
    borderColor: Colors.light.primaryBase,
  },



  followButton: {
    paddingVertical: 4,
    paddingHorizontal: 1,
    borderRadius: 12,
    justifyContent: "center",
    borderWidth: 1,
    alignItems: "center",
    borderColor: Colors.light.primaryBase,
  },
  followingButton: {
    backgroundColor: Colors.light.primaryBase,
  },
  buyButtonText: {
    marginLeft: 5,
    color: Colors.light.primaryBase,
    fontFamily: "DMSansBold",
    fontSize: 14,
  },

  followButtonText: {
    marginLeft: 3,
    color: Colors.light.primaryBase,
    fontFamily: "DMSansMedium",
    fontSize: 12,
  },
  followingButtonText: {
    color: "#fff",
  },
});
