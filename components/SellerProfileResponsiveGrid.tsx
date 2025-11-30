import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Dimensions, ListRenderItem, ViewStyle } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface ResponsiveGridProps<T> {
  data: T[];
  renderItem: (item: T, index: number, itemWidth: number) => React.ReactNode;
  numColumns?: number;
  spacing?: number;
  contentContainerStyle?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  refreshControl?: React.ReactElement;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement;
  onScroll?: (event?: any) => void;
  scrollEventThrottle?: number;
  keyExtractor?: (item: T, index: number) => string;
  // Responsive breakpoints
  breakpoints?: {
    small?: number; // screen width threshold for small screens
    medium?: number; // screen width threshold for medium screens
    large?: number; // screen width threshold for large screens
  };
  // Columns for different screen sizes
  columnsConfig?: {
    small?: number;
    medium?: number;
    large?: number;
  };
  // Animation configs
  enableItemAnimation?: boolean;
  itemAnimationDelay?: number;
  scrollAnimationConfig?: {
    damping?: number;
    stiffness?: number;
  };

  maxHeaderHeight?: number;
}

interface GridItem<T> {
  item: T;
  index: number;
  isEmpty?: boolean;
}

const defaultBreakpoints = {
  small: 480,
  medium: 768,
  large: 1024,
};

const defaultColumnsConfig = {
  small: 2,
  medium: 3,
  large: 4,
};

const SellerProfileResponsiveGrid = <T,>({
  data,
  renderItem,
  numColumns,
  spacing = 16,
  contentContainerStyle,
  showsVerticalScrollIndicator = true,
  onEndReached,
  onEndReachedThreshold = 0.1,
  refreshControl,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  onScroll,
  scrollEventThrottle = 16,
  keyExtractor = (item, index) => `grid-item-${index}`,
  breakpoints = defaultBreakpoints,
  columnsConfig = defaultColumnsConfig,
  enableItemAnimation = false,
  itemAnimationDelay = 50,
  scrollAnimationConfig = { damping: 15, stiffness: 100 },

  maxHeaderHeight,
}: ResponsiveGridProps<T>) => {
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width,
  );
  
  // Debounce onEndReached to prevent multiple rapid calls
  const onEndReachedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate responsive columns
  const responsiveColumns = useMemo(() => {
    if (numColumns) return numColumns;

    if (screenWidth >= breakpoints.large!) {
      return columnsConfig.large!;
    } else if (screenWidth >= breakpoints.medium!) {
      return columnsConfig.medium!;
    } else {
      return columnsConfig.small!;
    }
  }, [screenWidth, numColumns, breakpoints, columnsConfig]);

  // Calculate item width
  const itemWidth = useMemo(() => {
    const totalSpacing = spacing * (responsiveColumns - 1);
    const availableWidth = screenWidth - totalSpacing - spacing * 2; // Account for container padding
    return availableWidth / responsiveColumns;
  }, [screenWidth, responsiveColumns, spacing]);

  // Prepare grid data (fill empty slots in last row if needed)
  const gridData = useMemo(() => {
    const rows: GridItem<T>[][] = [];
    const totalItems = data.length;

    for (let i = 0; i < totalItems; i += responsiveColumns) {
      const row: GridItem<T>[] = [];

      for (let j = 0; j < responsiveColumns; j++) {
        const index = i + j;
        if (index < totalItems) {
          row.push({ item: data[index], index });
        } else {
          row.push({ item: {} as T, index: -1, isEmpty: true });
        }
      }

      rows.push(row);
    }

    return rows;
  }, [data, responsiveColumns]);

  // Handle screen dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  // Animated item component
  /*
  const AnimatedGridItem = useCallback(
    ({
      item,
      index: itemIndex,
      rowIndex,
    }: {
      item: GridItem<T>;
      index: number;
      rowIndex: number;
    }) => {
      const animatedValue = useSharedValue(0);

      useEffect(() => {
        let timeoutId: NodeJS.Timeout | number | undefined;
        if (enableItemAnimation) {
          const delay =
            (rowIndex * responsiveColumns + itemIndex) * itemAnimationDelay;
          timeoutId = setTimeout(() => {
            animatedValue.value = withSpring(1, scrollAnimationConfig);
          }, delay);
        } else {
          animatedValue.value = 1;
        }
        return () => {
          if (timeoutId) clearTimeout(timeoutId as number);
        };
      }, []);

      const animatedStyle = useAnimatedStyle(() => {
        if (!enableItemAnimation) {
          return {
            width: itemWidth,
            marginRight: itemIndex < responsiveColumns - 1 ? spacing : 0,
            marginBottom: spacing,
          };
        }

        const scale = interpolate(
          animatedValue.value,
          [0, 1],
          [0.8, 1],
          Extrapolate.CLAMP,
        );

        const opacity = interpolate(
          animatedValue.value,
          [0, 1],
          [0, 1],
          Extrapolate.CLAMP,
        );

        const translateY = interpolate(
          animatedValue.value,
          [0, 1],
          [20, 0],
          Extrapolate.CLAMP,
        );

        return {
          width: itemWidth,
          marginRight: itemIndex < responsiveColumns - 1 ? spacing : 0,
          marginBottom: spacing,
          opacity,
          transform: [{ scale }, { translateY }],
        };
      });

      if (item.isEmpty) {
        return <Animated.View style={animatedStyle} />;
      }

      return (
        <Animated.View style={animatedStyle}>
          {renderItem(item.item, item.index, itemWidth)}
        </Animated.View>
      );
    },
    [
      itemWidth,
      spacing,
      responsiveColumns,
      renderItem,
      enableItemAnimation,
      itemAnimationDelay,
      scrollAnimationConfig,
    ],
  );
*/

  /**
   * Memoized grid item component to prevent unnecessary re-renders
   * This is critical for preventing flickering during scroll
   */
  const AnimatedGridItem = React.memo(({
    item,
    index: itemIndex,
    rowIndex,
  }: {
    item: GridItem<T>;
    index: number;
    rowIndex: number;
  }) => {
    // Initialize animatedValue only once using useRef to prevent recreation
    const animatedValueRef = useRef(useSharedValue(enableItemAnimation ? 0 : 1));
    const animatedValue = animatedValueRef.current;

    useEffect(() => {
      let timeoutId: NodeJS.Timeout | number | undefined;
      if (enableItemAnimation) {
        const delay =
          (rowIndex * responsiveColumns + itemIndex) * itemAnimationDelay;
        timeoutId = setTimeout(() => {
          animatedValue.value = withSpring(1, scrollAnimationConfig);
        }, delay);
      } else {
        animatedValue.value = 1;
      }
      return () => {
        if (timeoutId) clearTimeout(timeoutId as number);
      };
    }, [
      enableItemAnimation,
      rowIndex,
      itemIndex,
      itemAnimationDelay,
      animatedValue,
      responsiveColumns,
      scrollAnimationConfig,
    ]);

    const animatedStyle = useAnimatedStyle(() => {
      if (!enableItemAnimation) {
        return {
          width: itemWidth,
          marginRight: itemIndex < responsiveColumns - 1 ? spacing : 0,
          marginBottom: spacing,
        };
      }

      const scale = interpolate(
        animatedValue.value,
        [0, 1],
        [0.8, 1],
        Extrapolate.CLAMP,
      );

      const opacity = interpolate(
        animatedValue.value,
        [0, 1],
        [0, 1],
        Extrapolate.CLAMP,
      );

      const translateY = interpolate(
        animatedValue.value,
        [0, 1],
        [20, 0],
        Extrapolate.CLAMP,
      );

      return {
        width: itemWidth,
        marginRight: itemIndex < responsiveColumns - 1 ? spacing : 0,
        marginBottom: spacing,
        opacity,
        transform: [{ scale }, { translateY }],
      };
    }, [itemWidth, itemIndex, responsiveColumns, spacing, animatedValue.value]);

    if (item.isEmpty) {
      return <Animated.View style={animatedStyle} />;
    }

    return (
      <Animated.View style={animatedStyle}>
        {renderItem(item.item, item.index, itemWidth)}
      </Animated.View>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison function to prevent re-renders
    // Only re-render if the actual item data changes
    if (prevProps.item.isEmpty && nextProps.item.isEmpty) {
      return true; // Don't re-render empty items
    }
    if (prevProps.item.isEmpty !== nextProps.item.isEmpty) {
      return false; // Re-render if empty state changes
    }
    // Compare item IDs for non-empty items
    const prevItem = prevProps.item.item as any;
    const nextItem = nextProps.item.item as any;
    return prevItem?.id === nextItem?.id && 
           prevItem?.isUserFavorite === nextItem?.isUserFavorite &&
           prevItem?.favouriteCount === nextItem?.favouriteCount;
  });
  
  AnimatedGridItem.displayName = "AnimatedGridItem";

  // Row renderer for FlatList
  const renderRow: ListRenderItem<GridItem<T>[]> = useCallback(
    ({ item: row, index: rowIndex }) => (
      <Animated.View
        style={{
          flexDirection: "row",
          paddingHorizontal: spacing,
        }}
      >
        {row.map((gridItem, itemIndex) => (
          <AnimatedGridItem
            key={
              gridItem.isEmpty
                ? `empty-${rowIndex}-${itemIndex}`
                : keyExtractor(gridItem.item, gridItem.index)
            }
            item={gridItem}
            index={itemIndex}
            rowIndex={rowIndex}
          />
        ))}
      </Animated.View>
    ),
    [spacing, AnimatedGridItem, keyExtractor],
  );

  /**
   * Key extractor for rows based on actual item IDs, not row index
   * This prevents flashing when pagination loads new items
   * Row keys are generated from the IDs of items in the row
   */
  const keyExtractorForRows = useCallback(
    (row: GridItem<T>[], index: number) => {
      // Create a unique key based on the actual items in the row
      const rowKey = row
        .filter(gridItem => !gridItem.isEmpty)
        .map(gridItem => keyExtractor(gridItem.item, gridItem.index))
        .join('-');
      
      // Fallback to index if row is empty (shouldn't happen but safe)
      return rowKey || `row-${index}`;
    },
    [keyExtractor],
  );

  // Debounced onEndReached handler
  const handleEndReached = useCallback(() => {
    if (onEndReachedTimeoutRef.current) {
      clearTimeout(onEndReachedTimeoutRef.current);
    }
    
    onEndReachedTimeoutRef.current = setTimeout(() => {
      onEndReached?.();
    }, 300); // 300ms debounce
  }, [onEndReached]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (onEndReachedTimeoutRef.current) {
        clearTimeout(onEndReachedTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Animated.FlatList
      data={gridData}
      renderItem={renderRow}
      keyExtractor={keyExtractorForRows}
      // onScroll={scrollHandler}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      onEndReached={handleEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      //@ts-ignore
      refreshControl={refreshControl}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={[
        {
          paddingTop: maxHeaderHeight ?? spacing,
          paddingBottom: spacing,
        },
        contentContainerStyle,
      ]}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      disableVirtualization={false}
      legacyImplementation={false}
      // Enable native bounce to allow pull-to-refresh on iOS
      bounces={true}
      alwaysBounceVertical={true}
      overScrollMode="never"
      /**
       * getItemLayout removed to prevent flashing/flickering during scroll
       * Reason: Items have variable heights due to:
       * - Variable text lengths (brand names, product titles)
       * - Variable price display lengths
       * - Potential text wrapping on smaller screens
       * 
       * Per coding guide section 3.1: "Use getItemLayout for fixed-height items"
       * Since our items have dynamic heights, letting FlatList auto-measure
       * provides better accuracy and eliminates flashing when scrolling down.
       * 
       * Performance impact: Minimal - other optimizations maintain smooth scrolling
       */
    />
  );
};

export default SellerProfileResponsiveGrid;
