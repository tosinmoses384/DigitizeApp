import CustomButton from "@components/CustomButton";
import DrbersFollowCard from "@components/drbersFollowCard";
import SearchInput from "@components/SearchInput";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { getEmptyStateCountLoader } from "@helper/get-empty-count-loader/getEmptyCountLoader";
import { useAppDispatch, useAppSelector } from "@redux/store";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { router } from "expo-router";
import { setSellerId } from "@redux/slice/filters/filterSlice";
import React, { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { useApiService } from "@hooks/use-auth-guard/useApiService";

const Drbers = () => {
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  const dispatch = useAppDispatch();
  const { callApi, callApiWithLoading } = useApiService();

  const [loading, setLoading] = useState(false);
  const [pageToken, setPageToken] = useState("");
  const [loader, setLoader] = useState(false);
  const [details, setDetails]: any = useState([]);
  const [allDetails, setAllDetails]: any = useState([]); // Store all drbers for search
  const [isActivateDoneBtn, setIsActivateDoneBtn]: any = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [followBtnLoader, setFollowBtnLoader] = useState(false);
  const [activeFollowId, setActiveFollowId] = useState("");

  const getTrifters = async () => {
    if (pageToken) {
      await callApi(
        (token) => wardrobeServices.triftersQuery(token, "", "12", pageToken || "", 0),
        {
          onSuccess: (res: any) => {
            setLoading(false);
            let newData = res?.data?.dataset || [];
            const updatedAllDetails = [...allDetails, ...newData];
            setDetails([...details, ...newData]);
            setAllDetails(updatedAllDetails);
            setPageToken(res?.data?.pageToken);
          },
          onError: (error) => {
            console.error('Error fetching drbers:', error);
            setLoading(false);
          }
        }
      );
    }
  };

  const getInitialItems = async () => {
    setPageToken("");
    setDetails([]);
    setAllDetails([]);
    setLoading(true);

    await callApi(
      (token) => wardrobeServices.triftersQuery(token, "", "12", pageToken || "", 0),
      {
        onSuccess: (res: any) => {
          setLoading(false);
          const initialData = res?.data?.dataset || [];
          setDetails(initialData);
          setAllDetails(initialData);
          if (res?.data?.hasNextPage) {
            setPageToken(res?.data?.pageToken);
          }
        },
        onError: (error) => {
          console.error('Error fetching initial drbers:', error);
          setLoading(false);
        }
      }
    );
  };

  useEffect(() => {
    if (token) {
      getInitialItems();
    }
  }, [token]);

  const updateItemState = (data: any) => {
    const findExistingItems = details?.find(
      (list: any) => list?.id === data?.id
    );

    if (findExistingItems) {
      const getNewUpdate = details?.map((list: any) =>
        list?.id === data?.id
          ? {
              ...list,
              isFollowing: list?.isFollowing ? false : true,
            }
          : list
      );

      setDetails(getNewUpdate);
    }
  };

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === "") {
      // If search is empty, show all drbers
      setDetails(allDetails);
    } else {
      // Filter drbers based on search query
      const filteredDetails = allDetails.filter((drber: any) =>
        drber?.name?.toLowerCase().includes(query.toLowerCase())
      );
      setDetails(filteredDetails);
    }
  };

  const handleFollowAndUnfollow = async (selectedData: any) => {
    setFollowBtnLoader(true);
    setActiveFollowId(selectedData?.id);
    setIsActivateDoneBtn(true);

    let data = {
      brandId: selectedData?.id,
    };

    await callApi(
      (token) => {
        return selectedData?.isFollowing
          ? wardrobeServices.unfollowTrifters(data, token)
          : wardrobeServices.followTrifters(data, token);
      },
      {
        onSuccess: (res: any) => {
          setFollowBtnLoader(false);
          if (res?.status === 200) {
            return updateItemState(selectedData);
          }
        },
        onError: (error) => {
          console.error('Error following/unfollowing drber:', error);
          setFollowBtnLoader(false);
        }
      }
    );
  };

  const handleProfilePress = (userId: string) => {
    dispatch(setSellerId(userId));
    router.push("/SellerProfile");
  };

  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={"Drbers"}
          onPress={() => router.back()}
          isShowHeaderShadow
        />
        <View
          style={{
            position: "absolute",
            right: 16,
            top: "14%",
          }}
        >
          <CustomButton
            title="Done"
            buttonStyle={
              isActivateDoneBtn ? styles.doneBtn : styles.doneInactiveBtn
            }
            textStyle={
              isActivateDoneBtn
                ? styles.doneBtnText
                : styles.doneInactiveBtnText
            }
            onPress={isActivateDoneBtn ? () => router.push("/home") : () => {}}
          />
        </View>
      </View>
      
      {/* Search Field */}
      <View style={styles.searchContainer}>
        <SearchInput
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search Drbers"
        />
      </View>

      <ScrollView
        style={styles.scrollViewContainer}
        onScroll={getTrifters}
        scrollEventThrottle={16}
        // showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {loading
            ? getEmptyStateCountLoader(18)?.map((list: any, index) => (
                <View style={styles.item} key={index}>
                  <DrbersFollowCard
                    name={`${list?.name}`}
                    rating={list?.ratings}
                    imageUrl={list?.imageUrl}
                    isFollowing={list?.isFollowing}
                    loading={list?.id === activeFollowId && followBtnLoader}
                    preLoader
                    onPress={() => {}}
                  />
                </View>
              ))
            : details?.map((list: any) => (
                <View style={styles.item} key={list?.id}>
                  <DrbersFollowCard
                    name={`${list?.name}`}
                    rating={list?.ratings}
                    imageUrl={list?.imageUrl}
                    isFollowing={list?.isFollowing}
                    loading={list?.id === activeFollowId && followBtnLoader}
                    onPress={() => handleFollowAndUnfollow(list)}
                    onProfilePress={() => handleProfilePress(list?.id)}
                  />
                </View>
              ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Drbers;
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
    paddingBottom: 30,
  },
  scrollViewContainer: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
  },
  doneBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FF3B4A",
    borderRadius: 12,
  },
  doneInactiveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F6F7F7",
    borderRadius: 12,
  },
  doneInactiveBtnText: {
    fontSize: 12,
    color: "#D3D5D8",
    fontFamily: "DMSansSemiBold",
  },
  doneBtnText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontFamily: "DMSansSemiBold",
  },
  container: {
    flex: 1,
    flexDirection: "row", // Arrange items horizontally
    flexWrap: "wrap", // Wrap items to the next row if needed
    justifyContent: "flex-start", // Align items to the start of the container
    // justifyContent: 'space-between', // Or use this for even spacing
    padding: 10,
  },
  item: {
    width: "33.33%", // Divide the row into 3 equal parts

    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
});
