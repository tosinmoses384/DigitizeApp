import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import StackHeader from "../../components/StackHeader";
import { router } from "expo-router";
import { fontSz } from "../../constants";
import VerifiedIcon from "../../assets/images/svg/verified.svg";
import ClockIcon from "../../assets/images/svg/access_time.svg";
import FilterIcon from "../../assets/images/svg/Icons/Basic/Filter.svg";
import ToggleTabs from "../../components/Toggle";

import { Colors, SIZES } from "../../constants/Colors";
import { useAppSelector } from "@redux/store";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import { starTemplate } from "@helper/starTemplate";
import { getInitials } from "@helper/getInitials";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { useToast } from "react-native-toast-notifications";
import CustomButton from "@components/CustomButton";

const ProfileMainOther = () => {
  const toast = useToast();
  const [selectedTab, setSelectedTab] = useState("first");
  const [scrollTab, setScrollTab] = useState("All");
  const { profile } = useAppSelector((state) => state.userProfileSlice);
  const { countryId } = useAppSelector((state) => state.userCountryId);
  const { sellerId } = useAppSelector((state) => state.productFilter);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBtnLoader, setFollowBtnLoader] = useState(false);

  const [userDashboard, setUserDashboard]: any = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTabSelect = (tab: string) => {
    setSelectedTab(tab);
    setScrollTab("All");
  };

  const handleScrollTabSelect = (tab: string) => {
    setScrollTab(tab);
  };

  const profileData: any = {
    item: "200",
    following: userDashboard?.followingTriftersCount,
    followers: userDashboard?.followerCount,
    about: "**********",
    location: "**********",
    lastSeen: "**********",
    username: userDashboard?.trifterName,
    isVerified: true,
    review: "1017",
  };

  const scrollTabs = ["All", "Active", "Reserved", "Drafts", "Sold"];
  const scrollTabs2 = ["All", "Trifters", "Automatic"];

  const getProfile = () => {
    const userProfile = marketplaceServices.sellerProfile(
      profile?.countryId || countryId,
      sellerId,
    );

    userProfile
      .then((res: any) => {
        setLoading(false);
        if (res?.status === 200) {
          setUserDashboard(res?.data);
          return;
        }
        // if (res?.responseCode === "400" || res?.responseCode === 400) {
        //   return push("/");
        // }
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getProfile();
  }, [sellerId]);

  const handleFollowClick = () => {
    if (!profile) {
      return router.push("/Onboarding");
    }

    setFollowBtnLoader(true);

    let data = {
      brandId: userDashboard?.trifterUserId,
    };

    let getNewServer = isFollowing
      ? wardrobeServices.unfollowTrifters(data, profile?.token)
      : wardrobeServices.followTrifters(data, profile?.token);

    getNewServer
      .then((res: any) => {
        setFollowBtnLoader(false);
        if (res?.status === 200) {
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

  return (
    <ScrollView
      // style={defaultStyles.container}
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
        // paddingHorizontal: 20,
        paddingBottom: 10,
      }}
    >
      <StackHeader
        title={userDashboard?.trifterName}
        onPress={() => router.back()}
      />

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
            {["item", "following", "followers"]?.map((key) => (
              <View
                key={key}
                style={[
                  styles.countContainer,
                  key === "followers" && styles.followerCountContainer,
                ]}
              >
                <Text style={styles.text}>{profileData[key]}</Text>
                <Text style={styles.textcontent}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.nameContainer}>
          <Text style={styles.userName}>{profileData.username}</Text>
          {profileData.isVerified && (
            <VerifiedIcon style={styles.verifiedIcon} />
          )}
        </View>
        <View style={styles.reviewContainer}>
          {starTemplate(4)}
          {/* <StarIcon height={20} width={20} fill={"#6B727E"} />
          <StarIcon height={20} width={20} fill={"#6B727E"} />
          <StarIcon height={20} width={20} fill={"#6B727E"} />
          <StarIcon height={20} width={20} />
          <StarIcon height={20} width={20} /> */}
          <Text style={styles.text}>{profileData.review} review</Text>
        </View>

        <Text style={styles.userDetails}>{profileData.about}</Text>
        <Text style={styles.userLocation}>{profileData.location}</Text>
        <View style={styles.reviewContainer}>
          <ClockIcon height={18} width={18} />
          <Text style={styles.userLastSeen}>
            Last seen: {profileData.lastSeen}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <View style={{ width: "48%", marginRight: 5 }}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => router.push("/inbox")}
            >
              <Text style={styles.nextText}>Message</Text>
            </TouchableOpacity>
          </View>
          {/* <TouchableOpacity style={styles.followButton} onPress={handleClick}>
            <Text style={styles.nextText2}>Follow</Text>
          </TouchableOpacity> */}
          <View style={{ width: "48%", marginLeft: 5 }}>
            <CustomButton
              title="Follow"
              buttonStyle={styles.followButton}
              textStyle={styles.nextText2}
              loader={followBtnLoader}
              onPress={() => handleFollowClick}
            />
          </View>
        </View>
      </View>

      <ToggleTabs
        selectedTab={handleTabSelect}
        currentTab={selectedTab}
        firstLabel="Items"
        secondLabel="Reviews"
        small={false}
      />

      {selectedTab === "first" && (
        <View style={styles.filterContainer}>
          <View style={{ flexDirection: "row", gap: 5 }}>
            <Text>1824</Text>
            <Text>Items</Text>
          </View>
          <FilterIcon />
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollTabContainer}
      >
        {(selectedTab === "first" ? scrollTabs : scrollTabs2)?.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleScrollTabSelect(tab)}
            style={[
              styles.scrollTab,
              scrollTab === tab && styles.scrollTabFocused,
            ]}
          >
            <Text
              style={[
                styles.scrollTabText,
                scrollTab === tab && styles.scrollTabTextFocused,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* {selectedTab === "first" && <RecommendedCardList cardsData={cardData3} />}
      {selectedTab != "first" && <TriftersList />} */}
    </ScrollView>
  );
};

export default ProfileMainOther;

const styles = StyleSheet.create({
  // wrapper:{
  //   paddi
  // },
  profileContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 15,
    paddingHorizontal: 16,
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

  nextButton: {
    backgroundColor: Colors.light.primaryBase,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: 221,
    height: 48,
    justifyContent: "center",
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  skipButton: {
    backgroundColor: Colors.light.background,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 12,
    width: "100%",
    justifyContent: "center",
    height: 48,
  },
  followButton: {
    backgroundColor: Colors.light.primaryBase,
    paddingVertical: 10,
    borderRadius: 12,
    width: "100%",
    justifyContent: "center",
    height: 48,
  },
  nextText: {
    color: "#212C3D",
    fontFamily: "DMSansBold",
    fontWeight: "bold",
    textAlign: "center",
  },
  nextText2: {
    color: "white",
    fontFamily: "DMSansBold",
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
  },
  funButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: Colors.light.primaryBase,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    height: 48,
    justifyContent: "center",
  },
  verifiedIcon: {
    marginLeft: 5,
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
  },
  userLastSeen: {
    fontSize: 10,
    color: "rgba(92, 111, 127, 1)",
    textAlign: "left",
    marginLeft: 5,
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
  scrollTabContainer: {
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    maxHeight: 40,
  },
  scrollTab: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: "white",
    marginRight: 10,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollTabFocused: {
    backgroundColor: "#FF5C68",
    borderColor: "#FF3B4A",
    borderWidth: 1,
  },
  scrollTabText: {
    fontSize: fontSz(14),
    color: "#1E3448",
    fontFamily: "DMSansMedium",
  },
  scrollTabTextFocused: {
    color: "white",
  },
});
