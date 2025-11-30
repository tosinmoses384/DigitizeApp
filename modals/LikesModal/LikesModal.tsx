import BottomModal from "@components/BottomModal";
import CustomButton from "@components/CustomButton";
import EmptyState from "@components/EmptyState";
import LineLoader from "@components/LineLoader";
import NewBottomModal from "@components/NewBottomModal";
import SearchInput from "@components/SearchInput";
import { getEmptyStateCountLoader } from "@helper/get-empty-count-loader/getEmptyCountLoader";
import { getInitials } from "@helper/getInitials";
import { useAppSelector } from "@redux/store";
import timelineServices from "@services/features/timeline-service/timelineServices";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
interface ILikesModal {
  onClose: any;
  isShow: boolean;
  selectedLikeDetails: any;
}
const LikesModal = ({ onClose, isShow, selectedLikeDetails }: ILikesModal) => {
  const { token, profile } = useAppSelector((state) => state.userProfileSlice);
  const [loader, setLoader] = useState(false);
  const [pageToken, setPageToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [getPostLikes, setGetPostLikes]: any = useState([]);
  const [search, setSearch] = useState("");
  const [followBtnLoader, setFollowBtnLoader] = useState(false);
  const [activeFollowId, setActiveFollowId] = useState("");
  const data = [
    {
      id: 1,

      name: "teanottee",
      image: "",
      followers: "13 Followers",
      isFollowing: false,
    },
    {
      id: 2,
      name: "teanottee",
      image: "",
      followers: "13 Followers",
      isFollowing: true,
    },
    {
      id: 3,

      name: "teanottee",
      image: "",
      followers: "13 Followers",
      isFollowing: true,
    },
    {
      id: 4,

      name: "teanottee",
      image: "",
      followers: "13 Followers",
      isFollowing: false,
    },
    {
      id: 5,

      name: "teanottee",
      image: "",
      followers: "13 Followers",
      isFollowing: true,
    },
    {
      id: 6,

      name: "teanottee",
      image: "",
      followers: "13 Followers",
      isFollowing: true,
    },
    {
      id: 7,

      name: "teanottee",
      image: "",
      followers: "13 Followers",
      isFollowing: true,
    },
    {
      id: 8,

      name: "teanottee",
      image: "",
      followers: "13 Followers",
      isFollowing: true,
    },
  ];

  const getInitialItems = () => {
    setPageToken("");
    setGetPostLikes([]);
    setLoading(true);
    timelineServices
      .getPostLikesQuery(token, selectedLikeDetails?.id, "12", "", search)
      .then((res: any) => {
        setLoading(false);
        setGetPostLikes(res?.data?.dataset);

        if (res?.data?.hasNextPage) {
          setPageToken(res?.data?.pageToken);
        }
        if (res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
      })
      .catch((error: any) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedLikeDetails?.id) {
      getInitialItems();
    }
  }, [selectedLikeDetails?.id, search]);

  const updateItemState = (data: any) => {
    const findExistingItems = getPostLikes?.find(
      (list: any) => list?.id === data?.id
    );

    if (findExistingItems) {
      const getNewUpdate = getPostLikes?.map((list: any) =>
        list?.id === data?.id
          ? {
              ...list,
              isFollowing: list?.isFollowing ? false : true,
            }
          : list
      );

      setGetPostLikes(getNewUpdate);
    }
  };

  const handleFollowAndUnfollow = (selectedData: any) => {
    setFollowBtnLoader(true);
    setActiveFollowId(selectedData?.id);

    let data = {
      brandId: selectedData?.userId,
    };

    let getNewServer = selectedData?.isFollowing
      ? wardrobeServices.unfollowTrifters(data, token)
      : wardrobeServices.followTrifters(data, token);

    getNewServer
      .then((res: any) => {
        setFollowBtnLoader(false);
        if (res?.status === 200) {
          return updateItemState(selectedData);
        }
        // return openNotification({
        //   type: "error",
        //   message: "Error Message",
        //   description: res?.detail || res?.Message,
        // });
      })
      .catch((error) => {
        setFollowBtnLoader(false);
      });
  };

  const renderLikeTemplate = (item?: any, index?: number) => {
    return (
      <View style={styles.cardWrapper} key={index}>
        <View style={styles.imageView}>
          {loading ? (
            ""
          ) : item?.userImageUrl ? (
            <Image
              source={{ uri: item?.userImageUrl }}
              style={{ width: "100%", height: "100%", borderRadius: 44 }}
            />
          ) : (
            <Text style={styles.userInitials}>
              {getInitials(item?.username)}
            </Text>
          )}
        </View>
        <View style={styles.centerView}>
          {loading ? (
            <View style={{ width: "90%", height: 10, marginBottom: 8 }}>
              <LineLoader />
            </View>
          ) : (
            <Text style={styles.name}>{item?.username}</Text>
          )}

          {loading ? (
            <View style={{ width: "60%", height: 10, marginBottom: 8 }}>
              <LineLoader />
            </View>
          ) : (
            <Text style={styles.followers}>{item?.followers}</Text>
          )}
        </View>
        <View>
          {loading ? (
            <View style={{ width: "100%", height: 40 }}>
              <LineLoader />
            </View>
          ) : (
            item?.userId !== profile?.id && (
              <CustomButton
                title={item?.isFollowing ? "Following" : "Follow"}
                onPress={() => handleFollowAndUnfollow(item)}
                loader={
                  item?.id === activeFollowId && followBtnLoader ? true : false
                }
                showLoadingText={
                  item?.id === activeFollowId && followBtnLoader ? true : false
                }
                textStyle={
                  item?.isFollowing
                    ? styles.activeFollowersText
                    : styles.inActiveFollowersText
                }
                buttonStyle={
                  item?.isFollowing
                    ? styles.activeFollowersBtn
                    : styles.inActiveFollowersBtn
                }
              />
            )
          )}
        </View>
      </View>
    );
  };

  const templateData = ({ item }: any) => {
    return renderLikeTemplate(item);
  };

  return (
    <NewBottomModal isShow={isShow} onClose={onClose}>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Likes</Text>
        </View>
        <View style={styles.searchView}>
          <SearchInput
            value={search}
            placeholder="Search Drbers"
            onChangeText={(e: any) => setSearch(e)}
          />
        </View>
        {loading ? (
          getEmptyStateCountLoader(8)?.map((list, index) =>
            renderLikeTemplate("", index)
          )
        ) : getPostLikes?.length ? (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={getPostLikes}
            keyExtractor={(item) => item?.id?.toString()}
            renderItem={templateData}
          />
        ) : (
          <View>
            <EmptyState
              title="No Likes Yet"
              subtitle="This post hasn't received any likes."
            />
          </View>
        )}
      </View>
    </NewBottomModal>
  );
};

export default LikesModal;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "#f9fafc",
  },
  header: {
    padding: 12,
    backgroundColor: "white",
  },
  headerText: {
    textAlign: "center",
    color: "#071827",
    fontSize: 14,
    fontFamily: "DMSansSemiBold",
  },
  searchView: {
    paddingVertical: 12,
    backgroundColor: "white",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  cardWrapper: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#EDF2F7",
    alignItems: "center",
    flex: 1,
  },
  imageView: {
    width: 44,
    height: 44,
    backgroundColor: "#919EAB14",
    borderRadius: 44,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  centerView: {
    flex: 1,
  },
  name: {
    color: "#1E2226",
    fontSize: 14,
    fontFamily: "DMSansMedium",
    textTransform: "capitalize",
  },
  followers: {
    fontSize: 10,
    color: "#A0B1C0",
    fontFamily: "DMSansMedium",
  },
  activeFollowersBtn: {
    backgroundColor: "#FF3B4A",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#FF3B4A",
  },
  inActiveFollowersBtn: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#FF3B4A",
  },
  activeFollowersText: {
    color: "white",
    fontSize: 14,
  },

  inActiveFollowersText: {
    color: "#FF3B4A",
    fontSize: 14,
  },
  userInitials: {
    fontFamily: "DMSansSemiBold",
  },
});
