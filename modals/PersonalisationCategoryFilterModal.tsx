import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native";
import ModalContainer from "../components/ModalContainer";
import CloseIcon from "../assets/images/svg/x-close.svg";
import ChevronRightIcon from "../assets/images/svg/chevron-right-arrow.svg";
import CustomButton from "../components/CustomButton";
interface IPersonalisationCategoryFilterModal {
  handleSelect: any;
  handleClose: any;
  selectedCategoryAns: string;
  handleClear: any;
  handleApply: any;
}
const PersonalisationCategoryFilterModal = ({
  handleSelect,
  handleClose,
  selectedCategoryAns,
  handleClear,
  handleApply,
}: IPersonalisationCategoryFilterModal) => {
  const details = [
    {
      id: 1,
      title: "Category",
      value: selectedCategoryAns || "All",
    },
    {
      id: 2,
      title: "Sort by",
      value: "Newest First",
      color: "rgba(212, 49, 62, 1)",
    },
  ];
  return (
    <ModalContainer styleWrapper={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.containerHeader}>
          <Pressable
            style={({ pressed }) => pressed && styles?.pressed}
            onPress={handleClose}
          >
            <Text>
              <CloseIcon />
            </Text>
          </Pressable>
          <Text style={styles.title}>Filter</Text>
          <Pressable
            style={({ pressed }) => [pressed && styles?.pressed]}
            onPress={handleClear}
          >
            <Text style={styles.clear}>Clear All</Text>
          </Pressable>
        </View>
        {details?.map((list) => (
          <Pressable
            style={({ pressed }) => pressed && styles?.pressed}
            key={list?.id}
            onPress={() => handleSelect(list)}
          >
            <View style={styles.selectionView}>
              <Text style={styles.selectionTitle}>{list?.title}</Text>

              <View style={styles.iconAndValue}>
                <Text
                  style={[
                    { color: list?.color, textTransform: "capitalize" },
                    styles.textContent,
                  ]}
                >
                  {list?.value}
                </Text>
                <ChevronRightIcon />
              </View>
            </View>
          </Pressable>
        ))}
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Apply"
            buttonStyle={styles.btnContainer}
            textStyle={styles.btnTextContent}
            onPress={handleApply}
          />
        </View>
      </View>
    </ModalContainer>
  );
};

export default PersonalisationCategoryFilterModal;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "rgba(187,187,189,.5)",
    position: "absolute",
    height: "100%",
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    // paddingHorizontal: 16,
  },
  container: {
    backgroundColor: "white",
    padding: 16,
    width: "100%",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  containerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 11,
  },
  pressed: {
    opacity: 0.6,
  },
  title: {
    fontSize: 14,
    color: "rgba(30, 34, 38, 1)",
    fontFamily: "DMSansMedium",
    textAlign: "center",
  },
  clear: {
    fontSize: 10,
    color: "rgba(144, 149, 158, 1)",
  },
  selectionView: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 11,
    marginBottom: 8,
  },
  selectionTitle: {
    color: "rgba(33, 44, 61, 1)",
    fontSize: 14,
    fontFamily: "DMSansMedium",
  },
  iconAndValue: {
    flexDirection: "row",
  },
  textContent: {
    marginRight: 12,
  },
  buttonContainer: {
    marginTop: 120,
    marginBottom: 20,
  },
  btnContainer: {
    backgroundColor: "rgba(255, 59, 74, 1)",
    // display: "flex",
    // justifyContent: "center",
  },
  btnTextContent: {
    textAlign: "center",
    color: "white",
    width: "100%",
  },
});
