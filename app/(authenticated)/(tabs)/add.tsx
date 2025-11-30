import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ResourcesHeaderMain } from '../../../components/StackHeader';
import UploadIcon from '../../../assets/images/svg/upload.svg';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Pics1 from '../../../assets/images/svg/pics1.svg';
import Pics2 from '../../../assets/images/svg/pics2.svg';
import DeleteIcon from '../../../assets/images/svg/delete.svg';
import { fontSz } from '../../../constants';
import { Colors } from '../../../constants/Colors';
import FilledButton from '../../../components/buttons/Filled_button';
import AppTextInput from '../../../components/AppTextInput';
import SelectWithDrawer from '../../../components/SelectWithDrawer';
import PriceSelector from '../../../components/PriceSelector';
import AmountInput from '../../../components/AmountInput';
import SelectItemCategoryModal from '../../../modals/SelectItemCategoryModal';
import SelectItemBrandModal from '../../../modals/SelectItemBrandModal';
import SelectItemSizeModal from '../../../modals/SelectItemSizeModal';
import SelectItemConditionModal from '../../../modals/SelectItemConditionModal';
import SelectItemMaterialsModal from '../../../modals/SelectItemMaterialModal';
import SelectItemColorModal from '../../../modals/SelectItemColorModal';
import { useNavigation, useRoute } from '@react-navigation/native';
import { generateGUID } from '../../../helper/guid-number';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import fileServerServices from '../../../services/features/file-server/fileServer';
import { useToast } from 'react-native-toast-notifications';
import MyResponsiveGrid from '../../../components/MyResponsiveGrid';
import wardrobeServices from '../../../services/features/wardrobe-service/wardrobeServices';
import configurationServices from '../../../services/features/configuration-service/configurationService';
import { setProfileTab } from '@redux/slice/profile/profileSlice';
import SelecParcelModal from 'modals/SelectParcelModal';
import { useApiService } from '@hooks/use-auth-guard/useApiService';
import SelectItemSeasonModal from '../../../modals/SelectItemSeasonModal';
import { useOptimizedImagePicker } from '@hooks/useOptimizedImagePicker';
import { useFeatures } from '@hooks/use-features';
import { useI18n } from '@hooks/use-i18n';
import { useQuery } from '@tanstack/react-query';
import { ICurrency } from '../../../services/features/orders/models';
import marketplaceServices from '../../../services/features/marketplace/marketplaceServices';

const { width: screenWidth } = Dimensions.get('window');

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

type Option = {
  label: string;
  items: string[];
  selectedValue: string;
  ref: React.RefObject<BottomSheetModal>;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
};

const Add: React.FC = () => {
  const { t } = useI18n();
  const toast = useToast();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { existingItemId }: any = route.params || {};
  const { callApi, callApiWithLoading } = useApiService();

  const { token, profile, postageAddress } = useAppSelector((state) => state?.userProfileSlice);
  const { itemSize } = useAppSelector((state) => state?.itemSizeSlice);
  const { colors } = useAppSelector((state) => state?.colorSlice);
  const { categories } = useAppSelector((state) => state?.categoriesSlice);
  
  // State for filtered sizes based on selected category
  const [filteredSizes, setFilteredSizes] = useState<any[]>([]);
  const [loadingSizes, setLoadingSizes] = useState(false);
  const [sizeSearchQuery, setSizeSearchQuery] = useState('');
  
  // Function to find category name by ID
  const findCategoryNameById = (categoryId: string, categoriesList: any[] = (categories as any) || []): string => {
    if (!categoriesList || !categoryId) return 'Unknown Category';
    
    for (const category of categoriesList) {
      if (category.id === categoryId) {
        return category.name || 'Unknown Category';
      }
      // Check children recursively
      if (category.children && category.children.length > 0) {
        const found = findCategoryNameById(categoryId, category.children);
        if (found !== 'Unknown Category') {
          return found;
        }
      }
    }
    return 'Unknown Category';
  };
  
  const { isOfflineShipping, features, isLoading: featuresLoading } = useFeatures();
  const [successVisible, setSuccessVisible] = useState<boolean>(false);
  const [images, setImages] = useState<any[]>([]);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [errors, setErrors]: any = useState<Errors>({});
  const [cardWidth, setCardWidth] = useState(172);

  const [drawerType, setDrawerType] = useState<string | null>(null);
  const [loader, setLoader] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [imageLoader, setImageLoader] = useState(false);
  const [deleteImageName, setDeleteImageName] = useState<string | null>(null);
  const [imageRequestId, setImageRequestId] = useState('');

  const [newExistingItemId, setNewExistingItemId] = useState('');
  const snapPoints = useMemo(() => ['25%', '50%', '80%'], []);

  const [addImageFromServer, setAddImageFromServer] = useState<any[]>([]);
  const [resetExistingItemId, setResetNewExistingItemId] = useState<string>('');

  // Initialize component state only on mount, not on every focus
  useEffect(() => {
    setRefNumber(generateGUID());
    // Don't clear images on every focus - only initialize on mount
  }, []);

  const validateFields = useCallback(() => {
    let newErrors: { [key: string]: string } = {};
    if (!images.length) newErrors.images = 'Please upload at least one image';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [images]);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleCloseModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const {
    pickMultipleImages,
    error: pickerError,
    clearError: clearPickerError,
  } = useOptimizedImagePicker({
    maxResolution: null,
    maxFileSize: 1.9 * 1024 * 1024,
    quality: 0.9,
    format: 'auto',
    enableCropping: false,
    processing: {
      enableProgressiveJPEG: true,
      preserveTransparency: true,
      stripMetadata: true,
      enableSmartCropping: false,
      compressionAlgorithm: 'balanced',
      enableEnhancement: false,
      enableBackgroundRemoval: false,
    },
  });

  const handlePickImage = async () => {
    try {
      clearPickerError();
      setImageLoader(true);

      const results = await pickMultipleImages({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.9,
      });

      const parsedResult = results.map((result) => ({
        ...result,
        imageUri: result.uri,
        type: `image/${result.format}`,
      }));

      setImages((prevImages) => {
        const newImages = [...prevImages, ...parsedResult];

      
        return newImages;
      });

      setErrors((prevErrors: any) => ({ ...prevErrors, images: '' }));
      setImageLoader(false);
    } catch (error: any) {
   
      setImageLoader(false);
      setErrors((prevErrors: any) => ({
        ...prevErrors,
        images: error.message ?? pickerError?.message,
      }));
    }
  };

  const getImagesFromServer = async () => {
    setImageLoader(true);
    let getExpectedGuid = newExistingItemId ? imageRequestId : refNumber;

    await callApi(
      (token) => fileServerServices.getUserItemPicture(token, getExpectedGuid),
      {
        onSuccess: (res: any) => {
          setImageLoader(false);
          if (res?.status === 200) {
            setAddImageFromServer(res?.data);
            
          } else {
            setAddImageFromServer([]);
           
          }
        },
        onError: (error) => {
          setImageLoader(false);
          setAddImageFromServer([]);
         
        },
      },
    );
  };

  // Function to fetch sizes based on selected category
  const fetchSizesByCategory = async (categoryId: string, query?: string) => {
    if (!categoryId) {
      setFilteredSizes([]);
      return;
    }

    setLoadingSizes(true);
    const queryParam = query ? `?query=${encodeURIComponent(query)}&categoryId=${categoryId}` : `?categoryId=${categoryId}`;
    const fullEndpointUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/item-category-sizes${queryParam}`;
    const categoryName = findCategoryNameById(categoryId);
   
    // PLEASE USE THIS ENDPOINT URL IN THIS FORMAT INSTEAD
    // https://staging-api.digitizeapp.com/configuration/v1/item-category-sizes?query=small&categoryId=071e91ad-e74c-41cc-843c-610e4ac577dd
    await callApi(
      (token) => configurationServices.getSizesByCategory(token, categoryId, query),
      {
        onSuccess: (res: any) => {
          setLoadingSizes(false);
          const payload = res?.data ?? res;
          const dataset =
            Array.isArray(payload?.dataset)
              ? payload?.dataset
              : Array.isArray(payload?.data?.dataset)
              ? payload?.data?.dataset
              : Array.isArray(payload?.data)
              ? payload?.data
              : Array.isArray(payload)
              ? payload
              : [];

          if (Array.isArray(dataset) && dataset.length > 0) {
            const transformed = dataset.map((size: any) => ({
              id: size?.id,
              label: size?.size || size?.label || size?.name,
              name: size?.size || size?.label || size?.name,
              imageUrl: size?.imageUrl,
              status: size?.status,
            }));
            setFilteredSizes(transformed.filter((s: any) => s.label));
          } else {
            setFilteredSizes([]);
          }
        },
        onError: (error) => {
          setLoadingSizes(false);
          setFilteredSizes([]);
        },
      },
    );
  };

  // Function to handle size search
  const handleSizeSearch = (query: string) => {
    setSizeSearchQuery(query);
    const selectedCategoryId = addItemFormik?.values?.selectedCategoryId;
    if (selectedCategoryId) {
      fetchSizesByCategory(selectedCategoryId, query);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setNewExistingItemId('');
      if (existingItemId) {
        setImageRequestId('');
        getItemById();

        router.setParams({ existingItemId: '' });
      }

      // ("clear");
    }, [existingItemId]),
  );

  useEffect(() => {
    if (imageRequestId) {
      getImagesFromServer();
    }
  }, [imageRequestId]);

  useEffect(() => {
    if (token && images?.length && refNumber) {
      setImageLoader(true);
      let plartform = Platform.OS == 'android' ? true : false;
      let getExpectedGuid = newExistingItemId ? imageRequestId : refNumber;

      images?.map(async (imageList, index) => {
        await callApi(
          (token) =>
            fileServerServices.itemImageUpload(
              [imageList],
              plartform,
              getExpectedGuid,
              token,
            ),
          {
            onSuccess: (res: any) => {
              setImageLoader(false);
              setImages([]);
              if (res?.status === 200) {
                getImagesFromServer();
              } else {
               
                toast.show(`${res?.message || res?.detail}`, {
                  type: 'danger',
                  duration: 4000,
                });
              }
            },
            onError: (error) => {
              setImageLoader(false);
              setImages([]);
             
             
            },
          },
        );
      });

      return;
    }
  }, [token, images]);

  const addItemsValidationSchema = Yup?.object()?.shape({
    title: Yup.string().required('Required'),
    description: Yup.string().required('Required'),
    categoryId: Yup.string().required('Required'),
    brandId: Yup.string().required('Required'),
    sizeId: Yup.string().test(
      'size-required',
      'Required',
      function(value) {
        const { selectedCategoryId } = this.parent;
        // If category is selected but no sizes available, skip validation
        const hasCategoryButNoSizes = selectedCategoryId && filteredSizes.length === 0 && !loadingSizes;
        if (hasCategoryButNoSizes) {
          return true; // Skip validation when size field is disabled
        }
        return !!value; // Otherwise require value
      }
    ),
    conditionId: Yup.string().required('Required'),
    colourId: Yup.string().required('Required'),
    materialId: Yup.string(),
    selectedCategoryId: Yup.string().required('Required'),
    selectedBrandId: Yup.string().required('Required'),
    selectedSizeId: Yup.string().test(
      'size-required',
      'Required',
      function(value) {
        const { selectedCategoryId } = this.parent;
        // If category is selected but no sizes available, skip validation
        const hasCategoryButNoSizes = selectedCategoryId && filteredSizes.length === 0 && !loadingSizes;
        if (hasCategoryButNoSizes) {
          return true; // Skip validation when size field is disabled
        }
        return !!value; // Otherwise require value
      }
    ),
    selectedConditionId: Yup.string().required('Required'),
    selectedColourId: Yup.array().of(Yup.string()).min(1, 'Required'),
    selectedMaterialId: Yup.array().of(Yup.string()),
    price: Yup.string().required('Required'),
    seasonId: Yup.string().required('Required'),
    // Conditional validation based on shipping mode
    parcelId: Yup.string().when('isOfflineShipping', {
      is: false,
      then: (schema) => schema.required('Parcel size is required'),
      otherwise: (schema) => schema.notRequired()
    }),
    shippingPrice: Yup.string().when('isOfflineShipping', {
      is: true,
      then: (schema) => schema.required('Shipping fee is required'),
      otherwise: (schema) => schema.notRequired()
    }),
    selectedParcelId: Yup.string().when('isOfflineShipping', {
      is: false,
      then: (schema) => schema.required('Parcel size is required'),
      otherwise: (schema) => schema.notRequired()
    }),
  });

  const addItemFormik = useFormik({
    validationSchema: addItemsValidationSchema,
    initialValues: {
      title: '',
      description: '',
      categoryId: '',
      brandId: '',
      sizeId: '',
      conditionId: '',
      colourId: '',
      materialId: '',
      parcelId: '',
      selectedCategoryId: '',
      selectedBrandId: '',
      selectedSizeId: '',
      selectedConditionId: '',
      selectedColourId: [],
      selectedMaterialId: [],
      price: '',
      shippingPrice: '',
      selectedParcelId: '',
      seasonId: '',
      seasonName: '',
      isOfflineShipping: isOfflineShipping,
    },
    enableReinitialize: true,
    onSubmit: async (values: any) => {
    
      setLoader(true);

      if (addImageFromServer?.length === 0) {
       
       
        setLoader(false);
        return toast.show(`Image item must not be empty.`, {
          type: 'danger',
          duration: 4000,
        });
      }

     

      // Base data object with common fields
      const baseData = {
        title: values?.title,
        description: values?.description,
        defaultImageUrl: addImageFromServer[0]?.resourceUrl,
        price: parseInt(values?.price.replace(/,/g, ''), 10),
        categoryId: values?.selectedCategoryId,
        brandId: values?.selectedBrandId,
        sizeId: values?.selectedSizeId,
        conditionId: values?.selectedConditionId,
        colourIds: values?.selectedColourId,
        ...(values?.selectedMaterialId &&
          values?.selectedMaterialId.length > 0 && {
            materialIds: values?.selectedMaterialId,
          }),
        seasonId: values?.seasonId,
      };

      // Conditional shipping fields based on shipping mode
      const shippingFields = isOfflineShipping
        ? {
            offlineShippingPrice: parseInt(values?.shippingPrice.replace(/,/g, ''), 10),
          }
        : {
            parcelSizeId: values?.selectedParcelId,
          };

      const data: any = resetExistingItemId && resetExistingItemId.trim() !== ''
        ? {
            existingItemId: resetExistingItemId,
            ...baseData,
            ...shippingFields,
          }
        : {
            requestId: refNumber,
            ...baseData,
            ...shippingFields,
          };
    
      await callApi(
        (token) => {
          return wardrobeServices.createUserItem(data, token);
        },
        {
          onSuccess: (res) => {
           
            setLoader(false);
            if (res?.status === 200) {
              toast.show(
                resetExistingItemId 
                  ? 'Item successfully updated!' 
                  : 'successful', 
                {
                  type: 'success',
                  duration: 4000,
                }
              );
              
              // Reset form after successful item creation
              addItemFormik.resetForm();
              // Clear images after successful submission
              setAddImageFromServer([]);
              dispatch(setProfileTab('second'));
              router.replace('/profileMain');
            } else {
             
              toast.show(`${res?.message || res?.detail}`, {
                type: 'danger',
                duration: 4000,
              });
            }
          },
          onError: (error) => {
           
            setLoader(false);
            toast.show(`An error occurred. Please try again later.`, {
              type: 'danger',
              duration: 4000,
            });
          
          },
        },
      );
    },
  });

  const handleSellPress = useCallback(async () => {
    if (__DEV__) {
      const formErrors = await addItemFormik.validateForm();
    }
    addItemFormik.handleSubmit();
  }, [addItemFormik]);

  // Clear all form data and images - used for explicit cleanup
  const clearAllData = useCallback(() => {
    addItemFormik.resetForm();
    setAddImageFromServer([]);
    setRefNumber(generateGUID());
  }, [addItemFormik]);

  // ("addItemFormik", addItemFormik);

  const getActiveData = (
    allValues: any,
    findValue: string,
    isLabel?: boolean,
  ) => {
    // ("active data", allValues);
    if (isLabel) {
      const getData = allValues?.find(
        (list: any) => list?.label?.toLowerCase() === findValue?.toLowerCase(),
      );
      return getData?.id || '';
    }
    const getData = allValues?.find((list: any) => list?.id === findValue);
    return getData?.label || '';
  };

  const getItemById = async () => {
    await callApi(
      (token) => wardrobeServices.getItemById(token, existingItemId),
      {
        onSuccess: (res: any) => {
          if (res?.status === 200) {
            
            setNewExistingItemId(res?.data?.id);
            setResetNewExistingItemId(res?.data?.id);

            setImageRequestId(res?.data?.requestId);
            addItemFormik.setFieldValue('selectedBrandId', res?.data?.brandId);
            addItemFormik.setFieldValue('brandId', res?.data?.brand);
            addItemFormik.setFieldValue('selectedSizeId', res?.data?.sizeId);
            addItemFormik.setFieldValue(
              'selectedCategoryId',
              res?.data?.categoryId,
            );
            addItemFormik.setFieldValue('categoryId', res?.data?.category);
            addItemFormik.setFieldValue(
              'sizeId',
              getActiveData(itemSize, res?.data?.sizeId),
            );
            addItemFormik.setFieldValue(
              'selectedColourId',
              Array.isArray(res?.data?.colours) ? res?.data?.colours : [],
            );
            const existingColourLabels = (Array.isArray(res?.data?.colours) ? res?.data?.colours : [])
              .map((id: string) => getActiveData(colors, id))
              .filter((v: string) => !!v)
              .join(', ');
            addItemFormik.setFieldValue('colourId', existingColourLabels);
          }
        },
        onError: (error) => {
          if (__DEV__) {
          }
        },
      },
    );
  };

  const handleSelectColor = (colors: any) => {
    if (Array.isArray(colors)) {
      addItemFormik?.setFieldValue(
        'colourId',
        colors.map((color) => color?.target?.value).join(', '),
      );
      addItemFormik?.setFieldValue(
        'selectedColourId',
        colors.map((color) => color?.target?.id),
      );
      setDrawerType(null);
      return;
    }
    addItemFormik?.setFieldValue('colourId', colors?.target?.value);
    addItemFormik?.setFieldValue('selectedColourId', [colors?.target?.id]);
    setDrawerType(null);
  };

  const handleSelectMaterial = (materials: any) => {
    if (Array.isArray(materials)) {
      addItemFormik?.setFieldValue(
        'materialId',
        materials.map((color) => color?.target?.value).join(', '),
      );
      addItemFormik?.setFieldValue(
        'selectedMaterialId',
        materials.map((color) => color?.target?.id),
      );
      setDrawerType(null);
      return;
    }
    addItemFormik?.setFieldValue('materialId', materials?.target?.value);
    addItemFormik?.setFieldValue('selectedMaterialId', [materials?.target?.id]);

    setDrawerType(null);
  };

  // Initialize form only on component mount, not on every focus
  useEffect(() => {
    // Only reset form on initial mount when not editing an existing item
    if (!existingItemId && !newExistingItemId) {
      addItemFormik.resetForm();
    }
  }, []); // Empty dependency array ensures this runs only on initial mount

  // Update form values when isOfflineShipping changes
  useEffect(() => {
    addItemFormik.setFieldValue('isOfflineShipping', isOfflineShipping);
    // Reset shipping fields when toggling offline shipping
    if (!isOfflineShipping) {
      addItemFormik.setFieldValue('shippingPrice', '');
    } else {
      addItemFormik.setFieldValue('selectedParcelId', '');
      addItemFormik.setFieldValue('parcelId', '');
    }
  }, [isOfflineShipping]);

  // Watch for category changes and fetch corresponding sizes
  useEffect(() => {
   
    const selectedCategoryId = addItemFormik.values.selectedCategoryId;
    
    // Log all available category IDs and names
    const getAllCategoryIds = (categoriesList: any[] = (categories as any) || [], parentPath = ''): any[] => {
      let allCategories: any[] = [];
      if (!categoriesList) return allCategories;
      
      categoriesList.forEach(category => {
        const currentPath = parentPath ? `${parentPath} > ${category.name}` : category.name;
        allCategories.push({
          id: category.id,
          name: category.name,
          path: currentPath
        });
        
        if (category.children && category.children.length > 0) {
          allCategories = [...allCategories, ...getAllCategoryIds(category.children, currentPath)];
        }
      });
      
      return allCategories;
    };
    
    const allCategories = getAllCategoryIds();
    
    if (selectedCategoryId) {
      const selectedCategoryName = findCategoryNameById(selectedCategoryId);
      
      // Clear any existing sizes before fetching new ones
      setFilteredSizes([]);
      
      fetchSizesByCategory(selectedCategoryId);
      // Clear size selection when category changes
      addItemFormik.setFieldValue('sizeId', '');
      addItemFormik.setFieldValue('selectedSizeId', '');
    } else {
      setFilteredSizes([]);
    }
  }, [addItemFormik.values.selectedCategoryId]);

  // Handle price from SetShippingPrice screen
  useFocusEffect(
    useCallback(() => {
      if (params.price && params.price !== addItemFormik.values.price) {
        if (__DEV__) {
        }
        addItemFormik.setFieldValue('price', params.price);
      }
    }, [params.price, addItemFormik.values.price]),
  );

  // Handle shippingPrice from SetShippingPrice screen
  useFocusEffect(
    useCallback(() => {
      if (
        params.shippingPrice &&
        params.shippingPrice !== addItemFormik.values.shippingPrice
      ) {
        if (__DEV__) {
        }
        addItemFormik.setFieldValue('shippingPrice', params.shippingPrice);
      }
    }, [params.shippingPrice, addItemFormik.values.shippingPrice]),
  );

  const handleDeleteImage = async (data: { resourceName: string; requestId: string }) => {
    setDeleteImageName(data?.resourceName);

    await callApi(
      (token) =>
        fileServerServices.deleteItemImage(
          token,
          encodeURIComponent(data?.requestId),
          data?.resourceName,
        ),
      {
        onSuccess: (res) => {
          setDeleteImageName(null);
          if (res?.status === 200) {
            getImagesFromServer();
            toast.show(`${res?.message || res?.detail}`, {
              type: 'success',
              duration: 4000,
            });
          } else {
            toast.show(`${res?.message || res?.detail}`, {
              type: 'danger',
              duration: 4000,
            });
          }
        },
        onError: (error) => {
          setDeleteImageName(null);
          toast.show(`An error occurred. Please try again later.`, {
            type: 'danger',
            duration: 4000,
          });
          if (__DEV__) {
          }
        },
      },
    );
  };

  const imageTemplate = addImageFromServer.map((imageData: any, index: number) => (
    <View key={index} style={[styles.imageWrapper, { width: cardWidth }]}>
      {/* <Text>{imageData?.requestId}</Text> */}
      <Image
        source={{ uri: imageData?.resourceUrl }}
        style={[styles.image]}
        resizeMode={'contain'}
      />
      {deleteImageName === imageData?.resourceName ? (
        ''
      ) : (
        <TouchableOpacity
          onPress={() => {
            // resetForms();
            handleDeleteImage(imageData);
          }}
          style={styles.deleteIcon}
        >
          <DeleteIcon width={50} height={50} />
        </TouchableOpacity>
      )}
    </View>
  ));

  // Get countryId from shipping address (postageAddress) - this is the shipping data from backend
  // Fallback to profile countryId if shipping address is not available
  const countryId = useMemo(() => {
    return postageAddress?.countryId || profile?.countryId;
  }, [postageAddress?.countryId, profile?.countryId]);

  // Fetch currency from marketplace features endpoint based on countryId
  // Primary source: GET /marketplace/v1/{countryId}/features
  const { data: currencyData } = useQuery<ICurrency | null>({
    queryKey: ['currency', countryId],
    queryFn: async () => {
      if (!countryId) return null;
      
      try {

        // Use features endpoint as primary source for currency
        const featuresResponse = await marketplaceServices.features(countryId);
        
        if (featuresResponse?.status === 200 && featuresResponse?.data) {
          const featuresData = featuresResponse.data as any;
          
          // Extract currency from data.country object (primary structure)
          // Response structure: { data: { country: { currencySymbol, currencyCode, currency, ... } } }
          let currencyInfo: ICurrency | null = null;
          
          // Check 1: Currency in country object (primary structure from API)
          if (featuresData?.country && featuresData.country.currencySymbol) {
            currencyInfo = {
              countryId: featuresData.country.id || countryId,
              currencyId: featuresData.country.currencyId || '',
              currencySymbol: featuresData.country.currencySymbol,
              currencyName: featuresData.country.currency || featuresData.country.currencyName || '',
              currencyCode: featuresData.country.currencyCode || '',
            };
          }
          // Check 2: Currency object at root level (fallback)
          else if (featuresData?.currency && typeof featuresData.currency === 'object') {
            currencyInfo = {
              countryId,
              currencyId: featuresData.currency.currencyId || '',
              currencySymbol: featuresData.currency.currencySymbol || '',
              currencyName: featuresData.currency.currencyName || '',
              currencyCode: featuresData.currency.currencyCode || '',
            };
          }
          // Check 3: Currency fields at root level (fallback)
          else if (featuresData?.currencySymbol) {
            currencyInfo = {
              countryId,
              currencyId: featuresData.currencyId || '',
              currencySymbol: featuresData.currencySymbol,
              currencyName: featuresData.currencyName || '',
              currencyCode: featuresData.currencyCode || '',
            };
          }
          
          if (currencyInfo?.currencySymbol) {
            return currencyInfo;
          } 
        } 
      } catch (error) {
       
      }
      
      return null;
    },
    enabled: !!countryId,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    retry: 1,
  });

  // Currency mapping fallback for common countries (until backend endpoint is confirmed)
  // This should be removed once backend provides currency via API
  const getCurrencyFallback = useCallback((countryId: string | undefined): string => {
    if (!countryId) return "$";
    
    const currencyMap: Record<string, string> = {
      'NG': '₦', // Nigeria - Naira
      'US': '$', // United States - Dollar
      'GB': '£', // United Kingdom - Pound
      'EU': '€', // European Union - Euro
      'JP': '¥', // Japan - Yen
      'CN': '¥', // China - Yuan
      'IN': '₹', // India - Rupee
      'ZA': 'R', // South Africa - Rand
      'KE': 'KSh', // Kenya - Shilling
      'GH': '₵', // Ghana - Cedi
    };
    
    return currencyMap[countryId] || "$";
  }, []);

  // Get currency symbol with fallback chain:
  // 1. Currency from backend based on shipping address countryId
  // 2. Currency from fallback mapping based on countryId
  // 3. Profile currency (if available)
  // 4. Default "$"
  const currencySymbol = useMemo(() => {
    if (currencyData?.currencySymbol) {
      return currencyData.currencySymbol;
    }
    
    // Use fallback mapping if backend didn't return currency
    const fallbackCurrency = getCurrencyFallback(countryId);
    if (fallbackCurrency !== "$") {
      return fallbackCurrency;
    }
    
    // Last resort fallbacks
    return (profile as any)?.currencySymbol || "$";
  }, [currencyData?.currencySymbol, countryId, getCurrencyFallback, profile]);

  return (
    <BottomSheetModalProvider>
      <View
        style={[
          {
            flex: 1,
            backgroundColor: Colors.light.background,
            paddingHorizontal: 20,
            paddingVertical: 16,
            marginTop: Platform.OS == 'android' ? 20 : 20,
          },
        ]}
      >
        <ResourcesHeaderMain title={existingItemId ? t('wardrobe.editItem') : t('sell.sellAnItem')} />
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 80 }}
          >
            <Text style={styles.title}>{t('sell.addImages')}</Text>
            <View>
              <View style={styles.instructionsContainer}>
                <View style={styles.textContainer}>
                  <Text style={styles.textBold}>{t('sell.uploadUpTo10Images')} </Text>
                  <Text
                    onPress={handlePresentModalPress}
                    style={styles.textLink}
                  >
                    {t('sell.seePhotoTips')}
                  </Text>
                </View>
                <Text style={styles.textSmall}>
                  {t('sell.formatInfo')}
                </Text>
                {imageLoader ? (
                  <TouchableOpacity style={styles.uploadButton}>
                    <UploadIcon width={20} height={20} />
                    <Text style={styles.uploadText}>{t('sell.loading')}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    // onPress={pickImage}
                    onPress={handlePickImage}
                  >
                    <UploadIcon width={20} height={20} />
                    <Text style={styles.uploadText}>{t('sell.uploadPhotos')}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* display image here */}
              <ScrollView>
                <MyResponsiveGrid
                  template={imageTemplate}
                  subtractFromMargin={40}
                  getNumberOfRows={(data: number) => setCardWidth(data)}
                />
              </ScrollView>

              {errors.images ? (
                <Text style={{ color: 'red' }}>{errors.images}</Text>
              ) : null}
            </View>

            <View style={styles.inputViewWrapper}>
              <AppTextInput
                onChangeText={addItemFormik.handleChange('title')}
                value={addItemFormik?.values?.title}
                error={
                  addItemFormik.submitCount > 0 && addItemFormik.errors.title
                }
                placeholder={t('sell.whatAreYouTrifting')}
                label={t('sell.title')}
              />
            </View>
            <View style={{ marginVertical: 16 }}>
              <AppTextInput
                isMultiline
                onChangeText={addItemFormik.handleChange('description')}
                value={addItemFormik?.values?.description}
                error={
                  addItemFormik.submitCount > 0 &&
                  addItemFormik.errors.description
                }
                placeholder={t('sell.exampleDescription')}
                label={t('sell.describeItem')}
              />
            </View>

            <Text style={styles.title}>{t('sell.item')}</Text>

            <View style={{ marginVertical: 16 }}>
              <SelectWithDrawer
                value={addItemFormik?.values?.categoryId || t('sell.category')}
                onPress={() => setDrawerType('category')}
                activeColor={addItemFormik?.values?.categoryId && 'black'}
                error={
                  addItemFormik.submitCount > 0 &&
                  addItemFormik.errors.categoryId
                }
              />
            </View>
            <View style={{ marginVertical: 16 }}>
              <SelectWithDrawer
                value={addItemFormik?.values?.brandId || t('sell.brand')}
                onPress={() => setDrawerType('brand')}
                activeColor={addItemFormik?.values?.brandId && 'black'}
                error={
                  addItemFormik.submitCount > 0 && addItemFormik.errors.brandId
                }
              />
            </View>
            <View style={{ marginVertical: 16 }}>
              <SelectWithDrawer
                value={
                  loadingSizes 
                    ? t('common.loading') 
                    : addItemFormik?.values?.sizeId 
                    ? addItemFormik?.values?.sizeId
                    : t('sell.size')
                }
                onPress={() => {
                  const selectedCategoryId = addItemFormik?.values?.selectedCategoryId;
                  
                  if (!loadingSizes) {
                    // If no category is selected, don't open the modal
                    if (!selectedCategoryId) {
                      return;
                    }
                    
                    // If no sizes available for this category, don't open the modal
                    if (filteredSizes.length === 0 && selectedCategoryId) {
                      return;
                    }
                    
                    // Always refresh sizes when opening the modal to ensure fresh data
                    // This handles cases where the same category is selected again
                    fetchSizesByCategory(selectedCategoryId);
                    setDrawerType('size');
                  }
                }}
                activeColor={addItemFormik?.values?.sizeId && 'black'}
                disabled={!addItemFormik?.values?.selectedCategoryId || (filteredSizes.length === 0 && !loadingSizes)}
                helperText={
                  addItemFormik?.values?.selectedCategoryId && filteredSizes.length === 0 && !loadingSizes
                    ? t('sell.noSizesSelectAnotherCategory')
                    : undefined
                }
                error={
                  addItemFormik.submitCount > 0 && addItemFormik.errors.sizeId
                }
              />
            </View>
            <View style={{ marginVertical: 16 }}>
              <SelectWithDrawer
                value={addItemFormik?.values?.colourId || t('sell.colour')}
                activeColor={addItemFormik?.values?.colourId && 'black'}
                onPress={() => setDrawerType('colour')}
                error={
                  addItemFormik.submitCount > 0 && addItemFormik.errors.colourId
                }
              />
            </View>
            <View style={{ marginVertical: 16 }}>
              <SelectWithDrawer
                value={addItemFormik?.values?.conditionId || t('sell.condition')}
                activeColor={addItemFormik?.values?.conditionId && 'black'}
                onPress={() => setDrawerType('condition')}
                error={
                  addItemFormik.submitCount > 0 &&
                  addItemFormik.errors.conditionId
                }
              />
            </View>
            <View style={{ marginVertical: 16 }}>
              <SelectWithDrawer
                value={
                  addItemFormik?.values?.materialId || t('sell.material')
                }
                activeColor={addItemFormik?.values?.materialId && 'black'}
                onPress={() => setDrawerType('material')}
                error={
                  addItemFormik.submitCount > 0 &&
                  addItemFormik.errors.materialId
                }
              />
            </View>
            <View style={{ marginVertical: 16 }}>
              <SelectWithDrawer
                value={addItemFormik?.values?.seasonName || t('sell.season')}
                activeColor={addItemFormik?.values?.seasonId && 'black'}
                onPress={() => setDrawerType('season')}
                error={
                  addItemFormik.submitCount > 0 && addItemFormik.errors.seasonId
                }
              />
            </View>
            <View style={{ marginVertical: 16 }}>
              <AmountInput
                label={t('sell.itemPrice')}
                value={addItemFormik?.values?.price}
                onChangeText={(value) =>
                  addItemFormik.setFieldValue('price', value)
                }
                keyboardType="numeric"
                placeholder={t('sell.enterItemPrice')}
                error={
                  addItemFormik.submitCount > 0
                    ? (addItemFormik.errors.price as string)
                    : undefined
                }
                currency={currencySymbol}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderWidth: 0,
                }}
                autoFocus={false}
              />
            </View>
            {/* Conditional shipping fields based on shipping mode */}
            {isOfflineShipping ? (
              <View style={{ marginVertical: 16 }}>
                <PriceSelector
                  value={addItemFormik?.values?.shippingPrice}
                  currency={currencySymbol}
                  onPress={() =>
                    router.push({
                      pathname: '/SetShippingPrice',
                      params: {
                        shippingPrice: addItemFormik?.values?.shippingPrice,
                        onSave: 'true',
                      },
                    })
                  }
                  error={
                    addItemFormik.submitCount > 0
                      ? (addItemFormik.errors.shippingPrice as string)
                      : undefined
                  }
                />
              </View>
            ) : (
              <View style={{ marginVertical: 16 }}>
                <SelectWithDrawer
                  value={addItemFormik?.values?.parcelId || t('sell.parcelSize')}
                  activeColor={addItemFormik?.values?.parcelId && 'black'}
                  onPress={() => setDrawerType('parcel')}
                  error={
                    addItemFormik.submitCount > 0 && addItemFormik.errors.parcelId
                  }
                />
              </View>
            )}
            <View style={{ marginTop: 20 }}>
              <FilledButton
                title={existingItemId ? t('wardrobe.editItem') : t('sell.sellItem')}
                loading={loader}
                onPress={handleSellPress}
              />
            </View>
          </ScrollView>

          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={2}
            snapPoints={snapPoints}
            enableDismissOnClose={true}
          >
            <BottomSheetView style={styles.contentContainer}>
              <View style={styles.headerContainer}>
                <Text style={styles.headerText}>{t('sell.photoTips')}</Text>
                <TouchableOpacity
                  style={styles.closeIconContainer}
                  onPress={handleCloseModal}
                >
                  <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>
              </View>

              {/* Scrollable content inside the bottom sheet */}
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
                    text: 'Take photos in a well lit area. Bright daylight is best',
                    text1: 'Choose natural light',
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
                    text: 'Take photos in a well lit area. Bright daylight is best',
                    text1: 'Pick a neutral background',
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
                    text: 'Take photos in a well lit area. Bright daylight is best',
                    text1: 'Don’t use flash',
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

          {drawerType === 'category' && true && (
            <SelectItemCategoryModal
              isShow={drawerType === 'category' && true}
              onClose={() => setDrawerType(null)}
              name="categoryId"
              onSelect={(e: any) => {
                addItemFormik?.setFieldValue('categoryId', e?.target?.value);
                addItemFormik?.setFieldValue(
                  'selectedCategoryId',
                  e?.target?.id,
                );
                addItemFormik?.setFieldError('categoryId', '');
                addItemFormik?.setFieldError('selectedCategoryId', '');
                setDrawerType(null);
              }}
            />
          )}

          {drawerType === 'brand' && true && (
            <SelectItemBrandModal
              isShow={drawerType === 'brand' && true}
              onClose={() => setDrawerType(null)}
              name="brandId"
              onSelect={(e: any) => {
                addItemFormik?.setFieldValue('brandId', e?.target?.value);
                addItemFormik?.setFieldValue('selectedBrandId', e?.target?.id);
                setDrawerType(null);
              }}
            />
          )}
          
          
            {drawerType === 'size' && true && (() => {
              
              return (
                <SelectItemSizeModal
                  isShow={drawerType === 'size' && true}
                  onClose={() => setDrawerType(null)}
                  name="sizeId"
                  sizes={filteredSizes}
                  onSearch={handleSizeSearch}
                  onSelect={(e: any) => {
                    addItemFormik?.setFieldValue('sizeId', e?.target?.value);
                    addItemFormik?.setFieldValue('selectedSizeId', e?.target?.id);
                    setDrawerType(null);
                  }}
                />
              );
            })()}
          {drawerType === 'condition' && true && (
            <SelectItemConditionModal
              isShow={drawerType === 'condition' && true}
              onClose={() => setDrawerType(null)}
              name="conditionId"
              onSelect={(e: any) => {
                addItemFormik?.setFieldValue('conditionId', e?.target?.value);
                addItemFormik?.setFieldValue(
                  'selectedConditionId',
                  e?.target?.id,
                );
                setDrawerType(null);
              }}
            />
          )}

          {drawerType === 'parcel' && true && (
            <SelecParcelModal
              isShow={drawerType === 'parcel' && true}
              onClose={() => setDrawerType(null)}
              name="parcelId"
              value={addItemFormik?.values?.selectedParcelId}
              onSelect={(e: any) => {
                addItemFormik?.setFieldValue('parcelId', e?.target?.value);
                addItemFormik?.setFieldValue('selectedParcelId', e?.target?.id);
                setDrawerType(null);
              }}
            />
          )}

          {drawerType === 'colour' && true && (
            <SelectItemColorModal
              isShow={drawerType === 'colour' && true}
              onClose={() => setDrawerType(null)}
              name="colourId"
              onSelect={handleSelectColor}
              multipleSelect={true}
              maxSelection={2}
              selected={addItemFormik?.values?.selectedColourId}
            />
          )}

          {drawerType === 'season' && true && (
            <SelectItemSeasonModal
              isShow={drawerType === 'season' && true}
              onClose={() => setDrawerType(null)}
              name="seasonId"
              onSelect={(season: any) => {
                addItemFormik?.setFieldValue('seasonId', season?.target?.id);
                addItemFormik?.setFieldValue(
                  'seasonName',
                  season?.target?.label,
                );
                setDrawerType(null);
              }}
              mode={'active'}
              selected={addItemFormik?.values?.seasonId}
            />
          )}

          {drawerType === 'material' && true && (
            <SelectItemMaterialsModal
              isShow={drawerType === 'material' && true}
              onClose={() => setDrawerType(null)}
              name="materialId"
              onSelect={handleSelectMaterial}
              multipleSelect={true}
              maxSelection={3}
              selected={addItemFormik?.values?.selectedMaterialId}
            />
          )}
        </KeyboardAvoidingView>
      </View>
    </BottomSheetModalProvider>
  );
};

export default Add;

const styles = StyleSheet.create({
  title: {
    fontSize: fontSz(14),
    marginVertical: 10,
    fontFamily: 'DMSansMedium',
    color: '#353535',
  },
  input: {
    paddingLeft: 10,
    paddingVertical: 10,
    fontSize: fontSz(14),
    textAlign: 'justify',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E9F0',
    flexDirection: 'row',
    fontFamily: 'DMSansRegular',
    color: '#212B36',
    backgroundColor: 'white',
  },
  multilineInput: {
    minHeight: 100,
    maxHeight: 150,
  },
  rowText: {
    textAlign: 'left',
    paddingTop: 10,
    color: '#787878',
    fontFamily: 'DMSansRegular',
  },
  rowTextMain: {
    textAlign: 'left',
    paddingTop: 10,
    fontFamily: 'DMSansBold',
  },

  instructionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderColor: '#E2E9F0',
    borderWidth: 1,
    padding: 40,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5,
  },
  textBold: {
    textAlign: 'center',
    fontFamily: 'DMSansRegular',
    color: '#90959E',
    fontSize: fontSz(14),
  },
  textLink: {
    color: '#D4313E',
    textDecorationLine: 'underline',
    fontFamily: 'DMSansRegular',
    fontSize: fontSz(14),
  },
  textSmall: {
    color: '#888',
    fontSize: fontSz(14),
    textAlign: 'center',
    fontFamily: 'DMSansRegular',
  },
  headerContainer: {
    flexDirection: 'row',
    top: -20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    textAlign: 'center',
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryOption: {
    padding: 15,
    borderBottomColor: '#E2E9F0',
    borderBottomWidth: 1,
  },
  categoryText: {
    fontSize: 16,
    color: '#212C3D',
    fontFamily: 'DMSansRegular',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 12,
    borderColor: '#464F5D',
    borderWidth: 2,
    marginTop: 20,
    marginHorizontal: 60,
  },
  uploadText: {
    marginLeft: 5,
    fontFamily: 'DMSansMedium',
    fontSize: fontSz(14),
    color: '#464F5D',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageContainerPics: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
    gap: 20,
  },
  image: {
    width: '100%',
    height: 150,
    overflow: 'hidden',
    borderRadius: 5,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 20,
  },
  closeIconContainer: {
    position: 'absolute',
    right: 10,
    zIndex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  imageWrapper: {
    position: 'relative',
    margin: 5,
  },
  deleteIcon: {
    position: 'absolute',
    top: 5,
    right: 1,
  },
  inputViewWrapper: {
    marginTop: 16,
  },
});