import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import UploadButton from "../UploadButton";
import PhotoTipsModal from "../PhotoTipsModal";
import ImageModal from "../ImageModal";
import { UploadIcon } from "../../assets/icons/uploadIcon";
import { CameraIcon } from "../../assets/icons/cameraIcon";
import PhotoTips from "@components/PhotoTips";
import DigitizeAppIcon from "@components/svgs/DigitizeAppIcon";
import { DM_SANS } from "@constants/Fonts";
import GoogleIcon from "@components/svgs/GoogleIcon";
import PinterestIcon from "@components/svgs/PinterestIcon";
import WardrobeBrowserPicker from "@components/wardrobeAndOutffit/WardrobeBrowserPicker";
import { ImageData } from "@components/ImageDescriptionModal/types";
import DrbersItemsBrowserPicker from "@components/wardrobeAndOutffit/DrbersItemsBrowserPicker";
import { useI18n } from "@hooks/use-i18n";

interface MediaData extends ImageData {
  uri: string;
  type?: "image" | "video";
  mimeType?: string;
  fileName?: string;
  thumbnailUri?: string;
}

interface UploadComponentProps {
  uploadedImages: MediaData[];
  failedImages: Set<number>;
  isProcessing: boolean;
  processingProgress: number;
  error: any;
  title?: string;
  maxMediaCount?: number;
  allowedMediaTypes?: "images" | "videos" | "mixed";
  onUploadFromGallery: () => void;
  onTakeNewPhotos?: () => void;
  onUploadVideo?: () => void;
  onPhotoTips?: () => void;
  onRemoveImage: (index: number) => void;
  onImageError: (index: number) => void;
  onImageLoad: (index: number) => void;
  onAddBrowsedImages?: (imageUri: string | Array<string>) => void;
  onSelectingImage?: (isSelecting: boolean) => void;
}

const UploadComponent: React.FC<UploadComponentProps> = ({
  uploadedImages,
  failedImages,
  isProcessing,
  processingProgress,
  error,
  onUploadFromGallery,
  onTakeNewPhotos,
  onUploadVideo,
  onPhotoTips,
  onRemoveImage,
  onImageError,
  onImageLoad,
  title = "Add Photo",
  maxMediaCount = 10,
  allowedMediaTypes = "images",
  ...props
}) => {
  const { t } = useI18n();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const [browseSource, setBrowseSource] = useState<
    "google" | "pinterest" | null
  >(null);
  const [showBrowserModal, setShowBrowserModal] = useState(false);
  const [showDrbersBrowserModal, setShowDrbersBrowserModal] = useState(false);
  const photoTipsModalRef = useRef<BottomSheetModal>(null);
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const handleImagePress = (index: number) => {
    if (!failedImages.has(index)) {
      setSelectedImageIndex(index);
      setModalVisible(true);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImageIndex(null);
  };

  const handlePhotoTips = () => {
    photoTipsModalRef.current?.present();
    // Call the parent's onPhotoTips if provided
    onPhotoTips?.();
  };

  const handleCloseBrowserPickerModal = () => {
    props?.onSelectingImage?.(false);
    setShowBrowserModal(false);
    setShowDrbersBrowserModal(false);
    setBrowseSource(null);
  };

  const handleShowBrowserPickerModal = useCallback(
    (type: "google" | "pinterest") => {
      props?.onSelectingImage?.(true);
      setBrowseSource(type);
      setShowBrowserModal(true);
    },
    [],
  );

  const handleShowDrbersBrowserPickerModal = useCallback(() => {
    props?.onSelectingImage?.(true);
    setShowDrbersBrowserModal(true);
  }, []);

  const handleOnSelectBrowserPick = (
    selectedImageUri: string | Array<string>,
  ) => {
    console.log(
      "\n\nhandleOnSelectBrowserPick selectedImageUri :>> \t\t",
      selectedImageUri,
      "\n\n---",
    );
    if (
      typeof selectedImageUri === "string" &&
      Boolean(selectedImageUri?.trim())
    ) {
      props?.onAddBrowsedImages?.(selectedImageUri);
    }
    props?.onAddBrowsedImages?.(selectedImageUri);
    handleCloseBrowserPickerModal();
  };

  return (
    <BottomSheetModalProvider>
      <View style={styles.contentContainer}>
        <View style={styles.addPhotoSection}>
          <Text style={styles.addPhotoTitle}>
            {title || t('upload.addPhotoOrVideo')}
          </Text>

          <View style={styles.buttonsContainer}>
            {
              props?.onAddBrowsedImages ? (
                <View style={[styles.uploadOptionButtonGroup]}>
                  <TouchableOpacity
                    style={[styles.uploadOptionButton]}
                    onPress={handleShowDrbersBrowserPickerModal}
                  >
                    <DigitizeAppIcon />
                    <Text style={[styles.uploadOptionButtonTitle]}>{t('upload.drbers')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.uploadOptionButton]}
                    onPress={() => handleShowBrowserPickerModal("google")}
                  >
                    <GoogleIcon />
                    <Text style={[styles.uploadOptionButtonTitle]}>{t('upload.google')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.uploadOptionButton]}
                    onPress={() => handleShowBrowserPickerModal("pinterest")}
                  >
                    <PinterestIcon />
                    <Text style={[styles.uploadOptionButtonTitle]}>{t('upload.pinterest')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                </>
              )
            }

            {allowedMediaTypes === "mixed" ? (
              // For mixed media, show both gallery and camera buttons
              <>
                <UploadButton
                  title={isProcessing ? t('upload.processing') : t('upload.uploadFromGallery')}
                  icon={
                    isProcessing ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <UploadIcon />
                    )
                  }
                  onPress={onUploadFromGallery}
                  style={[
                    styles.uploadButton,
                    isProcessing && styles.disabledButton,
                  ]}
                  disabled={
                    isProcessing || uploadedImages.length >= maxMediaCount
                  }
                />

                {onTakeNewPhotos && (
                  <UploadButton
                    title={isProcessing ? t('upload.processing') : t('upload.takeNewPhotos')}
                    icon={
                      isProcessing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <CameraIcon />
                      )
                    }
                    onPress={onTakeNewPhotos}
                    style={[
                      styles.uploadButton,
                      isProcessing && styles.disabledButton,
                    ]}
                    disabled={
                      isProcessing || uploadedImages.length >= maxMediaCount
                    }
                  />
                )}

                {onUploadVideo && (
                  <UploadButton
                    title={isProcessing ? t('upload.processing') : t('upload.uploadVideo')}
                    icon={
                      isProcessing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <UploadIcon />
                      )
                    }
                    onPress={onUploadVideo}
                    style={[
                      styles.uploadButton,
                      isProcessing && styles.disabledButton,
                    ]}
                    disabled={
                      isProcessing || uploadedImages.length >= maxMediaCount
                    }
                  />
                )}
              </>
            ) : (
              // For specific media types, show the appropriate buttons
              <>
                {allowedMediaTypes === "images" && (
                  <>
                    <UploadButton
                      title={
                        isProcessing ? t('upload.processing') : t('upload.uploadFromGallery')
                      }
                      icon={
                        isProcessing ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <UploadIcon />
                        )
                      }
                      onPress={onUploadFromGallery}
                      style={[
                        styles.uploadButton,
                        isProcessing && styles.disabledButton,
                      ]}
                      disabled={
                        isProcessing || uploadedImages.length >= maxMediaCount
                      }
                    />

                    {onTakeNewPhotos && (
                      <UploadButton
                        title={
                          isProcessing ? t('upload.processing') : t('upload.takeNewPhotos')
                        }
                        icon={
                          isProcessing ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <CameraIcon />
                          )
                        }
                        onPress={onTakeNewPhotos}
                        style={[
                          styles.uploadButton,
                          isProcessing && styles.disabledButton,
                        ]}
                        disabled={
                          isProcessing || uploadedImages.length >= maxMediaCount
                        }
                      />
                    )}
                  </>
                )}

                {allowedMediaTypes === "videos" && onUploadVideo && (
                  <UploadButton
                    title={isProcessing ? t('upload.processing') : t('upload.uploadVideo')}
                    icon={
                      isProcessing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <UploadIcon />
                      )
                    }
                    onPress={onUploadVideo}
                    style={[
                      styles.uploadButton,
                      isProcessing && styles.disabledButton,
                    ]}
                    disabled={
                      isProcessing || uploadedImages.length >= maxMediaCount
                    }
                  />
                )}
              </>
            )}
          </View>

          {/* Progress Indicator */}
          {isProcessing && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${processingProgress}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {processingProgress.toFixed(0)}% - {t('upload.processingYourMedia')}
              </Text>
            </View>
          )}

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error.message}</Text>
              <Text style={styles.errorSuggestions}>
                {error.recoverySuggestions?.join(", ")}
              </Text>
            </View>
          )}
        </View>

        <PhotoTips onPhotoTipsPress={handlePhotoTips} />

        {uploadedImages.length > 0 && (
          <View style={styles.imageGallerySection}>
            <Text style={styles.galleryTitle}>
              {t('upload.selectedMedia')} ({uploadedImages.length})
            </Text>
            <View style={styles.imageGrid}>
              {uploadedImages.map((imageData, index) => (
                <View key={index} style={styles.imageItemContainer}>
                  <TouchableOpacity
                    style={styles.imageContainer}
                    onPress={() => handleImagePress(index)}
                    onLongPress={() => onRemoveImage(index)}
                  >
                    {failedImages.has(index) ? (
                      // Fallback display for failed images
                      <View style={styles.failedImageContainer}>
                        <Text style={styles.failedImageText}>📷</Text>
                        <Text style={styles.failedImageLabel}>
                          {t('upload.failedToLoad')}
                        </Text>
                      </View>
                    ) : imageData.type === "video" ? (
                      <View style={styles.videoContainer}>
                        <Image
                          source={{ uri: imageData.thumbnailUri || imageData.uri }}
                          style={styles.uploadedImage}
                          resizeMode="cover"
                          onError={() => onImageError(index)}
                          onLoad={() => onImageLoad(index)}
                        />
                        <View style={styles.videoOverlay}>
                          <Text style={styles.videoIcon}>▶️</Text>
                        </View>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: imageData.uri }}
                        style={styles.uploadedImage}
                        resizeMode="cover"
                        onError={() => onImageError(index)}
                        onLoad={() => onImageLoad(index)}
                        onLoadStart={() => {
                          console.log("Image loading started:", imageData.uri);
                        }}
                      />
                    )}
                    <View style={styles.imageOverlay}>
                      <Text style={styles.imageIndex}>{index + 1}</Text>
                      {failedImages.has(index) && (
                        <Text style={styles.errorIndicator}>⚠️</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => onRemoveImage(index)}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>

                  {/* Image Size Information */}
                  <View style={styles.imageSizeInfo}>
                    {Boolean(imageData.originalFileSize) &&
                      Boolean(imageData.fileSize) ? (
                      <Text style={styles.imageSizeText}>
                        📏 {formatFileSize(imageData.originalFileSize ?? 0)} →{" "}
                        {formatFileSize(imageData.fileSize ?? 0)}
                      </Text>
                    ) : null}
                    {Boolean(imageData.compressionRatio) ? (
                      <Text style={styles.compressionText}>
                        💾{" "}
                        {((imageData.compressionRatio ?? 0) * 100).toFixed(0)}% {t('upload.savings')}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
            <Text style={styles.galleryHint}>
              {t('upload.tapToRemoveHint')}
            </Text>
          </View>
        )}

        {/* Image Modal */}
        <ImageModal
          visible={modalVisible}
          images={uploadedImages}
          selectedIndex={selectedImageIndex}
          onClose={closeModal}
        />

        {/* Photo Tips Modal */}
        <PhotoTipsModal ref={photoTipsModalRef} />
      </View>

      <WardrobeBrowserPicker
        visible={showBrowserModal}
        browseSource={browseSource}
        onSelect={handleOnSelectBrowserPick}
        onDismiss={handleCloseBrowserPickerModal}
      />

      <DrbersItemsBrowserPicker
        visible={showDrbersBrowserModal}
        onSelect={handleOnSelectBrowserPick}
        onDismiss={handleCloseBrowserPickerModal}
      />
    </BottomSheetModalProvider>
  );
};

export default UploadComponent;

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    width: "100%",
    height: "100%",
  },
  addPhotoSection: {
    width: "100%",
  },
  addPhotoTitle: {
    color: "#000000",
    fontFamily: "DMSans",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonsContainer: {
    gap: 16,
  },
  uploadButton: {
    marginBottom: 0,
  },
  disabledButton: {
    opacity: 0.7,
  },
  progressContainer: {
    marginTop: 16,
    width: "100%",
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 2,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "DMSans",
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
    width: "100%",
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    fontFamily: "DMSans",
    fontWeight: "600",
    marginBottom: 4,
  },
  errorSuggestions: {
    fontSize: 12,
    color: "#7F1D1D",
    fontFamily: "DMSans",
  },
  photoTipsButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  photoTipsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    fontFamily: "DMSans",
    marginBottom: 4,
  },
  photoTipsSubText: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "DMSans",
    textAlign: "center",
  },
  imageGallerySection: {
    width: "100%",
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    fontFamily: "DMSans",
    marginBottom: 16,
    textAlign: "center",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  imageContainer: {
    position: "relative",
    width: (Dimensions.get("window").width - 80) / 2, // Account for padding and gap
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 16,
  },
  galleryHint: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "DMSans",
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  imageIndex: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "DMSans",
  },
  failedImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  failedImageText: {
    fontSize: 32,
    marginBottom: 8,
  },
  failedImageLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontFamily: "DMSans",
    textAlign: "center",
  },
  errorIndicator: {
    fontSize: 12,
    marginLeft: 4,
  },
  imageItemContainer: {
    marginBottom: 16,
  },
  imageSizeInfo: {
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  imageSizeText: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: "DMSans",
    textAlign: "center",
    marginBottom: 2,
  },
  compressionText: {
    fontSize: 10,
    color: "#059669",
    fontFamily: "DMSans",
    fontWeight: "600",
    textAlign: "center",
  },
  videoContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  videoIcon: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  uploadOptionButtonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  uploadOptionButton: {
    height: 76,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#F1F2F6",
    flex: 1,
    minWidth: 93.33,
  },
  uploadOptionButtonTitle: {
    color: "#1E2226",
    fontFamily: DM_SANS.regular,
  },
  bottomSheetView: {
    flex: 1,
    height: "100%",
  },
});
