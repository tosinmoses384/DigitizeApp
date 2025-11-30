import React, { useEffect, useState } from "react";
import { Platform, StatusBar, View, Text, Pressable, GestureResponderEvent, StyleSheet, Alert, Image } from "react-native";
import { router, Tabs, useNavigation } from "expo-router";
import { Provider } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { usePhotoLibraryPermission } from "../../../hooks/usePhotoLibraryPermission";

import { useColorScheme } from "../../../hooks/useColorScheme";
import { store,  } from "../../../redux/store";
import { Colors } from "../../../constants/Colors";
import StackHeader from "../../../components/StackHeader";
import LoginNotificationModal from "modals/LoginNotificationModal";
import NewBottomModal from "@components/NewBottomModal";
import { setWardrobeType } from "@redux/slice/temporary-add-item-to-outfit/temporaryAddItemtoOutfitSlice";
import { setIsShownLoginModal } from "@redux/slice/profile/profileSlice";
import { useAppDispatch, useAppSelector } from "@redux/store";

// Icons
import Profile1 from "../../../assets/images/svg/profile1.svg";
import Profile2 from "../../../assets/images/svg/profile2.svg";
import Duotone from "../../../assets/images/svg/duotone.svg";
import Duotone2 from "../../../assets/images/svg/duotone2.svg";
import Linear from "../../../assets/images/svg/linear.svg";
import Linear2 from "../../../assets/images/svg/linear2.svg";
import Plus from "../../../assets/images/svg/plus.svg";
import Plus2 from "../../../assets/images/svg/plus2.svg";
import Home from "../../../assets/images/svg/home.svg";
import Home2 from "../../../assets/images/svg/home2.svg";
import AiSVGIcon from "../../../assets/images/svg/aiSVGicon.svg";
import TshirtComponentSVG from "@assets/images/svg_components/shirt_outfit";
import { useI18n } from "@hooks/use-i18n";
import OutFitComponentSVG from "@assets/images/svg_components/outfit_svg";
import { setTagedDetails } from "@redux/slice/outfit-edit-details/outfitEditDetailsSlice";
import UploadStatusModal from "modals/sataus/UploadStatusModal";
import timelineServices from "@services/features/timeline-service/timelineServices";
import PlanCalendarSvg from "@assets/images/svg_components/plan_calendar";
import { generateGUID } from "@helper/guid-number";


type IconButton = {
  onPress?: (event: GestureResponderEvent) => void;
  icon: React.ReactNode;
  label: string;
};

const IconButtonRow: React.FC<{ buttons: IconButton[] }> = ({ buttons }) => (
  <View style={styles.iconRow}>
    {buttons.map((btn, idx) => (
      <View key={idx} style={styles.buttonWrapper}>
        <Pressable style={styles.pressable} onPress={btn.onPress}>
          <View style={styles.icon}>{btn.icon}</View>
          <Text style={styles.label}>{btn.label}</Text>
        </Pressable>
      </View>
    ))}
  </View>
);

export default function TabLayout() {
  const { t, locale } = useI18n();
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { profile, isShownLoginModal } = useAppSelector((state) => state.userProfileSlice);
  const [optionsModal, setOptionsModal] = useState(false);
  const [isShowLoginModal, setIsShowLoginModal] = useState(false);
  const [insideStory, setInsideStory] = useState(null);
  const [stories, setStories]: any = useState([]);
  const [pageToken, setPageToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [forceUpdate, setForceUpdate] = React.useState(0);

 const { token,  refetchPostList, fetchMoreItem, userName } =
    useAppSelector((state) => state?.userProfileSlice);

    const [isShowImageModal, setIsShowImageModal] = useState(false);
  const [isFileLoader, setIsFileLoader] = useState(false);
  const [images, setImages] = useState<any[]>([]);

const handleNewPost = () => {
    setOptionsModal(false);
    
    router.push("/addPost");
  }

  const handleNewStory = () => {
    setOptionsModal(false);
    setTimeout(() => {
      router.push({
        pathname: '/(authenticated)/createStory',
        params: {
          refetchStories: 'true'
        }
      });
  }, 500);
  }
  const handleSellItem= () => {
    setOptionsModal(false);
    router.push("/(authenticated)/(tabs)/add");
  }
  const handleItems= () => {
    setOptionsModal(false);
         dispatch(setWardrobeType("first"));
      navigation.navigate("items", { refNumber: generateGUID() });

       //  router.push("/(authenticated)/(tabs)/wardrobe?tab=items");
  }
  
  const  handleOutfit = () => {
    setOptionsModal(false);
        dispatch(setWardrobeType("second"));
     router.push("/(authenticated)/(tabs)/wardrobe?tab=outfit");
  }
  
  const handlePlan = () => {
    setOptionsModal(false);
     dispatch(setWardrobeType("third"));
  router.push("/(authenticated)/(tabs)/wardrobe?tab=plan");
  }
    const iconButtons: IconButton[] = [
    { icon: <TshirtComponentSVG />, label: t('create.items'), onPress: handleItems },
    { icon: <OutFitComponentSVG />, label: t('create.outfit'), onPress: handleOutfit },
    { icon: <PlanCalendarSvg />, label: t('create.plan'), onPress: handlePlan },
  ];



  const pickImage = async () => {
    if (!token) {
      // dispatch(setShowModal(true));

      return dispatch(setIsShownLoginModal(true));
    }
    dispatch(setTagedDetails(null));
    setIsShowImageModal(true);
    setIsFileLoader(true);
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission to access camera roll is required!");
      setIsFileLoader(false);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 1,
      base64: false,
      selectionLimit: 1,
    });
    
    setIsFileLoader(false);
    
    if (!result.canceled) {
      setIsFileLoader(true);
      const selectedMedia = result.assets
        .filter((asset: any) => {
          return asset.mimeType.startsWith("image/"); // Only images for stories
        })
        .map((asset: any) => ({
          uri: asset.uri,
          type: "image",
          mimeType: asset.mimeType,
          fileName: asset?.fileName,
          fileSize: asset?.fileSize,
        }));
      setIsFileLoader(false);
      setImages(selectedMedia);
    }
  };

  useEffect(() => {
    setIsShowLoginModal(isShownLoginModal);
  }, [isShownLoginModal]);

  useEffect(() => {
    const removeListener = navigation.addListener("beforeRemove", (e: any) => {
      e.preventDefault();
      navigation.dispatch(e.data.action);
    });
    return removeListener;
  }, [navigation]);

  const handleTabPress = (e: any) => {
    dispatch(setWardrobeType("first"));
    if (!profile) {
      e.preventDefault();
      setIsShowLoginModal(true);
    }
  };

  const renderTabIcon = (route: string, focused: boolean) => {
    switch (route) {
      case "home":
        return focused ? <Home2 width={24} height={24} /> : <Home width={24} height={24} />;
      case "wardrobe":
        return focused ? <Duotone2 width={24} height={24} /> : <Duotone width={24} height={24} />;
      case "add":
        return focused ? <Plus2 width={24} height={24} /> : <Plus width={24} height={24} />;
      case "ai":
        return (
          <AiSVGIcon 
            width={24} 
            height={24}
            color={focused ? "#FF3B4A" : Colors.light.tabIconDefault}
          />
        );
      case "profile":
        return focused ? <Profile2 width={24} height={24} /> : <Profile1 width={24} height={24} />;
      default:
        return null;
    }
  };

  const getTabLabel = React.useCallback((route: string) => {
    const labels: Record<string, string> = {
      "home": t('navigation.home'),
      "wardrobe": t('navigation.wardrobe'),
      "add": t('navigation.add'),
      "ai": t('navigation.aiStylist'),
      "profile": t('navigation.profile')
    };
    return labels[route] || route.charAt(0).toUpperCase() + route.slice(1);
  }, [t]);

  const renderTabLabel = (route: string, focused: boolean) => {
    return (
      <Text
        key={`label-${route}-${locale}`}
        style={{
          color: focused ? "#FF3B4A" : Colors.light.iconText,
          fontFamily: "DMSansRegular",
          fontSize: 12,
        }}
      >
        {getTabLabel(route)}
      </Text>
    );
  };


    const getInitialStories = () => {
    setPageToken("");
    // setGetPost([]);
    setLoading(true);

    timelineServices
      .getStoriesQuery(
        token,

        "12",
        ""
      )
      .then((res: any) => {
        setLoading(false);
        setStories(res?.data?.dataset);

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
    getInitialStories();
  }, []);

  // Force re-render when locale changes
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [locale]);

  return (
    <Provider store={store}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      {isShowLoginModal && (
        <LoginNotificationModal
          isShow={isShowLoginModal}
          onClose={() => {
            setIsShowLoginModal(false);
            dispatch(setIsShownLoginModal(false));
          }}
          handleButtonClose={() => {
            setIsShowLoginModal(false);
            dispatch(setIsShownLoginModal(false));
          }}
        />
      )}

      <Tabs
        key={`${locale}-${forceUpdate}`}
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarLabelStyle: { fontSize: 12, fontFamily: "DMSansRegular" },
          tabBarStyle: {
            paddingTop: Platform.OS === "ios" ? 10 : 0,
            position: "absolute",
          },
        }}
      >
        {["home", "wardrobe", "add", "ai", "profile"].map((route) => (
          <Tabs.Screen
            key={`${route}-${locale}`}
            name={route}
            listeners={{
              tabPress: (e) => {
                if (route === "add") {
                  e.preventDefault();
                  if (!token) {
                    return  dispatch(setIsShownLoginModal(true));
                  
                   
                  }
    
                
                  setOptionsModal(true);
                } else {
                  handleTabPress(e);
                }
              },
            }}
            options={{
              title: route.charAt(0).toUpperCase() + route.slice(1),
              tabBarIcon: ({ focused }) => renderTabIcon(route, focused),
              tabBarLabel: ({ focused }) => renderTabLabel(route, focused),
              headerTransparent: route === "add",
              header: route === "add" ? () => <StackHeader title="" /> : undefined,
            }}
          />
        ))}
      </Tabs>

      <NewBottomModal
        isShow={optionsModal}
        onClose={() => setOptionsModal(false)}
        maxHeight={300}
        contentStyle={{
          backgroundColor: "white",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          width: "100%",
          flex: 1,
        }}
      >
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{t('create.create')}</Text>
          <Pressable onPress={() => setOptionsModal(false)} style={styles.closeButton}>
            <Text style={{ fontSize: 30, fontWeight: "300" }}>×</Text>
          </Pressable>
        </View>
        {/* Modal Options */}
        <View style={{ paddingHorizontal: 16 }}>
          {[
            { label: t('create.newPost'), action:handleNewPost },
            { label: t('create.newStory'), action: handleNewStory},
            { label: t('create.sellItem'), action: handleSellItem },
          ].map(({ label, action }, idx) => (
            <Pressable
              key={label}
              onPress={action}
              style={{
                paddingVertical: 12,
                borderBottomWidth: idx < 2 ? 1 : 0,
                borderTopWidth: idx == 0 ? 1 : 0,
                borderBottomColor: "#eee",
                borderTopColor: "#eee",
              }}
            >
              <Text style={{ fontSize: 14, color: "#6B727E", textAlign: "center" }}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {/* Modal Icon Row */}
        <IconButtonRow buttons={iconButtons} />
      </NewBottomModal>


     
      
{isShowImageModal ? (
        <UploadStatusModal
          isShow
          onClose={() => {
            setImages([]);
            setIsShowImageModal(false);
          }}
          fileDetails={images}
          refetch={getInitialStories}
          loader={isFileLoader}
        />
      ) : null}

   </Provider>
  );
}

const styles = StyleSheet.create({
  iconRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 50,
  },
  buttonWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 35,
    backgroundColor: "#F1F2F6",
    marginBottom: 30,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  pressable: {
    alignItems: "center",
  },
  icon: {
    height: 30,
  },
  label: {
    fontSize: 11,
    color: "#1E2226",
    marginTop: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: "DMSansSemiBold",
    textAlign: "center",
  },
  closeButton: {
    padding: 12,
    position: "absolute",
    right: 16,
  },
});