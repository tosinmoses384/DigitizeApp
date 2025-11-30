import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Colors, SIZES } from "../../constants/Colors";
import StackHeader from "../../components/StackHeader";
import ToggleSwitch from "toggle-switch-react-native";
import { router } from "expo-router";
import { fontSz } from "../../constants";
import DownIcon from "../../assets/images/svg/chevron-down-arrow.svg";
import Ionicons from "react-native-vector-icons/Ionicons"; // For cancel (X) icon
import { useAppSelector } from "@redux/store";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import { useToast } from "react-native-toast-notifications";
import AppTabWrapper from "@components/AppTabWrapper";
import { useApiService } from "@hooks/use-auth-guard/useApiService";
import { useI18n } from "@hooks/use-i18n";

const BundleDiscounts: React.FC = () => {
  const { t } = useI18n();
  const toast = useToast();
  const { token, profile } = useAppSelector((state) => state?.userProfileSlice);
  const { callApi, callApiWithLoading } = useApiService();
  const [isDiscountEnabled, setIsDiscountEnabled] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false); // Modal visibility
  const [loading, setLoading] = useState(false);
  const discountOptions = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const [discountBundles, setDiscountBundle]: any = useState([]);
  const [activeSelectedDiscount, setActiveSelectedDiscount]: any = useState("");

  const updateDiscount = async (data: any, updatedData: any) => {
    setLoading(true);
    let newData = {
      isDiscountBundleEnabled: isDiscountEnabled,
      settings: data,
    };

    await callApi(
      (token) => marketplaceServices.bundleDiscount(newData, token),
      {
        onSuccess: (res) => {
          setLoading(false);
          if (res?.status === 200) {
            setActiveSelectedDiscount("");
            return setDiscountBundle(updatedData);
          }
          toast.show(res?.detail || t('bundleDiscounts.operationFailed'), {
            type: "danger",
            duration: 4000,
          });
        },
        onError: (error) => {
          console.error('Error updating discount:', error);
          setLoading(false);
        }
      }
    );
  };

  const updateDiscountToServer = (updatedItems: any) => {
    const distuctureData = updatedItems?.filter((list: any) => {
      return (
        list?.discountPercentage !== 0 && {
          discountPercentage: list?.discountPercentage,
          itemQuantity: list?.itemQuantity,
        }
      );
    });
    updateDiscount(distuctureData, updatedItems);
  };

  // Function to handle selection of a discount percentage
  const handleDiscountSelect = (percentage: number) => {
    setIsModalVisible(false);
    const checkIfDiscountExist = discountBundles?.find(
      (list: any) => list?.id === activeSelectedDiscount
    );

    if (checkIfDiscountExist) {
      const getItems = discountBundles?.map((list: any) =>
        list?.id === activeSelectedDiscount
          ? {
              ...list,
              discountPercentage: percentage,
            }
          : { ...list }
      );

      updateDiscountToServer(getItems);
    }
  };

  const getHolidayMode = async () => {
    setLoading(true);

    await callApi(
      (token) => marketplaceServices.getSellerSettings(token),
      {
        onSuccess: (res: any) => {
          setLoading(false);
          if (res?.status === 200) {
            setIsDiscountEnabled(res?.data?.isDiscountBundleEnabled);
            const distructureData = res?.data?.discountBundles?.map(
              (list: any, index: number) => {
                return {
                  id: index,
                  ...list,
                };
              }
            );
            setDiscountBundle(distructureData);
            return;
          }
        },
        onError: (error) => {
          console.error('Error fetching seller settings:', error);
          setLoading(false);
        }
      }
    );
  };

  useEffect(() => {
    if (token) {
      getHolidayMode();
    }
  }, [profile]);

  const handleToggleDiscount = async () => {
    setLoading(true);

    await callApi(
      (token) => marketplaceServices.toggleBundleDiscount(token),
      {
        onSuccess: (res: any) => {
          setLoading(false);
          if (res?.status === 200) {
            return setIsDiscountEnabled(!isDiscountEnabled);
          }
          toast.show(`${res?.detail || res?.Message}`, {
            type: "danger",
            duration: 4000,
          });
        },
        onError: (error: any) => {
          console.error('Error toggling bundle discount:', error);
          setLoading(false);
        }
      }
    );
  };

  return (
    <AppTabWrapper>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
          paddingHorizontal: 20,
        }}
      >
        <StackHeader title={t('bundleDiscounts.bundleDiscounts')} onPress={() => router.back()} />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.headerText}>{t('bundleDiscounts.selectDiscount')}</Text>
          <ToggleSwitch
            isOn={isDiscountEnabled}
            onColor="#FF3B4A"
            offColor="#CBD6E0"
            labelStyle={{ color: "black", fontWeight: "900" }}
            size="medium"
            onToggle={handleToggleDiscount}
            disabled={loading}
          />
        </View>

        {isDiscountEnabled && (
          <View style={styles.modal}>
            {discountBundles?.map((item: any, index: number) => (
              <View key={index}>
                <Text
                  style={styles.headerText}
                >{`${t('bundleDiscounts.items')} ${item?.itemQuantity}`}</Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.itemText}>
                    {item?.discountPercentage}%
                  </Text>
                  {loading && activeSelectedDiscount === item?.id ? (
                    <Text>...</Text>
                  ) : (
                    <TouchableOpacity
                      onPress={
                        loading
                          ? () => {}
                          : () => {
                              setIsModalVisible(true);
                              setActiveSelectedDiscount(index);
                            }
                      }
                    >
                      <DownIcon height={20} width={20} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View>
          <Text style={styles.descriptionText}>
            {t('bundleDiscounts.discountDescription')}{" "}
            <Text
              style={{
                color: "#D4313E",
                fontFamily: "DMSansRegular",
                textDecorationLine: "underline",
              }}
              onPress={() => router.push("/helpCenter")}
            >
              {t('bundleDiscounts.faq')}
            </Text>
            .
          </Text>
        </View>

        {/* Modal for Selecting Discount */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => {
            setIsModalVisible(false);
            setActiveSelectedDiscount("");
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.bottomSheet}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('bundleDiscounts.selectDiscount')}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsModalVisible(false);
                    setActiveSelectedDiscount("");
                  }}
                >
                  <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>
              </View>

              {/* List of Discounts */}
              <FlatList
                data={discountOptions}
                keyExtractor={(item) => item.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleDiscountSelect(item)}
                  >
                    <Text style={styles.itemTextCentered}>{item}%</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </View>
    </AppTabWrapper>
  );
};

export default BundleDiscounts;

const styles = StyleSheet.create({
  headerText: {
    fontSize: fontSz(14),
    marginVertical: 10,
    fontFamily: "DMSansMedium",
    color: "#393939",
  },
  itemText: {
    fontSize: fontSz(14),
    fontFamily: "DMSansRegular",
    color: "#393939",
  },
  itemTextCentered: {
    fontSize: fontSz(14),
    fontFamily: "DMSansRegular",
    color: "#393939",
    textAlign: "center", // Center the text
  },
  descriptionText: {
    fontSize: 16,
    marginTop: 20,
    color: "#6B727E",
    fontFamily: "DMSansRegular",
  },
  modal: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  bottomSheet: {
    backgroundColor: "#FFF",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: fontSz(16),
    fontFamily: "DMSansMedium",
    color: "#393939",
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0E0E0",
  },
});
