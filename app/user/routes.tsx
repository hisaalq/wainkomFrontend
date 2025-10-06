import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import { MAP } from "../../assets/style/stylesheet";

export default function MapScreen() {
  const [userLoc, setUserLoc] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({});
      setUserLoc({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    })();
  }, []);

  const region = useMemo<Region>(() => {
    if (userLoc) {
      return {
        latitude: userLoc.latitude,
        longitude: userLoc.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    // Kuwait City fallback while loading permission/GPS
    return { latitude: 29.3759, longitude: 47.9774, latitudeDelta: 0.1, longitudeDelta: 0.1 };
  }, [userLoc]);

  return (
    <View style={MAP.container}>
      {/* Top "stepper" like the mock */}
      <View style={MAP.stepper}>
        <Text style={[MAP.step, MAP.stepActive]}>● Order</Text>
        <Text style={MAP.step}>——</Text>
        <Text style={[MAP.step, MAP.stepActive]}>🚗 Drive</Text>
        <Text style={MAP.step}>——</Text>
        <Text style={[MAP.step, MAP.stepActive]}>● Collect</Text>
      </View>

      {/* Info chips (hidden until we have a location) */}
      {userLoc && (
        <View style={MAP.chipsRow}>
          <View style={MAP.chip}>
            <Text style={MAP.chipTitle}>Distance</Text>
            <Text style={MAP.chipValue}>—</Text>
          </View>
          <View style={MAP.chip}>
            <Text style={MAP.chipTitle}>Time to arrive</Text>
            <Text style={MAP.chipValue}>—</Text>
          </View>
        </View>
      )}

      {/* Map – only current location */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        region={region}
        showsUserLocation
        followsUserLocation
        showsMyLocationButton
        showsScale={false}
        showsCompass={false}
        toolbarEnabled={false}
      />

      {/* Bottom card like the mock */}
      <View style={MAP.bottomCard}>
        <Text style={MAP.bottomTitle}>Expected time</Text>
        <Text style={MAP.bottomEta}>—</Text>
        <Text style={MAP.placeName}>{userLoc ? "Your current location" : "Locating..."}</Text>
        <View style={MAP.primaryBtn}>
          <Text style={MAP.primaryBtnText}>Add New Order</Text>
        </View>
      </View>
    </View>
  );
}