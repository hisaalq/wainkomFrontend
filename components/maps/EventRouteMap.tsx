// src/components/EventRouteMap.tsx
import * as Location from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import MapView, { Callout, Marker, Polyline } from "react-native-maps";
import { COLORS } from "../../assets/style/color";
import { MAP } from "../../assets/style/stylesheet";
import { EventItem } from "../../types/Events";
import { getRegionForCoordinates, openDirections } from "../../utils/maps";
import { decodePolyline } from "../../utils/polyline";

type Props = {
  events: EventItem[];
  googleApiKey: string;
  selectedEventId?: string;             // when user taps a card/marker
  onSelectEvent?: (id: string) => void;
};

export default function EventRouteMap({ events, googleApiKey, selectedEventId, onSelectEvent }: Props) {
  const mapRef = useRef<MapView | null>(null);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [routePoints, setRoutePoints] = useState<{ latitude: number; longitude: number }[]>([]);
  const [eta, setEta] = useState<{ distanceText: string; durationText: string } | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const selected = useMemo(() => events.find(e => e.id === selectedEventId) ?? null, [events, selectedEventId]);

  // 1) get user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({});
      setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    })();
  }, []);

  // 2) fetch directions when we have both ends
  useEffect(() => {
    const fetchDirections = async () => {
      if (!userLoc || !selected) return;
      setLoadingRoute(true);
      try {
        const url =
          `https://maps.googleapis.com/maps/api/directions/json?` +
          `origin=${userLoc.lat},${userLoc.lng}&destination=${selected.lat},${selected.lng}` +
          `&mode=driving&key=${process.env.GOOGLE_API_KEY}`;
        const res = await fetch(url);
        const json = await res.json();
        const route = json.routes?.[0];
        const leg = route?.legs?.[0];
        const pts = route?.overview_polyline?.points;
        if (pts) setRoutePoints(decodePolyline(pts));
        if (leg) setEta({ distanceText: leg.distance?.text, durationText: leg.duration?.text });
        // fit
        if (mapRef.current && pts) {
          mapRef.current.fitToCoordinates(decodePolyline(pts), {
            edgePadding: { top: 100, bottom: 160, left: 60, right: 60 },
            animated: true,
          });
        }
      } catch (e) {
        console.warn("Directions error", e);
      } finally {
        setLoadingRoute(false);
      }
    };
    fetchDirections();
  }, [userLoc?.lat, userLoc?.lng, selected?.id]);

  const initialRegion = useMemo(() => {
    const coords = events.map(e => ({ latitude: e.lat, longitude: e.lng }));
    if (userLoc) coords.push({ latitude: userLoc.lat, longitude: userLoc.lng });
    return getRegionForCoordinates(coords);
  }, [events, userLoc]);

  return (
    <View style={MAP.container}>
      {/* Top chips like the screenshot */}
      <View style={[MAP.searchWrap, { top: 12 }]}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1, backgroundColor: "#fff", padding: 12, borderRadius: 12, elevation: 2 }}>
            <Text style={{ fontWeight: "700" }}>{eta?.distanceText ?? "—"}</Text>
            <Text style={{ opacity: 0.7 }}>Distance</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#fff", padding: 12, borderRadius: 12, elevation: 2 }}>
            <Text style={{ fontWeight: "700" }}>{eta?.durationText ?? "—"}</Text>
            <Text style={{ opacity: 0.7 }}>Time to arrive</Text>
          </View>
        </View>
      </View>

      <MapView ref={mapRef} style={MAP.map} initialRegion={initialRegion}>
        {/* User pin */}
        {userLoc && (
          <Marker coordinate={{ latitude: userLoc.lat, longitude: userLoc.lng }} title="You" />
        )}

        {/* Event markers */}
        {events.map((e) => (
          <Marker
            key={e.id}
            coordinate={{ latitude: e.lat, longitude: e.lng }}
            onPress={() => onSelectEvent?.(e.id)}
          >
            <View style={MAP.markerPin} />
            <Callout>
              <View style={{ maxWidth: 240 }}>
                <Text style={MAP.calloutTitle}>{e.title}</Text>
                <Text>{e.location}</Text>
                <Pressable
                  onPress={() => openDirections(e.lat, e.lng, e.title)}
                  style={{ marginTop: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 8, backgroundColor: COLORS.primary, borderRadius: 8 }}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Open in Google Maps</Text>
                </Pressable>
              </View>
            </Callout>
          </Marker>
        ))}

        {/* Route line */}
        {routePoints.length > 0 && (
          <Polyline coordinates={routePoints} strokeWidth={5} />
        )}
      </MapView>

      {/* Bottom pill like the screenshot */}
      {selected && (
        <View style={{ position: "absolute", bottom: 18, left: 12, right: 12, backgroundColor: "#fff", borderRadius: 18, padding: 14, elevation: 4 }}>
          <Text style={{ fontWeight: "700", marginBottom: 4 }}>{selected.title}</Text>
          <Text style={{ opacity: 0.8, marginBottom: 10 }}>{selected.location}</Text>
          <Pressable
            onPress={() => openDirections(selected.lat, selected.lng, selected.title)}
            style={{ alignSelf: "flex-start", backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Open in Google Maps</Text>
          </Pressable>
          {loadingRoute ? <ActivityIndicator style={{ marginTop: 10 }} /> : null}
        </View>
      )}
    </View>
  );
}
