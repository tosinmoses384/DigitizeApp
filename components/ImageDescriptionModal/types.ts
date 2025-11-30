export interface ImageData {
  uri: string;
  originalFileSize: number | null; // null for browsed image;
  fileSize: number | null; // null for browsed image;
  compressionRatio: number | null; // null for browsed image;
}

export interface ImageDescription {
  imageUri: string;
  originalFileSize: number | null; // null for browsed image;
  fileSize: number | null; // null for browsed image;
  compressionRatio: number | null; // null for browsed image;
  clientRequestId?: string;
  brandId: string | null;
  categoryId: string | null;
  sizeId: string | null;
  colourId: string | null;
  selectedBrandId: string | null;
  selectedCategoryId: string | null;
  selectedSizeId: string | null;
  selectedColourId: string | null;
  seasonId: string | null;
  selectedSeasonId: string | null;
  isValid?: boolean;
  hasBeenEdited?: boolean;
  isSkipped?: boolean;
}

export interface ImageDescriptionModalProps {
  isVisible: boolean;
  images: ImageDescription[];
  currentIndex: number;
  onClose: (reason: "success" | "manual") => void;
  onSave: (descriptions: ImageDescription[]) => void;
  onImageChange: (index: number) => void;
  onSkip: (index: number) => void;
  onDelete: (index: number) => void;
  onReplaceImage: (index: number) => void;
  token: string;
}

export interface ActionBarProps {
  onSkip: () => void;
  onNext: () => void;
  onDelete: () => void;
  isLastImage: boolean;
  isLoading: boolean;
  nextButtonText?: string;
}

export interface ImageNavigationProps {
  imageUri: string;
  onPrevious: () => void;
  onNext: () => void;
  onChangeImage: () => void;
  showPrevious: boolean;
  showNext: boolean;
  imageIndex: number;
  totalImages: number;
}
