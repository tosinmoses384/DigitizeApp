import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Modal,
  Text,
  StyleSheet,
  View,
  Platform,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SIZES } from "../constants/Colors";
import { useAppSelector } from "../redux/store";
// import configurationServices from "../services/features/configuration-service/configurationService";
// import ChevronRightIcon from "../assets/images/svg/chevron-right-arrow.svg";
import { TouchableOpacity } from "react-native-gesture-handler";
import SeeAllIcon from "../assets/images/svg/seeAllIcon.svg";
import { ScrollView } from "react-native";
import SearchInput from "../components/SearchInput";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import { useToast } from "react-native-toast-notifications";
import AddCircleSvgComponent from "@assets/images/svg_components/add_circle";
import { useDispatch } from "react-redux";
import { setBrands } from "@redux/slice/brands/itemBrandsSlice";
interface ISelectItemCategoryModal {
  onClose: any;
  isShow: boolean;
  name: string;
  onSelect: any;
  onToast?: (message: string, type: 'success' | 'danger' | 'info') => void;
  onBrandAdded?: () => void; // Callback to refetch brands
}
const SelectItemBrandModal = ({
  onClose,
  isShow,
  name,
  onSelect,
  onToast,
  onBrandAdded,
}: ISelectItemCategoryModal) => {
  const { brands }: any = useAppSelector((state) => state?.brandsSlice);
  const [search, setSearch] = useState("");
  const [brandOptions, setBrandOptions]: any = useState([]);
  const [searchedBrand, setSearchedBrand] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // Force refresh mechanism
    const { token, profile } = useAppSelector((state) => state?.userProfileSlice);
  const toast = useToast();
const dispatch = useDispatch();
    const [searchLoader, setSearchLoader] = useState(false);
  
  useEffect(() => {
    console.log('🔄 useEffect triggered - Brands from Redux:', brands);
    console.log('🔄 Type of brands:', typeof brands, 'Array?', Array.isArray(brands));
    console.log('🔄 Current brandOptions before update:', brandOptions);
    
    if (brands && Array.isArray(brands)) {
      setBrandOptions(brands);
      console.log('✅ Set brandOptions to:', brands);
      console.log('✅ Number of brands:', brands.length);
    } else {
      console.log('❌ Brands is not an array, keeping empty array');
      setBrandOptions([]);
    }
  }, [brands]);

  // Force refresh effect when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0) {
      console.log('🔄 Refresh key changed, forcing brand options update:', refreshKey);
      if (brands && Array.isArray(brands)) {
        setBrandOptions([...brands]); // Create new array reference to force re-render
        console.log('✅ Force updated brandOptions with', brands.length, 'brands');
      }
    }
  }, [refreshKey, brands]);

  // Ensure brandOptions is always an array before filtering
  console.log('🔍 brandOptions before filter:', brandOptions, 'Type:', typeof brandOptions, 'IsArray:', Array.isArray(brandOptions));
  console.log('🔍 Current search term:', search);
  const safeBrandOptions = Array.isArray(brandOptions) ? brandOptions : [];
  const newBrandOptions = safeBrandOptions.filter((list: any) =>
    list?.name?.toLocaleLowerCase()?.includes(search?.toLocaleLowerCase())
  );
  console.log('🔍 Filtered results:', newBrandOptions.length, 'brands found');
  console.log('🔍 Filtered brand names:', newBrandOptions.map(b => b.name));



const addBrand = async () => {
  setSearchLoader(true);
  console.log("Starting addBrand function");
  
  try {
    const response = await marketplaceServices.addBrands(token, searchedBrand);
    console.log("API Response:", response);

    if (response?.responseCode != 0) {
       console.log("Error case - responseCode:", response?.responseCode);
       console.log("Error detail:", response["detail"]);
       
       // Use callback to show toast outside modal or fallback to Alert
       const errorMessage = response["detail"] || "Failed to add brand";
       console.log('Showing error message:', errorMessage);
       
       // Always show Alert for immediate feedback, and also try toast
       Alert.alert("Error", errorMessage, [{ text: "OK" }]);
       
       if (onToast) {
         console.log('Also trying toast callback');
         onToast(errorMessage, 'danger');
       }
       
       setSearchLoader(false);
       return;
    }
    
    // Success case
    console.log("Success case - showing success message");
    const successMessage = "Brand added successfully!";
    
    // Always show Alert for immediate feedback, and also try toast
    Alert.alert("Success", successMessage, [{ text: "OK" }]);
    
    if (onToast) {
      console.log('Also trying success toast callback');
      onToast(successMessage, 'success');
    }

    setSearchLoader(false);
    // DON'T clear search text - keep it so user can select the new brand
    // setSearchedBrand('');
    // setSearch('');
    
    // SUCCESS: Use the real brand data from API response
    console.log('✅ Brand added successfully, API response:', response);
   // console.log('✅ Response data:', response.data);
    
    // Extract the real brand data from the API response
    let newBrandData;
    if (response.data && typeof response.data === 'object') {
      // The API should return the newly created brand

      console.log('✅ Response data: ====', response.data.id);
      console.log('✅ Response data:=======', response.data.brandIsd);

      newBrandData = {
        id: response.data.id || response.data.brandId || `temp_${Date.now()}`,
        name: response.data.name || searchedBrand,
        logoImageUrl: response.data.logoImageUrl || '',
        status: response.data.status || 'Active',
        createdOn: response.data.createdOn || new Date().toISOString()
      };
    } else {
      // Fallback if response structure is unexpected
      newBrandData = {
        id: `temp_${Date.now()}`,
        name: searchedBrand,
        logoImageUrl: '',
        status: 'Active',
        createdOn: new Date().toISOString()
      };
    }
    
    console.log('✨ Adding real brand data to local state:', newBrandData);
    const currentBrands = Array.isArray(brandOptions) ? brandOptions : [];
    const updatedBrands = [newBrandData, ...currentBrands];
    setBrandOptions(updatedBrands);
    dispatch(setBrands(updatedBrands));
    // The brand is now added to local state with real backend data
    // No need to trigger Redux refetch since we have the real data locally
    console.log('✅ Brand successfully added to local state with real backend data');
    console.log('✅ Brand can now be selected immediately with real ID:', newBrandData.id);
    
    // DON'T trigger background refetch immediately as it overwrites our local state
    // The brand is already added to backend and local state, no need for immediate refetch
    console.log('✅ Brand successfully added to local state and Redux. Skipping background refetch to prevent overwrite.');
    
    // Optional: Only refetch much later if needed for other users/sessions
    // setTimeout(() => {
    //   if (onBrandAdded) {
    //     console.log('🔄 Late background sync (optional)');
    //     onBrandAdded();
    //   }
    // }, 30000); // 30 seconds later
  } catch (error: any) {
    console.log("Caught error:", error);
    setSearchLoader(false);
    
    const errorMessage = "An unexpected error occurred";
    console.log('Showing catch error message:', errorMessage);
    
    // Always show Alert for immediate feedback, and also try toast
    Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    
    if (onToast) {
      console.log('Also trying error toast callback');
      onToast(errorMessage, 'danger');
    }

    if (error.response) {
      console.error("Backend Error:", error.response.data);
    } else {
      console.error("Unknown Error:", error.message);
    }
  }
};








  return (
    <Modal visible={isShow} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.wrapper]}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              pressed && styles.pressed,
              styles.backwrapper,
            ]}
            onPress={onClose}
          >
            <Ionicons
              name="chevron-back"
              color={"rgba(70, 79, 84, 1)"}
              size={20}
            />
          </Pressable>

          <Text style={styles.headerTitle}>Brands</Text>
        </View>
        <View style={styles.searchContainer}>
          <SearchInput 
        //  value={search} onChangeText={(e: any) => setSearch(e)}
          


           value={search}
              onChangeText={(text: string) => {
                console.log("Search text:", text);
              setSearchedBrand  (text);
                setSearch(text);
              }
            }    
          />
        </View>
         {searchedBrand !== '' && (
         <Pressable
    onPress={() => {
     if (!searchLoader) {
       addBrand();
       console.log(`Add "${searchedBrand}" to brands`);
     }
    }}
    style={[styles.addBrandView, searchLoader && styles.addBrandViewDisabled]}
    disabled={searchLoader}
  >
    {searchLoader ? (
      <ActivityIndicator size="small" color="#464f5d" />
    ) : (
      <AddCircleSvgComponent />
    )}
    <Text style={[styles.addBrandTo, searchLoader && styles.addBrandToDisabled]}>
      {searchLoader ? 'Adding brand...' : `Add "${searchedBrand}" to brands`}
    </Text>
  </Pressable>
)}


        <ScrollView style={styles.body}>
          {newBrandOptions?.map((item: any) => (
            <Pressable
              style={({ pressed }) => [
                pressed && styles.pressed,
                styles.bodyWithChildren,
              ]}
              key={item.id}
              onPress={() => {
                onSelect({
                  target: { value: item.name, name, id: item.id },
                });
              }}
            >
              <View style={styles.bodyWithChildrenName}>
                {/* <View style={styles.categoryIconContainer}>
                  {item?.imageUrl ? (
                    <Image src={item?.imageUrl} />
                  ) : (
                    <SeeAllIcon width={16} height={16} />
                  )}
                </View> */}
                <Text style={styles.categoryName}>{item.name}</Text>
              </View>
              <View style={styles.categoryRadio} />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default SelectItemBrandModal;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#ff9fafc",
    flex: 1,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
  },
  backwrapper: {
    width: 40,
    display: "flex",
    justifyContent: "center",
    position: "absolute",
    zIndex: 1,
    left: 20,
    top: "30%",
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,

    backgroundColor: "white",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  headerTitle: {
    paddingVertical: 12,
    flex: 1,
    textAlign: "center",
    color: "rgba(7, 24, 39, 1)",
    fontFamily: "DMSansSemiBold",
    fontSize: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  bodyWithChildren: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: "rgba(237, 242, 247, 1)",
  },
  bodyWithChildrenName: {
    flex: 1,
    flexDirection: "row",
  },
  categoryName: {
    fontSize: 12,
    color: "rgba(30, 34, 38, 1)",
    fontFamily: "DMSansMedium",
    textTransform: "capitalize",
  },
  categoryIconContainer: {
    width: 16,
    height: 16,

    marginRight: 8,
  },
  categoryRadio: {
    width: 17,
    height: 17,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(107, 114, 126, 1)",
  },
  searchContainer: {
    marginTop: 10,
    marginHorizontal: 16,
  },

  addBrandTo: {
    		fontSize: 12,
    		lineHeight: 20,
    		fontWeight: "500",
    		fontFamily: "DMSans-Medium",
    		color: "#464f5d",
    		textAlign: "left"
  	},

    	addBrandView: {
    		width: "100%",
    		flexDirection: "row",
    		alignItems: "center",
    		paddingHorizontal: 16,
    		paddingVertical: 8,
    		gap: 4
  	},

  	addBrandViewDisabled: {
    		opacity: 0.6,
  	},

  	addBrandToDisabled: {
    		color: "#9ca3af",
  	},

});
