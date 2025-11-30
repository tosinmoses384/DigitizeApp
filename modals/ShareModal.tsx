import CustomButton from '@components/CustomButton';
import NewBottomModal from '@components/NewBottomModal';
import {generateDeepLinks} from '../config/linking';

import React from 'react';
import {Linking, Pressable, StyleSheet, Text, Clipboard} from 'react-native';
import {View} from 'react-native';
import CloseIcon from '../assets/images/svg/x-close.svg';
import FacebookIcon from '../assets/images/svg/facebook.svg';
import TwitterIcon from '../assets/images/svg/twitter.svg';
import TikTokIcon from '../assets/images/svg/tiktok.svg';
import WhatsappIcon from '../assets/images/svg/whatsapp.svg';
import LinkIcon from '../assets/images/svg/link.svg';
import CopyIcon from '../assets/images/svg/copy-duplicate.svg';
import {useToast} from 'react-native-toast-notifications';
interface IShareModal {
  isShow: boolean;
  onClose: any;
  linkUrl?: string;
  postData?: any; // Post data for post sharing
  profileData?: any; // Profile data for profile sharing
  itemData?: any; // Item data for item sharing
  shareType?: 'post' | 'profile' | 'item' | 'general'; // Standardized share types
}
const ShareModal = ({
  isShow,
  onClose,
  linkUrl,
  postData,
  profileData,
  itemData,
  shareType,
}: IShareModal) => {
  const toast = useToast();

  // Generate universal link URL based on share type using linking.ts configuration
  const generateShareLink = () => {
    switch (shareType) {
      case 'post':
        if (postData?.id) {
          return generateDeepLinks.universal.post(postData.id);
        }
        // If shareType is 'post' but no postData.id, don't fallback to home
        return linkUrl || generateDeepLinks.universal.home();
      case 'profile':
        if (profileData?.userId || profileData?.id) {
          const userId = profileData?.userId || profileData?.id;
          return generateDeepLinks.universal.userProfile(userId);
        }
        return linkUrl || generateDeepLinks.universal.home();
      case 'item':
        if (itemData?.id) {
          return generateDeepLinks.universal.item(itemData.id);
        }
        return linkUrl || generateDeepLinks.universal.home();
      case 'general':
      default:
        // Only use home URL for general sharing or when no specific shareType is provided
        return linkUrl || generateDeepLinks.universal.home();
    }
  };

  const link = generateShareLink();

  // Generate smart share message based on share type
  const generateShareMessage = () => {
    switch (shareType) {
      case 'post':
        if (postData) {
          const postTitle = postData?.title || postData?.description;
          const authorName =
            postData?.user?.firstName && postData?.user?.lastName
              ? `${postData.user.firstName} ${postData.user.lastName}`.trim()
              : postData?.user?.firstName;

          const postDescription = postTitle ? `"${postTitle}"` : 'this post';
          const authorText = authorName ? ` by ${authorName}` : '';
          return `Check out ${postDescription}${authorText} on DigitizeApp!`;
        }
        break;
      case 'profile':
        if (profileData) {
          const userName =
            profileData?.firstName && profileData?.lastName
              ? `${profileData.firstName} ${profileData.lastName}`.trim()
              : profileData?.firstName || profileData?.username || 'this user';
          return `Check out ${userName}'s profile on DigitizeApp!`;
        }
        break;
      case 'item':
        if (itemData) {
          const itemName = itemData?.title || itemData?.name || 'this item';
          const sellerName =
            itemData?.seller?.firstName && itemData?.seller?.lastName
              ? `${itemData.seller.firstName} ${itemData.seller.lastName}`.trim()
              : itemData?.seller?.firstName;
          const sellerText = sellerName ? ` by ${sellerName}` : '';
          return `Check out "${itemName}"${sellerText} on DigitizeApp!`;
        }
        break;
      default:
        break;
    }
    return 'Check out this link on DigitizeApp!';
  };

  const messageLink = generateShareMessage();

  const sharePlartform = [
    {
      id: 1,
      title: 'WhatsApp',
      icon: <WhatsappIcon />,
    },
    {
      id: 2,
      title: 'TikTok',
      icon: <TikTokIcon />,
    },
    {
      id: 3,
      title: 'Facebook',
      icon: <FacebookIcon />,
    },
    {
      id: 4,
      title: 'Twitter',
      icon: <TwitterIcon />,
    },
  ];

  const shareWhatsApp = (url: string, message: string) => {
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(
      `${message} ${url}`,
    )}`;
    Linking.openURL(whatsappUrl);
  };

  const shareTwitter = (url: string, message: string) => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      url,
    )}&text=${encodeURIComponent(message)}`;
    Linking.openURL(twitterUrl);
  };

  const shareFacebook = (url: string, message: string) => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url,
    )}&quote=${encodeURIComponent(message)}`;
    Linking.openURL(facebookUrl);
  };

  const shareTikTok = (url: string, message: string) => {
    // TikTok doesn't have a direct web sharing URL like other platforms
    // For mobile, we'll try to open the TikTok app or fallback to copying the link
    const tiktokAppUrl = `tiktok://`;
    const fullMessage = `${message} ${url}`;

    // Try to open TikTok app first
    Linking.canOpenURL(tiktokAppUrl)
      .then(supported => {
        if (supported) {
          // Copy the content to clipboard and open TikTok app
          Clipboard.setString(fullMessage);
          toast.show('Link copied! Opening TikTok app to share.', {
            type: 'success',
            duration: 4000,
          });
          return Linking.openURL(tiktokAppUrl);
        } else {
          // Fallback: copy to clipboard with instructions
          Clipboard.setString(fullMessage);
          toast.show('Link copied! Please paste it in TikTok manually.', {
            type: 'success',
            duration: 4000,
          });
        }
      })
      .catch(() => {
        // Fallback: copy to clipboard
        Clipboard.setString(fullMessage);
        toast.show('Link copied! Please paste it in TikTok manually.', {
          type: 'success',
          duration: 4000,
        });
      });
  };

  const handleShare = (list: any) => {
    if (list?.title === 'WhatsApp') {
      return shareWhatsApp(link, messageLink);
    }
    if (list?.title === 'TikTok') {
      return shareTikTok(link, messageLink);
    }
    if (list?.title === 'Facebook') {
      return shareFacebook(link, messageLink);
    }
    if (list?.title === 'Twitter') {
      return shareTwitter(link, messageLink);
    }
  };

  const handleCopyToClipboard = () => {
    Clipboard.setString(link);
    return toast.show(`Copied!, Text has been copied to clipboard.`, {
      type: 'success',
      duration: 4000,
    });
  };

  return (
    <View>
      <NewBottomModal
        isShow={isShow}
        onClose={onClose}
        maxHeight={257}
        contentStyle={{
          backgroundColor: 'white',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingHorizontal: 0,
          width: '100%', // Or a specific width (e.g., '80%')
          flex: 1,
        }}>
        <View style={styles.body}>
          <Pressable
            style={({pressed}) => [styles.closeIcon, pressed && styles.pressed]}
            onPress={onClose}>
            <CloseIcon />
          </Pressable>
          <View style={styles.optionBody}>
            <Text style={styles.optionBodyTitle}>Share this link via:</Text>
            <View style={styles.socialListView}>
              {sharePlartform?.map(list => (
                <Pressable
                  key={list?.id}
                  style={({pressed}) => [
                    styles.socialList,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => handleShare(list)}>
                  <View style={styles.socialListIcon}>{list?.icon}</View>
                  <Text style={styles.socialListTitle}>{list?.title}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Text style={styles.socialLinkTitle}>Or copy link</Text>
          <View style={styles.socialLinkCopy}>
            <View style={styles.socialLinkView}>
              <View style={styles.linkIconView}>
                <LinkIcon />
              </View>
              <Text
                style={styles.linkText}
                numberOfLines={1}
                ellipsizeMode="tail">
                {link}
              </Text>
            </View>
            <CustomButton
              title="Copy"
              buttonStyle={styles.copyBtn}
              textStyle={styles.copyBtnText}
              icon={<CopyIcon />}
              onPress={handleCopyToClipboard}
            />
          </View>
        </View>
      </NewBottomModal>
    </View>
  );
};

export default ShareModal;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: '#f9fefc',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    zIndex: 3,
    right: 16,
    top: 16,
  },
  pressed: {
    opacity: 0.5,
  },
  optionBody: {
    marginTop: 10,
  },
  optionBodyTitle: {
    fontSize: 14,
    color: '#07090C',
    marginBottom: 24,
    fontFamily: 'DMSansMedium',
  },
  socialListView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#E9EAEB',
    marginBottom: 16,
  },
  socialList: {
    justifyContent: 'center',
  },
  socialListIcon: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 14,
  },
  socialListTitle: {
    color: '#1E2226',
    fontSize: 11,
    textAlign: 'center',
  },
  socialLinkCopy: {
    flexDirection: 'row',
    alignItems: 'center',

    flex: 1,
  },
  socialLinkView: {
    backgroundColor: '#E9EAEB',
    padding: 8,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  socialLinkTitle: {
    color: '#464F5D',
    fontSize: 12,
    marginBottom: 8,
  },
  linkIconView: {
    marginRight: 2,
  },
  linkText: {
    fontSize: 14,
    color: '#5C6F7F',
    flex: 1,
  },
  copyBtn: {
    backgroundColor: '#FF3B4A',
    borderRadius: 4,
    paddingHorizontal: 17,
    paddingVertical: 12,
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'DMSansMedium',
  },
});
