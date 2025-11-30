import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// import RNFS from "react-native-fs";
import { Colors, SIZES } from "../../constants/Colors";
import { useFormik } from "formik";
import * as FileSystem from "expo-file-system";
import * as Yup from "yup";
import StackHeader from "../../components/StackHeader";
import { router, useFocusEffect } from "expo-router";
import UploadIcon from "../../assets/images/svg/upload.svg";
import CameraIcon from "../../assets/images/svg/camera.svg";
import RightIcon from "../../assets/images/svg/chevron-down-arrow.svg";

import { Image } from "react-native";
import { fontSz } from "../../constants";
import * as ImagePicker from "expo-image-picker";

import DeleteIcon from "../../assets/images/svg/delete.svg";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import Pics1 from "../../assets/images/svg/pics1.svg";
import Pics2 from "../../assets/images/svg/pics2.svg";
import { Ionicons } from "@expo/vector-icons";
import FilledButton from "../../components/buttons/Filled_button";
import { TextInput } from "react-native-gesture-handler";
import MyResponsiveGrid from "../../components/MyResponsiveGrid";
import SelectWithDrawer from "../../components/SelectWithDrawer";
import SelectItemBrandModal from "../../modals/SelectItemBrandModal";
import SelectItemColorModal from "../../modals/SelectItemColorModal";
import SelectItemSizeModal from "../../modals/SelectItemSizeModal";
import fileServerServices from "../../services/features/file-server/fileServer";
import { useAppSelector } from "../../redux/store";
import { useRoute } from "@react-navigation/native";
import { useToast } from "react-native-toast-notifications";
import wardrobeServices from "../../services/features/wardrobe-service/wardrobeServices";
import SelectItemCategoryModal from "modals/SelectItemCategoryModal";
import { generateGUID } from "@helper/guid-number";

const { width: screenWidth } = Dimensions.get("window");

type Errors = {
  title?: string;
  description?: string;
  images?: string;
  category?: string;
  brand?: string;
  size?: string;
  condition?: string;
  color?: string;
  material?: string;
  price?: string;
};

const Itemz = () => {
  const toast = useToast();
  const route = useRoute();
  const { refNumber }: any = route.params;
  const { profile, refetchUserState, token } = useAppSelector(
    (state) => state?.userProfileSlice
  );
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const bottomSheetModalRef2 = useRef<BottomSheetModal>(null);
  const [selectedSize, setSelectedSize] = useState("Size");
  const [selectedBrand, setSelectedBrand] = useState("Brand");
  const [images, setImages] = useState<any>(null);
  const [imageBase64, setImageBase64] = useState<any[]>([]);

  const [color, setColor] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const snapPoints = useMemo(() => ["25%", "50%", "80%"], []);
  const [isNextClicked, setIsNextClicked] = useState(false);
  const [cardWidth, setCardWidth] = useState(172);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const [activeOption, setActiveOption] = useState(null);
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const [drawerType, setDrawerType] = useState(null);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const [selectedColourId, setSelectedColourIds] = useState("");
  const toggleOption = (option) => {
    const isExpanded = activeOption === option;
    setActiveOption(isExpanded ? null : option);
    Animated.timing(rotationAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    setSelectedBrandId("");
    setSelectedSizeId("");
    setSelectedColourIds("");
  }, [selectedBrandId, selectedSizeId, selectedColourId]);

  const handleSheetChanges = useCallback((index: number) => {}, []);

  const handleCloseModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);  


  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.3,
      base64: true,
      selectionLimit: 10,
    });

    if (!result.canceled && result.assets.length > 0) {
      console.log("Images selected, starting immediate upload...");
      
      // Start dynamic loading state - no static toast
      setLoader(true); // Start loading state that will persist until API response
      
      try {
        // Upload each image with unique client request ID
      const uploadData = result.assets.map((asset, index) => {
        const clientRequestId = generateGUID();
        console.log(`Preparing image ${index + 1} with ID: ${clientRequestId}`);
        
        return {
          asset,
          clientRequestId,
          imageData: {
            imageUri: asset.uri,
            type: asset.mimeType,
          }
        };
      });
      
      const uploadPromises = uploadData.map(async ({ imageData, clientRequestId }) => {
        let platform = Platform.OS === "android" ? true : false;
        const result = await fileServerServices.itemImageUpload(
          [imageData], 
          platform, 
          clientRequestId, // Use unique ID for each image
          token
        );
        
        // Return both the result and the clientRequestId for tracking
        return {
          ...result,
          clientRequestId
        };
      });
      
      // Wait for all uploads to complete
      const uploadResults = await Promise.all(uploadPromises);
      
      // Keep loading state active until complete process finishes
      
      // Check if all uploads were successful
      const allSuccessful = uploadResults.every(res => res?.status === 200);
      
      if (allSuccessful) {
        // toast.show("Images uploaded successfully!", {
        //   type: "success",
        //   duration: 3000,
        // });
        
        // Store uploaded image data for metadata editing
        const uploadedImages = uploadData.map((data, index) => ({
          imageUri: data.asset.uri,
          type: data.asset.mimeType,
          clientRequestId: data.clientRequestId,
          uploaded: true,
          uploadResult: uploadResults[index],
        }));
        
       // setImages(uploadedImages);
        
        // Submit all uploaded image request IDs to server
        console.log("Images uploaded, submitting all request IDs to server");
        
        // Collect all request IDs from uploaded images
        const allRequestIds = uploadedImages.map(img => img.clientRequestId);
        console.log("All request IDs to submit:", allRequestIds);
        
        // Call submitItemToServer with all request IDs
        await submitItemToServer(allRequestIds);
          
        } else {
          // Handle partial failures
          const failedUploads = uploadResults.filter(res => res?.status !== 200);
          toast.show(`Failed to upload ${failedUploads.length} image(s). Please try again.`, {
            type: "danger",
            duration: 4000,
          });
        }
        
      } catch (error) {
        setLoader(false);
        console.error("Error uploading images:", error);
        toast.show("Failed to upload images. Please try again.", {
          type: "danger",
          duration: 4000,
        });
      }
      
      setErrors((prevErrors) => ({ ...prevErrors, images: "" }));
    }
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.2,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      console.log("Camera image captured, starting immediate upload...");
      
      // Start dynamic loading state - no static toast
      setLoader(true); // Start loading state that will persist until API response
      
      try {
        const clientRequestId = generateGUID();
        console.log(`Uploading camera image with ID: ${clientRequestId}`);
        
        const imageData = {
          imageUri: result.assets[0].uri,
          type: result.assets[0].mimeType,
        };
        
        let platform = Platform.OS === "android" ? true : false;
        const uploadResult = await fileServerServices.itemImageUpload(
          [imageData], 
          platform, 
          clientRequestId,
          token
        );
        
        // Keep loading state active until complete process finishes
        
        if (uploadResult?.status === 200) {
          toast.show("Image uploaded successfully!", {
            type: "success",
            duration: 3000,
          });
          
          // Store uploaded image data for metadata editing
          const uploadedImage = {
            imageUri: result.assets[0].uri,
            type: result.assets[0].mimeType,
            clientRequestId: clientRequestId,
            uploaded: true,
            uploadResult: uploadResult,
          };
          
          setImages([uploadedImage]); // Camera only captures one image
          


         
          await submitItemToServer([uploadedImage.clientRequestId]);
          
        } else {
          console.log("❌ Camera image upload failed:", uploadResult);
          setLoader(false); // Stop loading on upload failure
          toast.show("Failed to upload image. Please try again.", {
            type: "danger",
            duration: 4000,
          });
        }
        
      } catch (error) {
        console.error("❌ Error uploading camera image:", error);
        setLoader(false); // Stop loading on error
        toast.show("Failed to upload image. Please try again.", {
          type: "danger",
          duration: 4000,
        });
      }
      
      setErrors((prevErrors) => ({ ...prevErrors, images: "" }));
    }
  };

  const handleCameraPress = () => {
    Alert.alert(
      "Select Option",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: openCamera,
        },
        {
          text: "Pick from Gallery",
          onPress: pickImage,
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const [isShowImageButtonAction, setIsShowImageBottomAction] = useState(false);

  const handleNextPress = () => {
    if (images) {
      setIsShowImageBottomAction(true);
      // bottomSheetModalRef2.current?.present();
    } else {
      Alert.alert("Please add images before proceeding.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      setImages(null);
    }, [])
  );

  const imageTemplate = (
    <View
      // key={index}
      style={[styles.imageWrapper, { width: "100%" }]}
    >
      <Image
        source={{ uri: images?.imageUri }}
        style={[styles.image, { height: 400 }]}
      />
      <TouchableOpacity
        onPress={() => {
          resetForms();
          setImages(null);
        }}
        style={styles.deleteIcon}
      >
        <DeleteIcon width={50} height={50} />
      </TouchableOpacity>
    </View>
  );

  const addItemsValidationSchema = Yup?.object()?.shape({
    brandId: Yup.string().required("Required"),
    sizeId: Yup.string().required("Required"),
    colourId: Yup.string().required("Required"),
    selectedSizeId: Yup.string().required("Required"),
    selectedBrandId: Yup.string().required("Required"),
    selectedcolorId: Yup.string().required("Required"),
    selectedCategoryId: Yup.string().required("Required"),
    categoryId: Yup.string().required("Required"),
  });

  const resetForms = () => {
    setImages(null);
    addItemFormik.resetForm();
  };

  useFocusEffect(
    useCallback(() => {
      resetForms();
    }, [])
  );

  const [loader, setLoader] = useState(false);





  const submitItemToServer = async (requestIds: string[]) => {
    // Loading state already active from image upload, keep it going
    console.log("Starting backend submission with loading state active...");

    try {
      // Silently POST to /v1/items/multiple with all request IDs and empty strings for other fields
      const itemsPayload = requestIds.map(requestId => ({
        requestId: requestId, // Use raw request ID without prefix
        brandId: null,
        categoryId: null,
        sizeId: null,
        colourIds: [null]
      }));

      console.log("Submitting to backend API...", itemsPayload);
      
      // Wait for API response
      const res = await wardrobeServices?.submitMultipleItems(itemsPayload, token);
      
      console.log("API response received:", res);
      
      // Stop loading after API response
      setLoader(false);
      
      if (res?.status === 200) {
        resetForms();
        
        // Navigate to multi-edit page with uploaded image data
        const uploadedImagesData = requestIds.map(requestId => ({
          imageUri: images,
          type: 'image',
          clientRequestId: requestId,
          uploaded: true,
          uploadResult: res
        }));

        console.log("✅ Backend submission successful, navigating to wardrobe");
        router.replace('/(authenticated)/(tabs)/wardrobe');
        
        return toast.show(`${res?.detail || res?.message || 'Items uploaded successfully'}`, {
          type: "success",
          duration: 4000,
        });
      }

      if (res?.responseCode === 401) {
        return router.replace("/Onboarding");
      }

      console.log("❌ Backend submission failed:", res);
      return toast.show(`${res?.detail || res?.message || 'Upload failed'}`, {
        type: "danger",
        duration: 4000,
      });
      
    } catch (error) {
      console.error("❌ Backend submission error:", error);
      setLoader(false); // Stop loading on error
      return toast.show("An error occurred. Please try again later.", {
        type: "danger",
        duration: 4000,
      });
    }
  };




  const uploadImageToServer = async (values: any) => {
    if (token && images) {
      setLoader(true);
      let plartform = Platform.OS == "android" ? true : false;
      fileServerServices
        ?.itemImageUpload([images], plartform, refNumber, token)
        ?.then((res: any) => {
         // setLoader(false);

          if (res?.status === 200) {
            return submitItemToServer(values);
          }

          if (res?.responseCode === 401) {
            return router.replace("/Onboarding");
          }

          console.log("error from uploading image>>>", res);

          return toast.show(`${res?.Message || res?.message || res?.detail}`, {
            type: "danger",
            duration: 4000,
          });
        })
        .catch(() => {
          setLoader(false);
          setImages(null);
        });
      return;
    }
  };

  const addItemFormik = useFormik({
    validationSchema: addItemsValidationSchema,
    initialValues: {
      brandId: "",
      sizeId: "",
      colourId: "",
      selectedSizeId: "",
      selectedBrandId: "",
      selectedcolorId: "",
      categoryId: "",
      selectedCategoryId: "",
    },
    onSubmit: async (values: any) => {
      let valuesData: any = {
        requestId: refNumber,
        brandId: values?.selectedBrandId,
        sizeId: values?.selectedSizeId,
        colourIds: [values?.selectedcolorId],
        categoryId: values?.selectedCategoryId,
      };
      uploadImageToServer(valuesData);
    },
  });

  return (
    <BottomSheetModalProvider>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
          paddingHorizontal: 20,
        }}
      >
        <StackHeader
          title={images ? "Add item" : "Add to wardrobe"}
          onPress={() => router.back()}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        >
          <View
            style={{
              flex: 1,

              borderColor: "#E2E9F0",
              borderWidth: 1,
              borderRadius: 10,

              maxHeight: "100%",
              flexDirection: "row",
              alignItems: "center",
              // backgroundColor: "blue",
            }}
          >
            {!images && (
              <View style={styles.instructionsContainer}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={pickImage}
                >
                  <UploadIcon width={20} height={20} />
                  <Text style={styles.uploadText}>Upload photos</Text>
                </TouchableOpacity>
                <View style={styles.textContainer}>
                  <Text style={styles.textBold}>
                    We recommend capturing the item only in a flat-lay position,
                    taken from directly above the item.
                  </Text>
                  <Text style={styles.textBold}>
                    We will automatically remove the background for a cleaner
                    look.
                  </Text>
                </View>
                <Text onPress={handlePresentModalPress} style={styles.textLink}>
                  See photo tips
                </Text>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginTop: 96,
                    alignItems: "center",
                  }}
                  onPress={handleCameraPress}
                >
                  <CameraIcon width={20} height={20} />
                  <Text style={styles.textLink2}>{"  "}Open camera</Text>
                </TouchableOpacity>
              </View>
            )}
            {images && (
              <ScrollView style={{ height: "100%" }}>
                {imageTemplate}
              </ScrollView>
            )}
          </View>
          {isShowImageButtonAction && images ? (
            <View>
              <View style={{ marginVertical: 10 }}>
                <SelectWithDrawer
                  value={addItemFormik?.values?.brandId || "Brand"}
                  onPress={() => setDrawerType("brand")}
                  error={
                    addItemFormik.submitCount > 0 &&
                    addItemFormik.errors.brandId
                  }
                  activeColor={addItemFormik?.values?.brandId && "black"}
                />
              </View>
              <View style={{ marginVertical: 10 }}>
                <SelectWithDrawer
                  value={addItemFormik?.values?.sizeId || "Size"}
                  onPress={() => setDrawerType("size")}
                  error={
                    addItemFormik.submitCount > 0 && addItemFormik.errors.sizeId
                  }
                  activeColor={addItemFormik?.values?.sizeId && "black"}
                />
              </View>
              <View style={{ marginVertical: 10 }}>
                <SelectWithDrawer
                  value={addItemFormik?.values?.colourId || "Colour"}
                  onPress={() => setDrawerType("colour")}
                  error={
                    addItemFormik.submitCount > 0 &&
                    addItemFormik.errors.colourId
                  }
                  activeColor={addItemFormik?.values?.colourId && "black"}
                />
              </View>
              <View style={{ marginVertical: 10 }}>
                <SelectWithDrawer
                  value={addItemFormik?.values?.categoryId || "Category"}
                  onPress={() => setDrawerType("category")}
                  activeColor={addItemFormik?.values?.categoryId && "black"}
                  error={
                    addItemFormik.submitCount > 0 &&
                    addItemFormik.errors.categoryId
                  }
                />
              </View>
            </View>
          ) : (
            <></>
          )}

          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={2}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            enableDismissOnClose={true}
          >
            <BottomSheetView style={styles.contentContainer}>
              <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Photo tips</Text>
                <TouchableOpacity
                  style={styles.closeIconContainer}
                  onPress={handleCloseModal}
                >
                  <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>
              </View>

              <BottomSheetScrollView
                contentContainerStyle={styles.scrollContentContainer}
              >
                {[
                  {
                    image1: (
                      <Pics1
                        width={screenWidth * 0.4}
                        height={screenWidth * 0.45}
                      />
                    ),
                    image2: (
                      <Pics2
                        width={screenWidth * 0.4}
                        height={screenWidth * 0.45}
                      />
                    ),
                    text: "Take photos in a well lit area. Bright daylight is best",
                    text1: "Choose natural light",
                  },
                  {
                    image1: (
                      <Pics1
                        width={screenWidth * 0.4}
                        height={screenWidth * 0.45}
                      />
                    ),
                    image2: (
                      <Pics1
                        width={screenWidth * 0.4}
                        height={screenWidth * 0.45}
                      />
                    ),
                    text: "Take photos in a well lit area. Bright daylight is best",
                    text1: "Pick a neutral background",
                  },
                  {
                    image1: (
                      <Pics1
                        width={screenWidth * 0.4}
                        height={screenWidth * 0.45}
                      />
                    ),
                    image2: (
                      <Pics1
                        width={screenWidth * 0.4}
                        height={screenWidth * 0.45}
                      />
                    ),
                    text: "Take photos in a well lit area. Bright daylight is best",
                    text1: "Don’t use flash",
                  },
                ].map(({ image1, image2, text, text1 }, index) => (
                  <View key={index}>
                    <Text style={styles.rowTextMain}>{text1}</Text>

                    <View style={styles.imageContainerPics}>
                      {image1}
                      {image2}
                    </View>
                    <Text style={styles.rowText}>{text}</Text>
                  </View>
                ))}
              </BottomSheetScrollView>
            </BottomSheetView>
          </BottomSheetModal>
        </ScrollView>

        {images ? (
          <View
            style={{ justifyContent: "flex-end", padding: 5, marginBottom: 20 }}
          >
            <FilledButton
              title={isShowImageButtonAction && images ? "Save Item" : "Next"}
              loading={loader}
              onPress={
                isShowImageButtonAction && images
                  ? addItemFormik?.handleSubmit
                  : handleNextPress
              }
            />
          </View>
        ) : (
          ""
        )}
      </View>

      {drawerType === "category" && true && (
        <SelectItemCategoryModal
          isShow={drawerType === "category" && true}
          onClose={() => setDrawerType(null)}
          name="categoryId"
          onSelect={(e) => {
            addItemFormik?.setFieldValue("categoryId", e?.target?.value);
            addItemFormik?.setFieldValue("selectedCategoryId", e?.target?.id);
            addItemFormik?.setFieldError("categoryId", "");
            addItemFormik?.setFieldError("selectedCategoryId", "");
            setDrawerType(null);
          }}
        />
      )}

      {drawerType === "colour" && true && (
        <SelectItemColorModal
          isShow={drawerType === "colour" && true}
          onClose={() => setDrawerType(null)}
          name="colourId"
          onSelect={(e) => {
            addItemFormik?.setFieldValue("colourId", e?.target?.value);
            addItemFormik?.setFieldValue("selectedcolorId", e?.target?.id);
            setDrawerType(null);
          }}
        />
      )}

      {drawerType === "brand" && true && (
        <SelectItemBrandModal
          isShow={drawerType === "brand" && true}
          onClose={() => setDrawerType(null)}
          name="brandId"
          onSelect={(e) => {
            addItemFormik?.setFieldValue("brandId", e?.target?.value);
            addItemFormik?.setFieldValue("selectedBrandId", e?.target?.id);
            setDrawerType(null);
          }}
        />
      )}

      {/* selectedSizeId:"", */}
      {drawerType === "size" && true && (
        <SelectItemSizeModal
          isShow={drawerType === "size" && true}
          onClose={() => setDrawerType(null)}
          name="sizeId"
          onSelect={(e) => {
            addItemFormik?.setFieldValue("sizeId", e?.target?.value);
            addItemFormik?.setFieldValue("selectedSizeId", e?.target?.id);
            setDrawerType(null);
          }}
        />
      )}
      
      {/* Loading Overlay */}
      {loader && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" color="FF3B4A" />
            <Text style={{ marginTop: 10, fontSize: 16, fontWeight: '500' }}>
              Uploading items...
            </Text>
          </View>
        </View>
      )}
    </BottomSheetModalProvider>
  );
};

export default Itemz;

const styles = StyleSheet.create({
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 12,
    borderColor: "#464F5D",
    borderWidth: 1,
    marginTop: 20,
    marginHorizontal: 60,
  },
  contentContainer: {
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    top: -20,
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    textAlign: "center",
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbf9f9",
    paddingVertical: 20,
    paddingLeft: 10,
    justifyContent: "space-between",
    borderRadius: 12,
  },
  optionList: {
    marginVertical: 2,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#dddddd53",
    gap: 20,
    paddingVertical: 10,
  },
  colorInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbf9f9",
    borderRadius: 12,
    padding: 10,
  },
  closeIconContainer: {
    position: "absolute",
    right: 10,
    zIndex: 1,
  },
  textLink: {
    color: "#D4313E",
    textDecorationLine: "underline",
    fontFamily: "DMSansRegular",
    fontSize: fontSz(14),
    textAlign: "center",
  },
  textLink2: {
    fontFamily: "DMSansRegular",
    fontSize: fontSz(14),
    textAlign: "center",
  },
  rowText: {
    textAlign: "left",
    paddingTop: 10,
    color: "#787878",
    fontFamily: "DMSansRegular",
  },
  label: {
    color: "#212C3D",
    fontFamily: "DMSansMedium",
    fontSize: 14,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    fontFamily: "DMSansBold",
    fontSize: fontSz(14),
    marginLeft: 10,
  },
  rowTextMain: {
    textAlign: "left",
    paddingTop: 10,
    fontFamily: "DMSansBold",
  },
  instructionsContainer: {
    padding: 30,
  },
  textContainer: {
    flexDirection: "column",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  imageWrapper: {
    position: "relative",
    margin: 5,
  },
  textBold: {
    textAlign: "center",
    fontFamily: "DMSansRegular",
    color: "#90959E",
    fontSize: fontSz(14),
  },
  uploadText: {
    marginLeft: 5,
    fontFamily: "DMSansMedium",
    fontSize: fontSz(14),
    color: "#464F5D",
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  imageContainerPics: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
    gap: 20,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  image: {
    width: "100%",

    marginTop: 10,
    borderRadius: 5,
    resizeMode: "cover",
  },
  title: {
    fontSize: fontSz(14),
    marginVertical: 10,
    fontFamily: "DMSansMedium",
    color: "#353535",
  },
  deleteIcon: {
    position: "absolute",
    top: 10,
    right: -2,
  },
});
