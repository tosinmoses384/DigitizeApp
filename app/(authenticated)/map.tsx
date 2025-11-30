import React, { useState, useEffect } from "react";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { StyleSheet, View, Text, Platform, Alert } from "react-native";
import StackHeader from "../../components/StackHeader";
import { Colors, SIZES } from "../../constants/Colors";
import ToggleTabs from "../../components/Toggle";
import { router } from "expo-router";
import SearchBarWithAutocomplete1 from "../../components/SearchWithAutocomplete";
import Loader from "../../components/Loader";

export default function App() {
  const [selectedTab, setSelectedTab] = useState("first");

  const [value, setValue] = useState("");
  const [searchTerm, setSearch] = useState({
    term: "",
    fetchPredictions: false,
  });
  const [loaderVisible, setLoaderVisible] = useState(false);

  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);

  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    (async () => {
      setLoaderVisible(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        setLoaderVisible(false);
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
      setRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setLoaderVisible(false);
    })();
  }, []);

  const handleTextChange = (text: string) => {
    setValue(text);
    setSearch({ term: text, fetchPredictions: true });
  };

  const handleAnimationFinish = () => {
    setLoaderVisible(false);
  };

  const onPredictionTapped = (placeId: string, description: string) => {
    "Tapped prediction:", placeId, description;
    setShowPredictions(false);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
      }}
    >
      <View
        style={{
          marginHorizontal: 20,
        }}
      >
        <StackHeader
          title="Choose a pick-up point"
          onPress={() => router.back()}
        />
        <SearchBarWithAutocomplete1
          placeholder="Search category"
          value={value}
          onChangeText={handleTextChange}
          setSearch={setSearch}
          predictions={predictions}
          showPredictions={showPredictions}
          setShowPredictions={setShowPredictions}
          onPredictionTapped={onPredictionTapped}
        />
        <View style={{ marginHorizontal: 20 }}>
          <ToggleTabs
            currentTab={selectedTab}
            selectedTab={setSelectedTab}
            firstLabel="Map"
            secondLabel="List"
            small={false}
          />
        </View>
      </View>

      <View>
        <MapView style={styles.map} region={region} showsUserLocation={true}>
          {location && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You are here"
            />
          )}
        </MapView>

        {loaderVisible && (
          <View style={styles.loaderOverlay}>
            <Loader
              visible={loaderVisible}
              message="Almost there... Just a moment"
              onAnimationFinish={handleAnimationFinish}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Transparent background
  },
});

// import React, { useState, useEffect, useRef } from "react";
// import MapView, { Marker,PROVIDER_GOOGLE , Callout } from "react-native-maps";
// import * as Location from "expo-location";
// import {
//   StyleSheet,
//   View,
//   Text,
//   ActivityIndicator,
//   Platform,
//   Alert,
//   StatusBar,
//   Button,
// } from "react-native";
// import StackHeader from "@/components/StackHeader";
// import { Colors, SIZES } from "@/constants/Colors";
// import ToggleTabs from "@/components/Toggle";
// import { router } from "expo-router";
// import SearchBarWithAutocomplete1 from "@/components/SearchWithAutocomplete";
// import Loader from "@/components/Loader";
// import * as FileSystem from 'expo-file-system';
// import { shareAsync } from 'expo-sharing';

// let locationsOfInterest = [
//     {
//       title: "First",
//       location: {
//         latitude: -27.2,
//         longitude: 145
//       },
//       description: "My First Marker"
//     },
//     {
//       title: "Second",
//       location: {
//         latitude: -30.2,
//         longitude: 150
//       },
//       description: "My Second Marker"
//     }
//   ]

//   const mapJson = [
//     {
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#212121"
//         }
//       ]
//     },
//     {
//       "elementType": "labels.icon",
//       "stylers": [
//         {
//           "visibility": "off"
//         }
//       ]
//     },
//     {
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#757575"
//         }
//       ]
//     },
//     {
//       "elementType": "labels.text.stroke",
//       "stylers": [
//         {
//           "color": "#212121"
//         }
//       ]
//     },
//     {
//       "featureType": "administrative",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#757575"
//         }
//       ]
//     },
//     {
//       "featureType": "administrative.country",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#9e9e9e"
//         }
//       ]
//     },
//     {
//       "featureType": "administrative.locality",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#bdbdbd"
//         }
//       ]
//     },
//     {
//       "featureType": "poi",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#757575"
//         }
//       ]
//     },
//     {
//       "featureType": "poi.park",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#181818"
//         }
//       ]
//     },
//     {
//       "featureType": "poi.park",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#616161"
//         }
//       ]
//     },
//     {
//       "featureType": "poi.park",
//       "elementType": "labels.text.stroke",
//       "stylers": [
//         {
//           "color": "#1b1b1b"
//         }
//       ]
//     },
//     {
//       "featureType": "road",
//       "elementType": "geometry.fill",
//       "stylers": [
//         {
//           "color": "#2c2c2c"
//         }
//       ]
//     },
//     {
//       "featureType": "road",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#8a8a8a"
//         }
//       ]
//     },
//     {
//       "featureType": "road.arterial",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#373737"
//         }
//       ]
//     },
//     {
//       "featureType": "road.highway",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#3c3c3c"
//         }
//       ]
//     },
//     {
//       "featureType": "road.highway",
//       "elementType": "geometry.stroke",
//       "stylers": [
//         {
//           "color": "#ffeb3b"
//         },
//         {
//           "weight": 3
//         }
//       ]
//     },
//     {
//       "featureType": "road.highway.controlled_access",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#4e4e4e"
//         }
//       ]
//     },
//     {
//       "featureType": "road.local",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#616161"
//         }
//       ]
//     },
//     {
//       "featureType": "transit",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#757575"
//         }
//       ]
//     },
//     {
//       "featureType": "water",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#000000"
//         }
//       ]
//     },
//     {
//       "featureType": "water",
//       "elementType": "geometry.fill",
//       "stylers": [
//         {
//           "color": "#1f0038"
//         }
//       ]
//     },
//     {
//       "featureType": "water",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#3d3d3d"
//         }
//       ]
//     }
//   ]

// export default function App() {
//   const [selectedTab, setSelectedTab] = useState("first");

//   const [count, setCount] = useState(0);
//   const [value, setValue] = useState("");
//   const [searchTerm, setSearch] = useState({
//     term: "",
//     fetchPredictions: false,
//   });
//   const [loaderVisible, setLoaderVisible] = useState(false);

//   const [predictions, setPredictions] = useState([]);
//   const [showPredictions, setShowPredictions] = useState(false);

//   const [draggableMarkerCoord, setDraggableMarkerCoord] = useState({
//     longitude: 148.11,
//     latitude: -26.85
//   });
//   const mapRef = useRef();

//   const onRegionChange = (region) => {
//     (region);
//   };

//   const showLocationsOfInterest = () => {
//     return locationsOfInterest.map((item, index) => {
//       return (
//         <Marker
//           key={index}
//           coordinate={item.location}
//           title={item.title}
//           description={item.description}
//         />
//       )
//     });
//   };

//   const takeSnapshotAndShare = async () => {
//     const snapshot = await mapRef.current.takeSnapshot({ width: 300, height: 300, result: 'base64'});
//     const uri = FileSystem.documentDirectory + "snapshot.png";
//     await FileSystem.writeAsStringAsync(uri, snapshot, { encoding: FileSystem.EncodingType.Base64 });
//     await shareAsync(uri);
//   };

//   const [location, setLocation] =
//     useState<Location.LocationObjectCoords | null>(null);
//   const [region, setRegion] = useState({
//     latitude: 37.78825,
//     longitude: -122.4324,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   });

//   useEffect(() => {
//     (async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert("Permission to access location was denied");
//         return;
//       }

//       let userLocation = await Location.getCurrentPositionAsync({});
//       setLocation(userLocation.coords);
//       setRegion({
//         latitude: userLocation.coords.latitude,
//         longitude: userLocation.coords.longitude,
//         latitudeDelta: 0.0922,
//         longitudeDelta: 0.0421,
//       });
//     })();
//   }, []);

//   // Handle text change for the search input
//   const handleTextChange = (text: string) => {
//     setValue(text);
//     setSearch({ term: text, fetchPredictions: true });
//   };

//   const handleAnimationFinish = () => {
//     setLoaderVisible(false);
//   };

//   // Handle the event when a prediction is tapped
//   const onPredictionTapped = (placeId: string, description: string) => {
//     ("Tapped prediction:", placeId, description);
//     setShowPredictions(false); // Close predictions list
//   };

//   return (
//     <View
//       style={{
//         flex: 1,
//         backgroundColor: Colors.light.background,
//         paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
//       }}
//     >
//       <View
//         style={{
//           marginHorizontal: 20,
//         }}
//       >
//         <StackHeader
//           title="Choose a pick-up point"
//           onPress={() => router.back()}
//         />
//         <SearchBarWithAutocomplete1
//           placeholder="Search category"
//           value={value}
//           onChangeText={handleTextChange}
//           setSearch={setSearch}
//           predictions={predictions}
//           showPredictions={showPredictions}
//           setShowPredictions={setShowPredictions}
//           onPredictionTapped={onPredictionTapped}
//         />
//         <View style={{ marginHorizontal: 20 }}>
//           <ToggleTabs
//             currentTab={selectedTab}
//             selectedTab={setSelectedTab}
//             firstLabel="Map"
//             secondLabel="List"
//             small={false}
//           />
//         </View>
//       </View>

//       {location ? (
//       <View style={styles.containerm}>

//         <MapView
//         provider={PROVIDER_GOOGLE}
//         ref={mapRef}
//         style={styles.map}
//         onRegionChange={onRegionChange}
//         initialRegion={{
//           latitude: -26.852691607783505,
//           latitudeDelta: 27.499085419977938,
//           longitude: 148.1104129487327,
//           longitudeDelta: 15.952148000000022,
//         }}
//         customMapStyle={mapJson}
//       >
//         {showLocationsOfInterest()}
//         <Marker
//           draggable
//           pinColor='#0000ff'
//           coordinate={draggableMarkerCoord}
//           onDragEnd={(e) => setDraggableMarkerCoord(e.nativeEvent.coordinate)}
//         />
//         <Marker
//           pinColor='#00ff00'
//           coordinate={{ latitude: -35, longitude: 147}}
//         >
//           <Callout>
//             <Text>Count: {count}</Text>
//             <Button title='Increment Count' onPress={() => setCount(count + 1)} />
//             <Button title='Take Snapshot and Share' onPress={takeSnapshotAndShare} />
//           </Callout>
//         </Marker>
//         <Text style={styles.mapOverlay}>Longitude: {draggableMarkerCoord.longitude}, latitude: {draggableMarkerCoord.latitude}</Text>
//       </MapView>
//       <StatusBar style="auto" />
//       </View>
//       ) : (
//         <View style={styles.map}>
//           <Loader
//             // visible={loaderVisible}
//             // message="Almost there... Just a moment"
//             // onAnimationFinish={handleAnimationFinish}
//           />
//           <ActivityIndicator size="large" color={Colors.primary} />
//           <Text>Fetching your location...</Text>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     width: "100%",
//     height: "100%",
//   },
//   containerm: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   mapOverlay: {
//     position: "absolute",
//     bottom: 50,
//     backgroundColor: "#ffffff",
//     borderWidth: 2,
//     borderRadius: 5,
//     padding: 16,
//     left: "25%",
//     width: "50%",
//     textAlign: "center"
//   }
// });
