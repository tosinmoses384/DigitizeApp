// import React, { useMemo, useState } from 'react';
// import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
// import BottomSheet, { BottomSheetModal, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
// import { useKeyboardController } from 'react-native-keyboard-controller';

// export default function CommentsModal({ bottomSheetRef, onClose , children}) {
//   const snapPoints = useMemo(() => ['50%', '90%'], []);
//   const { keyboardHeight, isKeyboardVisible } = useKeyboardController();
//   const [comment, setComment] = useState('');

//   const handleSend = () => {
//     if (comment.trim()) {
//       console.log('Send:', comment);
//       setComment('');
//       // Keyboard stays open because we don't dismiss it
//     }
//   };

//   return (
//     <BottomSheetModal
//       ref={bottomSheetRef}
//       index={0} // hidden initially
//       snapPoints={snapPoints}
//       keyboardBehavior="extend"
//       keyboardBlurBehavior="restore"
//       enablePanDownToClose
//      // onClose={onClose} // optional callback for parent
//     >
//       <BottomSheetView style={styles.container}>
//         <View style={{ flex: 1 }}>
//           {children}
//         </View>

//         {/* Input */}
//         <View
//           style={[
//             styles.inputRow,
//             { marginBottom: isKeyboardVisible ? keyboardHeight : 0 },
//           ]}
//         >
//           {/* <BottomSheetTextInput
//             style={styles.input}
//             placeholder="Write a comment..."
//             value={comment}
//             onChangeText={setComment}
//           /> */}
//           <Pressable style={styles.sendButton} onPress={handleSend}>
//             <Text style={{ color: 'white' }}>Send</Text>
//           </Pressable>
//         </View>
//       </BottomSheetView>
//     </BottomSheetModal>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   inputRow: {
//     flex:1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 8,
//     borderTopWidth: 1,
//     borderColor: '#ddd',
//   },
//   input: {
//     flex: 1,
//     padding: 8,
//     backgroundColor: '#f1f1f1',
//     borderRadius: 20,
//   },
//   sendButton: {
//     marginLeft: 8,
//     backgroundColor: '#007bff',
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//   },
// });





// import BottomModal from "@components/BottomModal";
// import React, { ReactNode, useEffect, useState } from "react";
// import SendIcon from "../../assets/images/svg/send.svg";
// import {
//   Animated,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   StyleSheet,
//   TouchableWithoutFeedback,
//   View,
// } from "react-native";
// import { Keyboard } from "react-native";

// interface INewBottomModal {
//   onClose: any;
//   isShow: boolean;
//   children: ReactNode;
//   maxHeight?: any;
//   contentStyle?: any;
//   removeKeybordAvoidingView?: boolean;
// }
// const NewBottomModal = ({
//   onClose,
//   isShow,
//   children,
//   maxHeight,
//   contentStyle,
//   removeKeybordAvoidingView,
// }: INewBottomModal) => {
//   // const overlayOpacity = useState(new Animated.Value(0))[0];

//   // useEffect(() => {
//   //   Animated.timing(overlayOpacity, {
//   //     toValue: isShow ? 0.9 : 0, // Animate to 0.5 when shown, 0 when hidden
//   //     duration: 1000, // Adjust the duration as needed
//   //     useNativeDriver: true, // Use native driver for better performance
//   //   }).start();
//   // }, [isShow]);
//   const overlayOpacity = useState(new Animated.Value(0))[0];
//   const [internalIsVisible, setInternalIsVisible] = useState(isShow); // Internal visibility state

//   useEffect(() => {
//     Animated.timing(overlayOpacity, {
//       toValue: isShow ? 0.9 : 0,
//       duration: 1000,
//       useNativeDriver: true,
//     }).start(({ finished }) => {
//       if (!isShow && finished) {
//         // Delay onClose and set internalIsVisible to false after fade-out
//         setTimeout(() => {
//           onClose?.();
//           setInternalIsVisible(false);
//         }, 0);
//       } else if (isShow) {
//         setInternalIsVisible(true); // Ensure internalIsVisible is true when showing
//       }
//     });
//   }, [isShow]);

//   return (
//     <Modal
//       // animationType="slide"
//       transparent={true}
//       visible={internalIsVisible}
//       onRequestClose={onClose}
//     >
//       {removeKeybordAvoidingView ? (
//         <View style={{ flex: 1 }}>
//           <TouchableWithoutFeedback
//             onPress={() => {
//               onClose?.();
//               Keyboard.dismiss();
//             }}
//           >
//             {/* <View style={styles.modalOverlay} /> */}
//             <Animated.View // Use Animated.View
//               style={[styles.modalOverlay, { opacity: overlayOpacity }]} // Apply animated opacity
//             />
//           </TouchableWithoutFeedback>
//           <View style={styles.modalContainer}>
//             {/* Container for the modal */}
//             <View
//               style={[
//                 contentStyle || styles.modalContent,
//                 { maxHeight: maxHeight || 510 },
//               ]}
//             >
//               {children}
//             </View>
//           </View>
//         </View>
//       ) : (
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           style={styles.keyboardAvoidingView} // Style the KeyboardAvoidingView
//           keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -20} // Adjust as needed
//         >
//           <TouchableWithoutFeedback
//             onPress={() => {
//               onClose?.();
//               Keyboard.dismiss();
//             }}
//           >
//             {/* <View style={styles.modalOverlay} /> */}
//             <Animated.View // Use Animated.View
//               style={[styles.modalOverlay, { opacity: overlayOpacity }]} // Apply animated opacity
//             />
//           </TouchableWithoutFeedback>
//           <View style={styles.modalContainer}>
//             {/* Container for the modal */}
//             <View
//               style={[
//                 contentStyle || styles.modalContent,
//                 { maxHeight: maxHeight || 510 },
//               ]}
//             >
//               {children}
//             </View>
//           </View>
//         </KeyboardAvoidingView>
//       )}
//     </Modal>
//   );
// };

// export default NewBottomModal;

// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1, // Take up full screen for the overlay
//     justifyContent: "flex-end", // Position modal at the bottom
//   },
//   modalOverlay: {
//     flex: 1, // Take up the full screen *for the overlay*
//     position: "absolute", // Key: Position the overlay absolutely
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   modalContent: {
//     backgroundColor: "white",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingHorizontal: 16,
//     width: "100%", // Or a specific width (e.g., '80%')
//     flex: 1,
//   },

//   keyboardAvoidingView: {
//     flex: 1,
//     // backgroundColor: "blue",
//   },
// });















// import React, { ReactNode, useEffect, useState } from "react";
// import {
//   Animated,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   StyleSheet,
//   TouchableWithoutFeedback,
//   View,
//   Keyboard,
// } from "react-native";

// interface INewBottomModal {
//   onClose: () => void;
//   isShow: boolean;
//   children: ReactNode;
//   maxHeight?: number;
//   contentStyle?: any;
//   removeKeybordAvoidingView?: boolean;
// }

// const NewBottomModal = ({
//   onClose,
//   isShow,
//   children,
//   maxHeight = 510,
//   contentStyle,
//   removeKeybordAvoidingView = false,
// }: INewBottomModal) => {
//   const overlayOpacity = useState(new Animated.Value(0))[0];
//   const translateY = useState(new Animated.Value(maxHeight))[0];
//   const [internalIsVisible, setInternalIsVisible] = useState(isShow);

//   useEffect(() => {
//     if (isShow) {
//       setInternalIsVisible(true);

//       Animated.parallel([
//         Animated.timing(overlayOpacity, {
//           toValue: 0.9,
//           duration: 300,
//           useNativeDriver: true,
//         }),
//         Animated.spring(translateY, {
//           toValue: 0,
//           useNativeDriver: true,
//           bounciness: 5,
//         }),
//       ]).start();
//     } else {
//       Animated.parallel([
//         Animated.timing(overlayOpacity, {
//           toValue: 0,
//           duration: 300,
//           useNativeDriver: true,
//         }),
//         Animated.timing(translateY, {
//           toValue: maxHeight,
//           duration: 250,
//           useNativeDriver: true,
//         }),
//       ]).start(({ finished }) => {
//         if (finished) {
//           setInternalIsVisible(false);
//           onClose?.();
//         }
//       });
//     }
//   }, [isShow]);

//   const renderContent = () => (
//     <>
//       <TouchableWithoutFeedback
//         onPress={() => {
//           onClose?.();
//           Keyboard.dismiss();
//         }}
//       >
//         <Animated.View
//           style={[styles.modalOverlay, { opacity: overlayOpacity }]}
//         />
//       </TouchableWithoutFeedback>

//       <View style={styles.modalContainer}>
//         <Animated.View
//           style={[
//             contentStyle || styles.modalContent,
//             {
//               maxHeight,
//               transform: [{ translateY }],
//             },
//           ]}
//         >
//           {children}
//         </Animated.View>
//       </View>
//     </>
//   );

//   return (
//     <Modal transparent visible={internalIsVisible} onRequestClose={onClose} >
//       {removeKeybordAvoidingView ? (
//         <View style={{ flex: 1 }}>{renderContent()}</View>
//       ) : (
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           style={styles.keyboardAvoidingView}
//           keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -20}
//         >
//           {renderContent()}
//         </KeyboardAvoidingView>
//       )}
//     </Modal>
//   );
// };

// export default NewBottomModal;

// const styles = StyleSheet.create({
//   modalContainer: {
//     height:500,
//     flex: 1,
//     justifyContent: "flex-end",
//   },
//   modalOverlay: {
//     flex: 1,
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   modalContent: {
//     backgroundColor: "white",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingHorizontal: 16,
//     width: "100%",
//     paddingTop: 16,
//     paddingBottom: 24,
//   },
//   keyboardAvoidingView: {
//     flex: 1,
//   },
// });



import React, { ReactNode, useEffect, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Keyboard,
} from "react-native";

interface INewBottomModal {
  onClose: any;
  isShow: boolean;
  children: ReactNode;
  maxHeight?: any;
  contentStyle?: any;
  removeKeybordAvoidingView?: boolean;
}

const NewBottomModalComments = ({
  onClose,
  isShow,
  children,
  maxHeight,
  contentStyle,
  removeKeybordAvoidingView,
}: INewBottomModal) => {
  const overlayOpacity = useState(new Animated.Value(0))[0];
  const translateY = useState(new Animated.Value(500))[0]; // start offscreen
  const [internalIsVisible, setInternalIsVisible] = useState(isShow);

  useEffect(() => {
    if (isShow) {
      setInternalIsVisible(true);

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          bounciness: 5,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 500,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setTimeout(() => {
            onClose?.();
            setInternalIsVisible(false);
          }, 0);
        }
      });
    }
  }, [isShow]);

  return (
    <Modal
    //   transparent={true}
      visible={internalIsVisible}
      onRequestClose={onClose}
    >
     <View style={{flex:1}}>
        {children}
     
     </View>
   
   
    </Modal>
  );
};

export default NewBottomModalComments;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalOverlay: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    width: "100%",
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});
