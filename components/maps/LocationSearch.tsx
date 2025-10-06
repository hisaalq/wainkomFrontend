import React, { forwardRef } from "react";
import { View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { COLORS } from "../../assets/style/color";

type Props = {
  apiKey: string;
  onPlaceSelected: (lat: number, lng: number, description: string) => void;
  placeholder?: string;
};

const LocationSearch = forwardRef<any, Props>(({ apiKey, onPlaceSelected, placeholder = "Search places" }, ref) => {
  return (
    <View>
      <GooglePlacesAutocomplete
        ref={ref}
        placeholder={placeholder}
        fetchDetails
        onPress={(data, details) => {
          const lat = details?.geometry?.location?.lat;
          const lng = details?.geometry?.location?.lng;
          if (typeof lat === "number" && typeof lng === "number") {
            onPlaceSelected(lat, lng, data.description || "");
          }
        }}
        query={{ key: apiKey, language: "en" }}
        styles={{
          textInput: {
            height: 48,
            borderRadius: 12,
            paddingHorizontal: 14,
            backgroundColor: "#fff",
            color: COLORS.backgroundd,
          },
          container: { flex: 0 },
          listView: { backgroundColor: "#fff", borderRadius: 12, marginTop: 6 },
        }}
      />
    </View>
  );
});

export default LocationSearch;
