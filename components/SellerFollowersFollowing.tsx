import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import React, {useState} from 'react';
import StackHeader from './StackHeader';
import {router} from 'expo-router';
import {defaultStyles} from '../constants/Styles';
import {fontSz} from '../constants';
import {Colors} from '../constants/Colors';
import ToggleTabs from './Toggle';
import {useAppDispatch, useAppSelector} from '@redux/store';
import {getInitials} from '@helper/getInitials';
import CustomButton from '@components/CustomButton';
import {useSellerFollowersFollowing} from '../hooks/useSellerFollowersFollowing';
import LineLoader from './LineLoader';

// Import existing components for Following tabs
import BrandsList from '../app/(authenticated)/brands';
import TriftersList from '../app/(authenticated)/trifters';

interface SellerFollowersFollowingProps {
  userId: string;
  type: 'followers' | 'following';
}

const SellerFollowersFollowing: React.FC<SellerFollowersFollowingProps> = ({
  userId,
  type,
}) => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  // Common state
  const [selectedTab, setSelectedTab] = useState('first');
  const [search, setSearch] = useState('');
  const {profile} = useAppSelector(state => state?.userProfileSlice);

  // Custom hook for followers functionality
  const {
    details,
    loading,
    pageToken,
    btnLoader,
    activeId,
    getTrifters,
    handleFollow,
    handleFollowAndUnfollow,
  } = useSellerFollowersFollowing({
    userId,
    type,
    search,
  });

  // Render individual follower item
  const renderFollowerItem = ({item: store}: {item: any}) => (
    <View style={styles.sectionContainer}>
      <View style={styles.imageView}>
        {store?.imageUrl ? (
          <Image
            source={{uri: store?.imageUrl}}
            style={{width: 44, height: 44, borderRadius: 44}}
          />
        ) : (
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'DMSansSemiBold',
            }}>
            {getInitials(store?.name || '')}
          </Text>
        )}
      </View>
      <View style={styles.textContainer}>
        <Text
          style={{
            fontFamily: 'DMSansMedium',
            textTransform: 'capitalize',
          }}>
          {store.name}
        </Text>
        <Text
          style={{
            fontFamily: 'DMSansMedium',
            fontSize: 10,
            color: '#A0B1C0',
          }}>
          {'13 Followers'}
        </Text>
      </View>

      {profile?.id === store?.id ? (
        <CustomButton
          title="Remove"
          buttonStyle={styles.buyButton}
          textStyle={styles.buyButtonText}
          onPress={() => handleFollow(store)}
          loader={btnLoader && activeId === store?.id ? true : false}
        />
      ) : (
        userId && (
          <CustomButton
            title={store?.isFollowing ? 'Following' : 'Follow'}
            buttonStyle={styles.buyButton}
            textStyle={styles.buyButtonText}
            onPress={() => handleFollowAndUnfollow(store)}
            loader={btnLoader && activeId === store?.id ? true : false}
          />
        )
      )}
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIcon}>
        <Text style={styles.emptyStateIconText}>👥</Text>
      </View>
      <Text style={styles.emptyStateTitle}>No Followers Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        This user doesn't have any followers at the moment.
      </Text>
    </View>
  );

  // Render footer loading indicator
  const renderFooter = () => {
    if (!pageToken) return null;

    return (
      <View style={{padding: 20, alignItems: 'center'}}>
        <ActivityIndicator size="small" color="#FF3B4A" />
      </View>
    );
  };

  // Handle load more (pagination)
  const handleLoadMore = () => {
    if (pageToken && !loading) {
      getTrifters();
    }
  };

  const renderFollowersContent = () => (
    <FlatList
      data={details}
      renderItem={renderFollowerItem}
      keyExtractor={(item: any, index: number) =>
        item?.id?.toString() || index.toString()
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 20}}
      ListEmptyComponent={!loading ? renderEmptyState : null}
      ListFooterComponent={renderFooter}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
      removeClippedSubviews={true}
      ListHeaderComponent={
        loading && details.length === 0 ? (
          <View style={styles.skeletonContainer}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} style={styles.skeletonFollowerItem}>
                <View style={styles.skeletonImageView}>
                  <LineLoader loaderStyle={styles.skeletonImage} />
                </View>
                <View style={styles.skeletonTextContainer}>
                  <View style={styles.skeletonNameWrapper}>
                    <LineLoader loaderStyle={styles.skeletonName} />
                  </View>
                  <View style={styles.skeletonFollowersWrapper}>
                    <LineLoader loaderStyle={styles.skeletonFollowersText} />
                  </View>
                </View>
                <View style={styles.skeletonButtonWrapper}>
                  <LineLoader loaderStyle={styles.skeletonButton} />
                </View>
              </View>
            ))}
          </View>
        ) : null
      }
    />
  );

  const renderFollowingContent = () => (
    <>
      <View style={{marginHorizontal: 16}}>
        <ToggleTabs
          currentTab={selectedTab}
          selectedTab={setSelectedTab}
          firstLabel="Drbers"
          secondLabel="Brands"
          small={false}
        />
      </View>
      {selectedTab === 'first' ? (
        <TriftersList hideHeader userId={userId} />
      ) : (
        <BrandsList hideHeader userId={userId} />
      )}
    </>
  );

  return (
    <View
      style={[
        type === 'following'
          ? styles.followingContainer
          : defaultStyles.container,
        {paddingTop: insets.top},
      ]}>
      <StackHeader
        title={type === 'followers' ? 'Followers' : 'Following'}
        isShowHeaderShadow
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push('/');
          }
        }}
      />

      {type === 'followers'
        ? renderFollowersContent()
        : renderFollowingContent()}
    </View>
  );
};

export default SellerFollowersFollowing;

const styles = StyleSheet.create({
  followingContainer: {
    paddingHorizontal: 0,
    paddingTop: 40,
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  sectionContainer: {
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageView: {
    width: 44,
    height: 44,
    backgroundColor: '#919EAB14',
    marginRight: 4,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: fontSz(14),
  },
  followingButtonText: {
    color: '#fff',
  },
  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateIconText: {
    fontSize: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'DMSansBold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    fontFamily: 'DMSansRegular',
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Skeleton loading styles for followers
  skeletonContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  skeletonFollowerItem: {
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonImageView: {
    width: 44,
    height: 44,
    marginRight: 4,
    borderRadius: 44,
    overflow: 'hidden',
  },
  skeletonImage: {
    width: 44,
    height: 44,
    backgroundColor: '#E0E0E0',
    borderRadius: 44,
  },
  skeletonTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonNameWrapper: {
    marginBottom: 8,
  },
  skeletonName: {
    width: '60%',
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  skeletonFollowersWrapper: {
    marginBottom: 4,
  },
  skeletonFollowersText: {
    width: '40%',
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
