import { StyleSheet } from 'react-native';

const BORDER_COLOR = '#E5E7EB';
const SELECTED_BORDER_COLOR = '#D4313E';
const PRIMARY_COLOR = '#D4313E';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    marginBottom: 16,
  },
  selectedCard: {
    borderColor: SELECTED_BORDER_COLOR,
    backgroundColor: '#FFF1F2',
  },
  iconContainer: {
    marginRight: 16,
    // Add styles if icons are used in the future
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'DMSans',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'DMSans',
    lineHeight: 20,
  },
  radioContainer: {
    marginLeft: 16,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadioOuter: {
    borderColor: PRIMARY_COLOR,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PRIMARY_COLOR,
  },
});
