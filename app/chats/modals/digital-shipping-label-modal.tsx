import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
  Clipboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useI18n } from "@hooks/use-i18n";
import { useShippingDetails } from "@hooks/use-shipping-details";
import orderServices from "@services/features/orders/orderService";
import CustomToastNotification from "@helper/toast-message";
import { useAppSelector } from "@redux/store";
import ImageViewModal from "@modals/ImageViewerModal";

/**
 * DigitalShippingLabelModal Component
 * 
 * Full-page modal displaying the digital shipping label with QR code,
 * order details, recipient information, and download functionality.
 * 
 * @section Architecture Requirements - Modal component layer
 * @section Performance - Uses React.memo and useCallback for optimization
 * @section Accessibility - Includes proper accessibility labels and roles
 */

interface ToastDetails {
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

interface DigitalShippingLabelModalProps {
  visible: boolean;
  onClose: () => void;
  shippingLabelUrl?: string;
  trackingCode?: string;
  shippingProvider?: string;
  shippingType?: string;
  metadata?: any;
  // Order details from chat page
  itemName?: string;
  itemImage?: string;
  itemPrice?: string;
  currencySymbol?: string;
  recipientName?: string;
}

const DigitalShippingLabelModal: React.FC<DigitalShippingLabelModalProps> = ({
  visible,
  onClose,
  shippingLabelUrl,
  trackingCode,
  shippingProvider = "InPost",
  shippingType = "Locker",
  metadata = {},
  itemName = "",
  itemImage = "",
  itemPrice = "",
  currencySymbol = "",
  recipientName = "",
}) => {
  const { t } = useI18n();
  const { token } = useAppSelector((state) => state.userProfileSlice);
  
  // State management
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [toastDetails, setToastDetails] = useState<ToastDetails | null>(null);
  const [isLabelFullScreen, setIsLabelFullScreen] = useState(false);
  const [isLabelLoading, setIsLabelLoading] = useState(true);

  /**
   * Fetch shipping details using React Query
   * Leverages caching from other components (chat screen, tracking modal)
   */
  const {
    data: shippingDetailsResponse,
    isLoading: isLoadingDetails,
  } = useShippingDetails(metadata?.order_id, visible && !!metadata?.order_id);

  const shippingDetails = shippingDetailsResponse?.data || null;

  /**
   * Format provider name for display
   * Uses API data first, then falls back to props
   * Uses shipping service description and ship-from details for context-aware display
   */
  const providerDisplayName = React.useMemo(() => {
    const provider = shippingDetails?.shippingProvider || shippingProvider || metadata?.shipping_provider || "";
    const serviceDescription = shippingDetails?.shippingService?.description || "";
    const shipFromType = shippingDetails?.shipFrom?.type;
    const shipFromName = shippingDetails?.shipFrom?.name;
    
    // Check if InPost to use specific translation
    if (provider?.toLowerCase() === "inpost") {
      return t("shippingInstructions.inpostFullName");
    }
    
    // Build context-aware display based on service type and ship-from details
    if (provider && serviceDescription) {
      // Capitalize provider name
      const formattedProvider = provider.charAt(0).toUpperCase() + provider.slice(1);
      
      // If it's a drop-off address type and we have the location name
      if (shipFromType === "DropOffAddress" && shipFromName) {
        return `${formattedProvider} ${serviceDescription} | ${shipFromName}`;
      }
      
      // For other types or when we don't have ship-from name
      return `${formattedProvider} ${serviceDescription}`;
    }
    
    // Fallback to basic format
    const type = shippingDetails?.shippingType || shippingType || metadata?.shipping_type || "";
    if (provider) {
      return `${provider} ${type}`;
    }
    
    return "";
  }, [shippingDetails, shippingProvider, shippingType, metadata, t]);

  /**
   * Get all order details from API data, then fallback to props/metadata
   * Uses actual API data without hardcoded fallbacks
   */
  const orderDetails = React.useMemo(() => {
    // Use API data for recipient if available
    const actualRecipientName = shippingDetails?.shipTo?.name || recipientName;
    
    // Delivery estimate - use shipping service duration if available
    let deliveryEstimate = "";
    if (shippingDetails?.shippingService?.duration) {
      // Use the duration from shipping service (e.g., "2-3 days")
      deliveryEstimate = shippingDetails.shippingService.duration;
    } else if (shippingDetails?.estimatedDeliveryDate) {
      // Fallback: Format the date if duration not available
      try {
        const date = new Date(shippingDetails.estimatedDeliveryDate);
        deliveryEstimate = date.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric',
          year: 'numeric'
        });
      } catch {
        deliveryEstimate = "";
      }
    }

    // Label expiry - calculate from shipping label creation date or estimated delivery
    let labelExpires = metadata?.label_expires || 
                      metadata?.expiry_date ||
                      metadata?.expiryDate ||
                      "";
    
    // Calculate expiry from label creation date (typically 14 days from creation)
    if (!labelExpires && shippingDetails?.shippingLabel?.createdOn) {
      try {
        const createdDate = new Date(shippingDetails.shippingLabel.createdOn);
        if (!isNaN(createdDate.getTime())) {
          const expiryDate = new Date(createdDate);
          expiryDate.setDate(expiryDate.getDate() + 14); // Labels typically expire in 14 days
          labelExpires = expiryDate.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric' 
          });
        }
      } catch {
        labelExpires = "";
      }
    }
    
    // Fallback: calculate from collection date if still no expiry
    if (!labelExpires && metadata?.collection_date) {
      try {
        const collectionDate = new Date(metadata.collection_date);
        if (!isNaN(collectionDate.getTime())) {
          const expiryDate = new Date(collectionDate);
          expiryDate.setDate(expiryDate.getDate() + 14);
          labelExpires = expiryDate.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric' 
          });
        }
      } catch {
        labelExpires = "";
      }
    }

    // Get shipping label URL and tracking info from API
    const labelUrl = shippingDetails?.shippingLabel?.shippingLabelResourceUrl || shippingLabelUrl;
    const trackingCodes = shippingDetails?.shippingLabel?.trackingCodes || (trackingCode ? [trackingCode] : []);
    const trackingUrls = shippingDetails?.shippingLabel?.trackingUrls || [];
    const orderId = metadata?.order_id || metadata?.orderId || "";

    return {
      deliveryEstimate,
      labelExpires,
      orderId,
      recipientName: actualRecipientName,
      labelUrl,
      trackingCodes,
      trackingUrls,
    };
  }, [shippingDetails, metadata, recipientName, shippingLabelUrl, trackingCode]);

  /**
   * Download the QR code/shipping label
   * Uses the API-provided URL
   */
  const handleDownloadQRCode = useCallback(async () => {
    const labelUrl = orderDetails.labelUrl;
    
    if (!labelUrl) {
      setToastDetails({
        message: t("digitalLabel.downloadUnavailable"),
        type: "error",
        duration: 3000,
      });
      return;
    }

    try {
      setIsDownloading(true);

      // Get file extension from URL
      const fileExtension = labelUrl.includes('.pdf') ? 'pdf' : 'png';
      const fileName = `shipping_label_${orderDetails.orderId || Date.now()}.${fileExtension}`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Download the file
      const downloadResult = await FileSystem.downloadAsync(
        labelUrl,
        fileUri
      );

      if (downloadResult.status !== 200) {
        throw new Error(t("digitalLabel.downloadFailed"));
      }

      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();
      
      if (isSharingAvailable) {
        // Share/save the file
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: fileExtension === 'pdf' ? 'application/pdf' : 'image/png',
          dialogTitle: t("digitalLabel.saveLabel"),
          UTI: fileExtension === 'pdf' ? 'com.adobe.pdf' : 'public.png',
        });
      } else {
        setToastDetails({
          message: t("digitalLabel.downloadSuccess"),
          type: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error downloading QR code:", error);
      }
      setToastDetails({
        message: t("digitalLabel.downloadError"),
        type: "error",
        duration: 3000,
      });
    } finally {
      setIsDownloading(false);
    }
  }, [orderDetails.labelUrl, orderDetails.orderId, t]);

  /**
   * Copy tracking code to clipboard
   */
  const handleCopyTrackingCode = useCallback((code: string) => {
    Clipboard.setString(code);
    setToastDetails({
      message: t("digitalLabel.trackingCodeCopied"),
      type: "success",
      duration: 2000,
    });
  }, [t]);

  /**
   * Open tracking URL in browser
   */
  const handleOpenTrackingUrl = useCallback(async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        setToastDetails({
          message: t("digitalLabel.cannotOpenUrl"),
          type: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error opening tracking URL:", error);
      }
      setToastDetails({
        message: t("digitalLabel.failedToOpenUrl"),
        type: "error",
        duration: 3000,
      });
    }
  }, [t]);

  /**
   * Handle cancel shipping label
   * Shows confirmation before canceling
   */
  const handleCancelLabel = useCallback(() => {
    Alert.alert(
      t("digitalLabel.cancelLabelTitle"),
      t("digitalLabel.cancelLabelMessage"),
      [
        {
          text: t("common.no"),
          style: "cancel",
        },
        {
          text: t("common.yes"),
          style: "destructive",
          onPress: async () => {
            if (!token || !orderDetails.orderId) {
              setToastDetails({
                message: t("common.error"),
                type: "error",
                duration: 3000,
              });
              return;
            }

            setIsCancelling(true);
            
            try {
              const response = await orderServices.cancelShippingLabel(
                token,
                orderDetails.orderId
              );

              if (response.status === 200 || response.responseCode === "0") {
                setToastDetails({
                  message: t("digitalLabel.labelCancelled"),
                  type: "success",
                  duration: 3000,
                });
                
                // Close modal after a short delay to show success toast
                setTimeout(() => {
                  onClose();
                }, 1500);
              } else {
                setToastDetails({
                  message: response.message || t("digitalLabel.cancelFailed"),
                  type: "error",
                  duration: 3000,
                });
              }
            } catch (error) {
              if (__DEV__) {
                console.error("Error canceling shipping label:", error);
              }
              setToastDetails({
                message: t("digitalLabel.cancelFailed"),
                type: "error",
                duration: 3000,
              });
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  }, [t, onClose, token, orderDetails.orderId]);

  /**
   * Open BR/Download options
   */
  const handleBRDownload = useCallback(() => {
    handleDownloadQRCode();
  }, [handleDownloadQRCode]);

  /**
   * Handle opening label in full-screen view
   */
  const handleOpenLabelFullScreen = useCallback(() => {
    if (orderDetails.labelUrl && !imageError) {
      setIsLabelFullScreen(true);
    }
  }, [orderDetails.labelUrl, imageError]);

  /**
   * Handle label image load
   */
  const handleLabelLoad = useCallback(() => {
    setIsLabelLoading(false);
  }, []);

  /**
   * Handle label image error
   */
  const handleLabelError = useCallback(() => {
    setIsLabelLoading(false);
    setImageError(true);
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Toast Notification */}
        {toastDetails && (
          <View style={styles.toastContainer}>
            <CustomToastNotification
              message={toastDetails.message}
              type={toastDetails.type}
              autoHideDuration={3000}
            />
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.backButton}
            accessibilityLabel={t("common.back")}
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={24} color="#07090C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t("digitalLabel.title")}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Loading State */}
          {isLoadingDetails && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF3B4A" />
              <Text style={styles.loadingText}>{t("digitalLabel.loadingDetails")}</Text>
            </View>
          )}

          {/* QR Code Section */}
          <View style={styles.qrSection}>
            <Text style={styles.qrTitle}>
              {t("digitalLabel.scanLabel")}
            </Text>
            <Text style={styles.qrDescription}>
              {t("digitalLabel.scanInstructions")}
            </Text>

            {/* QR Code Image - Tappable */}
            <TouchableOpacity
              style={styles.qrCodeContainer}
              onPress={handleOpenLabelFullScreen}
              activeOpacity={0.8}
              disabled={!orderDetails.labelUrl || imageError}
              accessibilityLabel={t("digitalLabel.tapToEnlarge")}
              accessibilityRole="button"
              accessibilityHint={t("digitalLabel.tapToEnlargeHint")}
            >
              {orderDetails.labelUrl && !imageError ? (
                <>
                  <Image
                    source={{ uri: orderDetails.labelUrl }}
                    style={styles.qrCodeImage}
                    resizeMode="contain"
                    onLoad={handleLabelLoad}
                    onError={handleLabelError}
                  />
                  {isLabelLoading && (
                    <View style={styles.labelLoadingOverlay}>
                      <ActivityIndicator size="large" color="#FF3B4A" />
                      <Text style={styles.labelLoadingText}>
                        {t("digitalLabel.loadingLabel")}
                      </Text>
                    </View>
                  )}
                  {!isLabelLoading && (
                    <View style={styles.tapToEnlargeHint}>
                      <Ionicons name="expand-outline" size={16} color="#6B7280" />
                      <Text style={styles.tapToEnlargeText}>
                        {t("digitalLabel.tapToEnlarge")}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.qrCodePlaceholder}>
                  <Ionicons name="qr-code-outline" size={140} color="#D1D5DB" />
                  {imageError && (
                    <Text style={styles.imageErrorText}>
                      {t("digitalLabel.imageLoadError")}
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>

            {/* Tracking Codes - Show all tracking codes with copy functionality */}
            {orderDetails.trackingCodes && orderDetails.trackingCodes.length > 0 && (
              <View style={styles.trackingCodeSection}>
                <Text style={styles.trackingCodeLabel}>
                  {t("digitalLabel.wontScan")}
                </Text>
                {orderDetails.trackingCodes.map((code, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleCopyTrackingCode(code)}
                    style={styles.trackingCodeRow}
                    accessibilityLabel={t("digitalLabel.copyTrackingCode")}
                    accessibilityRole="button"
                    activeOpacity={0.7}
                  >
                    <Text style={styles.trackingCode}>{code}</Text>
                    <Ionicons name="copy-outline" size={22} color="#6B7280" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Tracking URLs - Show clickable links */}
            {orderDetails.trackingUrls && orderDetails.trackingUrls.length > 0 && (
              <View style={styles.trackingUrlsSection}>
                {orderDetails.trackingUrls.map((url, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleOpenTrackingUrl(url)}
                    style={styles.trackingUrlButton}
                    accessibilityLabel={t("digitalLabel.openTrackingUrl")}
                    accessibilityRole="button"
                    activeOpacity={0.8}
                  >
                    <Ionicons name="link-outline" size={20} color="#2563EB" />
                    <Text style={styles.trackingUrlText}>
                      {t("digitalLabel.trackOrder")}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#2563EB" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Separator */}
          {(orderDetails.trackingCodes?.length > 0 || orderDetails.trackingUrls?.length > 0) && (
            <View style={styles.sectionSeparator} />
          )}

          {/* Shipping Provider - Only show if we have provider data */}
          {providerDisplayName && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t("digitalLabel.shippingProvider")}
                </Text>
                <View style={styles.providerBadge}>
                  <View style={styles.providerDot} />
                </View>
              </View>
              <Text style={styles.providerName}>{providerDisplayName}</Text>
            </>
          )}

          {/* Order Details - Only show if we have item data */}
          {itemName && (
            <View style={styles.orderSection}>
              <View style={styles.orderTextContainer}>
                <Text style={styles.detailLabel}>{t("digitalLabel.order")}</Text>
                <Text style={styles.orderItemName}>{itemName}</Text>
              </View>
              {itemImage && (
                <Image
                  source={{ uri: itemImage }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              )}
            </View>
          )}

          {/* Recipient - Only show if we have recipient name */}
          {orderDetails.recipientName && (
            <View style={styles.detailRowSpaced}>
              <Text style={styles.detailLabel}>{t("digitalLabel.recipient")}</Text>
              <Text style={styles.detailValue}>{orderDetails.recipientName}</Text>
            </View>
          )}

          {/* Delivery Estimate - Only show if we have delivery estimate */}
          {orderDetails.deliveryEstimate && (
            <View style={styles.detailRowSpaced}>
              <Text style={styles.detailLabel}>{t("digitalLabel.deliveryEstimate")}</Text>
              <Text style={styles.detailValue}>{orderDetails.deliveryEstimate}</Text>
            </View>
          )}

          {/* Label Expires - Only show if we have expiry date */}
          {orderDetails.labelExpires && (
            <View style={styles.detailRowSpaced}>
              <Text style={styles.detailLabel}>{t("digitalLabel.labelExpires")}</Text>
              <Text style={styles.detailValue}>{orderDetails.labelExpires}</Text>
            </View>
          )}

          {/* BR Download QR Code */}
          <TouchableOpacity
            style={styles.downloadRow}
            onPress={handleBRDownload}
            disabled={isDownloading}
            accessibilityLabel={t("digitalLabel.downloadQRCode")}
            accessibilityRole="button"
          >
            <View style={styles.downloadLeft}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <Text style={styles.downloadText}>
                {t("digitalLabel.brDownloadQRCode")}
              </Text>
            </View>
            {isDownloading ? (
              <ActivityIndicator size="small" color="#6B7280" />
            ) : (
              <Ionicons name="download-outline" size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Cancel Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.cancelButton, isCancelling && styles.cancelButtonDisabled]}
            onPress={handleCancelLabel}
            disabled={isCancelling}
            accessibilityLabel={t("digitalLabel.cancelShippingLabel")}
            accessibilityRole="button"
          >
            {isCancelling ? (
              <ActivityIndicator size="small" color="#212C3D" />
            ) : (
              <Text style={styles.cancelButtonText}>
                {t("digitalLabel.cancelShippingLabel")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Full-Screen Label Viewer */}
      {orderDetails.labelUrl && (
        <ImageViewModal
          isShow={isLabelFullScreen}
          onClose={() => setIsLabelFullScreen(false)}
          uri={orderDetails.labelUrl}
        />
      )}
    </Modal>
  );
};

/**
 * Memoize component to prevent unnecessary rerenders
 * 
 * @section Performance - Memoization for optimization
 */
export default React.memo(DigitalShippingLabelModal);

/**
 * Styles following DigitizeApp design system
 * 
 * @section Styling - StyleSheet.create for performance
 * @section Code Quality - No inline styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  toastContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9EAEB",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "DMSansBold",
    color: "#07090C",
    fontWeight: "700",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  qrSection: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  qrTitle: {
    fontSize: 20,
    fontFamily: "DMSansBold",
    color: "#07090C",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  qrDescription: {
    fontSize: 14,
    fontFamily: "DMSansRegular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  qrCodeContainer: {
    width: 320,
    height: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrCodeImage: {
    width: 300,
    height: 300,
  },
  qrCodePlaceholder: {
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  labelLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  labelLoadingText: {
    fontSize: 14,
    fontFamily: "DMSansRegular",
    color: "#6B7280",
    marginTop: 12,
  },
  tapToEnlargeHint: {
    position: "absolute",
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tapToEnlargeText: {
    fontSize: 12,
    fontFamily: "DMSansRegular",
    color: "#6B7280",
  },
  trackingCodeSection: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  trackingCodeLabel: {
    fontSize: 15,
    fontFamily: "DMSans-Medium",
    color: "#4B5563",
    marginBottom: 12,
    fontWeight: "500",
  },
  trackingCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 4,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  trackingCode: {
    fontSize: 17,
    fontFamily: "DMSansBold",
    color: "#111827",
    fontWeight: "700",
    flex: 1,
    letterSpacing: 0.5,
  },
  trackingUrlsSection: {
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 20,
    gap: 12,
  },
  trackingUrlButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#BFDBFE",
    gap: 10,
    width: "100%",
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  trackingUrlText: {
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    color: "#2563EB",
    fontWeight: "600",
  },
  imageErrorText: {
    fontSize: 12,
    fontFamily: "DMSansRegular",
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "DMSansRegular",
    color: "#6B7280",
    marginTop: 12,
  },
  sectionSeparator: {
    height: 8,
    backgroundColor: "#F9FAFB",
    marginTop: 24,
    marginBottom: 0,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailRowSpaced: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "DMSansRegular",
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "DMSansMedium",
    color: "#07090C",
    fontWeight: "500",
  },
  providerBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },
  providerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F59E0B",
  },
  providerName: {
    fontSize: 13,
    fontFamily: "DMSansRegular",
    color: "#07090C",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  orderSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  orderTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  orderItemName: {
    fontSize: 14,
    fontFamily: "DMSansRegular",
    color: "#07090C",
    marginTop: 6,
    lineHeight: 20,
  },
  downloadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    marginTop: 16,
  },
  downloadLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  downloadText: {
    fontSize: 14,
    fontFamily: "DMSansRegular",
    color: "#07090C",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E9EAEB",
  },
  cancelButton: {
    borderColor: "#212C3D",
    borderWidth: 1,
    borderStyle: "solid",
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  cancelButtonDisabled: {
    opacity: 0.5,
  },
  cancelButtonText: {
    color: "#212C3D",
    fontSize: 15,
    fontFamily: "DMSans-Medium",
    fontWeight: "500",
  },
});

