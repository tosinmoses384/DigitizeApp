import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import StackHeader from '../../components/StackHeader';
import {router} from 'expo-router';
import {Colors} from '../../constants/Colors';
import wardrobeServices from '../../services/features/wardrobe-service/wardrobeServices';
import {useAppSelector} from '../../redux/store';
import SearchInput from '@components/SearchInput';
import CustomButton from '@components/CustomButton';
import {useToast} from 'react-native-toast-notifications';
import {useApiService} from '@hooks/use-auth-guard/useApiService';
import LineLoader from '../../components/LineLoader';
interface IBrandsList {
  hideHeader: boolean;
  followingStatus?: number;
  userId?: string;
}
const BrandsList = ({hideHeader, followingStatus, userId}: IBrandsList) => {
  const {token} = useAppSelector(state => state?.userProfileSlice);
  const toast = useToast();
  const {callApi} = useApiService();

  const [loading, setLoading] = useState(false);
  const [pageToken, setPageToken] = useState('');
  const [details, setDetails]: any = useState([]);
  const [search, setSearch] = useState('');
  const [followBtnLoader, setFollowBtnLoader] = useState(false);
  const [activeFollowId, setActiveFollowId] = useState('');

  const getBrands = async () => {
    if (pageToken) {
      await callApi(
        token => {
          return userId
            ? wardrobeServices.sellerBrandQueryFollow(
                token,
                search || '',
                '12',
                pageToken || '',
                userId,
              )
            : wardrobeServices.brandQueryFollow(
                token,
                search || '',
                '12',
                pageToken || '',
                followingStatus || 0,
              );
        },
        {
          onSuccess: (res: any) => {
            setLoading(false);
            const newItems = res?.data?.dataset || [];
            setDetails([...details, ...newItems]);
            setPageToken(res?.data?.pageToken);
          },
          onError: error => {
            setLoading(false);
          },
        },
      );
    }
  };

  const getInitialItems = async () => {
    setPageToken('');
    setDetails([]);
    setLoading(true);

    await callApi(
      token => {
        return userId
          ? wardrobeServices.sellerBrandQueryFollow(
              token,
              search || '',
              '12',
              pageToken || '',
              userId,
            )
          : wardrobeServices.brandQueryFollow(
              token,
              search || '',
              '12',
              pageToken || '',
              followingStatus || 0,
            );
      },
      {
        onSuccess: (res: any) => {
          setLoading(false);
          const brands = res?.data?.dataset || [];
          setDetails(brands);
          if (res?.data?.hasNextPage) {
            setPageToken(res?.data?.pageToken);
          }
        },
        onError: error => {
          setLoading(false);
          // Show error state to user
          toast.show('Failed to load brands. Please try again.', {
            type: 'danger',
            duration: 4000,
          });
        },
      },
    );
  };

  useEffect(() => {
    if (token) {
      getInitialItems();
    }
  }, [token, search, userId]);

  const updateItemState = (data: any) => {
    if (followingStatus) {
      const getFilterData = details.filter(
        (list: any) => list?.id !== data?.id,
      );

      return setDetails(getFilterData);
    }
    const findExistingItems = details?.find(
      (list: any) => list?.id === data?.id,
    );

    if (findExistingItems) {
      const getNewUpdate = details?.map((list: any) =>
        list?.id === data?.id
          ? {
              ...list,
              isFollowing: list?.isFollowing ? false : true,
            }
          : list,
      );

      setDetails(getNewUpdate);
    }
  };

  const handleFollowAndUnfollow = async (selectedData: any) => {
    setFollowBtnLoader(true);
    setActiveFollowId(selectedData?.id);
    let data = {
      brandId: selectedData?.id,
    };

    await callApi(
      token => {
        return selectedData?.isFollowing
          ? wardrobeServices.unfollowBrands(data, token)
          : wardrobeServices.followBrands(data, token);
      },
      {
        onSuccess: (res: any) => {
          setFollowBtnLoader(false);
          if (res?.status === 200) {
            return updateItemState(selectedData);
          }
          toast.show(`${res?.message || res?.detail}`, {
            type: 'danger',
            duration: 4000,
          });
        },
        onError: error => {
          setFollowBtnLoader(false);
        },
      },
    );
  };

  return (
    <View
      style={{
        marginTop: hideHeader ? 0 : 30,
        backgroundColor: 'white',
        flex: 1,
      }}>
      {!hideHeader && (
        <StackHeader
          title="Brands"
          isShowHeaderShadow
          onPress={() => router.back()}
        />
      )}

      {/* <SearchBarWithAutocomplete1 /> */}
      <View style={styles.searchContainer}>
        <SearchInput value={search} onChangeText={(e: any) => setSearch(e)} />
      </View>
      {loading && details?.length === 0 && (
        <View style={styles.skeletonContainer}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} style={styles.skeletonItem}>
              <View style={styles.skeletonTextContainer}>
                <View style={styles.skeletonNameWrapper}>
                  <LineLoader loaderStyle={styles.skeletonName} />
                </View>
                <View style={styles.skeletonItemsWrapper}>
                  <LineLoader loaderStyle={styles.skeletonItems} />
                </View>
              </View>
              <View style={styles.skeletonButtonWrapper}>
                <LineLoader loaderStyle={styles.skeletonButton} />
              </View>
            </View>
          ))}
        </View>
      )}
      {!loading && details?.length === 0 && (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>No Brands Found</Text>
          <Text style={styles.emptyStateSubtitle}>
            {userId
              ? "This user isn't following any brands yet."
              : 'No brands available at the moment.'}
          </Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={getBrands}
        scrollEventThrottle={16}>
        {details?.map((store: any, index: number) => (
          <View key={index} style={styles.sectionContainer}>
            <View style={styles.textContainer}>
              <Text
                style={{
                  fontFamily: 'DMSansMedium',
                  fontSize: 12,
                  textTransform: 'capitalize',
                }}>
                {store?.name}
              </Text>
              <Text
                style={{
                  fontFamily: 'DMSansMedium',
                  fontSize: 12,
                  textTransform: 'capitalize',
                  color: '#A0B1C0',
                }}>
                {`${store?.itemsCount || 0} Items`}
              </Text>
            </View>
            <CustomButton
              loader={activeFollowId === store?.id && followBtnLoader}
              title={
                activeFollowId === store?.id && followBtnLoader
                  ? 'Loading'
                  : store?.isFollowing
                  ? userId
                    ? 'Following'
                    : followingStatus
                    ? 'Unfollow'
                    : 'Following'
                  : 'Follow'
              }
              buttonStyle={[
                styles.buyButton,

                store?.isFollowing && styles.followingButton,
                store?.isFollowing &&
                  followingStatus === 1 && {backgroundColor: 'white'},
                {width: store?.isFollowing ? 100 : 80},
                store?.isFollowing &&
                  userId && {
                    backgroundColor: '#FF3B4A',
                    borderColor: '#FF3B4A',
                  },
              ]}
              textStyle={[
                styles.buyButtonText,
                store?.isFollowing && styles.followingButtonText,
                store?.isFollowing &&
                  followingStatus === 1 &&
                  styles.buyButtonText,
                store?.isFollowing &&
                  userId && {
                    color: 'white',
                  },
              ]}
              onPress={() => handleFollowAndUnfollow(store)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default BrandsList;

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  textContainer: {
    flex: 1,
  },
  buyButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    justifyContent: 'center',
    borderWidth: 1,
    alignItems: 'center',
    borderColor: Colors.light.primaryBase,
  },
  followingButton: {
    backgroundColor: Colors.light.primaryBase,
  },
  buyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    marginLeft: 5,
    color: Colors.light.primaryBase,
    fontFamily: 'DMSansBold',
    fontSize: 14,
  },
  followingButtonText: {
    color: '#fff',
  },
  searchContainer: {
    marginTop: 10,
    marginHorizontal: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'DMSansSemiBold',
    color: '#212B36',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    fontFamily: 'DMSansRegular',
    color: '#637381',
    textAlign: 'center',
    lineHeight: 20,
  },
  skeletonContainer: {
    marginTop: 20,
  },
  skeletonItem: {
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonNameWrapper: {
    marginBottom: 8,
  },
  skeletonName: {
    width: '50%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  skeletonItemsWrapper: {
    marginBottom: 4,
  },
  skeletonItems: {
    width: '35%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  skeletonButtonWrapper: {
    marginLeft: 16,
  },
  skeletonButton: {
    width: 80,
    height: 32,
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
  },
});
