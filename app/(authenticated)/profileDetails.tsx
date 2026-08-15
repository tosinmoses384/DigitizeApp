import AppTextInput from "@components/AppTextInput";
import { useFormik } from "formik";
import * as Yup from "yup";
import CustomButton from "@components/CustomButton";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import TitleAndChevronRight from "@components/TitleAndChevronRight";
import ContentSwitch from "@components/ContentSwitch";
import LocationModal from "modals/LocationModal";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { capitalizeFirstLetter } from "@helper/capitalize-first-letter";
import identityServices from "@services/features/identity-service/loginService";
import { setRefetchUserState, setProfile, setUserName } from "@redux/slice/profile/profileSlice";
import { useToast } from "react-native-toast-notifications";
import { setTemporaryRoute } from "@redux/slice/temporary-route/temporaryRouteSlice";
// import ImageIcon from "../../assets/images/svg/camera-icon-red.svg";
import fileServerServices from "@services/features/file-server/fileServer";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import { getInitials } from "@helper/getInitials";
import EmailAndPhoneNumber from "@components/EmailAndPhonenumber";
import { useI18n } from "@hooks/use-i18n";
import { PRESET_CONFIGS, useOptimizedImagePicker } from "@hooks/useOptimizedImagePicker";

const ProfileDetailsScreen = () => {
  const { t } = useI18n();
  const toast = useToast();
  const [images, setImages] = useState<any[]>([]);
  const dispatch = useAppDispatch();
  const { profile, token, userName } = useAppSelector(
    (state) => state.userProfileSlice
  );
  const {
    pickImageFromGallery,
    isProcessing: isProfileImageProcessing,
  } = useOptimizedImagePicker(PRESET_CONFIGS.profile);

  const [isShowCity, setIsShowCity] = useState(false);
  const [isShowCountryModal, setIsShowCountryModal] = useState(false);
  const [city, setCity]: any = useState(null);
  const [country, setCountry]: any = useState(null);
  const [profileUpdateLoader, setProfileUpdateLoader] = useState(false);
  const profileValidationSchema = Yup?.object()?.shape({
    bio: Yup.string().optional(),
  });

  useEffect(() => {
    setCity({
      label: profile?.locationName,
      value: profile?.locationId,
      id: profile?.locationId,
    });
    setCountry({
      label: profile?.countryName,
      value: profile?.countryId,
      id: profile?.countryId,
    });
    setIsShowCity(profile?.shouldShowLocation);
  }, [profile]);

  // Fetch profile image and username from marketplace API when component mounts or profile is refetched
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
        } catch {
        }
      }
    };

    fetchProfileDataFromMarketplace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.profileImageUrl, userName, token]);

  const profileFormik = useFormik({
    validationSchema: profileValidationSchema,
    initialValues: {
      bio: capitalizeFirstLetter(profile?.biography || "") || "",
    },
    onSubmit: async (values: any) => {
      setProfileUpdateLoader(true);
      let data = {
        biography: values?.bio,
        countryId: country?.id,
        locationId: city?.id,
        shouldShowLocation: isShowCity,
      };

      let uploadUserPicture = identityServices?.updateProfileDetails(
        data,
        token
      );
      uploadUserPicture
        ?.then((res: any) => {
          if (images?.length) {
            handleUpdate();
          }

          setProfileUpdateLoader(false);

          if (res?.status === 200) {
            dispatch(
              setProfile({
                ...(profile || {}),
                biography: values?.bio,
                countryId: country?.id,
                locationId: city?.id,
                shouldShowLocation: isShowCity,
                countryName: country?.label ?? profile?.countryName,
                locationName: city?.label ?? profile?.locationName,
              })
            );
            dispatch(setRefetchUserState(true));
            dispatch(setTemporaryRoute("/profileDetails"));
            return toast.show(t('settings.operationSuccessful'), {
              type: "success",
              duration: 4000,
            });
          }

          return toast.show(`${res?.message || res?.detail}`, {
            type: "danger",
            duration: 4000,
          });
        })
        .catch(() => {
          setProfileUpdateLoader(false);
        });
    },
  });

  useEffect(() => {
    profileFormik.setFieldValue(
      "bio",
      capitalizeFirstLetter(profile?.biography || "") || ""
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.biography]);

  const pickImage = async () => {
    try {
      setImages([]);

      const result = await pickImageFromGallery({
        mediaTypes: "images",
      });

      const mediaData = {
        imageUri: result.uri,
        type: `image/${result.format}`,
        originalFileSize: result.originalFileSize,
        fileSize: result.fileSize,
        compressionRatio: result.compressionRatio,
      };

      setImages([mediaData]);
    } catch (error) {
      const fallbackMessage =
        t("settings.imageUploadFailed") ||
        "Failed to upload image. Please try again.";

      const parsedErrorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message?: string }).message
          : undefined;

      const normalizedMessage = parsedErrorMessage
        ? parsedErrorMessage.toLowerCase()
        : "";

      if (
        normalizedMessage.includes("cancelled") ||
        normalizedMessage.includes("canceled")
      ) {
        return;
      }

      toast.show(parsedErrorMessage || fallbackMessage, {
        type: "danger",
        duration: 4000,
      });
    }
  };

  const handleUpdate = () => {
    if (images?.length) {
      
      let plartform = Platform.OS === "android" ? true : false;
      
      let uploadUserPicture = fileServerServices?.profileImageUpload(
        [images?.[0]],
        plartform,
        token
      );
      uploadUserPicture
        ?.then((res: any) => {
          
          if (res?.status === 200) {
            
            // Fetch profile image from marketplace API to populate profileImageUrl
            // This API returns trifterProfileImageUrl which is used in posts
            setTimeout(async () => {
              try {
                
                const socialProfileRes = await marketplaceServices.userSocialProfile(token);
                
                const profileData = socialProfileRes?.data as any;
                if (socialProfileRes?.status === 200 && profileData?.trifterProfileImageUrl) {
                  const trifterProfileImageUrl = profileData.trifterProfileImageUrl;
                  
                  // Update profile in Redux with the image URL from marketplace API
                  dispatch(setProfile({
                    ...(profile || {}),
                    profileImageUrl: trifterProfileImageUrl,
                  }));
                } 
              } catch {
              }
            }, 1000); // Wait 1 second for the image to be processed on the backend
            
            dispatch(setRefetchUserState(true));
            dispatch(setTemporaryRoute("/profileDetails"));
            toast.show(t('settings.imageUploadedSuccessfully') || 'Image uploaded successfully', {
              type: "success",
              duration: 4000,
            });
            // setImages([]);
            return;
          }
          if (res?.responseCode === "401" || res?.responseCode === 401) {
            return router.push("/Onboarding");
          }
          return toast.show(`${res?.message || res?.detail}`, {
            type: "danger",
            duration: 4000,
          });
        })
        .catch(() => {
          toast.show(t('settings.imageUploadFailed') || 'Failed to upload image. Please try again.', {
            type: "danger",
            duration: 4000,
          });
        });
    } 
  };

  const name =
    profile?.firstName && profile?.lastName
      ? `${profile?.firstName} ${profile?.lastName}`
      : profile?.emailAddress;

  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={t('settings.profileDetails')}
          onPress={() => router.back()}
          isShowHeaderShadow
        />
        <View style={styles.saveButtonView}>
          <CustomButton
            title={t('common.save')}
            textStyle={styles?.saveText}
            buttonStyle={styles?.saveButton}
            onPress={profileFormik.handleSubmit}
            loader={profileUpdateLoader}
          />
        </View>
      </View>
      <ScrollView style={styles.bodyContainer}>
        <View style={styles.imageViewContainer}>
          <View style={styles.imageView}>
            {images[0]?.imageUri || profile?.profileImageUrl ? (
              <Image
                source={{
                  uri: images[0]?.imageUri || profile?.profileImageUrl,
                }}
                style={{ width: 56, height: 56, borderRadius: 56 }}
              />
            ) : (
              <Text
                style={{
                  fontFamily: "DMSansSemiBold",
                }}
              >
                {getInitials(name)}
              </Text>
            )}
          </View>
          <View style={{ marginLeft: 8 }}>
            <CustomButton
              title={t('settings.changePhoto')}
              textStyle={styles.changeBtnText}
              onPress={pickImage}
              loader={isProfileImageProcessing}
            />
            {/* )} */}
          </View>
        </View>
        <View style={{ marginVertical: 16 }}>
          <AppTextInput
            isMultiline
            onChangeText={profileFormik.handleChange("bio")}
            value={profileFormik?.values?.bio}
            error={profileFormik.submitCount > 0 && profileFormik.errors.bio}
            placeholder={t('settings.tellUsAboutYourself')}
          />
        </View>
        <View style={{ marginBottom: 16 }}>
          <EmailAndPhoneNumber
            value={t('profile.username')}
            hasSubtitle={<Text style={styles.userNameText}>{userName}</Text>}
            onPress={() => router.push("/ChangeUserName")}
          />
        </View>
        <View style={styles.locationView}>
          <TitleAndChevronRight
            title={t('settings.myLocation')}
            iconTextRight={
              country && city
                ? `${capitalizeFirstLetter(
                    country?.label || ""
                  )}, ${capitalizeFirstLetter(city?.label || "")}`
                : t('settings.myLocation')
            }
            customStyle={styles.location}
          />
          <ContentSwitch
            title={t('settings.showCityInProfile')}
            handleSwitch={() => setIsShowCity(!isShowCity)}
            switchValue={isShowCity}
          />
        </View>
      </ScrollView>
      {isShowCountryModal && (
        <LocationModal
          getSelectedCity={(city: string) => {
            setCity(city);
          }}
          getSelectedCountry={(country: string) => {
            setCountry(country);
          }}
          isShow
          onClose={() => setIsShowCountryModal(false)}
        />
      )}
    </View>
  );
};

export default ProfileDetailsScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
    paddingBottom: 10,
  },
  saveButtonView: {
    position: "absolute",
    top: 12,
    right: 16,
  },
  bodyContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  imageViewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  imageView: {
    width: 56,
    height: 56,
    borderRadius: 56,
    backgroundColor: "#E2E9F0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  changeBtnText: {
    fontSize: 12,
    color: "#232323",
    fontFamily: "DMSansMedium",
  },
  locationView: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
  },
  location: {
    borderBottomColor: "#EDF2F7",
    borderBottomWidth: 1,
  },
  saveButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  saveText: {
    color: "#212C3D",
    fontSize: 14,
    fontFamily: "DMSansSemiBold",
  },
  saveImageBtn: {
    backgroundColor: "#FF3B4A",
    paddingVertical: 10,
  },
  saveImageBtnText: {
    fontSize: 12,
    color: "white",
  },
  userNameText: {
    fontSize: 12,
    color: "#393939",
    fontFamily: "DMSansMedium",
    textTransform: "capitalize",
    flex: 1,
  },
});
