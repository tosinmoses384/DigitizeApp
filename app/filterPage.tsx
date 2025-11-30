import StackHeader from '@components/StackHeader';
import React, { useEffect, useState, useMemo } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Colors, SIZES } from '../constants/Colors';
import { router } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import { useAppSelector } from '@redux/store';
import { StyleSheet } from 'react-native';
import SearchInput from '@components/SearchInput';
import CustomButton from '@components/CustomButton';
import FilterIcon from '../assets/images/svg/Filter.svg';
import ProductFilterModal from 'modals/ProductFilterModal';
import RecommendedCard from '@components/RecommendedCard';
import MyResponsiveGrid from '@components/MyResponsiveGrid';
import FlatListResponsiveGrid from '@components/FlatListResponsiveGrid';
import { getEmptyStateCountLoader } from '@helper/get-empty-count-loader/getEmptyCountLoader';
import EmptyState from '@components/EmptyState';
import FollowButton from '@components/FollowButton';
import { useDebounce } from '@hooks/useDebounce';
import { useMarketplaceItems } from '@hooks/useMarketplaceItems';
import { useFollowBrand } from '@hooks/useFollowBrand';
import { useSubcategories } from '@hooks/useSubcategories';

const FilterPage = () => {
  const route = useRoute();
  const { source, categoryId, categoryName } =
    (route.params as {
      source?: string;
      categoryId?: string;
      categoryName?: string;
    }) || {};

  const {
    pageTitle,
    categoryValue,
    sizeValue,
    brandValue,
    conditionValue,
    colourValue,
    materialValue,
  } = useAppSelector((state) => state.productFilter);

  const { countryId } = useAppSelector((state) => state.userCountryId);
  const { token, profile } = useAppSelector((state) => state.userProfileSlice);

  const [isShowFilterModal, setIsShowFilterModal] = useState(false);
  const [search, setSearch] = useState('');
  const [numColumns, setNumColumns] = useState(2);
  const [selectedCategory, setSelectedCategory] = useState<any>(
    source === 'home' && categoryId
      ? { id: categoryId, name: categoryName }
      : categoryValue,
  );

  // Memoize selectedCategory to prevent unnecessary re-renders
  const memoizedSelectedCategory = useMemo(() => selectedCategory, [selectedCategory?.id, selectedCategory?.name]);

  // Debounce search to reduce API calls
  const debouncedSearch = useDebounce(search, 300);

  // Custom hooks for extracted logic
  const { followLoading, isFollowingBrand, handleFollowBrand } = useFollowBrand({
    brandValue,
    token,
    source,
  });

  const { subcategories, selectedSubcategory, setSelectedSubcategory, subcatLoading } = useSubcategories({
    selectedCategory: memoizedSelectedCategory,
    token,
    source,
  });

  const { products, screenLoader, loadingMore, fetchItems, loadMoreItems } = useMarketplaceItems({
    token,
    countryId,
    profile,
    search: debouncedSearch,
    selectedCategory: memoizedSelectedCategory,
    selectedSubcategory,
    source,
    filterValues: {
      conditionValue,
      brandValue,
      colourValue,
      sizeValue,
      materialValue,
    },
  });



  // 🔹 Update products on filter/search/category changes
  useEffect(() => {
    fetchItems();
  }, [
    profile,
    countryId,
    token,
    debouncedSearch,
    pageTitle,
    brandValue?.id,
    memoizedSelectedCategory?.id,
    conditionValue?.id,
    colourValue?.id,
    sizeValue?.id,
    materialValue?.id,
    selectedSubcategory,
  ]);


  // 🔹 Adjust grid columns
  useEffect(() => {
    const { width } = Dimensions.get('window');
    if (width >= 1200) setNumColumns(4);
    else if (width >= 768) setNumColumns(3);
    else setNumColumns(2);
  }, []);

  // 🔹 Template for product card
  const template = ({ item }: any) => (
    <View
      style={[
        styles.card,
        { width: Dimensions.get('window').width / numColumns - 0 * 2 },
      ]}
    >
      <RecommendedCard
        imageSource={item?.image}
        size={item?.size}
        title={item.brandName}
        price={item.price}
        isServerImage
        itemId={item?.id}
        width={'90%'}
        isUserFavorite={item?.isUserFavorite}
        handleIsFavourite={() => {}}
        count={item?.favouriteCount}
        currency={item?.currencySymbol?.toUpperCase()}
      />
    </View>
  );

  const emptyTemplate = getEmptyStateCountLoader(8)?.map((_, index) => (
    <View
      key={index}
      style={[
        styles.card,
        {
          width: Dimensions.get('window').width / numColumns - 0 * 2,
          paddingHorizontal: 15,
        },
      ]}
    >
      <RecommendedCard
        imageSource={''}
        size={''}
        title={''}
        price={''}
        width={'100%'}
        isServerImage
        itemId={''}
        loader
      />
    </View>
  ));
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingVertical:
          Platform.OS === 'ios' ? SIZES.height / 22 : SIZES.padding,
      }}
    >
      <StackHeader
        title={pageTitle || 'Products'}
        onPress={() => router.back()}
      />

      {/* 🔹 Search */}
      <View style={styles.searchContainer}>
        <SearchInput value={search} onChangeText={(e: any) => setSearch(e)} />
      </View>

      {/* 🔹 Subcategories Pills - Only show when navigating from home */}
      {source === 'home' && (
        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollView}
          >
            {subcatLoading ? (
              <Text style={styles.categoryText}>Loading...</Text>
            ) : (
              subcategories.map((sub) => (
                <Pressable
                  key={sub.id}
                  style={[
                    styles.categoryChip,
                    selectedSubcategory === sub.id && styles.categoryChipActive,
                  ]}
                  onPress={() => {
                    setSelectedSubcategory(sub.id);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedSubcategory === sub.id &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {sub.name}
                  </Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* 🔹 Results + Filter */}
      <View style={styles.pageContainer}>
        {/* Follow Button positioned above and to the right - only show for brand filtering */}
        {source === 'brand' && brandValue?.id && (
          <View style={styles.followButtonTopContainer}>
            <FollowButton
              isFollowing={isFollowingBrand}
              onPress={handleFollowBrand}
              loading={followLoading}
            />
          </View>
        )}

        <View style={styles.filterContainer}>
          <View style={styles.filter}>
            <Text>Results</Text>
          </View>
          <View style={styles.actionView}>
            <CustomButton
              title="Filter"
              icon={<FilterIcon width={13} height={16} />}
              buttonStyle={styles.actionBtnBody}
              textStyle={styles.actionTextBtnBody}
              onPress={() => setIsShowFilterModal(true)}
            />
          </View>
        </View>

        {/* 🔹 Products Grid */}
        {screenLoader ? (
          <MyResponsiveGrid
            template={emptyTemplate}
            getNumberOfRows={(data: any) => {}}
          />
        ) : products?.length ? (
          <FlatListResponsiveGrid
            data={products}
            renderItem={template}
            onEndReached={loadMoreItems}
            loadingMore={loadingMore}
          />
        ) : (
          <EmptyState
            title="Oops! No Products Found"
            subtitle="Try adjusting your filters or clearing your search to explore more options. We're sure you'll find something that suits your needs!"
          />
        )}
      </View>

      {/* 🔹 Filter Modal */}
      {isShowFilterModal && (
        <ProductFilterModal
          onClose={() => setIsShowFilterModal(false)}
          isShow={isShowFilterModal}
          handleApply={() => {
            fetchItems();
            setIsShowFilterModal(false);
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default FilterPage;

const styles = StyleSheet.create({
  searchContainer: { padding: 16 },
  pageContainer: { backgroundColor: '#F8FAFC', flex: 1 },
  followButtonTopContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterContainer: { flexDirection: 'row', padding: 16 },
  filter: { flex: 1 },
  actionView: { width: 72 },
  actionBtnBody: {
    backgroundColor: 'rgba(237, 242, 247, 1)',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  actionTextBtnBody: {
    color: 'rgba(30, 52, 72, 1)',
    fontSize: 10,
    fontFamily: 'DMSansMedium',
  },
  card: { marginBottom: 20, borderRadius: 8 },
  categoriesContainer: {
    paddingVertical: 12,
  },
  categoriesScrollView: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryChipActive: { backgroundColor: '#FF3B4A', borderColor: '#FF3B4A' },
  categoryText: { fontSize: 13, color: '#333' },
  categoryTextActive: { color: '#fff', fontWeight: '600' },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginRight: 8,
  },
  retryButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#DC2626',
    borderRadius: 4,
  },
  retryText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
