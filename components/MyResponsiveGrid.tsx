import React, { useState, useEffect, ReactNode } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
interface IMyResponsiveGrid {
  template: ReactNode;
  getNumberOfRows: any;
  subtractFromMargin?: number;
}
const MyResponsiveGrid = ({
  template,
  getNumberOfRows,
  subtractFromMargin,
}: IMyResponsiveGrid) => {
  const [numColumns, setNumColumns] = useState(2); // Default to 3 columns

  // Get screen dimensions
  const { width } = Dimensions.get("window");

  useEffect(() => {
    // Adjust the number of columns based on the screen width
    if (width >= 1200) {
      setNumColumns(4); // 4 columns for large screens
    } else if (width >= 768) {
      setNumColumns(3); // 3 columns for medium screens
    } else {
      setNumColumns(2); // 2 columns for small screens
    }
  }, [width]);

  // Calculate card width based on the number of columns
  const cardWidth = width / numColumns - (subtractFromMargin || 29); // Subtracting 10 for margin

  useEffect(() => {
    getNumberOfRows(cardWidth);
  }, [cardWidth]);

  return <View style={styles.container}>{template}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap", // Wraps items into multiple rows
    justifyContent: "space-between", // Adds space between cards
  },
});

export default MyResponsiveGrid;
