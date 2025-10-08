import { Engagement, fetchEngagementByIdApi } from "@/api/eventsave";
import AuthContext from "@/context/authcontext";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Switch, Text, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { MAP, MODAL } from "../../assets/style/stylesheet";
import { decodePolyline } from "../../utils/polyline";

const KUWAIT = { latitude: 29.3759, longitude: 47.9774 } as const;
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_API_KEY || "";

export default function MapScreen() {
  const { isAuthenticated } = useContext(AuthContext);
  const params = useLocalSearchParams();
  
  // Extract event location from route params
  const eventLocation = useMemo(() => {
    const lat = params.eventLat ? parseFloat(params.eventLat as string) : undefined;
    const lng = params.eventLng ? parseFloat(params.eventLng as string) : undefined;
    const title = params.eventTitle as string | undefined;
    
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      return { latitude: lat, longitude: lng, title: title || "Event Location" };
    }
    return null;
  }, [params.eventLat, params.eventLng, params.eventTitle]);
  const [userLoc, setUserLoc] = useState<{ latitude: number; longitude: number } | null>({
    latitude: KUWAIT.latitude,
    longitude: KUWAIT.longitude,
  });
  const [isFallbackKuwait, setIsFallbackKuwait] = useState(true);
  const [useGps, setUseGps] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [savedEngagements, setSavedEngagements] = useState<Engagement[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [selectedModalEvent, setSelectedModalEvent] = useState<{ latitude: number; longitude: number; title: string } | null>(null);
  const [distance, setDistance] = useState<string>("—");
  const [travelTime, setTravelTime] = useState<string>("—");
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);

  useEffect(() => {
    (async () => {
      if (!useGps) {
        setUserLoc({ latitude: KUWAIT.latitude, longitude: KUWAIT.longitude });
        setIsFallbackKuwait(true);
        return;
      }
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setUseGps(false);
          setIsFallbackKuwait(true);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({});
        setUserLoc({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setIsFallbackKuwait(false);
      } catch {
        setUseGps(false);
        setUserLoc({ latitude: KUWAIT.latitude, longitude: KUWAIT.longitude });
        setIsFallbackKuwait(true);
      }
    })();
  }, [useGps]);

  // Calculate distance and travel time when event location is selected
  useEffect(() => {
    const activeLocation = selectedModalEvent || eventLocation;
    
    if (!activeLocation || !userLoc) {
      setDistance("—");
      setTravelTime("—");
      return;
    }

    // Haversine formula to calculate distance
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Radius of Earth in kilometers
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const distKm = calculateDistance(
      userLoc.latitude,
      userLoc.longitude,
      activeLocation.latitude,
      activeLocation.longitude
    );

    // Format distance
    if (distKm < 1) {
      setDistance(`${Math.round(distKm * 1000)} m`);
    } else {
      setDistance(`${distKm.toFixed(1)} km`);
    }

    // Estimate travel time (assuming average speed of 40 km/h in city)
    const avgSpeed = 40; // km/h
    const timeHours = distKm / avgSpeed;
    const timeMinutes = Math.round(timeHours * 60);
    
    if (timeMinutes < 1) {
      setTravelTime("< 1 min");
    } else if (timeMinutes < 60) {
      setTravelTime(`${timeMinutes} min`);
    } else {
      const hours = Math.floor(timeMinutes / 60);
      const mins = timeMinutes % 60;
      setTravelTime(`${hours}h ${mins}m`);
    }
  }, [userLoc, selectedModalEvent, eventLocation]);

  // Fetch route from Google Directions API when event location is selected
  useEffect(() => {
    const activeLocation = selectedModalEvent || eventLocation;
    
    if (!activeLocation || !userLoc || !GOOGLE_API_KEY) {
      setRouteCoordinates([]);
      return;
    }

    (async () => {
      try {
        const origin = `${userLoc.latitude},${userLoc.longitude}`;
        const destination = `${activeLocation.latitude},${activeLocation.longitude}`;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${GOOGLE_API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'OK' && data.routes?.[0]?.overview_polyline?.points) {
          const polylinePoints = data.routes[0].overview_polyline.points;
          const coordinates = decodePolyline(polylinePoints);
          
          setRouteCoordinates(coordinates);
          
          // Update travel time from API if available
          const duration = data.routes[0]?.legs?.[0]?.duration?.text;
          if (duration) {
            setTravelTime(duration);
          }
          
          // Update distance from API if available
          const dist = data.routes[0]?.legs?.[0]?.distance?.text;
          if (dist) {
            setDistance(dist);
          }
        } else {
          console.warn('Directions API error:', data.status, data.error_message);
          setRouteCoordinates([]);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        setRouteCoordinates([]);
      }
    })();
  }, [userLoc, selectedModalEvent, eventLocation]);

  const region = useMemo<Region>(() => {
    // Priority: selectedModalEvent > eventLocation > user location
    if (selectedModalEvent) {
      return {
        latitude: selectedModalEvent.latitude,
        longitude: selectedModalEvent.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
    
    if (eventLocation) {
      return {
        latitude: eventLocation.latitude,
        longitude: eventLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
    
    const lat = userLoc?.latitude ?? KUWAIT.latitude;
    const lng = userLoc?.longitude ?? KUWAIT.longitude;
    return {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [userLoc, eventLocation, selectedModalEvent]);

  const openSaved = async () => {
    try {
      if (!isAuthenticated) {
        setSavedEngagements([]);
        setShowSavedModal(true);
        return;
      }
      setLoadingSaved(true);
      const data = await fetchEngagementByIdApi();
      setSavedEngagements(data || []);
      setShowSavedModal(true);
    } catch (error) {
      console.error("Error fetching saved events:", error);
      setSavedEngagements([]);
      setShowSavedModal(true);
    } finally {
      setLoadingSaved(false);
    }
  };

  return (
    <View style={MAP.container}>
      {/* Top "stepper" like the mock */}
      <View style={MAP.stepper}>
        <Text style={[MAP.step, MAP.stepActive]}>● current location</Text>
        <Text style={MAP.step}>——</Text>
        <Text style={[MAP.step, MAP.stepActive]}>🚗 Drive</Text>
        <Text style={MAP.step}>——</Text>
        <Text style={[MAP.step, MAP.stepActive]}>● Event</Text>
      </View>

      {/* Info chips (hidden until we have a location) */}
      {(selectedModalEvent || eventLocation) && (
        <View style={MAP.chipsRow}>
          <View style={MAP.chip}>
            <Text style={MAP.chipTitle}>Distance</Text>
            <Text style={MAP.chipValue}>{distance}</Text>
          </View>
          <View style={MAP.chip}>
            <Text style={MAP.chipTitle}>Time to arrive</Text>
            <Text style={MAP.chipValue}>{travelTime}</Text>
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
      >
        {/* Show route polyline if available */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor="#00d4ff"
            lineDashPattern={[0]}
          />
        )}
        
        {/* Show event location marker if available */}
        {eventLocation && (
          <Marker
            coordinate={{
              latitude: eventLocation.latitude,
              longitude: eventLocation.longitude,
            }}
            title={eventLocation.title}
            description="Event Location"
            pinColor="#00d4ff"
          />
        )}
        
        {/* Show selected modal event marker */}
        {selectedModalEvent && (
          <Marker
            coordinate={{
              latitude: selectedModalEvent.latitude,
              longitude: selectedModalEvent.longitude,
            }}
            title={selectedModalEvent.title}
            description="Selected Event"
            pinColor="#ff6b6b"
          />
        )}
      </MapView>

      {/* Bottom card like the mock */}
      <View style={MAP.bottomCard}>
        <Text style={MAP.bottomTitle}>Expected time</Text>
        <Text style={MAP.bottomEta}>{travelTime}</Text>
        <Text style={MAP.placeName}>
          {selectedModalEvent ? selectedModalEvent.title : eventLocation ? eventLocation.title : (isFallbackKuwait ? "Kuwait" : "Your current location")}
        </Text>
        <View style={{ width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 }}>
          <Pressable style={MAP.primaryBtn} onPress={openSaved}>
            <Text style={MAP.primaryBtnText}>Add New event</Text>
          </Pressable>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={MAP.bottomTitle}>Use GPS</Text>
            <Switch
              value={useGps}
              onValueChange={setUseGps}
              thumbColor={useGps ? "#2E9AA6" : "#ccc"}
              trackColor={{ false: "#999", true: "#2E9AA6" }}
            />
          </View>
        </View>
      </View>

      {/* Saved events modal */}
      <Modal transparent visible={showSavedModal} animationType="fade" onRequestClose={() => setShowSavedModal(false)}>
        <Pressable style={MODAL.overlay} onPress={() => setShowSavedModal(false)} />
        <View style={MODAL.card}>
          <Text style={MODAL.title}>Saved Events</Text>
          <ScrollView style={{ maxHeight: 320 }}>
            {loadingSaved ? (
              <Text style={{ color: "#fff" }}>Loading...</Text>
            ) : savedEngagements.length === 0 ? (
              <Text style={{ color: "#A6AFBD" }}>No saved events.</Text>
            ) : (
              savedEngagements.map((e) => {
                const loc = e.event?.location;
                let lat: number | undefined;
                let lng: number | undefined;
                
                if (loc && typeof loc === "object" && Array.isArray((loc as any).coordinates)) {
                  [lng, lat] = (loc as any).coordinates as [number, number];
                }
                
                const hasLocation = lat && lng && !isNaN(lat) && !isNaN(lng);
                
                return (
                  <Pressable 
                    key={e._id} 
                    style={({ pressed }) => ({
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: "#1E2430",
                      backgroundColor: pressed ? "#2A3642" : hasLocation ? "#1E2430" : "#0F1A1C",
                      borderRadius: 8,
                      marginBottom: 4,
                      opacity: hasLocation ? 1 : 0.5,
                    })}
                    onPress={() => {
                      if (hasLocation) {
                        setSelectedModalEvent({
                          latitude: lat!,
                          longitude: lng!,
                          title: e.event?.title ?? "Event"
                        });
                        setShowSavedModal(false);
                      }
                    }}
                    disabled={!hasLocation}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#E8EAED", fontWeight: "700", marginBottom: 4 }}>{e.event?.title ?? "Untitled"}</Text>
                        <Text style={{ color: "#A6AFBD", fontSize: 12 }}>
                          {e.event?.date} • {e.event?.time}
                        </Text>
                      </View>
                      {hasLocation ? (
                        <View style={{ backgroundColor: '#00d4ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                          <Text style={{ color: '#0F1A1C', fontSize: 10, fontWeight: '700' }}>📍 VIEW</Text>
                        </View>
                      ) : (
                        <View style={{ backgroundColor: '#444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                          <Text style={{ color: '#999', fontSize: 10, fontWeight: '700' }}>No location</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
          <View style={MODAL.actions}>
            <Pressable onPress={() => setShowSavedModal(false)} style={MODAL.btnPrimary}>
              <Text style={MODAL.btnPrimaryText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}