import React, { ReactNode, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Platform, StyleSheet, View, TouchableOpacity, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import wardrobeServices from '../../services/features/wardrobe-service/wardrobeServices';
import { Colors, SIZES } from '../../constants/Colors';
import { generateGUID } from '../../helper/guid-number';
import {
  setOutfitType,
  setRefNumber,
  setSelectedDatePlan,
  setTemporaryAddItemToOutfit,
  setWardrobeType,
} from '../../redux/slice/temporary-add-item-to-outfit/temporaryAddItemtoOutfitSlice';
import {
  setIsEdit,
  setNewPostDetails,
  setOutfitEditDetails,
  setPlanDetails,
  addTagedItem,
  removeTagedItem,
  TaggedItem,
} from '../../redux/slice/outfit-edit-details/outfitEditDetailsSlice';
import ToggleTabs from '../../components/Toggle';
import PlusIcon from '../../assets/images/svg/add-circle-plus.svg';
import CustomButton from '../../components/CustomButton';
import StackHeader, { ResourcesHeaderMain } from '@components/StackHeader';
import CreatePlanView from './CreatePlanView';
import AddoutfitModal from 'modals/AddOutfitModal';
import AddToCollectionModal from 'modals/AddToCollectionModal';
import CreateCollectionModal from 'modals/CreateCollectionModal';
import SelectOutfitModal from 'modals/SelectOutfitModal';
import SelectItemsForPlanModal, { SelectItemsForPlanModalRef } from 'modals/SelectItemsForPlanModal';
import CollectionsList from '@components/collections/CollectionsList';
import TabSelector from '@components/TabSelector';
import ProductFilterModal from 'modals/ProductFilterModal';
import WardrobeList from '@components/wardrobe/WardrobeList';
import { useI18n } from '../../hooks/use-i18n';
import { processBatchItemsBackgroundRemoval } from '@utils/planItemBackgroundProcessor';
import { WardrobeItem } from '@services/features/wardrobe-service/types';

interface IWardrobeAndOutfits {
  type?: string;
  uploadComponent?: ReactNode;
  isTagItem?: boolean;
  onPress?: () => void;
  onGoback?: () => void;
  isDisplayOnModal?: boolean;
  isAddOutfit?: boolean;
}
const WardrobeAndOutfits = ({
  type,
  uploadComponent,
  isTagItem,
  onPress,
  onGoback,
  isDisplayOnModal,
  isAddOutfit,
}: IWardrobeAndOutfits) => {

  const { t } = useI18n();
  const navigation: any = useNavigation();
  const { token, profile } = useAppSelector((state) => state?.userProfileSlice);
  const { plansDetails } = useAppSelector(
    (state) => state.outfitEditDetailsSlice
  );
  const toast = useToast();
  const queryClient = useQueryClient();

  const { wardrobeType, selectedDatePlan } =
    useAppSelector((state) => state?.temporaryAddItemToOutfitSlice);
  const { tagedItems, isEditPostDetails, editPostId } = useAppSelector(
    (state) => state?.outfitEditDetailsSlice,
  );

  // Add filter state from Redux
  const {
    categoryValue,
    sizeValue,
    brandValue,
    conditionValue,
    colourValue,
    materialValue,
  } = useAppSelector((state) => state.productFilter);

  const dispatch = useAppDispatch();

  // Helper function to convert item to TaggedItem format
  const convertToTaggedItem = (item: any): TaggedItem => ({
    id: item.id,
    name: item.brandName || item.name || 'Unknown Item',
    imageUrl: item.itemDefaultImageUrl || item.itemImageUrls?.[0] || '',
    amount: item.amount || 0,
    currencySymbol: item.currencySymbol || '₦',
    type: item.type || 'item',
  });

  const isItemTagged = useCallback(
    (item: any) => {
      return tagedItems.some((taggedItem) => taggedItem.id === item.id);
    },
    [tagedItems]
  );

  const handleItemTagSelection = useCallback(
    (item: any) => {
      if (isItemTagged(item)) {
        dispatch(removeTagedItem(item.id));
      } else {
        const taggedItem = convertToTaggedItem(item);
        dispatch(addTagedItem(taggedItem));
      }
    },
    [isItemTagged, dispatch]
  );
  // TODO: Replace any[] with proper types for WardrobeItem and OutfitItem interfaces
  const [items, setItems] = useState<any[]>([]);
  const [outfits, setOutfits] = useState<any[]>([]);
  const [pageToken, setPageToken] = useState("");
  const [search, setSearch] = useState("");



  // Track common re-render drivers for diagnostics
  // NOTE: placed after state declarations to avoid
  // "used before declaration" lint errors

  const [loading, setLoading] = useState(false);
  const [isShowAddOutfitModal, setIsShowAddOutfitModal] = useState(false);
  const [isShowFilterModal, setIsShowFilterModal] = useState(false);
  const [scrollTab, setScrollTab] = useState<string>("");
  const [isShowAddToCollectionModal, setIsShowAddToCollectionModal] = useState(false);
  const [isShowCreateCollectionModal, setIsShowCreateCollectionModal] = useState(false);
  const [isShowSelectOutfitModal, setIsShowSelectOutfitModal] = useState(false);
  const [currentCollectionId, setCurrentCollectionId] = useState("");
  const [currentCollectionName, setCurrentCollectionName] = useState("");
  const [outfitSubTab, setOutfitSubTab] = useState(t('wardrobe.allOutfits'));
  const [pendingAddToCollectionAction, setPendingAddToCollectionAction] = useState<"createCollection" | "createOutfit" | null>(null);
  const [shouldOpenSelectAfterCreate, setShouldOpenSelectAfterCreate] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSelectItemsModal, setShowSelectItemsModal] = useState(false);
  const selectItemsModalRef = useRef<SelectItemsForPlanModalRef>(null);
  const searchRef = useRef(search);
  const lastSearchRef = useRef(search);
  searchRef.current = search;



  // Create getItemFromServer function similar to marketplace
  const getItemFromServer = useCallback(() => {
    setItems([]);
    setPageToken('');
    setLoading(true);

    const itemService = isTagItem
      ? wardrobeServices.listItemsQuery(
        {
          token: token,
          pageQuery: search,
          pageSize: '12',
          pageToken: '',
        },
        '0',
      )
      : wardrobeServices.itemsQuery(token, search, '12', profile?.id || '', '', scrollTab);

    itemService
      .then((res: any) => {
        setLoading(false);

        let items =
          res?.data?.dataset?.map((list: any) => {
            return {
              brandName: list?.brand,
              itemDefaultImageUrl: list?.defaultImageUrl,
              ...list,
            };
          }) || [];

        if (
          categoryValue?.id ||
          brandValue?.id ||
          sizeValue?.id ||
          colourValue?.id ||
          conditionValue?.id ||
          materialValue?.id
        ) {
          items = items.filter((item: any) => {
            let matches = true;

            if (categoryValue?.id && item.categoryId !== categoryValue.id)
              matches = false;
            if (brandValue?.id && item.brandId !== brandValue.id)
              matches = false;
            if (sizeValue?.id && item.sizeId !== sizeValue.id) matches = false;
            if (colourValue?.id && item.colourId !== colourValue.id)
              matches = false;
            if (conditionValue?.id && item.conditionId !== conditionValue.id)
              matches = false;
            if (materialValue?.id && item.materialId !== materialValue.id)
              matches = false;

            return matches;
          });
        }

        setItems(items);

        if (res?.data?.hasNextPage) {
          setPageToken(res?.data?.pageToken);
        }

        if (res?.responseCode === 401) {
          return router.push('/Onboarding');
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [
    isTagItem,
    token,
    search,
    scrollTab,
    profile?.id,
    categoryValue,
    brandValue,
    sizeValue,
    colourValue,
    conditionValue,
    materialValue,
  ]);

  const currentItems = useMemo(() => {
    return wardrobeType === "first" ? items : outfits;
  }, [outfits, items, wardrobeType]);

  const handleAddItem = useCallback(() => {
    navigation.navigate("items", { refNumber: generateGUID() });
  }, [navigation]);

  const handleCreateOutfit = useCallback(() => {
    dispatch(setRefNumber(generateGUID()));
    router.push("/outfit");
  }, [dispatch]);

  const handleSelectOutfit = useCallback(() => {
    setIsShowAddToCollectionModal(true);
  }, []);

  // Open CreateCollectionModal AFTER AddToCollectionModal has fully closed
  const handleAddFromOutfits = useCallback(() => {
    // User chose to create a collection
    setPendingAddToCollectionAction("createCollection");
    setIsShowAddToCollectionModal(false);
  }, []);

  const handleCreateNewOutfits = useCallback(() => {
    setPendingAddToCollectionAction("createOutfit");
    setIsShowAddToCollectionModal(false);
  }, []);

  const handleSelectItemsClose = useCallback(() => {
    setShowSelectItemsModal(false);
  }, []);

  const handleSelectItemsSkip = useCallback(() => {
    setShowSelectItemsModal(false);
  }, []);

  const handleSelectItemsNext = useCallback(async (selectedItems: WardrobeItem[]) => {
    if (!token || selectedItems.length === 0) {
      return;
    }

    try {
      const result = await processBatchItemsBackgroundRemoval(
        selectedItems,
        token,
        (progress) => {
          if (progress.itemsProgress && selectItemsModalRef.current) {
            selectItemsModalRef.current.updateProcessingProgress(progress.itemsProgress);
          }
        },
        3
      );

      if (selectItemsModalRef.current) {
        selectItemsModalRef.current.completeProcessing();
      }

      if (result.processedItems.length > 0) {
        dispatch(setTemporaryAddItemToOutfit(result.processedItems));
        dispatch(setRefNumber(generateGUID()));
        dispatch(setOutfitType(''));

        setTimeout(() => {
          if (result.skippedCount > 0 && result.itemsWithOriginalImage > 0) {
            toast.show(
              t('wardrobe.plan.processing.itemsOriginalAndSkipped', {
                itemsWithOriginalImage: result.itemsWithOriginalImage,
                skippedCount: result.skippedCount,
              }, `${result.itemsWithOriginalImage} item(s) using original image (background removal unavailable). ${result.skippedCount} item(s) skipped.`),
              { type: 'warning', duration: 4000 }
            );
          } else if (result.itemsWithOriginalImage > 0) {
            toast.show(
              t('wardrobe.plan.processing.itemsOriginal', { count: result.itemsWithOriginalImage }, `${result.itemsWithOriginalImage} item(s) using original image - background removal unavailable at the moment.`),
              { type: 'info', duration: 4000 }
            );
          } else if (result.skippedCount > 0) {
            toast.show(
              t('wardrobe.plan.processing.itemsSkipped', { count: result.skippedCount }, `${result.skippedCount} item(s) skipped (no image available).`),
              { type: 'warning', duration: 3000 }
            );
          }

          router.push('/collage');
        }, 900);
      } else {
        toast.show(t('wardrobe.plan.processing.none', undefined, 'No items could be processed. Please select items with images.'), {
          type: 'danger',
          duration: 3000,
        });
      }
    } catch (error: any) {
      if (selectItemsModalRef.current) {
        selectItemsModalRef.current.completeProcessing();
      }

      setTimeout(() => {
        setShowSelectItemsModal(false);
        toast.show(error?.message || t('wardrobe.plan.errorProcessingItems', undefined, 'Error processing items. Please try again.'), {
          type: 'danger',
          duration: 4000,
        });
      }, 900);
    }
  }, [token, dispatch, toast, t]);

  const addOutfitsMutation = useMutation({
    mutationFn: async (data: { outfitIds: string[]; collectionId: string }) => {
      const response = await wardrobeServices.addOutfitsToCollection(data, token);
      return response;
    },
    onSuccess: (response, variables) => {
      if (response?.status === 200 || response?.status === 201) {
        queryClient.invalidateQueries({ queryKey: ['collections', token] });

        setIsShowSelectOutfitModal(false);

        const outfitCount = variables.outfitIds.length;
        toast.show(
          `${outfitCount} ${outfitCount !== 1 ? t('wardrobe.outfits').toLowerCase() : t('wardrobe.outfit').toLowerCase()} ${t('common.addedTo')} "${currentCollectionName}"`,
          {
            type: "success",
            duration: 3000,
          }
        );

        setCurrentCollectionId("");
        setCurrentCollectionName("");
      } else {
        toast.show(response?.data?.message || t('wardrobe.failedToAddOutfits'), {
          type: "danger",
          duration: 3000,
        });
      }
    },
    onError: (error: any) => {
      toast.show(
        error?.message || t('wardrobe.errorOccurred'),
        {
          type: "danger",
          duration: 3000,
        }
      );
    },
  });

  const handleCollectionCreated = useCallback((collectionId: string, collectionName: string) => {
    setCurrentCollectionId(collectionId);
    setCurrentCollectionName(collectionName);
    // Close modal first; we'll open SelectOutfitModal in onCloseComplete
    setShouldOpenSelectAfterCreate(true);
    setIsShowCreateCollectionModal(false);
  }, []);

  const handleSelectOutfits = useCallback((selectedOutfitIds: string[]) => {
    if (selectedOutfitIds.length === 0 || !currentCollectionId) return;

    addOutfitsMutation.mutate({
      outfitIds: selectedOutfitIds,
      collectionId: currentCollectionId,
    });
  }, [currentCollectionId, addOutfitsMutation]);

  const handleSkipOutfitSelection = useCallback(() => {
    setIsShowSelectOutfitModal(false);

    toast.show(
      `${t('wardrobe.createACollection')} "${currentCollectionName}" ${t('wardrobe.collectionCreated')}`,
      {
        type: "success",
        duration: 3000,
      }
    );

    setCurrentCollectionId("");
    setCurrentCollectionName("");
  }, [currentCollectionName, toast, t]);

  const handleCloseSelectOutfitModal = useCallback(() => {
    setIsShowSelectOutfitModal(false);
    setCurrentCollectionId("");
    setCurrentCollectionName("");
  }, []);

  const getItems = useCallback(() => {
    if (pageToken && !isFetchingMore) {
      setIsFetchingMore(true);
      let params = {
        token: token,
        pageQuery: search,
        pageSize: "12",
        pageToken: pageToken,
      };

      const itemService = isTagItem
        ? wardrobeServices.listItemsQuery(params, "0")
        : wardrobeServices.itemsQuery(
          token,
          search,
          "12",
          profile?.id || '',
          pageToken,
          scrollTab
        );
      itemService
        .then((res: any) => {
          const distructureData = res?.data?.dataset?.map((list: any) => {
            return {
              brandName: list?.brand,
              itemDefaultImageUrl: list?.defaultImageUrl,
              ...list,
            };
          });

          setItems([...items, ...(distructureData || [])]);

          setPageToken(res?.data?.pageToken);

          if (res?.responseCode === "401" || res?.responseCode === 401) {
            return router.push("/Onboarding");
          }
        })
        .catch(() => { })
        .finally(() => {
          setIsFetchingMore(false);
        });
    }
  }, [pageToken, isFetchingMore, token, search, isTagItem, scrollTab, items, profile?.id]);

  const getMoreOutfits = useCallback(() => {
    if (pageToken && !isFetchingMore) {
      setIsFetchingMore(true);
      wardrobeServices
        .outfitsQuery(token, profile?.id, search, "12", pageToken)
        .then((res: any) => {
          let newData = res?.data?.dataset || [];
          setOutfits([...outfits, ...newData]);

          setPageToken(res?.data?.pageToken);

          if (res?.responseCode === "401" || res?.responseCode === 401) {
            return router.push("/Onboarding");
          }
        })
        .catch((error) => { })
        .finally(() => {
          setIsFetchingMore(false);
        });
    }
  }, [pageToken, isFetchingMore, token, profile?.id, search, outfits]);

  const handleEndReached = useCallback(() => {
    if (pageToken && !isFetchingMore) {
      if (wardrobeType === "first") {
        getItems();
      } else {
        getMoreOutfits();
      }
    }
  }, [pageToken, isFetchingMore, wardrobeType, getItems, getMoreOutfits]);

  const handleItemPress = useCallback(
    (item: any) => {
      if (wardrobeType === 'first') {
        if (type) {
          if (isTagItem) {
            handleItemTagSelection(item);
          } else {
            dispatch(setNewPostDetails([item]));
            router.push('/newPost');
          }
        } else {
          router.push({
            pathname: '/itemDetail',
            params: { item: JSON.stringify(item) },
          });
        }
      } else {
        if (type) {
          dispatch(setNewPostDetails([item]));
          router.push('/newPost');
        } else if (isAddOutfit) {
          dispatch(setOutfitEditDetails(item));
          setIsShowAddOutfitModal(true);
        } else {
          const isSoldOutfit = item?.status?.toLowerCase?.() === "itemsold";
          if (isSoldOutfit) {
            router.push({
              pathname: '/OutfitDetails',
              params: {
                outfitId: item?.id,
                outfitData: JSON.stringify(item)
              },
            });
          } else {
            dispatch(setOutfitEditDetails(item));
            navigation.navigate('EditOutfitView');
            dispatch(setRefNumber(generateGUID()));
          }
        }
      }
    },
    [wardrobeType, type, isTagItem, isAddOutfit, dispatch, navigation, handleItemTagSelection]
  );

  const getInitialItems = useCallback(() => {
    setPageToken("");
    setItems([]);
    setLoading(true);

    const params = {
      token: token,
      pageQuery: search,
      pageSize: "12",
      pageToken: "",
    };

    const itemService = isTagItem
      ? wardrobeServices.listItemsQuery(params, '0')
      : wardrobeServices.itemsQuery(token, search, '12', profile?.id || '', '', scrollTab);

    itemService
      .then((res: any) => {
        setLoading(false);

        const distructureData = res?.data?.dataset?.map((list: any) => {
          return {
            brandName: list?.brand,
            itemDefaultImageUrl: list?.defaultImageUrl,
            ...list,
          };
        });

        setItems(distructureData || []);
        if (res?.data?.hasNextPage) {
          setPageToken(res?.data?.pageToken);
        }
        if (res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [token, search, isTagItem, scrollTab, profile?.id]);

  const fetchOutfits = useCallback((query: string) => {
    setPageToken("");
    setOutfits([]);
    setLoading(true);

    // Console log the full endpoint URL, payload, and token for outfit search
    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || '';
    const trifterId = profile?.id || '';
    const pageSize = '12';
    const pageToken = '';
    const fullEndpointUrl = `${baseUrl}/wardrobe/v1/outfits?Query=${encodeURIComponent(query)}&TrifterId=${trifterId}&PageSize=${pageSize}&PageToken=${pageToken}`;

    wardrobeServices
      .outfitsQuery(token, profile?.id, query, "12", "")
      .then((res: any) => {
        setLoading(false);
        setOutfits(res?.data?.dataset);

        if (res?.data?.hasNextPage) {
          setPageToken(res?.data?.pageToken);
        }
        if (res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [token, profile?.id]);

  const getInitialOutfits = useCallback(() => {
    fetchOutfits(search);
  }, [fetchOutfits, search]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (wardrobeType === "first") {
        await getInitialItems();
      } else if (wardrobeType === "second") {
        await getInitialOutfits();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [wardrobeType, getInitialItems, getInitialOutfits]);

  const getSearchPlaceholder = useCallback(() => {
    if (isTagItem) return t('wardrobe.searchBrandName');
    if (wardrobeType === 'first') {
      return type && uploadComponent ? t('wardrobe.searchBrandName') : t('wardrobe.searchItems');
    }
    return t('wardrobe.searchOutfits');
  }, [isTagItem, wardrobeType, type, uploadComponent, t]);

  const getEmptyStateProps = useCallback(() => {
    if (wardrobeType === 'first') {
      return {
        emptyTitle: t('wardrobe.wardrobeEmpty'),
        emptyDescription: t('wardrobe.wardrobeEmptyDescription'),
        emptyActionText: t('wardrobe.addItem'),
        onEmptyAction: handleAddItem,
      };
    }
    return {
      emptyTitle: t('wardrobe.noOutfitsYet'),
      emptyDescription: t('wardrobe.noOutfitsDescription'),
      emptyActionText: t('wardrobe.createAnOutfit'),
      onEmptyAction: handleCreateOutfit,
    };
  }, [wardrobeType, t, handleAddItem, handleCreateOutfit]);

  const isFetchingRef = useRef(false);
  const lastFetchParamsRef = useRef<{ type: string; subTab: string; search: string } | null>(null);

  useFocusEffect(
    useCallback(() => {
      dispatch(setTemporaryAddItemToOutfit([]));
      dispatch(setRefNumber(""));
      dispatch(setIsEdit(false));
      dispatch(setOutfitEditDetails(null));
      dispatch(setOutfitType(""));

      if (!token) return;

      const currentParams = {
        type: wardrobeType,
        subTab: outfitSubTab,
        search: searchRef.current,
      };

      if (isFetchingRef.current) return;
      
      isFetchingRef.current = true;
      lastFetchParamsRef.current = currentParams;

      if (wardrobeType === "first") {
        getInitialItems();
      } else if (wardrobeType === "second" && outfitSubTab === t('wardrobe.allOutfits')) {
        fetchOutfits(searchRef.current);
      }

      setTimeout(() => {
        isFetchingRef.current = false;
      }, 300);
    }, [dispatch, token, wardrobeType, outfitSubTab, getInitialItems, fetchOutfits, t])
  );

  useEffect(() => {
    if (!token || wardrobeType !== "second" || outfitSubTab !== t('wardrobe.allOutfits')) {
      lastSearchRef.current = search;
      return;
    }
    
    if (search === lastSearchRef.current) return;
    
    const timeoutId = setTimeout(() => {
      if (!isFetchingRef.current) {
        isFetchingRef.current = true;
        fetchOutfits(search);
        setTimeout(() => {
          isFetchingRef.current = false;
        }, 300);
      }
    }, 500);

    lastSearchRef.current = search;
    return () => clearTimeout(timeoutId);
  }, [search, token, wardrobeType, outfitSubTab, t, fetchOutfits]);

  useEffect(() => {
    if (!token) return;
    
    const currentParams = {
      type: wardrobeType,
      subTab: outfitSubTab,
      search: searchRef.current,
    };
    
    const lastParams = lastFetchParamsRef.current;
    const hasTabChanged = lastParams && (
      lastParams.type !== wardrobeType || 
      lastParams.subTab !== outfitSubTab
    );
    
    if (!hasTabChanged || isFetchingRef.current) return;

    isFetchingRef.current = true;
    lastFetchParamsRef.current = currentParams;

    if (wardrobeType === "first") {
      getInitialItems();
    } else if (wardrobeType === "second" && outfitSubTab === t('wardrobe.allOutfits')) {
      fetchOutfits(searchRef.current);
    }

    setTimeout(() => {
      isFetchingRef.current = false;
    }, 300);
  }, [token, wardrobeType, outfitSubTab, t, getInitialItems, fetchOutfits]);

  const handleSearchChange = useCallback((text: string) => {
    setSearch(text);
  }, []);

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingTop: isDisplayOnModal
            ? 0
            : Platform.OS === "ios"
              ? SIZES.height / 22
              : SIZES.padding,
          position: "relative",
        },
      ]}
    >
      {type ? (
        <View style={styles.headerContainer}>
          <StackHeader
            title={type}
            onPress={onGoback ? onGoback : () => router.back()}
          />
          {isTagItem && (
            <View style={styles.headerBtnView}>
              <CustomButton
                title={t('wardrobe.next')}
                buttonStyle={
                  tagedItems.length > 0
                    ? styles.headerBtn
                    : styles.inactiveHeaderBtn
                }
                textStyle={
                  tagedItems.length > 0
                    ? styles.headerTextBtn
                    : styles.inactiveHeaderTextBtn
                }
                onPress={
                  tagedItems.length > 0
                    ? onPress
                      ? onPress
                      : () => {
                        if (isEditPostDetails && editPostId) {
                          router.push(`/editPost/${editPostId}`);
                        } else {
                          router.push("/newPost");
                        }
                      }
                    : () => { }
                }
              />
            </View>
          )}
        </View>
      ) : (
        <View style={{ position: "relative" }}>
          {(plansDetails || selectedDatePlan) && (
            <Pressable
              style={({ pressed }) => [
                pressed && { opacity: 0.5 },
                { position: "absolute", left: 16, top: "35%", zIndex: 1 },
              ]}
              onPress={
                selectedDatePlan
                  ? () => {
                    // router.back();
                    dispatch(setWardrobeType("third"));
                    dispatch(setPlanDetails(null));
                    dispatch(setSelectedDatePlan(""));
                    router.push("/wardrobe");
                  }
                  : () => dispatch(setPlanDetails(null))
              }
            >
              <Ionicons name="chevron-back" size={20} />
            </Pressable>
          )}
          <ResourcesHeaderMain
            title={isAddOutfit ? t('wardrobe.selectItem') : t('wardrobe.wardrobe')}
          />
        </View>
      )}
      {type && uploadComponent}
      {!isTagItem && !isAddOutfit && (
        <View style={{ marginHorizontal: 20 }}>
          <ToggleTabs
            currentTab={wardrobeType}
            selectedTab={(data: any) => {
              dispatch(setWardrobeType(data));
              setScrollTab("");
              setSearch("");
              setOutfitSubTab(t('wardrobe.allOutfits')); // Reset sub-tab when main tab changes
            }}
            firstLabel={t('wardrobe.items')}
            secondLabel={t('wardrobe.outfits')}
            thirdLabel={uploadComponent ? "" : t('wardrobe.planTab')}
            small={false}
          />
        </View>
      )}

      {!isTagItem && !isAddOutfit && wardrobeType === "second" && (
        <TabSelector
          tabs={[t('wardrobe.allOutfits'), t('wardrobe.collections')]}
          activeTab={outfitSubTab}
          onTabChange={setOutfitSubTab}
        />
      )}

      {wardrobeType === "third" ? (
        <CreatePlanView />
      ) : wardrobeType === "second" && outfitSubTab === t('wardrobe.collections') ? (
        <CollectionsList token={token} />
      ) : (
        <WardrobeList
          type={wardrobeType === 'first' ? 'items' : 'outfits'}
          data={currentItems}
          loading={loading}
          isRefreshing={isRefreshing}
          isFetchingMore={isFetchingMore}
          searchValue={search}
          searchPlaceholder={getSearchPlaceholder()}
          {...getEmptyStateProps()}
          isTagItem={isTagItem}
          onSearchChange={handleSearchChange}
          onEndReached={handleEndReached}
          onRefresh={handleRefresh}
          onItemPress={handleItemPress}
          isItemTagged={isItemTagged}
        />
      )}

      {!type &&
        wardrobeType !== "third" &&
        (!isAddOutfit && (
          <TouchableOpacity
            style={styles.addViewIcon}
            onPress={
              wardrobeType === "first" ? handleAddItem : handleSelectOutfit
            }
          >
            <PlusIcon />
          </TouchableOpacity>
        ))}


      {isShowAddOutfitModal && (
        <AddoutfitModal onClose={() => setIsShowAddOutfitModal(false)} isShow />
      )}

      <AddToCollectionModal
        isShow={isShowAddToCollectionModal}
        onClose={() => setIsShowAddToCollectionModal(false)}
        onCloseComplete={() => {
          if (pendingAddToCollectionAction === "createCollection") {
            setPendingAddToCollectionAction(null);
            setIsShowCreateCollectionModal(true);
          } else if (pendingAddToCollectionAction === "createOutfit") {
            setPendingAddToCollectionAction(null);
            setShowSelectItemsModal(true);
          }
        }}
        onAddFromOutfits={handleAddFromOutfits}
        onCreateNewOutfits={handleCreateNewOutfits}
      />

      <CreateCollectionModal
        isShow={isShowCreateCollectionModal}
        onClose={() => setIsShowCreateCollectionModal(false)}
        onCloseComplete={() => {
          if (shouldOpenSelectAfterCreate) {
            setShouldOpenSelectAfterCreate(false);
            setIsShowSelectOutfitModal(true);
          }
        }}
        onSuccess={handleCollectionCreated}
        token={token}
      />

      <SelectOutfitModal
        isVisible={isShowSelectOutfitModal}
        onClose={handleCloseSelectOutfitModal}
        onSkip={handleSkipOutfitSelection}
        onNext={handleSelectOutfits}
        collectionId={currentCollectionId}
        collectionName={currentCollectionName}
        token={token}
        loading={addOutfitsMutation.isPending}
      />

      {isShowFilterModal && (
        <ProductFilterModal
          onClose={() => setIsShowFilterModal(false)}
          isShow={isShowFilterModal}
          handleApply={() => {
            getItemFromServer();
            setIsShowFilterModal(false);
          }}
        />
      )}

      <SelectItemsForPlanModal
        ref={selectItemsModalRef}
        isVisible={showSelectItemsModal}
        onClose={handleSelectItemsClose}
        onSkip={handleSelectItemsSkip}
        onNext={handleSelectItemsNext}
        token={token}
        excludeItemIds={[]}
      />
    </View>
  );
};

export default WardrobeAndOutfits;

const styles = StyleSheet.create({
  addViewIcon: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: 'rgba(255, 59, 74, 1)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerContainer: {
    position: 'relative',
  },
  headerBtnView: {
    zIndex: 3,
    position: 'absolute',
    right: 16,
    top: 12,
  },
  headerBtn: {
    backgroundColor: '#FF3B4A',
    paddingVertical: 3,
    paddingHorizontal: 12,
  },
  headerTextBtn: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'DMSansSemiBold',
  },
  inactiveHeaderBtn: {
    backgroundColor: '#F6F7F7',
    paddingVertical: 3,
    paddingHorizontal: 12,
  },
  inactiveHeaderTextBtn: {
    color: '#D3D5D8',
    fontSize: 12,
    fontFamily: 'DMSansSemiBold',
  },
});
