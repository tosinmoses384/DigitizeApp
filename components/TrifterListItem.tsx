import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAppDispatch } from '@redux/store';
import { setSellerId } from '@redux/slice/filters/filterSlice';
import { Colors } from '../constants/Colors';
import CustomButton from '@components/CustomButton';
import { TrifterItem } from '../hooks/useTriftersData';

interface TrifterListItemProps {
  item: TrifterItem;
  userId?: string;
  followingStatus?: number;
  onFollowPress: (item: TrifterItem) => void;
  getButtonState: (item: TrifterItem, userId?: string) => {
    title: string;
    isLoading: boolean;
    disabled: boolean;
  };
  getButtonStyles: (
    item: TrifterItem,
    baseStyle: any,
    followingStyle: any,
    textStyle: any,
    followingTextStyle: any,
    userId?: string
  ) => {
    buttonStyle: any[];
    textStyle: any[];
  };
}

const TrifterListItem = memo<TrifterListItemProps>(({
  item,
  userId,
  followingStatus,
  onFollowPress,
  getButtonState,
  getButtonStyles
}) => {
  const dispatch = useAppDispatch();

  // Memoized navigation handler
  const handleProfilePress = React.useCallback(() => {
    router.push('/SellerProfile');
    dispatch(setSellerId(item.id));
  }, [item.id, dispatch]);

  // Memoized follow button press handler
  const handleFollowPress = React.useCallback(() => {
    onFollowPress(item);
  }, [item, onFollowPress]);

  // Get button state and styles
  const buttonState = getButtonState(item, userId);
  const { buttonStyle, textStyle } = getButtonStyles(
    item,
    styles.buyButton,
    styles.followingButton,
    styles.buyButtonText,
    styles.followingButtonText,
    userId
  );

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.textContainer}>
        <Pressable onPress={handleProfilePress}>
          <Text style={styles.nameText}>
            {item.name}
          </Text>
        </Pressable>
        <Text style={styles.followersText}>
          {`${item.followersCount || 0} Followers`}
        </Text>
      </View>

      <CustomButton
        loader={buttonState.isLoading}
        title={buttonState.title}
        buttonStyle={buttonStyle}
        textStyle={textStyle}
        onPress={handleFollowPress}
        disabled={buttonState.disabled}
      />
    </View>
  );
});

TrifterListItem.displayName = 'TrifterListItem';

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
  nameText: {
    fontFamily: 'DMSansMedium',
    textTransform: 'capitalize',
  },
  followersText: {
    fontFamily: 'DMSansMedium',
    textTransform: 'capitalize',
    color: '#A0B1C0',
    fontSize: 12,
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
  buyButtonText: {
    marginLeft: 5,
    color: Colors.light.primaryBase,
    fontFamily: 'DMSansBold',
    fontSize: 14,
  },
  followingButtonText: {
    color: '#fff',
  },
});

export default TrifterListItem;
