
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Pressable,
} from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";

import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { getInitials } from "@helper/getInitials";
import { capitalizeFirstLetter } from "@helper/capitalize-first-letter";
import { setProfile, setUserName } from "../../../redux/slice/profile/profileSlice";
import marketplaceServices from "../../../services/features/marketplace/marketplaceServices";

import { Colors, SIZES, primaryLight } from "../../../constants/Colors";
import { fontSz } from "../../../constants";

import HeadsetMic from "../../../assets/images/svg/headset_mic.svg";
import Balance from "../../../assets/images/svg/balance.svg";
import File from "../../../assets/images/svg/file.svg";
import Holiday from "../../../assets/images/svg/holiday.svg";
import Emoticon from "../../../assets/images/svg/insert_emoticon.svg";
import Lock from "../../../assets/images/svg/lock.svg";
import Settings from "../../../assets/images/svg/settings.svg";
import Percentage from "../../../assets/images/svg/uil_percentage.svg";
import Love from "../../../assets/images/svg/love.svg";
import InfoIcon from "../../../assets/images/svg/info.svg";
import ChevronRightArrow from "../../../assets/images/svg/chevron-right-arrow.svg";
import Receipt from "../../../assets/images/svg/receipt-payment.svg";
import ViewProfileSvg from "@assets/images/svg_components/view_profile_component";
import ShareProfileSvg from "@assets/images/svg_components/share_Profile_component";
import PersonalsationSettingsSvg from "@assets/images/svg_components/personalizations_seetings_svg";
import ProfileDetailsIcon from "@assets/images/svg/profile1.svg";
import { useToast } from "react-native-toast-notifications";
import ShareModal from "../../../modals/ShareModal";
import { useI18n } from "@hooks/use-i18n";
import TermsModal from "@components/modals/TermsModal";
import PrivacyModal from "@components/modals/PrivacyModal";

const Profile = () => {
  const dispatch = useAppDispatch();
  const { profile, token, userName } = useAppSelector((state) => state?.userProfileSlice);
  const toast = useToast();
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [showTermsModal, setShowTermsModal] = React.useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = React.useState(false);
  const { t } = useI18n();

  // Fetch profile image and username from marketplace API when component mounts
  // This ensures the profileImageUrl and userName are populated even if identity API returns empty values
  useEffect(() => {
    const fetchProfileDataFromMarketplace = async () => {
      // Only fetch if profileImageUrl or userName is empty and we have a token
      if (token && (!profile?.profileImageUrl || !userName)) {
        try {
          const socialProfileRes = await marketplaceServices.userSocialProfile(token);
          const profileData = socialProfileRes?.data as any;
          
          if (socialProfileRes?.status === 200) {
            // Update profile image URL if it's empty
            if (!profile?.profileImageUrl && profileData?.trifterProfileImageUrl) {
              const trifterProfileImageUrl = profileData.trifterProfileImageUrl; 
              dispatch(setProfile({
                ...(profile || {}),
                profileImageUrl: trifterProfileImageUrl,
              }));
            }
            
            // Update username if it's empty
            if (!userName && profileData?.trifterName) {
              const trifterName = profileData.trifterName;
              dispatch(setUserName(trifterName));
            }
          }
        } catch (error) {
        }
      }
    };

    fetchProfileDataFromMarketplace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.profileImageUrl, userName, token]);

  const sections = [
    {
      title: t('profile.general'),
      items: [
        { text: t('profile.profileDetails'), icon: ProfileDetailsIcon, screen: "/profileDetails" },
        { text: t('profile.helpAndSupport'), icon: HeadsetMic, screen: "/helpCenter" },
        { text: t('navigation.favorites'), icon: Love, screen: "/favorites" },
        { text: t('profile.personalisation'), icon: PersonalsationSettingsSvg, screen: "/personalisation" },
        { text: t('navigation.settings'), icon: Settings, screen: "/settings" },
        { text: t('profile.cookieSettings'), icon: Lock, screen: "/cookieSettings" },
        { text: t('profile.aboutDigitizeApp'), icon: InfoIcon, screen: "/about" },
        { text: t('profile.legalInformation'), icon: File, screen: "/legal" },
        { text: t('profile.ourPlatform'), icon: InfoIcon, screen: "/platform" },
        { text: t('profile.sendYourFeedback'), icon: Emoticon, screen: "/feedback" },
      ],
    },
    {
      title: t('profile.wardrobeSection'),
      items: [
        { text: t('profile.privacy'), icon: Lock, screen: "/wardrobePrivacy" },
      ],
    },
    {
      title: t('profile.prelovedSection'),
      items: [
        { text: t('profile.balance'), icon: Balance, screen: "/balance" },
        { text: t('profile.myOrders'), icon: Receipt, screen: "/order" },
        { text: t('profile.bundleDiscounts'), icon: Percentage, screen: "/bundleDiscounts" },
        { text: t('profile.holidayMode'), icon: Holiday, screen: "/holidayMode" },
      ],
    },
    {
      title: t('profile.socialsSection'),
      items: [
        { text: t('profile.personalisation'), icon: PersonalsationSettingsSvg, screen: "" },
      ],
    },
  ];

  const shareUrl = React.useCallback(() => {
    setShowShareModal(true);
  }, []);

  const handlePrivacyPolicyPress = React.useCallback(() => {
    setShowPrivacyModal(true);
  }, []);

  const handleTermsPress = React.useCallback(() => {
    setShowTermsModal(true);
  }, []);

  const handleCloseTermsModal = React.useCallback(() => {
    setShowTermsModal(false);
  }, []);

  const handleClosePrivacyModal = React.useCallback(() => {
    setShowPrivacyModal(false);
  }, []);


  const renderSection = (title: string, items: any[]) => (
    <View style={styles.sectionWrapper}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.row, index === items.length - 1 && styles.lastRow]}
            onPress={() => {
              if (item?.screen === "") {
                return;
              }
              router.push(item.screen);
            }}
          >
            <View style={styles.iconContainer}>
              <item.icon color="#90959E" width={15} height={15} />
            </View>
            <Text style={styles.rowText}>{item.text}</Text>
            <ChevronRightArrow width={16} height={16} color="#90959E" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
  const renderProfile = () => (
    <View style={styles.profileCard}>
      <TouchableOpacity onPress={() => router.push("/profileMain")}> 
        {profile?.profileImageUrl ? (
          <Image source={{ uri: profile.profileImageUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.initialsContainer}>
            <Text style={styles.initialsText}>
              {getInitials(`${profile?.firstName || ""} ${profile?.lastName || ""}`)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.name}>{`${capitalizeFirstLetter(profile?.firstName || "")} ${capitalizeFirstLetter(profile?.lastName || "")}`}</Text>
      {profile?.shouldShowLocation && [profile?.locationName, profile?.countryName].filter(Boolean).length > 0 && (
        <Text style={styles.location}>
          {[profile?.locationName, profile?.countryName].filter(Boolean).join(", ")}
        </Text>
      )}
    < View  style={ {flexDirection: "row", alignItems: "center",}}>  
      <TouchableOpacity 
        style={styles.viewProfileButton} 
        onPress={() => router.push("/profileMain")}
        accessibilityLabel={t('profile.viewProfile')}
        accessibilityRole="button"
      > 

     <ViewProfileSvg/>
    
        {/* <Text style={styles.viewProfileText}>View Profile</Text> */}
      </TouchableOpacity> 


  <TouchableOpacity 
    style={styles.viewProfileButton} 
    onPress={() => shareUrl()}
    accessibilityLabel={t('profile.shareProfile')}
    accessibilityRole="button"
  > 
      <ShareProfileSvg/>
        </TouchableOpacity> 
      </View>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      {profile && (
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderProfile()}
          {sections.map((section, idx) => (
            <React.Fragment key={idx}>{renderSection(section.title, section.items)}</React.Fragment>
          ))}

          <View style={styles.footer}>
            <Pressable 
              onPress={handlePrivacyPolicyPress}
              accessibilityLabel={t('legal.privacyPolicy')}
              accessibilityRole="button"
            > 
              <Text style={styles.footerLink}>{t('legal.privacyPolicy')}</Text>
            </Pressable>
            <Text style={styles.footerDot}>•</Text>
            <Pressable 
              onPress={handleTermsPress}
              accessibilityLabel={t('legal.termsAndConditions')}
              accessibilityRole="button"
            > 
              <Text style={styles.footerLink}>{t('legal.termsAndConditions')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
      
      {/* Standardized ShareModal for profile sharing */}
      <ShareModal
        isShow={showShareModal}
        onClose={() => setShowShareModal(false)}
        profileData={profile}
        shareType="profile"
      />

      <TermsModal
        visible={showTermsModal}
        onClose={handleCloseTermsModal}
      />

      <PrivacyModal
        visible={showPrivacyModal}
        onClose={handleClosePrivacyModal}
      />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 30,
    width: "90%",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  initialsContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    fontSize: 28,
    fontFamily: "DMSansBold",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    fontFamily: "DMSansBold",
  },
  location: {
    fontSize: 14,
    color: "gray",
    marginTop: 2,
    fontFamily: "DMSansMedium",
    textAlign: "center",
    textTransform: "capitalize",
  },
  viewProfileButton: {
    marginTop: 10,
    marginHorizontal: 5,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 20,
    transform: [{ scale: 1.2 }], // Scale up the entire button and SVG
    backgroundColor: Colors.light.background,
   
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.primaryBase,
    fontFamily: "DMSansBold",
  },
  sectionWrapper: {
    width: "90%",
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 0,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#071827",
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: "DMSansMedium",
    backgroundColor: "#F9FAFB",
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowText: {
    flex: 1,
    marginLeft: 16,
    fontSize: fontSz(15),
    color: "#1F2937",
    fontFamily: "DMSansMedium",
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  footerLink: {
    fontSize: 14,
    color: "#010101",
    fontFamily: "DMSansMedium",
  },
  footerDot: {
    fontSize: 14,
    color: "#010101",
    marginHorizontal: 8,
    fontFamily: "DMSansMedium",
  },
});
