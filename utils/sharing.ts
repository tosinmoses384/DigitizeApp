import { Share, Alert } from 'react-native';
import { generateDeepLinks } from '../config/linking';

export const shareItem = async (itemId: string, itemName?: string) => {
  try {
    const url = generateDeepLinks.universal.item(itemId);
    const message = itemName 
      ? `Check out this ${itemName} on DigitizeApp!` 
      : 'Check out this item on DigitizeApp!';

    await Share.share({
      message: `${message}\n${url}`,
      url: url,
      title: 'Share Item',
    });
  } catch (error) {
    console.error('Error sharing item:', error);
    Alert.alert('Error', 'Failed to share item');
  }
};

export const shareUserProfile = async (userId: string, userName: string) => {
  try {
    const universalLinkUrl = generateDeepLinks.universal.userProfile(userId);
    
    console.log('🌐 Generated universal link URL:', universalLinkUrl);
    
    // Use universal links for clickable sharing
    const shareMessage = `Check out ${userName}'s profile on DigitizeApp!\n\n${universalLinkUrl}`;
    
    const result = await Share.share({
      message: shareMessage,
      url: universalLinkUrl, // This makes the link clickable
      title: `${userName} on DigitizeApp`,
    });
    
    console.log('📤 Profile share result:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sharing user profile:', error);
    throw error;
  }
};

export const sharePost = async (postId: string, postTitle?: string, authorName?: string) => {
  try {
    const universalLinkUrl = generateDeepLinks.universal.post(postId);
    
    console.log('🌐 Generated post universal link URL:', universalLinkUrl);
    
    // Create share message for post
    const postDescription = postTitle ? `"${postTitle}"` : 'this post';
    const authorText = authorName ? ` by ${authorName}` : '';
    const shareMessage = `Check out ${postDescription}${authorText} on DigitizeApp!\n\n${universalLinkUrl}`;
    
    const result = await Share.share({
      message: shareMessage,
      url: universalLinkUrl, // This makes the link clickable
      title: `Post on DigitizeApp`,
    });
    
    console.log('📤 Post share result:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sharing post:', error);
    throw error;
  }
};

export const shareApp = async () => {
  try {
    const url = generateDeepLinks.universal.home();
    const message = 'Join me on DigitizeApp - the marketplace for fashion!';

    await Share.share({
      message: `${message}\n${url}`,
      url: url,
      title: 'Share DigitizeApp',
    });
  } catch (error) {
    console.error('Error sharing app:', error);
    Alert.alert('Error', 'Failed to share app');
  }
};

// Generate shareable links for different content types
export const generateShareableLink = {
  item: (itemId: string) => generateDeepLinks.universal.item(itemId),
  profile: (userId: string) => generateDeepLinks.universal.userProfile(userId),
  post: (postId: string) => generateDeepLinks.universal.post(postId),
  app: () => generateDeepLinks.universal.home(),
};
