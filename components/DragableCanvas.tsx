import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  PanResponder,
  Dimensions,
  Animated,
  Button,
  Platform,
} from "react-native";
import { captureRef } from "react-native-view-shot"; // Import view-shot captureRef
import CustomButton from "./CustomButton";
import DeleteIcon from "../assets/images/svg/delete.svg";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { setOutfitCanvasPosition } from "@redux/slice/temporary-add-item-to-outfit/temporaryAddItemtoOutfitSlice";

interface IDraggableResizableImages {
  imageDetails: any; // Array of image URLs
  getImageCombined: any;
  imageLoader: boolean;

  handleRemoveimage: any;
}

const DraggableResizableImages = ({
  imageDetails,
  getImageCombined,
  imageLoader,

  handleRemoveimage,
}: IDraggableResizableImages) => {
  const { width, height } = Dimensions.get("window");
  const { outfitCanvasPosition, temporaryAddItemToOutfitSlice } =
    useAppSelector((state) => state.temporaryAddItemToOutfitSlice);

  const dispatch = useAppDispatch();

  // Ref for capturing the entire view
  const viewRef = useRef<View>(null);

  const [isCapture, setIsCapture] = useState(false);
  const [capturedImage, setCapturedImage] = useState("");

  // Initialize positions for each image and store them in the state
  const [positions, setPositions] = useState(
    imageDetails.map(() => ({
      x: (width - 200) / 100, // Center horizontally
      y: (height - 200) / 100, // Center vertically
      width: 200, // Initial width of image
      height: 200, // Initial height of image
    }))
  );

  useEffect(() => {
    if (imageDetails.length !== positions.length) {
      const newPositions = imageDetails.map((_: any, index: number) => {
        if (positions[index]) {
          return positions[index];
        }
        return {
          x: (width - 200) / 100,
          y: (height - 200) / 100,
          width: 200,
          height: 200,
        };
      });
      setPositions(newPositions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageDetails.length, width, height]);

  useEffect(() => {
    if (imageDetails.length > outfitCanvasPosition.length) {
      const newCanvasPositions = imageDetails.map((_: any, index: number) => {
        if (outfitCanvasPosition[index]) {
          return outfitCanvasPosition[index];
        }
        return {
          x: (width - 200) / 100,
          y: (height - 200) / 100,
          width: 200,
          height: 200,
        };
      });
      dispatch(setOutfitCanvasPosition(newCanvasPositions));
    } else if (imageDetails.length < outfitCanvasPosition.length) {
      dispatch(setOutfitCanvasPosition(outfitCanvasPosition.slice(0, imageDetails.length)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageDetails.length]);

  // PanResponder for resizing (keep it the same as in your original code)
  const resizePanResponders = imageDetails.map((image: any, index: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        const newWidth = positions[index].width + gestureState.dx;
        const newHeight = positions[index].height + gestureState.dy;

        const constrainedWidth = Math.max(
          50,
          Math.min(newWidth, width - positions[index].x - 10)
        );
        const constrainedHeight = Math.max(
          50,
          Math.min(newHeight, height - positions[index].y - 10)
        );

        setPositions((prevPositions: any) => {
          const updatedPositions = [...prevPositions];
          updatedPositions[index] = {
            ...updatedPositions[index],
            width: constrainedWidth,
            height: constrainedHeight,
          };
          return updatedPositions;
        });

        const updatedPositions = [...outfitCanvasPosition];
        updatedPositions[index] = {
          ...updatedPositions[index],
          width: constrainedWidth,
          height: constrainedHeight,
        };
        dispatch(setOutfitCanvasPosition(updatedPositions));
      },
      onPanResponderRelease: () => {},
    });
  });

  // PanResponder for dragging (keep it the same as in your original code)
  const dragPanResponders = imageDetails.map((image: any, index: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        const newX = positions[index].x + gestureState.dx;
        const newY = positions[index].y + gestureState.dy;

        const constrainedX = Math.max(
          -145,
          Math.min(newX, width - positions[index].width)
        );
        const constrainedY = Math.max(
          -240,
          Math.min(newY, height - positions[index].height)
        );

        setPositions((prevPositions: any) => {
          const updatedPositions = [...prevPositions];
          updatedPositions[index] = {
            ...updatedPositions[index],
            x: constrainedX,
            y: constrainedY,
          };
          return updatedPositions;
        });

        const updatedPositions = [...outfitCanvasPosition];
        updatedPositions[index] = {
          ...updatedPositions[index],
          x: constrainedX,
          y: constrainedY,
        };

        dispatch(setOutfitCanvasPosition(updatedPositions));
      },
      onPanResponderRelease: () => {},
    });
  });

  // Function to capture the entire view as an image
  const captureCombinedImage = () => {
    setIsCapture(true);
    setTimeout(() => {
      if (viewRef.current) {
        captureRef(viewRef, {
          format: "png", // Specify the format of the captured image
          quality: 1, // Image quality (0.0 to 1.0)
          // snapshotContentContainer: true,
        })
          .then((uri) => {
            setIsCapture(false);
            let data = {
              imageUri: uri,
              type: "image/png",
            };

            getImageCombined(data);
            // ("Combined image captured and saved to", uri);
            // You can use the URI to display, share, or save the image
          })
          .catch((error) => {
            setIsCapture(false);
            console.error("Error capturing image", error);
          });
      }
    }, 5000);
  };

  return (
    <View style={{ flex: 1 }}>
      {capturedImage && (
        <Image
          source={{ uri: capturedImage }}
          style={{ width: 300, height: 200 }}
        />
      )}

      <View style={styles.parentView} ref={viewRef} collapsable={false}>
        {/* Assign ref to the parent view */}
        {imageDetails.map((image: any, index: number) => {
          if (!positions[index]) return null;
          
          return (
          <Animated.View
            key={index}
            style={[
              styles.imageContainer,
              {
                width:
                  outfitCanvasPosition[index]?.width + 10 ||
                  positions[index]?.width + 10,
                height:
                  outfitCanvasPosition[index]?.height + 10 ||
                  positions[index]?.height + 10,
                transform: [
                  {
                    translateX:
                      outfitCanvasPosition[index]?.x || positions[index]?.x || 0,
                  },
                  {
                    translateY:
                      outfitCanvasPosition[index]?.y || positions[index]?.y || 0,
                  },
                ],
                borderWidth: isCapture ? 0 : 0.5,
                borderColor: isCapture ? "white" : "#B5B9BE",
                borderStyle: isCapture ? "none" : "dashed",
                borderRadius: isCapture ? 0 : 10,
              },
            ]}
            {...dragPanResponders[index]?.panHandlers} // Attach the drag panResponder to the image container
          >
            {!isCapture && (
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 20,
                  top: -1,
                  right: -2,
                  backgroundColor: "transparent",
                  position: "absolute",
                  zIndex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: "#90959E",
                }}
              >
                <DeleteIcon
                  width={30}
                  height={30}
                  onPress={() => handleRemoveimage(image)}
                />
              </View>
            )}

            <View
              style={{
                position: "relative",
                paddingTop: 10,
              }}
            >
              <Image
                source={{ uri: image?.images }}
                style={[
                  styles.image,
                  {
                    width:
                      outfitCanvasPosition[index]?.width ||
                      positions[index]?.width,
                    height:
                      outfitCanvasPosition[index]?.height ||
                      positions[index]?.height,
                    borderRadius: isCapture ? 0 : 10,
                  },
                ]}
              />
            </View>
            {!isCapture && (
              <View
                style={[
                  styles.resizeHandle,
                  {
                    left:
                      (outfitCanvasPosition[index]?.width ||
                        positions[index]?.width) - 10,
                    top:
                      (outfitCanvasPosition[index]?.height ||
                        positions[index]?.height) - 10,
                  },
                ]}
                {...resizePanResponders[index]?.panHandlers} // Attach the resize panResponder to the handle
              >
                <Image
                  source={require("./../assets/images/resize-image1.png")}
                  style={{
                    objectFit: "contain",
                    resizeMode: "contain",
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                  }}
                />
              </View>
            )}
          </Animated.View>
          );
        })}
        {/* Button to capture all images combined as one */}
      </View>
      {imageDetails?.length ? (
        <View style={styles.createOutfitFooter}>
          <CustomButton
            title="Continue"
            buttonStyle={styles.continueBtn}
            textStyle={styles.continueTextStyle}
            onPress={captureCombinedImage}
            loader={isCapture || imageLoader}
          />
        </View>
      ) : (
        ""
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  parentView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white", // Adjusted for visibility
    position: "relative",
  },
  imageContainer: {
    position: "absolute", // Allow the image to be positioned freely within the parent view
    justifyContent: "center",
    alignItems: "center",
    zIndex: 90000,
  },
  image: {
    marginBottom: 10,
  },
  resizeHandle: {
    position: "absolute",
    width: 20,
    height: 20,
    // backgroundColor: "red", // Resize handle (small square at bottom-right)
  },
  createOutfitFooter: {
    paddingVertical: 30,
    paddingHorizontal: 16,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  continueBtn: {
    backgroundColor: "rgba(255, 59, 74, 1)",
    borderRadius: 12,
    position: "relative",
  },
  continueTextStyle: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    width: "100%",
  },
});

export default DraggableResizableImages;
