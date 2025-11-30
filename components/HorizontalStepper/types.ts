import { ViewStyle } from 'react-native';

export interface StepData {
  id: string;
  label?: string;
  isCompleted: boolean;
  isAccessible?: boolean;
  isSkipped?: boolean;
}

export interface HorizontalStepperProps {
  steps: StepData[];
  currentStep: number;
  onStepPress: (stepIndex: number) => void;
  containerStyle?: ViewStyle;
  stepSize?: number;
  activeColor?: string;
  completedColor?: string;
  pendingColor?: string;
  skippedColor?: string;
}

export interface StepComponentProps {
  step: StepData;
  index: number;
  isCurrentStep: boolean;
  onPress: (index: number) => void;
  stepSize: number;
  activeColor: string;
  completedColor: string;
  pendingColor: string;
  skippedColor: string;
  isLastStep: boolean;
}
