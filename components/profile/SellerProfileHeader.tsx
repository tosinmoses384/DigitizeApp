import React, { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SingleSkelenton from "@components/SingleSkelenton";
import { getInitials } from "@helper/getInitials";
import { router } from "expo-router";
import VerifiedIcon from "@assets/images/svg/verified.svg";
import { starTemplate } from "@helper/starTemplate";
import ClockIcon from "@assets/images/svg/access_time.svg";
import CustomButton from "@components/CustomButton";
import { Colors } from "@constants/Colors";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { useSellerProfile } from "@hooks/use-seller-profile";
import { useSellerItems } from "@hooks/use-seller-items";
import { useSellerReviews } from "@hooks/use-seller-reviews";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { setRefetchPostList } from "@redux/slice/profile/profileSlice";
import { useToast } from "react-native-toast-notifications";
import { useNavigation } from "@react-navigation/native";
import { capitalizeFirstLetter } from "@helper/capiterlize-first-letter";
import { useI18n } from "@hooks/use-i18n";

interface Props {
  onSelectTab?: (tab: string) => void;
  onSelectTabIndex?: (tabIndex: number) => void;
  selectedTab?: string;
  onSetActiveSubTab?: (activeTab: string) => void;
}

export default function SellerProfileHeader(props: Props): React.JSX.Element {
  const { t } = useI18n();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { sellerId } = useAppSelector((state) => state.productFilter);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBtnLoader, setFollowBtnLoader] = useState(false);
  const [selectedTab, setSelectedTab] = useState("first");

  const { profile, token } = useAppSelector((state) => state.userProfileSlice);
  const { countryId } = useAppSelector((state) => state.userCountryId);

  const sellerProfile = useSellerProfile({
    sellerId,
    token: token || "",
    countryId: countryId || profile?.countryId || "",
    enabled: !!sellerId,
    refetchOnFocus: false,
  });

  const sellerItems = useSellerItems({
    sellerId,
    token: token || "",
    countryId: countryId || profile?.countryId || "",
    enabled: false,
    refetchOnFocus: false,
  });

  const sellerReviews = useSellerReviews({
    sellerId,
    token: token || "",
    countryId: countryId || profile?.countryId || "",
    enabled: false,
    refetchOnFocus: false,
  });

  const userDashboard = sellerProfile.data;

  const profileData = useMemo(
    () => ({
      [userDashboard?.wardrobeItemCount === 1 ? 'item' : 'items']:
        userDashboard?.wardrobeItemCount || sellerItems.data?.length || 0,
      following: userDashboard?.followingTriftersCount,
      [userDashboard?.followerCount === 1 ? 'follower' : 'followers']:
        userDashboard?.followerCount,
      about: userDashboard?.biography,
      location: userDashboard?.countryName,
      lastSeen: userDashboard?.lastSeen,
      username: userDashboard?.trifterName,
      isVerified: userDashboard?.isVerified,
      review: userDashboard?.reviewCount || sellerReviews.data?.length || '0',
    }),
    [userDashboard, profile, sellerItems.data?.length, sellerReviews.data?.length],
  );

  const isLoggedInUser = userDashboard?.trifterUserId === profile?.id;

  const handleFollowClick = () => {
    if (!profile || !userDashboard?.trifterUserId) {
      return router.push("/Onboarding");
    }

    setFollowBtnLoader(true);

    const data = {
      brandId: userDashboard.trifterUserId,
    };

    const getNewServer = isFollowing
      ? wardrobeServices.unfollowTrifters(data, token)
      : wardrobeServices.followTrifters(data, token);

    getNewServer
      .then((res: any) => {
        setFollowBtnLoader(false);
        if (res?.status === 200) {
          dispatch(setRefetchPostList(true));
          return setIsFollowing(!isFollowing);
        }
        if (res?.responseCode === "401" || res?.responseCode === 401) {
          return router.push("/Onboarding");
        }

        return toast.show(`${res?.message || res?.detail}`, {
          type: "danger",
          duration: 4000,
        });
      })
      .catch((error) => {
        setFollowBtnLoader(false);
      });
  };

  const handleSelectTab = (tab: string, tabIndex: number, activeSubTab?: string) => {
    setSelectedTab(tab);
    if (props.onSelectTab) {
      props.onSelectTab?.(tab);
    }
    if (props.onSelectTabIndex) {
      props.onSelectTabIndex?.(tabIndex);
    }
    if (activeSubTab && props.onSetActiveSubTab) {
      props.onSetActiveSubTab?.(activeSubTab);
    }
  };

  useEffect(() => {
    if (userDashboard?.trifterUserId) {
      setIsFollowing(userDashboard?.isFollowingSeller);
    }
  }, [userDashboard]);

  if (sellerProfile.isLoading) {
    return (
      <View style={{ paddingLeft: 16 }}>
        <SingleSkelenton />
      </View>
    );
  }

  return (
    <View style={styles.profileContainer}>
      <View style={styles.row}>
        {userDashboard?.trifterProfileImageUrl ? (
          <Image
            source={{ uri: userDashboard?.trifterProfileImageUrl }}
            style={{
              width: 70,
              height: 70,
              borderRadius: 70,
            }}
          />
        ) : (
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 70,
              backgroundColor: "rgba(255, 247, 248, 1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 16,
                fontFamily: "DMSansSemiBold",
                color: "rgba(33, 44, 61, 1)",
              }}
            >
              {getInitials(userDashboard?.trifterName || "")}
            </Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          {[
            { key: userDashboard?.wardrobeItemCount === 1 ? "item" : "items", translationKey: userDashboard?.wardrobeItemCount === 1 ? 'marketplace.item' : 'marketplace.items', isFollower: false },
            { key: "following", translationKey: 'marketplace.following', isFollower: false },
            { key: userDashboard?.followerCount === 1 ? "follower" : "followers", translationKey: userDashboard?.followerCount === 1 ? 'marketplace.follower' : 'marketplace.followers', isFollower: true },
          ]?.map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => {
                if (item.key === "followers" || item.key === "follower") {
                  router.push(
                    `/SellerFollowers/${userDashboard?.trifterUserId}`,
                  );
                } else if (item.key === "following") {
                  router.push(
                    `/SellerFollowing/${userDashboard?.trifterUserId}`,
                  );
                } else {
                  handleSelectTab("first", 0, "ItemPost");
                }
              }}
              style={[
                styles.countContainer,
                item.isFollower && styles.followerCountContainer,
              ]}
            >
              <Text style={styles.text}>
              {item.key === 'following'
                        ? userDashboard?.followingTriftersCount || 0
                        : item.key === 'followers' || item.key === 'follower'
                        ? userDashboard?.followerCount || 0
                        : userDashboard?.wardrobeItemCount || sellerItems.data?.length || 0}
              </Text>
              <Text style={styles.textcontent}>
                {t(item.translationKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.nameContainer}>
        <Text style={styles.userName}>{profileData.username}</Text>
        {profileData.isVerified && <VerifiedIcon style={styles.verifiedIcon} />}
      </View>
      <View style={styles.topCenterStartAndReview}>
        {starTemplate(userDashboard?.ratings || 0)}
        <Text style={styles.topCenterReview}>
          {userDashboard?.reviewCount || 0} {t('marketplace.reviews')}
        </Text>
      </View>

      <Text style={styles.userDetails}>{capitalizeFirstLetter(profileData?.about || "")}</Text>
      <Text style={styles.userLocation}>{capitalizeFirstLetter(profileData?.location || "")}</Text>
      <View style={styles.reviewContainer}>
        <ClockIcon height={18} width={18} />
        <Text style={styles.userLastSeen}>
        {t('marketplace.lastSeen')} {userDashboard?.lastSeen || "**********"}
        </Text>
      </View>

      {!isLoggedInUser && (
        <View style={styles.buttonContainer}>
          <CustomButton
            title={isFollowing ? t('marketplace.following') : t('marketplace.follow')}
            buttonStyle={
              isFollowing ? styles.followButton : styles.notFollowButton
            }
            textStyle={
              isFollowing ? styles.nextText2 : styles.notFollowingText
            }
            loader={followBtnLoader}
            onPress={handleFollowClick}
            loadingStyle={{ padding: 9 }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    //
  },
  profileContainer: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 16,
    // margin: 12,
    borderRadius: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    flex: 1,
  },
  countContainer: {
    alignItems: "center",
    borderRadius: 5,
    backgroundColor: "#F6F7F7",
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
  },
  followerCountContainer: {
    backgroundColor: "#FFF7F8",
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: 10,
  },
  reviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 6,
    paddingHorizontal: 16,
  },
  followButton: {
    backgroundColor: Colors.light.primaryBase,
    // paddingVertical: 10,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  notFollowButton: {
    borderWidth: 1,
    borderColor: Colors.light.primaryBase,
    backgroundColor: "white",
    // paddingVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  userName: {
    fontSize: 16,
    fontFamily: "DMSansSemiBold",
    textTransform: "capitalize",
    color: "#393939",
  },
  userDetails: {
    fontSize: 12,
    color: "rgba(35, 35, 35, 1)",
    textAlign: "left",
    paddingVertical: 10,
    // fontFamily: "DMSansMedium",
  },
  userLocation: {
    fontSize: 12,
    color: "rgba(30, 34, 38, 1)",
    textAlign: "left",
    fontFamily: "DMSansSemiBold",
    marginBottom: 10,
  },
  userLastSeen: {
    fontSize: 10,
    color: "rgba(92, 111, 127, 1)",
    textAlign: "left",
    marginLeft: 5,
  },
  buttonContainer: {
    alignItems: "stretch",
    marginTop: 20,
    width: "100%",
  },
  text: {
    fontFamily: "DMSansBold",
    fontSize: 10,
    color: "rgba(7, 9, 12, 1)",
  },
  textcontent: {
    fontFamily: "DMSansMedium",
    fontSize: 10,
    color: "rgba(7, 9, 12, 1)",
  },
  verifiedIcon: {
    marginLeft: 5,
  },
  nextText2: {
    color: "white",
    fontFamily: "DMSansMedium",
    textAlign: "center",
    fontSize: 14,
  },
  notFollowingText: {
    color: Colors.light.primaryBase,
    fontFamily: "DMSansMedium",
    textAlign: "center",
    fontSize: 14,
  },
  topCenterStartAndReview: {
    flexDirection: "row",
    alignItems: "center",
  },
  topCenterReview: {
    fontSize: 10,
    color: "#232323",
    fontFamily: "DMSansMedium",
  },
});
