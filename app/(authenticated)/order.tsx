import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useMemo, useState } from 'react';
import ToggleTabs from '../../components/Toggle';
import { Colors, SIZES } from '../../constants/Colors';
import { fontSz } from '../../constants';
import StackHeader from '../../components/StackHeader';
import { router } from 'expo-router';
import AppTabWrapper from '@components/AppTabWrapper';
import { useOrders } from '@hooks/use-orders';
import {
  OrdersApiResponseDataType,
  OrdersItemDataType,
  OrdersRequestParamsType,
} from '@services/features/order-service/types';
import { format } from 'date-fns';
import WardrobeEmpty from '../../assets/images/svg/emptyWardrobe.svg';
import { Image } from 'expo-image';
import { useAppSelector } from '@redux/store';
import SkeletonShimmerUnit from '@components/SkeletonShimmerUnit';
import { useI18n } from '@hooks/use-i18n';

const Order = () => {
  const { t } = useI18n();
  
  const itemStatusMessage: Record<string, string> = {
    AwaitingPayment: t('orders.awaitingPayment'),
  };
  const [selectedTab, setSelectedTab] = useState<'first' | 'second'>('first');
  const [scrollTab, setScrollTab] = useState(t('orders.all'));
  const [filterByUser, setFilterByUser] =
    useState<OrdersRequestParamsType['FilterByUser']>('Buyer');
  const [filterByStatus, setFilterByStatus] =
    useState<OrdersRequestParamsType['FilterByStatus']>('InProgress');
  const { token } = useAppSelector((state) => state.userProfileSlice);

  const orderQueryFilter = useMemo<OrdersRequestParamsType>(
    () => {
      // Map translated tab names back to API values
      const tabToStatus: Record<string, OrdersRequestParamsType['FilterByStatus']> = {
        [t('orders.all')]: '',
        [t('orders.inProgress')]: 'InProgress',
        [t('orders.completed')]: 'Completed',
        [t('orders.cancelled')]: 'Cancelled',
      };
      
      return {
        FilterByUser: selectedTab === 'first' ? 'Seller' : 'Buyer',
        FilterByStatus: tabToStatus[scrollTab] || '',
      };
    },
    [selectedTab, scrollTab, t],
  );

  const getOrdersQuery = useOrders({ ...orderQueryFilter }, token);

  let ordersQueryData = (getOrdersQuery?.data?.pages.flatMap(
    (page) => page?.data,
  )?.[0] ?? ({} as OrdersApiResponseDataType)) as OrdersApiResponseDataType;

  const handleTabSelect = (tab: 'first' | 'second') => {
    setSelectedTab(tab);
    setScrollTab(t('orders.all'));
  };

  const handleScrollTabSelect = (tab: string) => {
    setScrollTab(tab);
  };

  const handleGetMoreOrders = async () => {
    if (getOrdersQuery.hasNextPage && !getOrdersQuery.isFetchingNextPage) {
      await getOrdersQuery.fetchNextPage();
    }
  };

  const scrollTabs = [
    t('orders.all'), 
    t('orders.inProgress'), 
    t('orders.completed'), 
    t('orders.cancelled')
  ];

  const keyExtractor = useCallback(
    (item: OrdersItemDataType) => item.orderId,
    [],
  );

  const renderItem: ListRenderItem<OrdersItemDataType> = useCallback(
    ({ item, index }) => {
      return (
        <View style={styles.cardView}>
          <Image
            source={{ uri: item.orderImageUrl }}
            style={styles.cardImage}
          />
          <View style={styles.cardViewCenter}>
            <Text style={styles.cardTitle}>{item?.orderDescription}</Text>
            <Text style={styles.cardStatus}>
              {itemStatusMessage[item?.status]}
            </Text>
            <Text style={styles.cardDate}>
              {format(item?.createdOn, 'dd/MM/yyyy')}
            </Text>
          </View>
          <Text style={styles.cardAmount}>
            {item.currencySymbol}
            {item?.total}
          </Text>
        </View>
      );
    },
    [filterByStatus, filterByUser],
  );

  const renderEmptyList = useCallback(() => {
    return (
      <>
        <WardrobeEmpty height={190} width={250} />
        <Text style={styles.emptyText}>{t('orders.noOrders')}</Text>
        <Text style={styles.emptyText2}>
          {t('orders.noOrdersDescription')}
        </Text>
      </>
    );
  }, [filterByStatus, t]);

  const renderFooter = useCallback(() => {
    if (!getOrdersQuery.isFetchingNextPage) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator />
      </View>
    );
  }, []);

  return (
    <AppTabWrapper>
      <View
        style={[
          {
            flex: 1,
            paddingHorizontal: 16,
            backgroundColor: Colors.light.background,
            paddingTop:
              Platform.OS === 'ios' ? SIZES.height / 22 : SIZES.padding,
          },
        ]}
      >
        <StackHeader title={t('orders.myOrders')} onPress={() => router.back()} />
        <ToggleTabs
          currentTab={selectedTab}
          selectedTab={handleTabSelect}
          firstLabel={t('orders.sold')}
          secondLabel={t('orders.bought')}
          small={false}
        />

        {/* Scrollable tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollTabContainer}
        >
          {scrollTabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => handleScrollTabSelect(tab)}
              style={[
                styles.scrollTab,
                scrollTab === tab && styles.scrollTabFocused,
              ]}
            >
              <Text
                style={[
                  styles.scrollTabText,
                  scrollTab === tab && styles.scrollTabTextFocused,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {getOrdersQuery.isLoading &&
        !Boolean(ordersQueryData?.dataset?.length) ? (
          <View style={{ flex: 1, rowGap: 10 }}>
            {[...Array(10).keys()].map((value) => (
              <View style={[styles.cardView]} key={`${value}`}>
                <SkeletonShimmerUnit {...styles.cardImage} />
                <View style={[{ rowGap: 5, flex: 1 }]}>
                  <SkeletonShimmerUnit height={15} />
                  <SkeletonShimmerUnit height={10} />
                  <SkeletonShimmerUnit height={15} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <>
            <FlatList
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              data={ordersQueryData.dataset}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              ListEmptyComponent={renderEmptyList}
              onEndReachedThreshold={0.5}
              onEndReached={handleGetMoreOrders}
              refreshControl={
                <RefreshControl
                  refreshing={getOrdersQuery.isRefetching}
                  onRefresh={getOrdersQuery.refetch}
                  colors={['#FF5C68']}
                />
              }
              ListFooterComponent={renderFooter}
            />
          </>
        )}
      </View>
    </AppTabWrapper>
  );
};

export default Order;

const styles = StyleSheet.create({
  scrollTabContainer: {
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    maxHeight: 40,
  },
  scrollTab: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    marginRight: 10,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollTabFocused: {
    backgroundColor: '#FF9DA4',
    borderColor: '#FF3B4A',
    borderWidth: 1,
  },
  scrollTabText: {
    fontSize: fontSz(14),
    color: '#1E3448',
    fontFamily: 'DMSansMedium',
  },
  scrollTabTextFocused: {
    color: 'white',
  },
  contentContainer: {
    flexGrow: 1,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  emptyText: {
    fontSize: fontSz(14),
    color: '#07090C',
    marginBottom: 10,
    justifyContent: 'center',
    textAlign: 'center',
    fontFamily: 'DMSansMedium',
  },
  emptyText2: {
    fontSize: fontSz(14),
    color: '#90959E',
    marginBottom: 20,
    justifyContent: 'center',
    textAlign: 'center',
    marginHorizontal: 80,
    fontFamily: 'DMSansRegular',
  },
  addButton: {
    backgroundColor: '#464F5D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: 250,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: fontSz(15),
    fontFamily: 'DMSansRegular',
  },
  cardView: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    marginBottom: 4,
    borderRadius: 8,
    flexDirection: 'row',
  },
  cardViewCenter: {
    flex: 1,
  },
  cardImage: {
    width: 52,
    height: 52,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 12,
    color: '#07090C',
    fontFamily: 'DMSansMedium',
  },
  cardStatus: {
    fontSize: 12,
    color: '#6B727E',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#07090C',
  },
  cardAmount: {
    color: '#5C6F7F',
    fontSize: 10,
    fontFamily: 'DMSansMedium',
  },
  footerLoader: {
    padding: 20,
  },
});
