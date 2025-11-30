import { useCallback, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedReaction,
  useDerivedValue,
  withTiming,
  cancelAnimation,
  scrollTo,
  Easing,
} from 'react-native-reanimated';

interface UseOnboardingAnimationProps {
  dataLength: number;
}

export const useOnboardingAnimation = ({
  dataLength,
}: UseOnboardingAnimationProps) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const flatListRef = useAnimatedRef<Animated.FlatList<unknown>>();
  const x = useSharedValue(0);
  const targetIndex = useSharedValue(0);
  const isInteracting = useSharedValue(false);
  const isScrolling = useSharedValue(false);
  const progress = useSharedValue(0);
  const loopTrigger = useSharedValue(0);

  const lastItemOffset = useMemo(() => (dataLength - 1) * SCREEN_WIDTH, [dataLength, SCREEN_WIDTH]);

  const currentIndex = useDerivedValue(() => {
    'worklet';
    return Math.floor(x.value / SCREEN_WIDTH + 0.5);
  });

  const loopProgress = useDerivedValue(() => {
    'worklet';
    if (x.value <= lastItemOffset) return 0;
    const prog = (x.value - lastItemOffset) / SCREEN_WIDTH;
    return prog < 0 ? 0 : prog > 1 ? 1 : prog;
  });

  useAnimatedReaction(
    () => loopTrigger.value,
    (trigger, prevTrigger) => {
      if (trigger !== prevTrigger && trigger > 0) {
        if (isInteracting.value || isScrolling.value) return;

        progress.value = 0;
        progress.value = withTiming(1, { duration: 3000, easing: Easing.linear }, (finished) => {
          if (finished && !isInteracting.value && !isScrolling.value) {
            const nextIdx = targetIndex.value + 1;

            isScrolling.value = true;
            progress.value = 0;

            if (nextIdx >= dataLength) {
              scrollTo(flatListRef, dataLength * SCREEN_WIDTH, 0, true);
              targetIndex.value = 0;
            } else {
              scrollTo(flatListRef, nextIdx * SCREEN_WIDTH, 0, true);
              targetIndex.value = nextIdx;
            }
          }
        });
      }
    }
  );

  useAnimatedReaction(
    () => currentIndex.value,
    (current, previous) => {
      if (current !== previous && previous !== null) {
        if (current === 0 && previous === dataLength) {
          scrollTo(flatListRef, 0, 0, false);
        }
      }
    }
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x;
    },
    onBeginDrag: () => {
      isInteracting.value = true;
      isScrolling.value = false;
      cancelAnimation(progress);
      progress.value = 0;
    },
    onEndDrag: (event) => {
      isInteracting.value = false;
      isScrolling.value = true;
      // Native pagingEnabled handles the snap, so we don't need to manually scrollTo here.
      // Just ensure we update the target index in onMomentumEnd.
    },
    onMomentumEnd: () => {
      isScrolling.value = false;

      const snapIndex = Math.round(x.value / SCREEN_WIDTH);

      // Handle infinite loop reset
      if (snapIndex >= dataLength) {
        scrollTo(flatListRef, 0, 0, false);
        targetIndex.value = 0;
      } else {
        targetIndex.value = snapIndex;
      }

      if (!isInteracting.value) {
        progress.value = 0;
        loopTrigger.value = loopTrigger.value + 1;
      }
    },
  });

  const startLoop = useCallback(() => {
    loopTrigger.value = 1;
  }, []);

  const stopLoop = useCallback(() => {
    cancelAnimation(progress);
  }, []);

  return {
    flatListRef,
    x,
    progress,
    currentIndex,
    loopProgress,
    dataLength,
    onScroll,
    startLoop,
    stopLoop,
    SCREEN_WIDTH,
  };
};
