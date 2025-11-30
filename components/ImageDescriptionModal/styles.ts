import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const modalStyles = StyleSheet.create({
  // Modal container wrapper
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E9F0',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 1,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#07090C',
    textAlign: 'center',
  },
  
  // Scrollable content
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 100, // Space for fixed action bar
  },
  
  // Image section
  imageSection: {
    height: screenHeight * 0.4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 0,
    marginTop: 0,
    borderRadius: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  
  // Image navigation
  imageNavigation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D4313E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  
  // Change image button container
  changeImageContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  // Change image button
  changeImageButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeImageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '500',
    marginLeft: 8,
  },
  
  // Form section
  formSection: {
    flex: 1,
    padding: 16,
    paddingBottom: 40, // Reduced padding since action bar is truly fixed
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#07090C',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  
  // Action bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F9FAFC',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Safe area for iOS devices
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginHorizontal: 6, // Replaces gap for better compatibility
  },
  
  // Button styles
  skipButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4313E',
    borderRadius: 8,
  },
  nextButton: {
    backgroundColor: '#D4313E',
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#FFF7F8',
    borderWidth: 1,
    borderColor: '#FF5C68',
    flex: 0,
    width: 48,
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Button text styles
  skipButtonText: {
    color: '#D4313E',
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#D4313E',
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '600',
  },
  
  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#07090C',
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'DMSans',
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#D4313E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'DMSans',
    fontWeight: '700',
  },
  errorButtonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    color: '#6B7280',
  },
});
