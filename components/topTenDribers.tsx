import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import DrbersFollowCard from "./drbersFollowCard";
import { useAppDispatch, useAppSelector } from "@redux/store";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { getEmptyStateCountLoader } from "@helper/get-empty-count-loader/getEmptyCountLoader";
import { setSellerId } from "@redux/slice/filters/filterSlice";
import { router } from "expo-router";
interface ITopTenDribers {
  refetch: any;
}
const TopTenDribers = ({ refetch }: ITopTenDribers) => {
  const { profile, token } = useAppSelector((state) => state?.userProfileSlice);
  const dispatch = useAppDispatch();
  const [searchLoader, setSearchLoader] = useState(false);
  const [trifters, setTrifters]: any = useState([]);
  const [followBtnLoader, setFollowBtnLoader] = useState(false);
  const [activeFollowId, setActiveFollowId] = useState("");

  const getInitialTrifters = () => {
    setSearchLoader(true);
    wardrobeServices
      .triftersQuery(token, "", "12", "", 0)
      .then((res: any) => {
        setSearchLoader(false);

        setTrifters(res?.data?.dataset);
      })
      .catch((error) => {
        setSearchLoader(false);
      });
  };

  useEffect(() => {
    if (profile) {
      getInitialTrifters();
    }
  }, [profile, token]);

  const updateItemState = (data: any) => {
    const findExistingItems = trifters?.find(
      (list: any) => list?.id === data?.id
    );

    if (findExistingItems) {
      const getNewUpdate = trifters?.map((list: any) =>
        list?.id === data?.id
          ? {
              ...list,
              isFollowing: list?.isFollowing ? false : true,
            }
          : list
      );

      setTrifters(getNewUpdate);
    }
  };

  const handleFollowAndUnfollow = (selectedData: any) => {
    setFollowBtnLoader(true);
    setActiveFollowId(selectedData?.id);
    let data = {
      brandId: selectedData?.id,
    };

    let getNewServer = selectedData?.isFollowing
      ? wardrobeServices.unfollowTrifters(data, token)
      : wardrobeServices.followTrifters(data, token);

    getNewServer
      .then((res: any) => {
        setFollowBtnLoader(false);
        if (res?.status === 200) {
          refetch?.(true);
          return updateItemState(selectedData);
        }
      })
      .catch((error) => {
        setFollowBtnLoader(false);
      });
  };

  const handleProfilePress = (userId: string) => {
    dispatch(setSellerId(userId));
    router.push("/SellerProfile");
  };

  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      style={{
        flexDirection: "row",
        flex: 1,
      }}
    >
      {searchLoader
        ? getEmptyStateCountLoader(12)?.map((list: any, index) => (
            <View style={{ marginHorizontal: 14 }} key={index}>
              <DrbersFollowCard
                preLoader={true}
                name={`${list?.name}`}
                rating={list?.ratings}
                imageUrl={list?.imageUrl}
                isFollowing={list?.isFollowing}
                loading={list?.id === activeFollowId && followBtnLoader}
                onPress={() => {}}
              />
            </View>
          ))
        : trifters?.map((list: any) => (
            <View style={{ marginHorizontal: 14 }} key={list?.id}>
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
    </ScrollView>
  );
};

export default TopTenDribers;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
  },
});
