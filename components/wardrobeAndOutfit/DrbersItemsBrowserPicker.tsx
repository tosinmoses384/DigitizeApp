import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  Modal,
  ModalProps,
  Platform,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import CustomButton from "@components/CustomButton";
import Icon from "@expo/vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Post, usePostsData } from "@hooks/use-posts-data";
import { Image } from "expo-image";
import SearchInput from "@components/SearchInput";
import { Colors } from "@constants/Colors";
import LoadingState from "@components/StoryLine/LoadingState";
import { padFlatListData } from "@utils/collection-helper";
import { DM_SANS } from "@constants/Fonts";
import EmptyState from "@components/EmptyState";
import { useI18n } from "@hooks/use-i18n";

interface Props extends Omit<ModalProps, "children"> {
  onSelect: (uri: Array<string>) => void;
  injectedJs?: string;
  postsDataParams?: {
    activeTab?: "ItemPost" | string;
  };
}

/**
 * Utility to tokenize a string into lowercase words
 */
const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/\s+/) // split by whitespace
    .filter(Boolean); // remove empty entries

export default function DrbersItemsBrowserPicker({
  ...props
}: Props): React.JSX.Element | null {
  const { t } = useI18n();
  const windowDimensions = useWindowDimensions();
  const { postsState, refreshSilently, getMoreItems, morePostsState } =
    usePostsData({
      activeTab: "ItemPost",
      filterByCategory: "ExplorePosts",
      filterByType: "ExploreItemPost",
      ...(props.postsDataParams ?? {}),
    });

  const [selectedImageUrl, setSelectedImageUrl] = useState<Array<string>>([]);
  const safeAreaInsets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [drbersItems, setDrbersItems] = useState<Post[]>([]);
  const [searching, setSearching] = useState(false);

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const handleSelect = () => {
    if (!Boolean(selectedImageUrl.length)) {
      Alert.alert(t('upload.noImageSelected'), t('upload.pleaseTapImage'));
      return;
    }

    props.onSelect(selectedImageUrl);
    setSelectedImageUrl([]);
  };

  const handleClose = () => {
    setSelectedImageUrl([]);
    props.onDismiss?.();
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshSilently();
    } catch (error) {
      //
    } finally {
      setRefreshing(false);
    }
  };

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    // If search is empty, show all drbers
    if (!Boolean(query.trim())) {
      setDrbersItems(postsState.posts);
      return;
    }

    setSearching(true);
    const tokenizedQuery = tokenize(query);
    const filteredDetails = postsState.posts.filter((item: Post) => {
      const tokenizedTitle = tokenize(item.title ?? ""),
        tokenizedCaption = tokenize(item.caption ?? ""),
        titleSet = new Set([...tokenizedTitle]),
        captionSet = new Set([...tokenizedCaption]);

      if (tokenizedQuery.length === 1) {
        return item.title?.includes(query) || item.caption?.includes(query);
      }

      return (
        tokenizedQuery.every((word) => titleSet.has(word)) ||
        tokenizedQuery.every((word) => captionSet.has(word))
      );
    });
    setDrbersItems(filteredDetails);
    setSearching(false);
  };

  const handleItemSelect = (item: Post) => {
    const url = item.defaultImageUrl.trim(); // normalize

    setSelectedImageUrl((prev) => {
      if (prev.includes(url)) {
        // remove
        return prev.filter((u) => u !== url);
      } else {
        // add (but ensure uniqueness)
        return [...new Set([...prev, url])];
      }
    });
  };

  const renderHeader = useCallback(
    () => (
      <View
        style={[styles.headerContainer, { paddingTop: safeAreaInsets.top }]}
      >
        <View />
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Icon name={"close"} size={24} />
        </TouchableOpacity>
      </View>
    ),
    [],
  );

  // Footer component for BottomSheet
  const renderFooter = useCallback(() => {
    return (
      <>
        <View style={[styles.footer, { paddingBottom: safeAreaInsets.bottom }]}>
          <CustomButton
            title={t('upload.selectImage')}
            onPress={handleSelect}
            variant={"primary"}
            disabled={!Boolean(selectedImageUrl?.length)}
          />
        </View>
      </>
    );
  }, [selectedImageUrl]);

  const renderItem: ListRenderItem<Post> = useCallback(
    ({ item, index }) => {
      const isSelected = selectedImageUrl.includes(item.defaultImageUrl);

      return (
        <TouchableOpacity
          style={[styles.item]}
          onPress={() => handleItemSelect(item)}
        >
          <Image
            source={{ uri: item.defaultImageUrl }}
            style={[styles.itemImage]}
          />
          {isSelected ? (
            <View style={[styles.itemCheck]}>
              <Icon name={"check"} color={"#FFF"} size={8} />
            </View>
          ) : null}
        </TouchableOpacity>
      );
    },
    [selectedImageUrl],
  );

  const renderEmptyList = useCallback(() => {
    return (
      <View
        style={[
          styles.emptyList,
          { paddingTop: windowDimensions.height * 0.1 },
        ]}
      >
        <EmptyState
          title={t('upload.noMatchFound')}
          subtitle={t('upload.noItemMatchesSearch')}
        />
      </View>
    );
  }, []);

  const renderListFooter = () => {
    if (morePostsState.hasMore && morePostsState.loading) {
      return (
        <View style={[styles.listFoorter]}>
          <ActivityIndicator size="large" color={"#FF3B4A"} />
        </View>
      );
    }
  };

  useEffect(() => {
    if (Boolean(postsState.posts?.length)) {
      setDrbersItems(postsState.posts);
    }
  }, [postsState.posts]);

  return (
    <>
      <Modal
        visible={props.visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleClose}
      >
        {postsState.loading ? (
          <LoadingState
            activeTab={props.postsDataParams?.activeTab ?? "ItemPost"}
            // hideHorizontalStory={hideHorizontalStory}
          />
        ) : (
          <View style={[{ flex: 1 }]}>
            {renderHeader()}
            {/* Search Field */}
            <View style={styles.searchContainer}>
              <SearchInput
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder={t('upload.searchDrbersItems')}
              />
              {searching ? (
                <ActivityIndicator size="large" color={"#FF3B4A"} />
              ) : null}
            </View>
            <FlatList
              //@ts-ignore
              data={padFlatListData(drbersItems, 3)}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor="#FF3B4A"
                  colors={Platform.OS === "android" ? ["#FF3B4A"] : undefined}
                />
              }
              numColumns={3}
              columnWrapperStyle={{ gap: 4 }}
              ListEmptyComponent={renderEmptyList}
              ListFooterComponent={renderListFooter}
              onEndReached={getMoreItems}
              onEndReachedThreshold={0.5}
            />
            {renderFooter()}
          </View>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: { gap: 4, paddingHorizontal: 16 },
  bottomSheetView: {
    flex: 1,
    height: "100%",
    zIndex: 9999,
  },
  selectBtn: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  selectImageButton: {},
  footer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  headerContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    // height: 30,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    position: "absolute",
    top: 4,
    alignSelf: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  closeBtn: {
    padding: 12,
  },
  item: {
    height: 104,
    // width: 50,
    flex: 1,
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  itemImage: {
    width: undefined,
    height: undefined,
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
    rowGap: 12,
  },
  itemCheck: {
    backgroundColor: "#FF3B4A",
    width: 12,
    height: 12,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 5,
    right: 5,
  },
  listFoorter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  emptyList: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    rowGap: 20,
  },
  emptyListTitle: { fontFamily: DM_SANS.bold, fontSize: 18 },
  emptyListSubtitle: { fontFamily: DM_SANS.regular, fontSize: 16 },
});
