import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { stepperStyles as styles } from './styles';
import { HorizontalStepperProps } from './types';
import { Ionicons } from '@expo/vector-icons';

const HorizontalStepper: React.FC<HorizontalStepperProps> = ({
  steps,
  currentStep,
  onStepPress,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const stepRefs = useRef<(View | null)[]>([]);
  const { width: screenWidth } = Dimensions.get('window');

  useEffect(() => {
    stepRefs.current = stepRefs.current.slice(0, steps.length);
  }, [steps]);

  useEffect(() => {
    const stepRef = stepRefs.current[currentStep];

    if (stepRef) {
      // Use a timeout to ensure layout has been calculated after any animations
      const timer = setTimeout(() => {
        stepRef.measure((x, y, width, height, pageX) => {
          // Calculate position to center the step
          const halfScreenWidth = screenWidth / 2;
          const stepCenter = pageX + width / 2;
          let scrollToX = stepCenter - halfScreenWidth;

          // Clamp the scroll position to prevent overscrolling
          scrollToX = Math.max(0, scrollToX);

          scrollViewRef.current?.scrollTo({ x: scrollToX, animated: true });
        });
      }, 100); 

      return () => clearTimeout(timer);
    }
  }, [currentStep, screenWidth, steps]);

  const handleStepPress = (index: number) => {
    const step = steps[index];
    if (step.isAccessible) {
      onStepPress(index);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {steps.map((step, index) => {
          const isCurrent = index === currentStep;
          const isCompleted = step.isCompleted;
          const isSkipped = step.isSkipped;
          const isAccessible = step.isAccessible;

          return (
            <View key={step.id} style={styles.stepContainer} ref={el => (stepRefs.current[index] = el)}>
              <View style={styles.stepWrapper}>
                <TouchableOpacity
                  style={[
                    styles.stepCircle,
                    isCurrent ? styles.currentStep : {},
                    isCompleted ? styles.completedStep : {},
                    !isCurrent && !isCompleted && !isSkipped ? styles.pendingStep : {},
                    isSkipped ? styles.skippedStep : {},
                  ]}
                  onPress={() => handleStepPress(index)}
                  disabled={!isAccessible}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark-sharp" size={16} color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.stepText,
                        isCurrent ? styles.currentText : {},
                        isCompleted ? styles.completedText : {},
                        !isCurrent && !isCompleted && !isSkipped ? styles.pendingText : {},
                        isSkipped ? styles.skippedText : {},
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </TouchableOpacity>

                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.connectionLine,
                      isCompleted && steps[index + 1] && steps[index + 1].isCurrent
                        ? styles.currentLine // Red line from completed to current
                        : isCompleted
                        ? styles.completedLine // Green line between completed steps
                        : styles.pendingLine, // Default pending line
                    ]}
                  />
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default HorizontalStepper;
