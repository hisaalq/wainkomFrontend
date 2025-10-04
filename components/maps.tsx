// components/PlaceSearch.tsx
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function PlaceSearch({
  onPick,
}: {
  onPick: (info: { name: string; lat: number; lng: number; placeId: string }) => void;
}) {
  const [searchText, setSearchText] = React.useState("");

  const handleSearch = () => {
    // For now, just use a default location when search is pressed
    // TODO: Integrate with Google Places API properly
    onPick({ 
      name: searchText || "Kuwait City", 
      lat: 29.3759, 
      lng: 47.9774, 
      placeId: "default" 
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search places in Kuwait"
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      <Text style={styles.note}>
        Note: Google Places integration coming soon
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  input: {
    backgroundColor: "#F2DEC4",
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  note: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
});
