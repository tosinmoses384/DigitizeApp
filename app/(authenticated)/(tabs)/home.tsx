import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Platform,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';
import { Colors, SIZES } from '../../../constants/Colors';





import { fontSz } from '../../../constants';
import RecommendedCardList from '../../../components/RecommendedCardList';

import { useAppDispatch, useAppSelector } from '@redux/store';
import HomeProductsList from '@components/HomeProductsList';
import { router } from 'expo-router';
import {
  setBrandValue,
  setPageTitle,
  setCategoryValue,
} from '@redux/slice/filters/filterSlice';
import { setWardrobeType } from '@redux/slice/temporary-add-item-to-outfit/temporaryAddItemtoOutfitSlice';
import CustomButton from '@components/CustomButton';

import SearchIcon from '../../../assets/images/svg/searchIcon.svg';
import { setIsShownLoginModal } from '@redux/slice/profile/profileSlice';
import StoryLine, { StoryLineApiConfig } from '@components/StoryLine';
import LineLoader from '@components/LineLoader';
import BannerCarousel from '@components/BannerCarousel';
import { useBanners } from '@hooks/useBanners';
import LoveIcon from '@assets/icons/loveIcon';
import InboxIcon from '@assets/icons/inboxIcon';
import { useI18n } from '@hooks/use-i18n';
import { trackEvent } from '@services/analyticsService';
import { useConfigurationData } from '@hooks/use-configuration-data';

import { useStories } from '@hooks/use-stories';

const Home = React.memo(() => {
  const { t } = useI18n();
  const { countryId } = useAppSelector(state => state.userCountryId);
  const { profile } = useAppSelector(state => state.userProfileSlice);
  const { data: configData } = useConfigurationData();
  const categories = configData.categories;
  const brandsFromRedux = configData.brands;
  const { token } = useAppSelector(
    state => state?.userProfileSlice,
  );

  // Fetch stories
  const { data: storiesData, isLoading: storiesLoading } = useStories({
    token: token || '',
    userId: profile?.id,
    enabled: !!token,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRecommendedForYou, setHasRecommendedForYou] = useState(false);
  const [isStoryLine, setIsStoryLine] = useState(1);
  const dispatch = useAppDispatch();

  const {
    banners,
    loading: bannersLoading,
    error: bannersError,
    refetch: refetchBanners,
  } = useBanners();

  // StoryLine API configuration state
  const [storyLineApiConfig, setStoryLineApiConfig] =
    useState<StoryLineApiConfig>({
      context: 'home',
      filterByCategory: 'TimelinePosts',
      customFilters: { featured: true, priority: 'high' },
    });




  // Console the full token, payload and API endpoint that produces brands here
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const fullEndpointUrl = `${baseUrl}/configuration/v1/brands/lov`;



  const brands = useMemo(() => {
    if (!brandsFromRedux || !Array.isArray(brandsFromRedux)) {
      return [];
    }
    return brandsFromRedux.map((brand: any) => ({
      id: brand.id || brand.value,
      name: brand.label || brand.name,
      imageUrl: brand.logoImageUrl || brand.imageUrl,
    }));
  }, [brandsFromRedux]);

  const categoriesData = useMemo(() => {
    if (!categories || !Array.isArray(categories)) {
      return [];
    }
    return categories;
  }, [categories]);

  useEffect(() => {
    let timer: any;

    if (isLoading) {
      timer = setTimeout(() => {
        setIsLoading(false);
      }, 2500);
    }

    return () => clearTimeout(timer);
  }, [isLoading]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    refetchBanners();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  }, [refetchBanners]);

  const handleTabPress = useCallback((tabId: number) => {
    setIsStoryLine(tabId);
  }, []);

  useEffect(() => {
    if (isStoryLine === 2) {
      trackEvent('shop-preloved-view');
    }
  }, [isStoryLine]);

  // Centralized API parameter configuration function
  const getApiConfig = useCallback(
    (activeTab: string, context: string = 'home'): StoryLineApiConfig => {
      // Check if user is authenticated
      const isAuthenticated = !!(token && profile);

      const baseConfig: StoryLineApiConfig = {
        activeTab,
        context: context as 'home' | 'profile' | 'category' | 'search',
        filterByCategory: isAuthenticated ? 'TimelinePosts' : 'PlatformPosts',
        customFilters: { featured: true, priority: 'high' },
      };

      // Tab-specific parameter customization
      switch (activeTab) {
        case 'ItemPost':
          return {
            ...baseConfig,
            filterByCategory: isAuthenticated
              ? 'ExplorePosts'
              : 'PlatformPosts',
            filterByType: 'ExploreItemPost',
            customFilters: {
              ...baseConfig.customFilters,
              itemSpecific: true,
              featured: true,
              priority: 'high',
            },
          };
        case 'OutfitPost':
          return {
            ...baseConfig,
            filterByCategory: isAuthenticated
              ? 'ExplorePosts'
              : 'PlatformPosts',
            filterByType: 'ExploreOutfitPost',
            customFilters: {
              ...baseConfig.customFilters,
              outfitSpecific: true,
              featured: true,
              priority: 'high',
            },
          };
        default:
          return {
            ...baseConfig,
            customFilters: {
              ...baseConfig.customFilters,
              general: true,
              featured: true,
              priority: 'high',
            },
          };
      }
    },
    [!!token, profile?.id],
  );

  // Enhanced tab change handler with dynamic API configuration
  const handleStoryLineTabChange = useCallback(
    (activeTab: string, suggestedFilterByType: string) => {
      // Generate new API configuration based on tab change
      const newApiConfig = getApiConfig(activeTab, 'home');

      // Update the API configuration state
      setStoryLineApiConfig(newApiConfig);
    },
    [getApiConfig],
  );

  // Initialize StoryLine API configuration on component mount
  useEffect(() => {
    const initialConfig = getApiConfig('', 'home');
    setStoryLineApiConfig(initialConfig);
  }, [getApiConfig]);

  const tabs = [
    {
      id: 1,
      title: t('home.digitizeapp'),
    },
    {
      id: 2,
      title: t('home.shopPreloved'),
    },
  ];

  const tabIconList = [
    {
      id: 1,
      icon: <SearchIcon width={20} height={24} />,
      link: '/Search',
    },
    {
      id: 2,
      icon: <LoveIcon width={20} height={24} />,
      link: '/favorites',
    },
    {
      id: 3,
      icon: <InboxIcon width={20} height={22} />,
      link: '/(authenticated)/inbox',
    },
  ];

  const HomeHeader = (
    <View style={styles.header}>
      <View style={styles.headerTab}>
        {tabs?.map(list => (
          <View style={styles.DigitizeAppBtnView} key={list?.id}>
            <CustomButton
              title={list?.title}
              onPress={() => handleTabPress(list?.id)}
              buttonStyle={
                isStoryLine === list?.id ? styles.activeBtn : styles.inActiveBtn
              }
              textStyle={
                isStoryLine === list?.id
                  ? styles.activeBtnText
                  : styles.inActiveBtnText
              }
            />
          </View>
        ))}
      </View>
      <View style={styles.iconListView}>
        {tabIconList?.map((list: any) => (
          <Pressable
            onPress={() => {
              if (!profile && list?.link === '/favorites') {
                return dispatch(setIsShownLoginModal(true));
              }
              dispatch(setIsShownLoginModal(false));
              router.push(list?.link);
            }}
            key={list.id}
            style={({ pressed }) => [
              styles.tabIcon,
              { opacity: pressed ? 0.5 : 1 },
            ]}>
            {list?.icon}
          </Pressable>
        ))}
      </View>
    </View>
  );

  const sections: any = useMemo(
    () => [
      {
        key: 'Categories',
        title: t('home.categories'),
        component: (
          <View style={styles.section}>
            {!categoriesData || categoriesData.length === 0 ? (
              <View style={{ height: 180, width: '100%' }}>
                <LineLoader />
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesRow}>
                {categoriesData.map(cat => (
                  <Pressable
                    key={cat.id}
                    style={styles.categoryBtn}
                    onPress={() => {
                      router.push({
                        pathname: '/filterPage',
                        params: {
                          source: 'home',
                          categoryId: cat.id,
                          categoryName: cat.name,
                        },
                      });
                      dispatch(setPageTitle(cat?.name));
                      dispatch(
                        setCategoryValue({ value: cat.name, id: cat.id }),
                      );
                    }}>
                    <Text style={styles.categoryText}>{cat.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        ),
      },
      {
        key: 'banner',
        component: (
          <BannerCarousel
            banners={banners}
            loading={bannersLoading}
            error={bannersError}
          />
        ),
      },


      {
        key: 'Brands',
        title: t('home.featuredBrands'),
        component: (
          <View style={styles.section}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesRow}>
              {brands.slice(0, 10).map(brand => (
                <View key={brand.id} style={{ alignItems: 'center' }}>
                  <Pressable
                    style={styles.brandBtn}
                    onPress={() => {
                      router.push('/filterPage?source=brand');

                      dispatch(setPageTitle(brand?.name));
                      dispatch(
                        setBrandValue({ value: brand.name, id: brand.id }),
                      );
                    }}>
                    <View style={{ alignItems: 'center' }}>
                      {/* Check if image URL is empty or not */}
                      {brand.imageUrl && brand.imageUrl.trim() !== '' ? (
                        <Image
                          source={{ uri: brand.imageUrl }}
                          style={{ width: 20, height: 20, marginRight: 5 }}
                          onError={(error) => {
                            console.log('Brand image load error:', brand.name, brand.imageUrl, error);
                          }}
                        />
                      ) : (
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            marginRight: 5,
                            backgroundColor: '#E5E5E5',
                            borderRadius: 4,
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Text style={{ fontSize: 10, color: '#999' }}>
                            {brand.name?.charAt(0)?.toUpperCase() || '?'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Pressable>

                  <Text style={styles.brandText}>{brand.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ),
      },

      {
        ...(profile
          ? {
            key: 'recommended',
            title: hasRecommendedForYou ? t('home.recommendedForYou') : '',
            component: (
              <RecommendedCardList
                isLoading={isLoading}
                isRefreshing={isRefreshing}
                setHasRecommendedForYou={setHasRecommendedForYou}
              />
            ),
            link: '/Recommended',
          }
          : null),
      },

      {
        key: 'products',
        title: t('home.products'),
        component: (
          <HomeProductsList
            countryId={countryId}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
          />
        ),
        link: '/filterPage',
      },
    ],
    [
      t,
      profile,
      isLoading,
      isRefreshing,
      hasRecommendedForYou,
      categoriesData,
      brands,
      countryId,
      banners,
      bannersLoading,
      bannersError,
      dispatch,
    ],
  );

  // Memoized render header function
  const renderHeader = useCallback(
    (title: any, link: any) => (
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          paddingVertical: 10,
          alignItems: 'baseline',
        }}>
        <Text
          style={{
            fontFamily: 'DMSansMedium',
            fontSize: fontSz(18),
            color: '#07090C',
          }}>
          {title}
        </Text>
        {link && (
          <TouchableOpacity
            onPress={
              link
                ? () => {
                  router.push(link);
                  dispatch(setBrandValue(null));
                  dispatch(setPageTitle(''));
                  dispatch(setWardrobeType('second'));
                }
                : () => { }
            }>
            <Text
              style={{
                fontSize: fontSz(12),
                fontFamily: 'DMSansMedium',
                color: '#5C6F7F',
              }}>
              {t('common.viewAll')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    ),
    [dispatch, t],
  );

  // Memoized props for StoryLine component
  const storyLineProps = useMemo(
    () => ({
      onActiveTabChange: handleStoryLineTabChange,
      apiConfig: storyLineApiConfig,
      parameterSource: 'parent' as const,
      onApiConfigChange: setStoryLineApiConfig,
      // Use new detail routes for home flow with new API endpoints
      itemDetailRoute: '/itemDetailsUpd',
      outfitDetailRoute: '/outfitDetailsUpdated',
    }),
    [handleStoryLineTabChange, storyLineApiConfig],
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingTop: Platform.OS === 'ios' ? SIZES.height / 22 : SIZES.padding,
      }}>
      <View style={{ paddingHorizontal: 16 }}>{HomeHeader}</View>
      {isStoryLine === 1 ? (
        <StoryLine {...storyLineProps} />
      ) : (
        <FlatList
          data={sections}
          renderItem={({ item }) => (
            <>
              {item.title && renderHeader(item?.title, item?.link)}
              {item.component}
            </>
          )}
          keyExtractor={item => item && item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#FF3B4A"
              colors={Platform.OS === 'android' ? ['#FF3B4A'] : undefined}
            />
          }
        />
      )}
    </SafeAreaView>
  );
});

Home.displayName = 'Home';

export default Home;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
    paddingBottom: 50,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
  },
  headerTab: {
    flexDirection: 'row',
    flexGrow: 1,
    alignItems: 'center',
  },
  DigitizeAppBtnView: {
    marginRight: 12,
  },
  shopView: {},
  activeBtn: {
    backgroundColor: '#D4313E',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D4313E',
  },
  activeBtnText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'DMSansBold',
  },
  inActiveBtn: {
    borderWidth: 1,
    borderColor: '#FFBEC3',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  inActiveBtnText: {
    color: '#FFBEC3',
    fontSize: 12,
    fontFamily: 'DMSansBold',
  },
  iconListView: {
    flexDirection: 'row',
  },
  tabIcon: {
    marginLeft: 12,
  },

  section: {
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#232323',
    marginBottom: 8,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  viewAll: {
    color: '#FF3B4A',
    fontSize: 13,
    fontWeight: '500',
  },
  categoriesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 21,
    paddingVertical: 14,
    marginRight: 5,

    borderWidth: 1,
    borderColor: '#E9EAEB',
  },
  categoryText: {
    color: '#1e2226',
    fontSize: 10,
    fontWeight: '400',
  },

  brandBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginRight: 10,

    borderWidth: 1,
    borderColor: '#E9EAEB',
  },

  brandText: {
    color: '#1e2226',
    fontSize: 10,
    fontWeight: '400',
    marginVertical: 10,
    marginRight: 10,
  },
});
