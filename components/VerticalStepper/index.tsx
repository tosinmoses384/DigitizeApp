import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type VerticalStepperStep = {
  key: string;
  renderContent: () => React.ReactNode;
  indicatorColor?: string; // defaults to brand red
};

export type VerticalStepperProps = {
  steps: VerticalStepperStep[];
  containerStyle?: ViewStyle | ViewStyle[];
  dotColor?: string; // defaults to brand-tint pink
};

const DEFAULT_INDICATOR = '#FF3B4A';
const DEFAULT_DOT_COLOR = '#FFD8DB';

const VerticalStepper: React.FC<VerticalStepperProps> = ({
  steps,
  containerStyle,
  dotColor = DEFAULT_DOT_COLOR,
}) => {
  const [stepHeights, setStepHeights] = useState<number[]>(() => steps.map(() => 0));
  const [checkboxTopOffset, setCheckboxTopOffset] = useState<number | null>(null);

  const STEP_VERTICAL_GAP = 16; // space between steps

  const dottedHeights = useMemo(() => {
    return stepHeights.map((h) => Math.max(48, (h || 0) + STEP_VERTICAL_GAP));
  }, [stepHeights]);

  const handleSetHeight = (index: number, height: number) => {
    setStepHeights((prev) => {
      if (prev[index] === height) return prev;
      const copy = [...prev];
      copy[index] = height;
      return copy;
    });
  };

  const dottedStartOffset = useMemo(() => {
    if (checkboxTopOffset == null) {
      // default based on 20px indicator + 2px top offset + 8px gap
      return 20 + 2 + 8;
    }
    return checkboxTopOffset;
  }, [checkboxTopOffset]);

  return (
    <View style={[styles.container, containerStyle]}> 
      {steps.map((step, index) => {
        const showDotted = index < steps.length - 1;
        const height = dottedHeights[index] || 0;
        const indicatorColor = step.indicatorColor || DEFAULT_INDICATOR;

        return (
          <View key={step.key} style={styles.stepRow} onLayout={(e) => handleSetHeight(index, e.nativeEvent.layout.height)}>
            <View
              style={[styles.checkboxContainer, { backgroundColor: indicatorColor }]}
              onLayout={(e) => {
                const { y, height } = e.nativeEvent.layout;
                // Start dots just below the indicator with an 8px gap
                const start = y + height + 8;
                if (checkboxTopOffset == null || Math.abs(start - checkboxTopOffset) > 0.5) {
                  setCheckboxTopOffset(start);
                }
              }}
            >
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>

            <View style={styles.stepContent}>
              {step.renderContent()}
            </View>

            {showDotted && (
              <View style={styles.dottedLineAbsolute}>
                <DottedLine height={height} startOffset={dottedStartOffset} dotColor={dotColor} />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const DottedLine: React.FC<{ height: number; startOffset?: number; dotColor?: string }> = ({ height, startOffset = 0, dotColor = DEFAULT_DOT_COLOR }) => {
  const effectiveHeight = Math.max(0, (height || 0) - (startOffset || 0));
  const count = useMemo(() => Math.max(2, Math.round(effectiveHeight / 8)), [effectiveHeight]);

  return (
    <View style={[styles.dottedLineContainer, { height }, startOffset ? { paddingTop: startOffset } : null]}> 
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[styles.dot, { backgroundColor: dotColor }]} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
    position: 'relative',
  },
  checkboxContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    marginTop: 2, // baseline alignment with title text
  },
  stepContent: {
    flex: 1,
    gap: 8,
  },
  dottedLineAbsolute: {
    position: 'absolute',
    left: 10,
    width: 1,
    alignItems: 'center',
    zIndex: 1,
    top: 0,
  },
  dottedLineContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default VerticalStepper;


