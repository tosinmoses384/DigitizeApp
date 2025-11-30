// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import SplashScreen from "./app/SplashScreen";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Provider } from "react-redux";
// import { Link, useRouter } from "expo-router";
// // import SplashTwo from "./app/SplashTwo";
// import Welcome from "./app/Onboarding";
// import { ToastProvider } from "react-native-toast-notifications";
// import { store, useAppDispatch, useAppSelector } from "./redux/store";
// import { useClearStorage } from "./hooks/clear-storage";
// import { useEffect, useState } from "react";
// import {
//   setProfile,
//   setRefetchUserState,
//   setToken,
// } from "./redux/slice/profile/profileSlice";
// import identityServices from "./services/features/identity-service/loginService";

// export type RootStackProps = {
//   SplashScreen: undefined;
//   Welcome: undefined;
// };

// const Stack = createNativeStackNavigator<RootStackProps>();

// export const AppNavigator = () => {
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { clearStorage } = useClearStorage();
//   const { profile, refetchUserState, token } = useAppSelector(
//     (state) => state?.userProfileSlice
//   );
//   const [loader, setLoader] = useState(false);

//   // useEffect(() => {
//   //   const checkAuth = async () => {
//   //     const token = await AsyncStorage.getItem("accessToken");

//   //     if (token) {
//   //       dispatch(setToken(token)); // Automatically log in if token exists
//   //     }
//   //   };
//   //   checkAuth();
//   // }, [dispatch]);

//   // useEffect(() => {
//   //   if (token) {
//   //     setLoader(true);
//   //     identityServices
//   //       ?.getUserProfile(token)
//   //       .then((res) => {
//   //         setLoader(false);
//   //         let data: any = { ...res?.data };
//   //         if (res?.message === "Success") {
//   //           dispatch(setProfile(data));
//   //           // router.replace("/home");
//   //           return;
//   //         }
//   //         if (res?.responseCode === 401) {
//   //           clearStorage;
//   //           dispatch(setProfile(null));
//   //           dispatch(setToken(""));
//   //           return;
//   //         }
//   //         clearStorage;
//   //         dispatch(setProfile(null));
//   //         dispatch(setToken(""));
//   //       })
//   //       .catch((error) => {
//   //         setLoader(false);
//   //         dispatch(setToken(""));
//   //         clearStorage;
//   //         dispatch(setProfile(null));
//   //       });

//   //     return () => {
//   //       dispatch(setRefetchUserState(false));
//   //     };
//   //   }
//   // }, [refetchUserState, token]);

//   return (
//     <ToastProvider>
//       <NavigationContainer>
//         <Stack.Navigator initialRouteName="SplashScreen">
//           <Stack.Screen
//             name="SplashScreen"
//             component={SplashScreen}
//             options={{ headerShown: false, headerTitle: "Home" }}
//           />

//           {/* <Stack.Screen
//             name="Welcome"
//             component={Welcome}
//             options={{ headerShown: false }}
//           /> */}
//         </Stack.Navigator>
//       </NavigationContainer>
//     </ToastProvider>
//   );
// };
