import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import StackHeader from '../../../components/StackHeader';
import { useAIStylistCarousel } from '../../../hooks/use-ai-stylist-carousel';
import StableCarousel from '../../../components/ai-stylist/StableCarousel';
import { ACCESSIBILITY_CONFIG } from '../../../components/ai-stylist/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useI18n } from "@hooks/use-i18n";

const AiStylist: React.FC = React.memo(() => {
  const { t } = useI18n();
  // React Native hook for responsive screen size
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  // Custom hook for carousel business logic
  const {
    currentIndex,
    centerModelImage,
    backgroundImage,
    handleCarouselIndexChange,
  } = useAIStylistCarousel();

  // Memoized, screen-based sizing derived from design proportions
  const {
    CARD_WIDTH,
    CARD_HEIGHT,
    MODEL_WIDTH,
    MODEL_HEIGHT,
    CARD_TOP,
    CARD_LEFT,
    MODEL_TOP,
    SPARKLE_LEFT_TOP,
    SPARKLE_RIGHT_BIG_TOP,
    SPARKLE_RIGHT_SMALL_TOP,
  } = React.useMemo(() => {
    const cardWidth = Math.round(SCREEN_WIDTH * 0.65);
    const cardHeight = Math.round(cardWidth * 1.6);
    const modelWidth = Math.round(cardWidth * 0.84);
    const modelHeight = Math.round(modelWidth * 1.46);
    const cardTop = Math.round(SCREEN_WIDTH * 0.37);
    const cardLeft = (SCREEN_WIDTH - cardWidth) / 2;
    const modelTop = cardTop + Math.round(cardHeight * 0.033);
    const sparkleLeftTop = cardTop + Math.round(cardHeight * 0.28);
    const sparkleRightBigTop = cardTop + Math.round(cardHeight * 0.2);
    const sparkleRightSmallTop = cardTop + Math.round(cardHeight * 0.42);

    return {
      CARD_WIDTH: cardWidth,
      CARD_HEIGHT: cardHeight,
      MODEL_WIDTH: modelWidth,
      MODEL_HEIGHT: modelHeight,
      CARD_TOP: cardTop,
      CARD_LEFT: cardLeft,
      MODEL_TOP: modelTop,
      SPARKLE_LEFT_TOP: sparkleLeftTop,
      SPARKLE_RIGHT_BIG_TOP: sparkleRightBigTop,
      SPARKLE_RIGHT_SMALL_TOP: sparkleRightSmallTop,
    };
  }, [SCREEN_WIDTH]);

  const dynamic = React.useMemo(
    () => ({
      centerModelImage: {
        top: MODEL_TOP,
        left: CARD_LEFT + (CARD_WIDTH - MODEL_WIDTH) / 2,
        width: MODEL_WIDTH,
        height: MODEL_HEIGHT,
      },
      sparkleLeft: { top: SPARKLE_LEFT_TOP },
      sparkleRightBig: { top: SPARKLE_RIGHT_BIG_TOP },
      sparkleRightSmall: { top: SPARKLE_RIGHT_SMALL_TOP },
    }),
    [
      CARD_TOP,
      CARD_LEFT,
      CARD_WIDTH,
      CARD_HEIGHT,
      MODEL_TOP,
      MODEL_WIDTH,
      MODEL_HEIGHT,
      SPARKLE_LEFT_TOP,
      SPARKLE_RIGHT_BIG_TOP,
      SPARKLE_RIGHT_SMALL_TOP,
    ]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StackHeader 
        title={t('aiStylist.title')}
      />

      {/* Main Content Section - Fixed layout */}
      <View style={styles.mainContent}>
        {/* Carousel Section */}
        <View style={styles.carouselSection}>
          {/* Top Carousel */}
          <View style={styles.carouselWrapper}>
            <StableCarousel onIndexChange={handleCarouselIndexChange} />
          </View>

          <Image
            style={[styles.centerModelImage, dynamic.centerModelImage]}
            contentFit="cover"
            source={centerModelImage}
            cachePolicy="memory-disk"
            transition={300}
            accessibilityRole="image"
            accessibilityLabel={`Fashion model ${currentIndex + 1}`}
            accessibilityIgnoresInvertColors
          />

          {/* Decorative sparkles */}
          <MaterialCommunityIcons
            name="star-four-points"
            size={22}
            color="#FF3B4A"
            style={[styles.sparkleLeft, dynamic.sparkleLeft]}
            accessibilityElementsHidden
          />
          <MaterialCommunityIcons
            name="star-four-points"
            size={16}
            color="#FF3B4A"
            style={[styles.sparkleRightSmall, dynamic.sparkleRightSmall]}
            accessibilityElementsHidden
          />
          <MaterialCommunityIcons
            name="star-four-points"
            size={30}
            color="#FF3B4A"
            style={[styles.sparkleRightBig, dynamic.sparkleRightBig]}
            accessibilityElementsHidden
          />
        </View>

        {/* Coming Soon Section */}
        <View style={styles.comingSoonSection}>
          <Text 
            style={styles.description}
            accessibilityRole="text"
          >
            {t('aiStylist.description')}
          </Text>
          
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            locations={[0, 1]}
            colors={['#c8a2c8', '#ff6f61']}
            style={styles.gradientButton}
          >
            <Pressable
              style={styles.comingSoonButton}
              accessibilityRole="button"
              accessibilityLabel={t('aiStylist.comingSoon')}
              accessibilityHint={ACCESSIBILITY_CONFIG.COMING_SOON_HINT}
              accessibilityState={{ disabled: true }}
            >
              <Text style={styles.comingSoonText}>{t('aiStylist.comingSoon')}</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </View>
    </SafeAreaView>
  );
});

AiStylist.displayName = 'AiStylist';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafc',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 40,
  },
  carouselSection: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  carouselWrapper: {
    zIndex: 3,
    marginTop: 24,
    marginRight: 24,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  // modelCard: {
  //   position: 'absolute',
  //   borderRadius: 13,
  //   backgroundColor: 'rgba(255, 255, 255, 0.2)',
  //   borderColor: '#F6F7F7',
  //   borderWidth: 4,
  //   zIndex: 1,
  // },
  centerModelImage: {
    position: 'absolute',
    zIndex: 2,
  },
  countBadgeText: {
    fontSize: 22,
    fontFamily: 'DMSans-Bold',
    color: '#FF3B4A',
  },
  sparkleLeft: {
    position: 'absolute',
    left: 44,
    zIndex: 0,
  },
  sparkleRightSmall: {
    position: 'absolute',
    right: 110,
    zIndex: 0,
  },
  sparkleRightBig: {
    position: 'absolute',
    right: 46,
    zIndex: 2,
  },
  comingSoonSection: {
    flex: 0.15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 16,
    gap: 20,
    minHeight: 120,
  },
  description: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#6b727e',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  gradientButton: {
    borderRadius: 30,
  },
  comingSoonButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'DMSans-Bold',
    color: '#07090c',
    textAlign: 'center',
  },
});

export default AiStylist;