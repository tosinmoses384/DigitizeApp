import { StyleSheet, View, useWindowDimensions } from "react-native";
import React, { useMemo } from "react";
import Animated, {
    SharedValue,
    useAnimatedStyle,
} from "react-native-reanimated";

type Props = {
    index: number;
    progress: SharedValue<number>;
    currentIndex: SharedValue<number>;
    loopProgress: SharedValue<number>;
    activeColor?: string;
    inactiveColor?: string;
    total: number;
};

const SEGMENT_MARGIN = 2;
const PAGINATION_PADDING = 40;

const Segment = ({
    index,
    progress,
    currentIndex,
    loopProgress,
    activeColor = "#FF3B4A",
    inactiveColor = "#FFD8DB",
    total,
}: Props) => {
    const { width: screenWidth } = useWindowDimensions();
    
    const segmentWidth = useMemo(() => {
        const totalPadding = PAGINATION_PADDING * 2;
        const totalMargins = SEGMENT_MARGIN * 2 * total;
        return (screenWidth - totalPadding - totalMargins) / total;
    }, [screenWidth, total]);

    const animatedStyle = useAnimatedStyle(() => {
        'worklet';
        const current = currentIndex.value;
        const isLooping = loopProgress.value > 0;
        
        let widthRatio = 0;
        
        if (current === total && index === 0) {
            widthRatio = progress.value;
        } else if (index === current) {
            widthRatio = progress.value;
        } else if (index < current) {
            widthRatio = 1;
        }
        
        if (isLooping && (index < current || index === total - 1)) {
            widthRatio = widthRatio * (1 - loopProgress.value);
        }
        
        return {
            width: widthRatio * segmentWidth,
        };
    });

    return (
        <View style={[styles.segmentContainer, { width: segmentWidth }]}>
            <View style={[styles.track, { backgroundColor: inactiveColor }]} />
            <Animated.View style={[styles.fill, { backgroundColor: activeColor }, animatedStyle]} />
        </View>
    );
};

export default React.memo(Segment);

const styles = StyleSheet.create({
    segmentContainer: {
        height: 4,
        marginHorizontal: SEGMENT_MARGIN,
        justifyContent: 'center',
    },
    track: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 2,
        opacity: 0.3,
    },
    fill: {
        height: '100%',
        borderRadius: 2,
    },
});
