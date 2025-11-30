import { useFormik } from "formik";
import * as Yup from "yup";
import MyResponsiveGrid from "@components/MyResponsiveGrid";
import StackHeader from "@components/StackHeader";
import { Colors } from "@constants/Colors";
import { useAppDispatch, useAppSelector } from "@redux/store";
import fileServerServices from "@services/features/file-server/fileServer";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import ImageIcon from "../../../assets/images/svg/image-icon.svg";
import CloseIcon from "../../../assets/images/svg/x-close.svg";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";
import { StatusBar } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { compressImage } from "../../../utils/imageCompression";
import * as FileSystem from "expo-file-system";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useToast } from "react-native-toast-notifications";
import AppTextInput from "@components/AppTextInput";
import { capitalizeFirstLetter } from "@helper/capiterlize-first-letter";
import SelectWithDrawer from "@components/SelectWithDrawer";
import { formatCurrency } from "@helper/formatNumber";
import SelectItemCategoryModal from "modals/SelectItemCategoryModal";
import SelectItemConditionModal from "modals/SelectItemConditionModal";
import SelectItemMaterialsModal from "modals/SelectItemMaterialModal";
import FilledButton from "@components/buttons/Filled_button";
import SelectItemBrandModal from "modals/SelectItemBrandModal";
import SelectItemSizeModal from "modals/SelectItemSizeModal";
import SelectItemColorModal from "modals/SelectItemColorModal";
import { setProfileTab } from "@redux/slice/profile/profileSlice";
import CustomButton from "@components/CustomButton";
import SelecParcelModal from "modals/SelectParcelModal";
import { useApiService } from "@hooks/use-auth-guard/useApiService";

const EditProfileItem = () => {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { callApi } = useApiService();
  const { id }: any = useLocalSearchParams();
  const { itemSize } = useAppSelector((state) => state?.itemSizeSlice);
  const { colors } = useAppSelector((state) => state?.colorSlice);
  const { token, profile } = useAppSelector((state) => state?.userProfileSlice);
  const { itemMaterials } = useAppSelector(
    (state) => state?.itemMaterialsSlice
  );
  const [imageRequestId, setImageRequestId] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [imageLoader, setImageLoader] = useState(false);
  const [cardWidth, setCardWidth] = useState(172);
  const [images, setImages] = useState<any[]>([]);
  const [loader, setLoader] = useState(false);
  const [addImageFromServer, setAddImageFromServer] = useState<any[]>([
    "uploadImage",
  ]);
  const [deleteImageName, setDeleteImageName] = useState(null);
  const [drawerType, setDrawerType]: any = useState(null);
  const getImagesFromServer = () => {
    setImageLoader(true);

    fileServerServices
      ?.getUserItemListPicture(token, imageRequestId)
      .then((res: any) => {
        setImageLoader(false);

        if (res?.status === 200) {
          setAddImageFromServer(["uploadImage", ...res?.data]);

          return;
        }
        setImages(["uploadImage"]);
      })
      .catch((err) => {
        setImageLoader(false);
        setImages(["uploadImage"]);
      });
  };

  useEffect(() => {
    if (token && images?.length && imageRequestId) {
      setImageLoader(true);
      let plartform = Platform.OS == "android" ? true : false;

      images?.map((imageList) => {
        fileServerServices
          ?.itemImageUpload([imageList], plartform, imageRequestId, token)
          ?.then((res: any) => {
            setImageLoader(false);
            setImages([]);
            if (res?.status === 200) {
              getImagesFromServer();

              return;

              // return toast.show(`${res?.message || res?.detail}`, {
              //   type: "success",
              //   duration: 4000,
              // });
            }
            if (res?.responseCode === 401) {
              return router.push("/Onboarding");
            }

            return toast.show(`${res?.message || res?.detail}`, {
              type: "danger",
              duration: 4000,
            });
          })
          .catch(() => {
            setImageLoader(false);
            setImages([]);
          });
      });

      return;
    }
  }, [token, images]);

  useEffect(() => {
    if (token && imageRequestId) {
      getImagesFromServer();
    }
  }, [token, id, imageRequestId]);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1, // Use max quality, we'll compress after
      base64: false,
      selectionLimit: 10,
    });

    if (!result.canceled) {
      try {
        // Smart compression: only compress images over 4MB
        console.log("Checking image sizes and compressing if needed...");
        const processedImages = await Promise.all(
          result.assets.map(async (asset, index) => {
            // Check if image is over 4MB
            const fileInfo = await FileSystem.getInfoAsync(asset.uri);
            const fileSizeInMB = (fileInfo.exists && 'size' in fileInfo) ? fileInfo.size / (1024 * 1024) : 0;
            
            console.log(`Image ${index + 1}: ${fileSizeInMB.toFixed(2)}MB`);
            
            if (fileSizeInMB > 4) {
              console.log(`Compressing image ${index + 1} (${fileSizeInMB.toFixed(2)}MB)`);
              const compressed = await compressImage(asset.uri, {
                maxSizeInMB: 4,
                quality: 0.9, // Higher quality (90%)
                maxWidth: 3000, // Higher resolution
                maxHeight: 3000 // Higher resolution
              });
              
              console.log(`Compressed to ${(compressed.fileSize / 1024 / 1024).toFixed(2)}MB`);
              
              return {
                imageUri: compressed.uri,
                type: compressed.mimeType,
              };
            } else {
              console.log(`Image ${index + 1} is under 4MB, using original`);
              return {
                imageUri: asset.uri,
                type: asset.mimeType,
              };
            }
          })
        );
        
        setImages((prevImages) => [
          ...prevImages,
          ...processedImages,
        ]);
      } catch (error) {
        console.error('Error compressing images:', error);
        Alert.alert('Error', 'Failed to process images. Please try again.');
      }
      // setErrors((prevErrors: any) => ({ ...prevErrors, images: "" }));
    }
  };

  const addItemsValidationSchema = Yup?.object()?.shape({
    title: Yup.string().required("Required"),
    description: Yup.string().required("Required"),
    categoryId: Yup.string().required("Required"),
    brandId: Yup.string().required("Required"),
    sizeId: Yup.string().required("Required"),
    conditionId: Yup.string().required("Required"),
    colourId: Yup.string().required("Required"),
    materialId: Yup.string().required("Required"),
    parcelId: Yup.string().required("Required"),
    selectedCategoryId: Yup.string().required("Required"),
    selectedBrandId: Yup.string().required("Required"),
    selectedSizeId: Yup.string().required("Required"),
    selectedConditionId: Yup.string().required("Required"),
    selectedColourId: Yup.string().required("Required"),
    selectedMaterialId: Yup.string().required("Required"),
    price: Yup.string().required("Required"),
    selectedParcelId: Yup.string().required("Required"),
  });

  const addItemFormik = useFormik({
    validationSchema: addItemsValidationSchema,
    initialValues: {
      title: "",
      description: "",
      categoryId: "",
      brandId: "",
      sizeId: "",
      conditionId: "",
      colourId: "",
      materialId: "",
      selectedCategoryId: "",
      selectedBrandId: "",
      selectedSizeId: "",
      parcelId: "",
      selectedConditionId: "",
      selectedColourId: "",
      selectedMaterialId: "",
      price: "",
      selectedParcelId: "",
    },
    onSubmit: async (values: any) => {
      setLoader(true);
      if (addImageFromServer?.length === 0) {
        return toast.show(`Image item' must not be empty.`, {
          type: "danger",
          duration: 4000,
        });
      }

      let data: any = {
        // ...(newExistingItemId ? { existingItemId: newExistingItemId } : ""),
        requestId: imageRequestId,
        title: values?.title,
        description: values?.description,
        defaultImageUrl: addImageFromServer[1]?.resourceUrl,
        price: parseInt(values?.price.replace(/,/g, ""), 10),
        categoryId: values?.selectedCategoryId,
        brandId: values?.selectedBrandId,
        sizeId: values?.selectedSizeId,
        conditionId: values?.selectedConditionId,
        colourIds: [values?.selectedColourId],
        materialIds: [values?.selectedMaterialId],
        parcelSizeId: values?.selectedParcelId,
      };

      let getServices = wardrobeServices.editUserItem(data, token, id);

      getServices
        ?.then((res) => {
          setLoader(false);
          if (res?.status === 200) {
            dispatch(setProfileTab("second"));
            return router.replace("/profileMain");
          }
          if (res?.responseCode === 401) {
            return router.replace("/Onboarding");
          }
          // let { errors } = res;
          // const reformatted = Object.fromEntries(
          //   Object.entries(errors).map(([key, value]) => [key, value[0]])
          // );

          // setErrors(reformatted);

          return toast.show(`${res?.message || res?.detail}`, {
            type: "danger",
            duration: 4000,
          });
        })
        .catch((error) => {
          setLoader(false);
          return toast.show(`An error occurred. Please try again later.`, {
            type: "danger",
            duration: 4000,
          });
        });
    },
  });

  const getActiveData = (
    allValues: any,
    findValue: string,
    isLabel?: boolean
  ) => {
    // ("active data", allValues);
    if (isLabel) {
      const getData = allValues?.find(
        (list: any) => list?.label?.toLowerCase() === findValue?.toLowerCase()
      );

      return getData?.id || "";
    }
    const getData = allValues?.find((list: any) => list?.id === findValue);
    return getData?.label || "";
  };

  const getItemById = () => {
    setEditLoading(true);

    wardrobeServices
      .listItemById(token, id)
      .then((res: any) => {
        if (res?.status === 200) {
          setImageRequestId(res?.data?.requestId);
          addItemFormik.setFieldValue("selectedBrandId", res?.data?.brandId);
          addItemFormik.setFieldValue("brandId", res?.data?.brand);
          addItemFormik.setFieldValue("selectedSizeId", res?.data?.sizeId);
          addItemFormik.setFieldValue("price", String(res?.data?.price));
          addItemFormik.setFieldValue(
            "title",
            capitalizeFirstLetter(res?.data?.title || "")
          );
          addItemFormik.setFieldValue(
            "description",
            capitalizeFirstLetter(res?.data?.description || "")
          );

          addItemFormik.setFieldValue(
            "sizeId",
            getActiveData(itemSize, res?.data?.sizeId)
          );

          addItemFormik.setFieldValue(
            "selectedColourId",
            getActiveData(colors, res?.data?.colours[0], true)
          );

          addItemFormik?.setFieldValue(
            "materialId",
            res?.data?.itemMaterials[0]
          );

          addItemFormik?.setFieldValue(
            "selectedMaterialId",
            getActiveData(itemMaterials, res?.data?.itemMaterials[0], true)
          );

          addItemFormik.setFieldValue("colourId", res?.data?.colours[0]);
          addItemFormik?.setFieldValue("categoryId", res?.data?.category);
          addItemFormik?.setFieldValue(
            "selectedCategoryId",
            res?.data?.categoryId
          );
          addItemFormik?.setFieldValue("conditionId", res?.data?.condition);
          addItemFormik?.setFieldValue(
            "selectedConditionId",
            res?.data?.conditionId
          );

          addItemFormik?.setFieldValue("parcelId", res?.data?.itemParcelSize);
          addItemFormik?.setFieldValue(
            "selectedParcelId",
            res?.data?.itemParcelSizeId
          );
          return;
        }
      })
      .catch((error: any) => {
        setEditLoading(false);
      });
  };

  useEffect(() => {
    if (token && id) {
      getItemById();
    }
  }, [token, id]);

  const handleDeleteImage = (data: any) => {
    // ("dataToDelete>>", data);

    setDeleteImageName(data?.resourceName);

    fileServerServices
      .deleteItemImage(
        token,
        encodeURIComponent(data?.requestId),
        data?.resourceName
      )
      .then((res) => {
        setDeleteImageName(null);
        if (res?.status === 200) {
          getImagesFromServer();
          return toast.show(`${res?.message || res?.detail}`, {
            type: "success",
            duration: 4000,
          });
        }
        if (res?.responseCode === 401) {
          return router.push("/Onboarding");
        }

        return toast.show(`${res?.message || res?.detail}`, {
          type: "danger",
          duration: 4000,
        });
      })
      .catch((error) => {
        setDeleteImageName(null);
        return toast.show(`An error occurred. Please try again later.`, {
          type: "danger",
          duration: 4000,
        });
      });
  };

  const imageTemplate = addImageFromServer?.map((imageList, index) => {
    if (imageList === "uploadImage") {
      return (
        <Pressable
          style={({ pressed }) => [
            styles.card,
            { width: cardWidth, opacity: pressed ? 0.5 : 1 },
          ]}
          key={index}
          onPress={imageLoader ? () => {} : pickImage}
        >
          {imageLoader ? (
            <ActivityIndicator />
          ) : (
            <View style={styles.imageUploadContainer}>
              <View style={styles.imageLogo}>
                <ImageIcon />
              </View>
              <Text style={styles.imageText}>
                Add another image
                <Text style={styles.imageTextInner}>Select image</Text>
              </Text>
            </View>
          )}
        </Pressable>
      );
    }

    return (
      <View style={[styles.card, { width: cardWidth }]} key={index}>
        {deleteImageName === imageList?.resourceName ? (
          <ActivityIndicator />
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.deleteContainer,
              pressed && { opacity: 0.5 },
            ]}
            onPress={() => {
              handleDeleteImage(imageList);
            }}
          >
            <CloseIcon width={10} height={10} />
          </Pressable>
        )}

        {deleteImageName === imageList?.resourceName ? (
          ""
        ) : (
          <Image
            source={{ uri: imageList?.resourceUrl }}
            style={styles.imageUploaded}
          />
        )}
      </View>
    );
  });

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: Colors.light.background,
          // paddingHorizontal: 20,
          paddingVertical: 16,
          marginTop: Platform.OS == "android" ? 20 : 20,
        },
      ]}
    >
      <StatusBar backgroundColor={"white"} barStyle={"dark-content"} />
      <StackHeader
        isShowHeaderShadow
        title="Edit"
        onPress={() => router.push("/profileMain")}
      />
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
          <View style={styles.imageContainer}>
            <Text style={styles.imageTitle}>Add image(s)</Text>
            <MyResponsiveGrid
              template={imageTemplate}
              getNumberOfRows={(data: any) => setCardWidth(data)}
            />
          </View>
          <View style={styles.inputViewWrapper}>
            <AppTextInput
              onChangeText={addItemFormik.handleChange("title")}
              value={addItemFormik?.values?.title}
              error={
                addItemFormik.submitCount > 0 && addItemFormik.errors.title
              }
              placeholder="What are you trifting"
              label="Title"
            />
          </View>
          <View style={{ marginVertical: 16 }}>
            <AppTextInput
              isMultiline
              onChangeText={addItemFormik.handleChange("description")}
              value={addItemFormik?.values?.description}
              error={
                addItemFormik.submitCount > 0 &&
                addItemFormik.errors.description
              }
              placeholder="e.g only worn a few times"
              label="Describe item"
            />
          </View>
          <Text style={styles.title}>Item</Text>
          <View style={{ marginVertical: 16 }}>
            <SelectWithDrawer
              value={addItemFormik?.values?.categoryId || "Category"}
              onPress={() => setDrawerType("category")}
              activeColor={addItemFormik?.values?.categoryId && "black"}
              error={
                addItemFormik.submitCount > 0 && addItemFormik.errors.categoryId
              }
            />
          </View>
          <View style={{ marginVertical: 16 }}>
            <SelectWithDrawer
              value={addItemFormik?.values?.brandId || "Brand"}
              onPress={() => setDrawerType("brand")}
              activeColor={addItemFormik?.values?.brandId && "black"}
              error={
                addItemFormik.submitCount > 0 && addItemFormik.errors.brandId
              }
            />
          </View>
          <View style={{ marginVertical: 16 }}>
            <SelectWithDrawer
              value={addItemFormik?.values?.sizeId || "Size"}
              onPress={() => setDrawerType("size")}
              activeColor={addItemFormik?.values?.sizeId && "black"}
              error={
                addItemFormik.submitCount > 0 && addItemFormik.errors.sizeId
              }
            />
          </View>
          <View style={{ marginVertical: 16 }}>
            <SelectWithDrawer
              value={addItemFormik?.values?.colourId || "Colour"}
              activeColor={addItemFormik?.values?.colourId && "black"}
              onPress={() => setDrawerType("colour")}
              error={
                addItemFormik.submitCount > 0 && addItemFormik.errors.colourId
              }
            />
          </View>
          <View style={{ marginVertical: 16 }}>
            <SelectWithDrawer
              value={addItemFormik?.values?.conditionId || "Condition"}
              activeColor={addItemFormik?.values?.conditionId && "black"}
              onPress={() => setDrawerType("condition")}
              error={
                addItemFormik.submitCount > 0 &&
                addItemFormik.errors.conditionId
              }
            />
          </View>
          <View style={{ marginVertical: 16 }}>
            <SelectWithDrawer
              value={
                addItemFormik?.values?.materialId || "Material(Recommended)"
              }
              activeColor={addItemFormik?.values?.materialId && "black"}
              onPress={() => setDrawerType("material")}
              error={
                addItemFormik.submitCount > 0 && addItemFormik.errors.materialId
              }
            />
          </View>
          <View style={{ marginVertical: 16 }}>
            <AppTextInput
              onChangeText={(value) =>
                addItemFormik.setFieldValue("price", formatCurrency(value))
              }
              keyboardType={"numeric"}
              value={addItemFormik?.values?.price}
              error={
                addItemFormik.submitCount > 0 && addItemFormik.errors.price
              }
              placeholder="Price"
              // label="Price"
              labelStyle={{ paddingHorizontal: 10 }}
            />
          </View>
          <View style={{ marginVertical: 16 }}>
            <SelectWithDrawer
              value={addItemFormik?.values?.parcelId || "Parcel size"}
              activeColor={addItemFormik?.values?.parcelId && "black"}
              onPress={() => setDrawerType("parcel")}
              error={
                addItemFormik.submitCount > 0 && addItemFormik.errors.parcelId
              }
            />
          </View>
          <View style={{ marginVertical: 20 }}>
            {/* <FilledButton
              title={"Save"}
              loading={loader}
              onPress={addItemFormik.handleSubmit}
            /> */}
            <CustomButton
              title="Save"
              loader={loader}
              buttonStyle={styles.saveBtn}
              textStyle={styles.saveBtnText}
              onPress={addItemFormik.handleSubmit}
            />
          </View>
          {drawerType === "category" && true && (
            <SelectItemCategoryModal
              isShow={drawerType === "category" && true}
              onClose={() => setDrawerType(null)}
              name="categoryId"
              onSelect={(e: any) => {
                addItemFormik?.setFieldValue("categoryId", e?.target?.value);
                addItemFormik?.setFieldValue(
                  "selectedCategoryId",
                  e?.target?.id
                );
                addItemFormik?.setFieldError("categoryId", "");
                addItemFormik?.setFieldError("selectedCategoryId", "");
                setDrawerType(null);
              }}
            />
          )}
          {drawerType === "condition" && true && (
            <SelectItemConditionModal
              isShow={drawerType === "condition" && true}
              onClose={() => setDrawerType(null)}
              name="conditionId"
              onSelect={(e: any) => {
                addItemFormik?.setFieldValue("conditionId", e?.target?.value);
                addItemFormik?.setFieldValue(
                  "selectedConditionId",
                  e?.target?.id
                );
                setDrawerType(null);
              }}
            />
          )}
          {drawerType === "material" && true && (
            <SelectItemMaterialsModal
              isShow={drawerType === "material" && true}
              onClose={() => setDrawerType(null)}
              name="materialId"
              onSelect={(e: any) => {
                addItemFormik?.setFieldValue("materialId", e?.target?.value);
                addItemFormik?.setFieldValue(
                  "selectedMaterialId",
                  e?.target?.id
                );
                setDrawerType(null);
              }}
            />
          )}
          {drawerType === "brand" && true && (
            <SelectItemBrandModal
              isShow={drawerType === "brand" && true}
              onClose={() => setDrawerType(null)}
              name="brandId"
              onSelect={(e: any) => {
                addItemFormik?.setFieldValue("brandId", e?.target?.value);
                addItemFormik?.setFieldValue("selectedBrandId", e?.target?.id);
                setDrawerType(null);
              }}
            />
          )}

          {drawerType === "size" && true && (
            <SelectItemSizeModal
              isShow={drawerType === "size" && true}
              onClose={() => setDrawerType(null)}
              name="sizeId"
              onSelect={(e: any) => {
                addItemFormik?.setFieldValue("sizeId", e?.target?.value);
                addItemFormik?.setFieldValue("selectedSizeId", e?.target?.id);
                setDrawerType(null);
              }}
            />
          )}
          {drawerType === "parcel" && true && (
            <SelecParcelModal
              isShow={drawerType === "parcel" && true}
              onClose={() => setDrawerType(null)}
              name="parcelId"
              onSelect={(e) => {
                addItemFormik?.setFieldValue("parcelId", e?.target?.value);
                addItemFormik?.setFieldValue("selectedParcelId", e?.target?.id);
                setDrawerType(null);
              }}
            />
          )}
          {drawerType === "colour" && true && (
            <SelectItemColorModal
              isShow={drawerType === "colour" && true}
              onClose={() => setDrawerType(null)}
              name="colourId"
              onSelect={(e: any) => {
                addItemFormik?.setFieldValue("colourId", e?.target?.value);
                addItemFormik?.setFieldValue("selectedColourId", e?.target?.id);
                setDrawerType(null);
              }}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EditProfileItem;

const styles = StyleSheet.create({
  imageContainer: {},
  imageTitle: {
    fontSize: 14,
    color: "#353535",
    fontFamily: "DMSansMedium",
    marginBottom: 8,
  },
  card: {
    marginBottom: 20,
    borderRadius: 8,
    position: "relative",
    backgroundColor: "#E9EAEB",
    height: 160,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  imageUploadContainer: {
    // height: "100%",
    width: "100%",
  },
  imageLogo: {
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
  },
  imageText: {
    textAlign: "center",
    fontSize: 12,
    color: "#464F5D",
    paddingHorizontal: 24,
  },
  imageTextInner: {
    color: "#AA2731",
  },
  imageUploaded: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  deleteContainer: {
    width: 20,
    height: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#440621",
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 3.44,
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 3.44 * 1.5,
      },
    }),
    position: "absolute",
    zIndex: 2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    top: 10,
    right: 10,
  },
  inputViewWrapper: {
    marginTop: 16,
  },
  title: {
    fontSize: 14,
    marginVertical: 10,
    fontFamily: "DMSansMedium",
    color: "#353535",
  },
  saveBtn: {
    backgroundColor: "#FF3B4A",
  },
  saveBtnText: {
    color: "white",
    fontSize: 16,
    fontFamily: "DMSansMedium",
    width: "100%",
    textAlign: "center",
  },
});
