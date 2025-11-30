import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from "react-native";

interface IFlatListResponsiveGrid {
  data: any;
  renderItem: any;
  subtractFromMargin?: number;
  onEndReached: any;
  loadingMore: boolean;
  headerTemplate?: any;
}

const FlatListResponsiveGrid = ({
  data,
  renderItem,
  subtractFromMargin = 29,
  onEndReached,
  loadingMore,
  headerTemplate,
}: IFlatListResponsiveGrid) => {
  const [numColumns, setNumColumns] = useState(2);
  const { width } = Dimensions.get("window");

  useEffect(() => {
    if (width >= 1200) {
      setNumColumns(4);
    } else if (width >= 768) {
      setNumColumns(3);
    } else {
      setNumColumns(2);
    }
  }, [width]);

  const getItemLayout = (_: any, index: any) => ({
    length: width / numColumns - subtractFromMargin,
    offset: (width / numColumns - subtractFromMargin) * index,
    index,
  });

  const renderFooter = () => {
    if (!onEndReached && !loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        {/* <ActivityIndicator animating size="small" /> */}
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={headerTemplate || null}
      numColumns={numColumns}
      getItemLayout={getItemLayout}
      contentContainerStyle={styles.listContent}
      ListFooterComponent={renderFooter}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 10,
  },
  loadingFooter: {
    paddingVertical: 20,
    // borderTopWidth: 1,
    // borderTopColor: "#CED0CE",
  },
});

export default FlatListResponsiveGrid;
