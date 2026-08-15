import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ModalProps,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import WebView from "react-native-webview";
import CustomButton from "@components/CustomButton";
import Icon from "@expo/vector-icons/MaterialIcons";
import { normalizePinterestUrl } from "@utils/url-formatter";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n } from "@hooks/use-i18n";

interface Props extends Omit<ModalProps, "children"> {
  browseSource: "google" | "pinterest" | null;
  onSelect: (uri: string) => void;
  injectedJs?: string;
}

const screenHeight = Dimensions.get("screen").height;

export default function WardrobeBrowserPicker({
  ...props
}: Props): React.JSX.Element | null {
  const { t } = useI18n();
  const webViewRef = useRef<WebView>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const safeAreaInsets = useSafeAreaInsets();

  const uri = useMemo(() => {
    return props.browseSource === "google"
      ? "https://images.google.com/"
      : "https://www.pinterest.com/search";
  }, [props.visible, props.browseSource]);

  const injectedJS = `
(function() {
  let lastSrc = null;
  let isProcessing = false;
  
  function postImage(src) {
    if (src && src !== lastSrc && !isProcessing) {
      lastSrc = src;
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "image", src }));
    }
  }

  // Capture clicks on images - this is the primary selection method
  document.addEventListener("click", function(e) {
    const t = e.target;
    if (t && t.tagName === "IMG" && t.src) {
      e.preventDefault(); // Prevent default link behavior that might cause refresh
      postImage(t.src);
    }
  }, true);

  // Throttled function to find largest image
  let throttleTimer = null;
  function throttledFindLargestImage() {
    if (throttleTimer || isProcessing) return;
    
    throttleTimer = setTimeout(() => {
      isProcessing = true;
      try {
        const imgs = Array.from(document.querySelectorAll("img[src]"));
        if (imgs.length === 0) return;
        
        let largest = null;
        let maxSize = 0;
        
        imgs.forEach(img => {
          // Only consider loaded images
          if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
            const size = img.naturalWidth * img.naturalHeight;
            if (size > maxSize) {
              maxSize = size;
              largest = img;
            }
          }
        });
        
        if (largest && largest.src) {
          postImage(largest.src);
        }
      } catch (err) {
        console.warn("Error finding largest image:", err);
      } finally {
        isProcessing = false;
        throttleTimer = null;
      }
    }, 500); // Wait 500ms before processing
  }

  // Less aggressive observer - only observe when images are added
  const observer = new MutationObserver((mutations) => {
    let hasImageChanges = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            if (element.tagName === 'IMG' || element.querySelector && element.querySelector('img')) {
              hasImageChanges = true;
            }
          }
        });
      }
    });
    
    if (hasImageChanges) {
      throttledFindLargestImage();
    }
  });

  // Start observing with more specific config
  observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    attributes: false, // Don't watch attribute changes
    attributeOldValue: false,
    characterData: false
  });

  // Initial scan after page loads
  if (document.readyState === 'complete') {
    setTimeout(throttledFindLargestImage, 1000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(throttledFindLargestImage, 1000);
    });
  }
})();
`;

  const pinterestInjectedJS = `
(function() {
  let lastSrc = null;

  function postImage(src) {
    if (src && src !== lastSrc) {
      lastSrc = src;
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "image", src }));
    }
  }

  // ✅ Only trigger on explicit user clicks
  document.addEventListener("click", function(e) {
    let el = e.target;

    // Case 1: Direct <img>
    if (el && el.tagName === "IMG" && el.src) {
      e.preventDefault();
      postImage(el.src);
      return;
    }

    // Case 2: Pinterest div with background-image
    const bg = window.getComputedStyle(el).getPropertyValue("background-image");
    if (bg && bg.startsWith("url(")) {
      const url = bg.slice(4, -1).replace(/["']/g, "");
      if (url) {
        e.preventDefault();
        postImage(url);
      }
    }
  }, true);

})();
`;

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "image") {
        setSelectedImageUrl(data.src);
      }
    } catch (err) {
      console.warn("Failed to parse message", err);
    }
  };

  const handleSelect = () => {
    if (!selectedImageUrl) {
      Alert.alert(t('upload.noImageSelected'), t('upload.pleaseTapImage'));
      return;
    }

    if (props.browseSource === "pinterest") {
      const normalisedImageUrl = normalizePinterestUrl(selectedImageUrl);
      props.onSelect(normalisedImageUrl);
    } else {
      props.onSelect(selectedImageUrl);
    }
    setSelectedImageUrl(null);
  };

  const handleClose = () => {
    setSelectedImageUrl(null);
    props.onDismiss?.();
  };

  const renderHeader = useCallback(
    () => (
      <View
        style={[styles.headerContainer, { paddingTop: safeAreaInsets.top }]}
      >
        <View />
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Icon name={"close"} size={24} />
        </TouchableOpacity>
      </View>
    ),
    [selectedImageUrl],
  );

  // Footer component for BottomSheet
  const renderFooter = () => {
    return (
      <>
        <View style={[styles.footer, { paddingBottom: safeAreaInsets.bottom }]}>
          <CustomButton
            title={t('upload.selectImage')}
            onPress={handleSelect}
            variant={"primary"}
            disabled={!Boolean(selectedImageUrl?.trim())}
          />
        </View>
      </>
    );
  };

  return (
    <>
      <Modal
        visible={props.visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleClose}
      >
        <View style={[{ flex: 1 }]}>
          {renderHeader()}
          <WebView
            ref={webViewRef}
            style={{ flex: 1 }}
            source={{ uri }}
            injectedJavaScript={
              props.browseSource === "pinterest"
                ? pinterestInjectedJS
                : injectedJS
            }
            onMessage={onMessage}
            startInLoadingState
            renderLoading={() => <ActivityIndicator style={{ flex: 1 }} />}
            onError={(error) => {
              console.log("Error loading search:", error);
              Alert.alert("Unable to load search, please try again later.");
            }}
            cacheEnabled={true}
            cacheMode={"LOAD_DEFAULT"}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsBackForwardNavigationGestures={false}
            scalesPageToFit={true}
            scrollEnabled={true}
            incognito={false}
          />
          {renderFooter()}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomSheetView: {
    flex: 1,
    height: "100%",
    zIndex: 9999,
  },
  selectBtn: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  selectImageButton: {},
  footer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  headerContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    // height: 30,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    position: "absolute",
    top: 4,
    alignSelf: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  closeBtn: {
    padding: 12,
  },
});
