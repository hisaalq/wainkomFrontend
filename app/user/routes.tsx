import PlaceSearch from "@/components/maps";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

export default function Routes() {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 29.3759,      // Kuwait City default
    longitude: 47.9774,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08
  });
  const [events, setEvents] = useState<
    { id: string; title: string; coordinates: [number, number] }[]
  >([]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setRegion(r => ({
          ...r,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        }));
      }
    })();
    // TODO: load events from your API (GeoJSON stored as [lng, lat]):
    // setEvents(await fetchEvents());
  }, []);

  return (
    <View style={{ flex: 1 }}>
        <PlaceSearch onPick={({ lat, lng }) => {
            const next = {
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
            };
            setRegion(next);
            mapRef.current?.animateToRegion(next, 600);
          }} />
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {events.map((e) => (
          <Marker
            key={e.id}
            title={e.title}
            coordinate={{ latitude: e.coordinates[1], longitude: e.coordinates[0] }}
          />
        ))}
      </MapView>
    </View>
  );
}
