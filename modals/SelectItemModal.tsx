import NewBottomModal from "@components/NewBottomModal";
import Selectitems from "app/(authenticated)/selectItems";
import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { View } from "react-native";

interface ISelectItemModal {
  isShow: boolean;
  onClose: any;
}
const SelectItemModal = ({ isShow, onClose }: ISelectItemModal) => {
  return (
    <View>
      <NewBottomModal
        isShow={isShow}
        onClose={onClose}
        maxHeight={"100%"}
        contentStyle={{
          backgroundColor: "white",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          paddingHorizontal: 0,
          width: "100%", // Or a specific width (e.g., '80%')
          flex: 1,
        }}
      >
        <View style={styles.body}>
          <Selectitems onClose={onClose} isEmbededInModal />
        </View>
      </NewBottomModal>
    </View>
  );
};

export default SelectItemModal;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "#f9fefc",
  },
});
