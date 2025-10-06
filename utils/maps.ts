import { Linking, Platform } from "react-native";

export function getRegionForCoordinates(coords: { latitude: number; longitude: number }[], pad = 0.02) {
  if (!coords.length) {
    return {
      latitude: 29.3759,      // Kuwait City default
      longitude: 47.9774,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }
  let minX = coords[0].latitude, maxX = coords[0].latitude;
  let minY = coords[0].longitude, maxY = coords[0].longitude;

  coords.forEach(({ latitude, longitude }) => {
    minX = Math.min(minX, latitude);
    maxX = Math.max(maxX, latitude);
    minY = Math.min(minY, longitude);
    maxY = Math.max(maxY, longitude);
  });

  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const deltaX = (maxX - minX) + pad;
  const deltaY = (maxY - minY) + pad;

  return {
    latitude: midX,
    longitude: midY,
    latitudeDelta: deltaX || 0.05,
    longitudeDelta: deltaY || 0.05,
  };
}

export function openDirections(lat: number, lng: number, label?: string) {
  const place = encodeURIComponent(label ?? "Destination");
  const url = Platform.select({
    ios: `http://maps.apple.com/?daddr=${lat},${lng}&q=${place}`,
    android: `geo:${lat},${lng}?q=${lat},${lng}(${place})`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
  });
  if (url) Linking.openURL(url);
}
