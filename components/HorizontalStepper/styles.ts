import { StyleSheet } from 'react-native';

export const stepperStyles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E9F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  stepContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap: 8, // Use gap for precise spacing
  },
  stepCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  stepText: {
    fontSize: 12,
    fontFamily: 'DMSans',
    fontWeight: '700',
  },
  connectionLine: {
    height: 2,
    width: 48,
    marginHorizontal: 8,
  },
  // Step states
  completedStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#077903',
    borderColor: '#077903',
  },
  currentStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#AA2731',
    borderColor: '#AA2731',
  },
  pendingStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E9EAEB',
    borderColor: '#E9EAEB',
  },
  skippedStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderColor: '#F59E0B',
  },
  // Text colors
  completedText: {
    color: '#FFFFFF',
  },
  currentText: {
    color: '#FFFFFF',
  },
  pendingText: {
    color: '#07090C',
  },
  skippedText: {
    color: '#F59E0B',
  },
  // Connection line colors
  completedLine: {
    backgroundColor: '#077903',
  },
  currentLine: {
    backgroundColor: '#D4313E',
  },
  pendingLine: {
    backgroundColor: '#FDE0E2',
  },
  skippedLine: {
    backgroundColor: '#FDE68A',
  },
});
