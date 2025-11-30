import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import StackHeader, { ResourcesHeader } from "../../components/StackHeader";
import { router } from "expo-router";
import { defaultStyles } from "../../constants/Styles";
import { fontSz } from "../../constants";
import { Colors } from "../../constants/Colors";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { getInitials } from "@helper/getInitials";
import CustomButton from "@components/CustomButton";
import { setRefetchUserDashboardState } from "@redux/slice/profile/profileSlice";
import { useApiService } from "@hooks/use-auth-guard/useApiService";
import { useI18n } from "@hooks/use-i18n";

const trifters = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const [pageToken, setPageToken] = useState("");
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  const { callApi, callApiWithLoading } = useApiService();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [details, setDetails]: any = useState([]);
  const [btnLoader, setBtnLoader] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const stores = [
    { name: "Next", items: "11M items" },
    { name: "Primark", items: "11M items" },
    { name: "Shein", items: "11M items" },
    { name: "Zara", items: "1M items" },
    { name: "H&M", items: "1M items" },
    { name: "New Look", items: "1M items" },
    { name: "Marks & Spencer", items: "1M items" },
    { name: "George", items: "1M items" },
    { name: "F&F", items: "1M items" },
    { name: "Pretty little things", items: "1M items" },
    { name: "River Island", items: "1M items" },
    { name: "Nike", items: "1M items" },
    { name: "Next", items: "11M items" },
    { name: "Primark", items: "11M items" },
    { name: "Shein", items: "11M items" },
    { name: "Zara", items: "1M items" },
    { name: "H&M", items: "1M items" },
    { name: "New Look", items: "1M items" },
    { name: "Marks & Spencer", items: "1M items" },
    { name: "George", items: "1M items" },
    { name: "F&F", items: "1M items" },
    { name: "Pretty little things", items: "1M items" },
    { name: "River Island", items: "1M items" },
    { name: "Nike", items: "1M items" },
  ];

  const getTrifters = async () => {
    if (pageToken) {
      await callApi(
        (token) => wardrobeServices.triftersFollowersQuery(token, search || "", "12", pageToken || ""),
        {
          onSuccess: (res: any) => {
            setLoading(false);
            let newData = res?.data?.dataset || [];
            setDetails([...details, ...newData]);
            setPageToken(res?.data?.pageToken);
          },
          onError: (error) => {
            console.error('Error fetching followers:', error);
            setLoading(false);
          }
        }
      );
    }
  };

  const getInitialItems = async () => {
    setPageToken("");
    setDetails([]);
    setLoading(true);

    await callApi(
      (token) => wardrobeServices.triftersFollowersQuery(token, search || "", "12", pageToken || ""),
      {
        onSuccess: (res: any) => {
          setLoading(false);
          setDetails(res?.data?.dataset);
          if (res?.data?.hasNextPage) {
            setPageToken(res?.data?.pageToken);
          }
        },
        onError: (error) => {
          console.error('Error fetching initial followers:', error);
          setLoading(false);
        }
      }
    );
  };

  useEffect(() => {
    if (token) {
      getInitialItems();
    }
  }, [token, search]);

  const [following, setFollowing] = useState(Array(stores.length).fill(false));

  const handleFollow = async (storeData: any) => {
    console.log("store>>", storeData);
    setBtnLoader(true);
    setActiveId(storeData?.id);

    await callApi(
      (token) => wardrobeServices.removeTrifter(storeData?.id, token),
      {
        onSuccess: (res: any) => {
          setBtnLoader(false);
          if (res?.succeeded) {
            setActiveId(null);
            dispatch(setRefetchUserDashboardState(true));
            return getInitialItems();
          }
        },
        onError: (error) => {
          console.error('Error removing follower:', error);
          setBtnLoader(false);
        }
      }
    );
  };

  return (
    <View style={defaultStyles.container}>
      <StackHeader
        title={t('following.followers')}
        isShowHeaderShadow
        onPress={() => router.back()}
      />

      {loading && (
        <View style={{ marginTop: 20 }}>
          <ActivityIndicator size="large" color="silver" />
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={getTrifters}
        scrollEventThrottle={16}
      >
        {details.map((store: any, index: number) => (
          <View key={index} style={styles.sectionContainer}>
            <View style={styles.imageView}>
              {store?.imageUrl ? (
                <Image
                  source={{ uri: store?.imageUrl }}
                  style={{ width: 44, height: 44, borderRadius: 44 }}
                />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "DMSansSemiBold",
                  }}
                >
                  {getInitials(store?.name || "")}
                </Text>
              )}
            </View>
            <View style={styles.textContainer}>
              <Text
                style={{
                  fontFamily: "DMSansMedium",
                  textTransform: "capitalize",
                }}
              >
                {store.name}
              </Text>
              <Text
                style={{
                  fontFamily: "DMSansMedium",
                  fontSize: 10,
                  color: "#A0B1C0",
                }}
              >
                {`13 ${t('following.followers')}`}
              </Text>
            </View>

            <CustomButton
              title={t('following.remove')}
              buttonStyle={styles.buyButton}
              textStyle={styles.buyButtonText}
              onPress={() => handleFollow(store)}
              loader={btnLoader && activeId === store?.id ? true : false}
            />
            {/* <TouchableOpacity
              style={[
                styles.buyButton,
                following[index] && styles.followingButton,
                { width: following[index] ? 100 : 80 },
              ]}
              onPress={() => handleFollow(index)}
            >
              <View style={styles.buyButtonContent}>
                <Text
                  style={[
                    styles.buyButtonText,
                    following[index] && styles.followingButtonText,
                  ]}
                >
                  {following[index] ? "Following" : "Follow"}
                </Text>
              </View>
            </TouchableOpacity> */}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default trifters;

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  imageView: {
    width: 44,
    height: 44,
    backgroundColor: "#919EAB14",
    marginRight: 4,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
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
  followingButton: {
    backgroundColor: Colors.light.primaryBase,
  },
  buyButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buyButtonText: {
    marginLeft: 5,
    color: Colors.light.primaryBase,
    fontFamily: "DMSansBold",
    fontSize: fontSz(14),
  },
  followingButtonText: {
    color: "#fff",
  },
});
