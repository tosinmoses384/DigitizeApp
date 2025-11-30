import BottomModal from "@components/BottomModal";
import CustomButton from "@components/CustomButton";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CloseIcon from "../assets/images/svg/x-close.svg";
import ChevronRight from "../assets/images/svg/chevron-right-arrow.svg";
import SelectItemCategoryType from "./ProductFilterTypes/CategorySelection";
import { useAppDispatch, useAppSelector } from "@redux/store";
import {
  setBrandValue,
  setCategoryValue,
  setColourValue,
  setConditionValue,
  setMaterialValue,
  setPageTitle,
  setSizeValue,
} from "@redux/slice/filters/filterSlice";
import SizeSelection from "./ProductFilterTypes/SizeSelection";
import BrandSelection from "./ProductFilterTypes/BrandSelection";
import ConditionSelection from "./ProductFilterTypes/ConditionSelection";
import ColorSelection from "./ProductFilterTypes/ColorSelection";
import MaterialSelection from "./ProductFilterTypes/MaterialSelection";
import { useI18n } from "@hooks/use-i18n";
interface IProductFilterModal {
  onClose: any;
  isShow: boolean;
  handleApply: any;
}
const ProductFilterModal = ({
  onClose,
  isShow,
  handleApply,
}: IProductFilterModal) => {
  const { t } = useI18n();
  const {
    pageTitle,
    categoryValue,
    sizeValue,
    brandValue,
    conditionValue,
    colourValue,
    materialValue,
  } = useAppSelector((state) => state.productFilter);
  const [filterSelectionType, setFilterSelectionType] = useState("");
  const dispatch = useAppDispatch();

  const options = [
    {
      id: 1,
      title: t('common.category'),
      value: categoryValue?.value || t('common.all'),
    },
    {
      id: 2,
      title: t('common.size'),
      value: sizeValue?.value || t('common.all'),
    },
    {
      id: 3,
      title: t('common.brand'),
      value: brandValue?.value || t('common.all'),
    },
    {
      id: 4,
      title: t('common.condition'),
      value: conditionValue?.value || t('common.all'),
    },
    {
      id: 5,
      title: t('common.colour'),
      value: colourValue?.value || t('common.all'),
    },
    {
      id: 6,
      title: t('common.price'),
      value: t('common.all'),
    },
    {
      id: 7,
      title: t('common.material'),
      value: materialValue?.value || t('common.all'),
    },
  ];

  return (
    <BottomModal onClose={onClose} isShow={isShow}>
      <View
        style={[
          styles.wrapper,
          {
            paddingBottom: !filterSelectionType
              ? Platform.OS === "ios"
                ? 160
                : 130
              : 20,
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => pressed && styles.headerCloseView}
            onPress={onClose}
          >
            <CloseIcon width={19} height={19} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {filterSelectionType || t('common.filter')}
          </Text>
          <Pressable
            style={({ pressed }) => pressed && styles.headerClear}
            onPress={() => {
              dispatch(setMaterialValue(null));
              setFilterSelectionType("");
              dispatch(setColourValue(null));
              dispatch(setConditionValue(null));
              dispatch(setBrandValue(null));
              dispatch(setSizeValue(null));
              dispatch(setCategoryValue(null));
            }}
          >
            <Text style={styles.headerClearText}>{t('common.clearAll')}</Text>
          </Pressable>
        </View>
        <View>
          {filterSelectionType === "Material" && (
            <MaterialSelection
              onSelect={(data: any) => {
                dispatch(setMaterialValue(data));
              }}
              onClose={() => setFilterSelectionType("")}
            />
          )}

          {filterSelectionType === "Colour" && (
            <ColorSelection
              onSelect={(data: any) => {
                dispatch(setColourValue(data));
              }}
              onClose={() => setFilterSelectionType("")}
            />
          )}
          {filterSelectionType === "Condition" && (
            <ConditionSelection
              onSelect={(data: any) => {
                dispatch(setConditionValue(data));
              }}
              onClose={() => setFilterSelectionType("")}
            />
          )}

          {filterSelectionType === "Brand" && (
            <BrandSelection
              onSelect={(data: any) => {
                dispatch(setBrandValue(data));
                dispatch(
                  setPageTitle(data?.id === "" ? t('common.products') : data?.value)
                );
              }}
              onClose={() => setFilterSelectionType("")}
            />
          )}

          {filterSelectionType === "Size" && (
            <SizeSelection
              onSelect={(data: any) => {
                dispatch(setSizeValue(data));
              }}
              onClose={() => setFilterSelectionType("")}
            />
          )}

          {filterSelectionType === "Category" && (
            <SelectItemCategoryType
              onClose={() => setFilterSelectionType("")}
              onSelect={(data: any) => {
                dispatch(setCategoryValue(data));
              }}
            />
          )}

          {filterSelectionType === "" && (
            <ScrollView>
              {filterSelectionType === "" && (
                <View>
                  {options?.map((list) => (
                    <Pressable
                      key={list?.id}
                      style={({ pressed }) => [
                        pressed && { opacity: 0.5 },
                        styles.optionList,
                      ]}
                      onPress={() => setFilterSelectionType(list?.title)}
                    >
                      <Text style={styles.optionTitle}>{list?.title}</Text>
                      <Text 
                        style={[
                          styles.optionValue,
                          list?.value !== "All" && styles.optionValueSelected
                        ]}
                      >
                        {list?.value}
                      </Text>
                      <View>
                        <ChevronRight />
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </View>
        {!filterSelectionType && (
          <View>
            <CustomButton
              title={t('common.apply')}
              buttonStyle={styles.applyBtnBody}
              textStyle={styles.applyBtnText}
              onPress={handleApply}
            />
            <CustomButton
              title={t('common.clearAll')}
              buttonStyle={styles.clearAllBtnBody}
              textStyle={styles.clearAllBtnText}
              onPress={() => {
                dispatch(setMaterialValue(null));
                dispatch(setColourValue(null));
                dispatch(setConditionValue(null));
                dispatch(setBrandValue(null));
                dispatch(setSizeValue(null));
                dispatch(setCategoryValue(null));
              }}
            />
          </View>
        )}
      </View>
    </BottomModal>
  );
};

export default ProductFilterModal;
const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: "100%",
    // paddingBottom: 70,
  },
  header: {
    flexDirection: "row",
    marginBottom: 13,
  },
  headerCloseView: {
    opacity: 0.5,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "rgba(30, 34, 38, 1)",
    fontSize: 14,
    fontFamily: "DMSansMedium",
  },
  headerClear: {
    opacity: 0.5,
  },
  headerClearText: {
    color: "rgba(144, 149, 158, 1)",
    fontSize: 12,
    fontFamily: "DMSansMedium",
  },
  optionList: {
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
  },
  applyBtnBody: {
    backgroundColor: "rgba(255, 59, 74, 1)",
    padding: 14,
  },
  applyBtnText: {
    textAlign: "center",
    width: "100%",
    fontSize: 16,
    color: "white",
    fontFamily: "DMSansMedium",
  },
  optionTitle: {
    flex: 1,
    fontSize: 14,
    color: "rgba(33, 44, 61, 1)",
    fontFamily: "DMSansMedium",
  },
  optionValue: {
    fontSize: 12,
    color: "rgba(30, 34, 38, 1)",
    marginRight: 12,
    textTransform: "capitalize",
  },
  optionValueSelected: {
    color: "rgba(255, 59, 74, 1)",
  },
  clearAllBtnBody: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(144, 149, 158, 1)",
    padding: 14,
    marginTop: 12,
  },
  clearAllBtnText: {
    textAlign: "center",
    width: "100%",
    fontSize: 16,
    color: "rgba(144, 149, 158, 1)",
    fontFamily: "DMSansMedium",
  },
});
