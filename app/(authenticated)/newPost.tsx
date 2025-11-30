import { useFormik } from "formik";
import * as Yup from "yup";
import AppTextInput from "@components/AppTextInput";
import StackHeader from "@components/StackHeader";
import { Colors } from "@constants/Colors";
import { router } from "expo-router";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FilledButton from "@components/buttons/Filled_button";
import TagIcon from "assets/images/svg/black-tag-icon.svg";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { setWardrobeType } from "@redux/slice/temporary-add-item-to-outfit/temporaryAddItemtoOutfitSlice";
import {
  clearTagedItems,
  setEditPostId,
  setIsEditPostData,
  setTagedDetails,
  setTagedItems,
} from "@redux/slice/outfit-edit-details/outfitEditDetailsSlice";
import { generateGUID } from "@helper/guid-number";
import timelineServices from "@services/features/timeline-service/timelineServices";
import { useToast } from "react-native-toast-notifications";
import fileServerServices from "@services/features/file-server/fileServer";
import { setRefetchPostList } from "@redux/slice/profile/profileSlice";
import TagItemModal from "@modals/tagItem/TagItemModal";
import { TaggedItem as ServiceTaggedItem } from "@services/features/wardrobe-service/types";
import TaggedItemsDisplay from "@components/TaggedItemsDisplay";

interface INewPost {
  isEditPost: boolean;
  editId: string;
}
const NewPost = ({ isEditPost, editId }: INewPost) => {
  const toast = useToast();
  const [loader, setLoader] = useState(false);
  const dispatch = useAppDispatch();

  const [imageLoader, setImageLoader] = useState(false);
  const [uploadedImage, setUploadedImage]: any = useState([]);
  const [uploadedGuid, setUploadedGuid]: any = useState(null);
  const [postDetails, setPostDetails]: any = useState(null);
  const [postDetailsLoader, setPostDetailsLoader] = useState(false);
  const [isShowTag, setIsShowTag] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

  const { isEditPostDetails, newPostDetails, tagedItemDetails, tagedItems } =
    useAppSelector((state) => state.outfitEditDetailsSlice);
  const { token, profile } = useAppSelector((state) => state.userProfileSlice);
  
  const addItemsValidationSchema = Yup?.object()?.shape({
    caption: Yup.string().required(),
  });

  const allTaggedItems = useMemo(() => {
    if (isInitialMount) {
      return [];
    }

    const items = [...(tagedItems || [])];

    if (
      tagedItemDetails &&
      !items.find((item) => item.id === tagedItemDetails.id)
    ) {
      items.push({
        id: tagedItemDetails.id,
        name:
          tagedItemDetails.brandName || tagedItemDetails.name || "Unknown Item",
        imageUrl:
          tagedItemDetails.imageUrl ||
          tagedItemDetails.image ||
          tagedItemDetails.itemDefaultImageUrl ||
          "",
        amount: tagedItemDetails.amount || 0,
        currencySymbol: tagedItemDetails.currencySymbol || "₦",
        type: tagedItemDetails.type || "item",
      });
    }

    return items;
  }, [tagedItems, tagedItemDetails, isInitialMount]);

  const handleTagModalNext = useCallback((selectedItems: ServiceTaggedItem[]) => {
    const reduxTaggedItems = selectedItems
      .filter(item => item.id && item.name)
      .map(item => ({
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl || '',
        amount: item.amount || 0,
        currencySymbol: item.currencySymbol || '₦',
        type: (item.type || 'item') as 'item' | 'outfit',
      }));
    
    dispatch(setTagedItems(reduxTaggedItems));
    setIsShowTag(false);
  }, [dispatch]);

  const handleTagModalClose = useCallback(() => {
    setIsShowTag(false);
  }, []);

  const handleTagModalCloseWithAlert = useCallback(() => {
    if (allTaggedItems.length > 0) {
      Alert.alert(
        'Discard Changes?',
        'You have selected items that will be lost if you close now.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              dispatch(clearTagedItems());
              dispatch(setTagedDetails(null));
              setIsShowTag(false);
            },
          },
        ],
      );
    } else {
      setIsShowTag(false);
    }
  }, [allTaggedItems.length, dispatch]);

  const handleBackPress = useCallback(() => {
    if (isShowTag) {
      handleTagModalCloseWithAlert();
    } else {
      router.back();
    }
  }, [isShowTag, handleTagModalCloseWithAlert]);

  // if it is an uploaded image

  const getImagesFromServer = (reqId: string) => {
    setImageLoader(true);

    fileServerServices
      ?.getTimeLineImagePicture(token, reqId)
      .then((res: any) => {
        setImageLoader(false);

        if (res?.status === 200) {
          setUploadedGuid(reqId);
          setUploadedImage(res?.data);

          return;
        }
        // setImages(["uploadImage"]);
      })
      .catch((err) => {
        setImageLoader(false);
        // setImages(["uploadImage"]);
      });
  };

  useLayoutEffect(() => {
    dispatch(setIsEditPostData(false));
    dispatch(setEditPostId(""));
    dispatch(clearTagedItems());
    dispatch(setTagedDetails(null));
    setIsInitialMount(false);
  }, [dispatch]);

  useEffect(() => {
    const backAction = () => {
      if (isShowTag) {
        handleTagModalCloseWithAlert();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [isShowTag, handleTagModalCloseWithAlert]);

  useEffect(() => {
    if (token && newPostDetails?.[0]?.imageUri) {
      const getGuid = generateGUID();
      setImageLoader(true);

      let plartform = Platform.OS == "android" ? true : false;
      fileServerServices
        ?.postTimeLineImageUpload(
          [newPostDetails?.[0]],
          plartform,
          getGuid,
          token,
        )
        ?.then((res: any) => {
          setImageLoader(false);
          if (res?.status === 200) {
            getImagesFromServer(getGuid);

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
        });

      return;
    }
  }, [token, newPostDetails?.[0]?.imageUri]);

  const addItemFormik = useFormik({
    validationSchema: addItemsValidationSchema,
    initialValues: {
      caption: "",
    },
    onSubmit: async (values: any) => {
      setLoader(true);
      dispatch(setRefetchPostList(false));

      const tagIds = allTaggedItems.map((item) => item.id);
      
      const data: any = isEditPost
        ? {
            caption: values?.caption,
            tagIds: tagIds,
          }
        : {
            requestId: uploadedImage?.requestId
              ? uploadedGuid
              : newPostDetails?.[0]?.id,
            isRequestIdWardrobeItemId: uploadedImage?.requestId ? false : true,
            caption: values?.caption,
            tagIds: tagIds.length > 0 
              ? tagIds 
              : postDetails?.tags?.[0]?.id
                ? [postDetails?.tags?.[0]?.id]
                : [],
          };
      const getServices = isEditPost
        ? timelineServices?.editPost(data, token, editId)
        : timelineServices.createPost(data, token);

      getServices
        ?.then((res) => {
          setLoader(false);
          if (res?.status === 200) {
            // toast.show(`Operation successful`, {
            //   type: "success",
            //   duration: 4000,
            // });
            dispatch(setRefetchPostList(true));

            return router.replace("/home");
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
          setLoader(false);
          return toast.show(`An error occurred. Please try again later.`, {
            type: "danger",
            duration: 4000,
          });
        });
    },
  });

  const getPostItem = () => {
    setPostDetailsLoader(true);
    timelineServices
      ?.getPostByIdQuery(token, editId)
      .then((res: any) => {
        addItemFormik.setFieldValue("caption", res?.data?.caption);
        setPostDetailsLoader(false);
        setPostDetails(res?.data);
      })
      .catch((error) => {
        setPostDetailsLoader(false);
      });
  };

  useEffect(() => {
    setPostDetails([]);

    if (isEditPost && editId) {
      getPostItem();
    }
  }, [isEditPost]);

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
        title={isEditPost ? "Edit post" : "New post"}
        onPress={handleBackPress}
      />
      <ScrollView style={styles.body}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: isEditPost
                ? postDetails?.defaultImageUrl
                : newPostDetails?.[0]?.imageUri ||
                  newPostDetails?.[0]?.itemDefaultImageUrl ||
                  newPostDetails?.[0]?.itemImageUrls?.[0] ||
                  newPostDetails?.[0]?.imageUrl,
            }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 8,
              objectFit: "contain",
            }}
          />
          {/* Show TaggedItemsDisplay when items are tagged, otherwise show Tag Item button */}
          {allTaggedItems.length > 0 ? (
            <View style={styles.taggedItemsOverlay}>
              <TaggedItemsDisplay
                taggedItems={allTaggedItems}
                onPress={() => {
                  dispatch(setWardrobeType("first"));
                  dispatch(setTagedDetails(null));
                  dispatch(setIsEditPostData(true));
                  dispatch(setEditPostId(editId));
                  setIsShowTag(true);
                }}
                maxVisibleThumbnails={3}
                showCount={true}
              />
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.addTag,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                dispatch(setWardrobeType("first"));
                dispatch(setTagedDetails(null));
                dispatch(setIsEditPostData(true));
                dispatch(setEditPostId(editId));
                setIsShowTag(true);
              }}
            >
              <TagIcon />
              <Text style={styles.addTagText}>
                Tag Item
              </Text>
            </Pressable>
          )}
        </View>
        
        <View style={{ marginBottom: 103 }}>
          <AppTextInput
            isMultiline
            onChangeText={addItemFormik.handleChange("caption")}
            value={addItemFormik?.values?.caption}
            error={
              addItemFormik.submitCount > 0 && addItemFormik.errors.caption
            }
            placeholder="Add caption"
            label="Caption"
          />
        </View>
        <View style={{ marginVertical: 20 }}>
          <FilledButton
            title={"Share post"}
            loading={loader || imageLoader || postDetailsLoader}
            onPress={addItemFormik.handleSubmit}
            style={{ width: "100%" }}
            disable={loader || imageLoader || postDetailsLoader}
          />
        </View>
      </ScrollView>
      
      <TagItemModal
        isVisible={isShowTag}
        onClose={handleTagModalClose}
        onNext={handleTagModalNext}
        token={token}
        trifterId={profile?.id}
        initialSelection={allTaggedItems as ServiceTaggedItem[]}
      />
    </View>
  );
};

export default NewPost;

const styles = StyleSheet.create({
  body: {
    // paddingVertical: 37,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  imageContainer: {
    height: 328,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 41,
    position: "relative",
  },
  addTag: {
    flexDirection: "row",
    backgroundColor: "white",
    position: "absolute",
    zIndex: 3,
    bottom: 11,
    left: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  addTagText: {
    marginLeft: 6,
    color: "#1C2533",
    fontSize: 12,
    fontFamily: "DMSansSemiBold",
  },
  pressed: {
    opacity: 0.5,
  },
  taggedItemsOverlay: {
    position: "absolute",
    zIndex: 3,
    bottom: 11,
    left: 8,
  },
});
