// components/PlaceSearch.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!;

export type PickedPlace = {
  name: string;
  lat: number;
  lng: number;
  placeId: string;
  geojson: { type: "Point"; coordinates: [number, number] };
};

export default function PlaceSearch({ onPick }: { onPick: (p: PickedPlace) => void }) {
  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder="Search places in Kuwait"
        fetchDetails
        enablePoweredByContainer={false}
        minLength={2}
        query={{
          key: GOOGLE_API_KEY,
          language: "en", // or "ar"
          region: "kw",
        }}
        onPress={(data, details) => {
          const lat = details?.geometry?.location?.lat;
          const lng = details?.geometry?.location?.lng;
          if (typeof lat === "number" && typeof lng === "number") {
            onPick({
              name: data?.structured_formatting?.main_text || data?.description || "Unknown",
              lat,
              lng,
              placeId: data.place_id!,
              geojson: { type: "Point", coordinates: [lng, lat] },
            });
          }
        }}
        styles={{
          textInput: styles.input,
          listView: styles.listView,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", top: 50, left: 16, right: 16, zIndex: 10 },
  input: { backgroundColor: "#fff", borderRadius: 12, height: 44, paddingHorizontal: 12, fontSize: 16 },
  listView: { backgroundColor: "#fff", borderRadius: 12, marginTop: 6 },
});
