import {
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import ToggleTabs from "@components/Toggle";
import { Colors, SIZES } from "../../constants/Colors";
import { fontSz } from "../../constants";
import WardrobeEmpty from "../../assets/images/svg/empty.svg";
import StarIcon from "../../assets/images/svg/StarOutline.svg";
import { useRouter } from "expo-router";
import { ResourcesHeaderMain } from "../../components/StackHeader";
import ChevronRight from "../../assets/images/svg/chevron-right-arrow.svg";
import { useAppSelector } from "@redux/store";
import conversationService from "@services/features/conversation-service/conversationService";
import ChatCard from "@components/ChatCard";
import { getEmptyStateCountLoader } from "@helper/get-empty-count-loader/getEmptyCountLoader";
import TrifterCard from "@components/TrifterCard";
import LoginNotificationModal from "modals/LoginNotificationModal";
import { useApiService } from "@hooks/use-auth-guard/useApiService";
import { useI18n } from "@hooks/use-i18n";

const Inbox = () => {
  const { t } = useI18n();
  const router = useRouter();
  const profile = useAppSelector((state) => state?.userProfileSlice?.profile);
  const token = useAppSelector((state) => state?.userProfileSlice?.token);
  const { callApi, callApiWithLoading } = useApiService();
  const [selectedTab, setSelectedTab] = useState("first");
  const [notifications, setNotifications] = useState([]);
  const [chatLoader, setChatLoader] = useState(false);
  const [chatList, setChatList]: any = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageToken, setPageToken] = useState("");

  const currentItems = selectedTab === "first" ? chatList : notifications;

  const getMoreChatList = async () => {
    if (pageToken) {
      setLoadingMore(true);

      let query = {
        PageSize: "12",
        PageToken: pageToken,
      };

      await callApi(
        (token) => conversationService.getUserConversation(token, query),
        {
          onSuccess: (res: any) => {
            setLoadingMore(false);
            let newDatas = res?.data?.dataset || [];
            setChatList([...chatList, ...newDatas]);
            setPageToken(res?.data?.pageToken);
          },
          onError: (error) => {
            console.error('Error fetching more chat list:', error);
            setLoadingMore(false);
          }
        }
      );
    }
  };

  const getInitialConversations = async () => {
    setChatList([]);
    setPageToken("");
    setChatLoader(true);
    let query: any = {
      PageSize: "12",
      PageToken: "",
    };

    await callApi(
      (token) => conversationService.getUserConversation(token, query),
      {
        onSuccess: (res: any) => {
          setChatLoader(false);
          setChatList(res?.data?.dataset);
          setPageToken(res?.data?.pageToken);
        },
        onError: (error) => {
          console.error('Error fetching initial conversations:', error);
          setChatLoader(false);
        }
      }
    );
  };

  useEffect(() => {
    if (selectedTab === "first" && token) {
      getInitialConversations();
    }
  }, [profile, selectedTab, token]);

  const renderMessageItem = ({ item }: any) => {
    // const { username, time, rating, comment } = item;
    // const firstLetter = username.charAt(0).toUpperCase();

    return (
      <View style={{ marginBottom: 8 }}>
        <ChatCard
          name={item?.name}
          rating={0}
          productName={item?.metadata?.product_name}
          productSize={item?.metadata?.product_size}
          productImage={item?.metadata?.product_image_url}
          sellerImage={item?.displayPicture}
          time={item?.lastUpdated}
          id={item?.id}
          metadata={item?.metadata}
          item={item}
        />
      </View>
    );
  };

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
        },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 18,
          paddingBottom: 20,
          position: "relative",
        }}
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ 
            position: "absolute", 
            left: 20, 
            transform: [{ rotate: '180deg' }] 
          }}
        >
          <ChevronRight width={24} height={24} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600", color: Colors.light.text }}>
          {t('inbox.title')}
        </Text>
      </View>

      <View style={{ marginHorizontal: 20 }}>
        <ToggleTabs
          currentTab={selectedTab}
          selectedTab={setSelectedTab}
          firstLabel={t('inbox.messagesTab')}
          secondLabel={t('inbox.notificationsTab')}
          small={false}
        />
      </View>

      {selectedTab === "first" && chatList.length === 0 && !chatLoader ? (
        <View style={styles.emptyState}>
          <WardrobeEmpty height={190} width={250} />
          <Text style={styles.emptyText}>{t('inbox.emptyInbox')}</Text>
          <Text style={styles.emptyText2}>
            {t('inbox.emptyInboxDesc')}
          </Text>
        </View>
      ) : selectedTab === "first" ? (
        chatLoader ? (
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
          <FlatList
            data={chatList}
            renderItem={renderMessageItem}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            onEndReached={getMoreChatList}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={chatLoader}
                onRefresh={getInitialConversations}
                tintColor="#FF3B4A" // iOS color
                colors={Platform.OS === "android" ? ["#FF3B4A"] : undefined} // Android color(s)
              />
            }
          />
        )
      ) : (
        <ScrollView
          contentContainerStyle={styles.emptyState}
          showsVerticalScrollIndicator={false}
        >
          <WardrobeEmpty height={190} width={250} />
          <Text style={styles.emptyText}>{t('inbox.noNotifications')}</Text>
          <Text style={styles.emptyText2}>
            {t('inbox.noNotificationsDesc')}
          </Text>
        </ScrollView>
      )}
      {/* {!profile && isShowLoginModal && (
        <LoginNotificationModal
          onClose={() => {}}
          isShow
          handleButtonClose={() => {
            setIsShowLoginModal(false);
          }}
        />
      )} */}
    </View>
  );
};

export default Inbox;

const styles = StyleSheet.create({
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  emptyText: {
    fontSize: fontSz(14),
    color: "#07090C",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "DMSansMedium",
  },
  emptyText2: {
    fontSize: fontSz(14),
    color: "#90959E",
    marginBottom: 20,
    textAlign: "center",
    marginHorizontal: 80,
    fontFamily: "DMSansRegular",
  },
  initialContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  initial: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    fontFamily: "DMSansBold",
  },
  contentContainer: {
    marginLeft: 10,
    flex: 1,
  },
  username: {
    fontSize: fontSz(16),
    color: "#07090C",
    fontFamily: "DMSansMedium",
  },
  time: {
    fontSize: fontSz(12),
    color: "#6B727E",
    fontFamily: "DMSansRegular",
  },
  comment: {
    fontSize: fontSz(14),
    color: "#07090C",
    fontFamily: "DMSansRegular",
    marginTop: 5,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    paddingTop: 10,
  },
});
