import { Engagement, fetchEngagementByIdApi } from "@/api/eventsave";
import AuthContext from "@/context/authcontext";
import * as Location from "expo-location";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Switch, Text, View } from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import { MAP, MODAL } from "../../assets/style/stylesheet";

const KUWAIT = { latitude: 29.3759, longitude: 47.9774 } as const;

export default function MapScreen() {
  const { userId } = useContext(AuthContext);
  const [userLoc, setUserLoc] = useState<{ latitude: number; longitude: number } | null>({
    latitude: KUWAIT.latitude,
    longitude: KUWAIT.longitude,
  });
  const [isFallbackKuwait, setIsFallbackKuwait] = useState(true);
  const [useGps, setUseGps] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [savedEngagements, setSavedEngagements] = useState<Engagement[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

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

  const region = useMemo<Region>(() => {
    const lat = userLoc?.latitude ?? KUWAIT.latitude;
    const lng = userLoc?.longitude ?? KUWAIT.longitude;
    return {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [userLoc]);

  const openSaved = async () => {
    try {
      if (!userId) {
        setSavedEngagements([]);
        setShowSavedModal(true);
        return;
      }
      setLoadingSaved(true);
      const data = await fetchEngagementByIdApi(userId);
      setSavedEngagements(data || []);
      setShowSavedModal(true);
    } catch {
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
        <Text style={MAP.placeName}>{isFallbackKuwait ? "Kuwait" : "Your current location"}</Text>
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
              savedEngagements.map((e) => (
                <View key={e._id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#1E2430" }}>
                  <Text style={{ color: "#E8EAED", fontWeight: "700" }}>{e.event?.title ?? "Untitled"}</Text>
                  <Text style={{ color: "#A6AFBD", fontSize: 12 }}>{e.event?.date} • {e.event?.time}</Text>
                </View>
              ))
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