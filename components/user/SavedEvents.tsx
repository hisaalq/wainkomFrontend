import { COLORS } from "@/assets/style/color";
import { LAYOUT, TYPO } from "@/assets/style/stylesheet";
import SavedEventRow from "@/components/maps/SavedEventRow";
import { useSavedEvents, useToggleSavedEvent } from "@/hooks/useSavedEvents";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, SectionList, Text, View } from "react-native";

export default function SavedEvents() {
  const { engagements, events, isLoading, isFetching, refetch } = useSavedEvents();
  const toggle = useToggleSavedEvent();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Get user location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const position = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
      } catch (error) {
        console.log('Error getting location:', error);
      }
    })();
  }, []);

  // Calculate distance using Haversine formula
  const calculateDistance = useCallback((eventLat: number, eventLng: number): string => {
    if (!userLocation) return "";
    
    const R = 6371; // Earth radius in km
    const dLat = (eventLat - userLocation.latitude) * (Math.PI / 180);
    const dLon = (eventLng - userLocation.longitude) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation.latitude * (Math.PI / 180)) *
        Math.cos(eventLat * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distKm = R * c;
    
    if (distKm < 1) {
      return `${Math.round(distKm * 1000)}m away`;
    } else {
      return `${distKm.toFixed(1)}km away`;
    }
  }, [userLocation]);

  const sections = useMemo(() => {
    const now = new Date();
    const parseDate = (iso?: string) => (iso ? new Date(iso) : undefined);
    const withWhen = (events ?? []).map((e) => ({
      raw: e,
      when: parseDate(e.date),
    }));

    const upcoming = withWhen
      .filter((e) => (e.when ? e.when.getTime() >= now.getTime() : true))
      .sort((a, b) => (a.when?.getTime() ?? 0) - (b.when?.getTime() ?? 0))
      .map((e) => e.raw);

    const past = withWhen
      .filter((e) => e.when && e.when.getTime() < now.getTime())
      .sort((a, b) => (b.when?.getTime() ?? 0) - (a.when?.getTime() ?? 0))
      .map((e) => e.raw);

    const result: { title: string; data: any[] }[] = [];
    if (upcoming.length) result.push({ title: "Upcoming", data: upcoming });
    if (past.length) result.push({ title: "Past", data: past });
    return result;
  }, [events]);

  const formatSubtitle = (item: any) => {
    const date = item?.date ? new Date(item.date) : undefined;
    const dateStr = date ? date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : undefined;
    const timeStr = typeof item?.time === "string" && item.time.trim() ? item.time.trim() : undefined;
    
    // Extract event location and calculate distance
    const loc = item?.location;
    let eventLat: number | undefined;
    let eventLng: number | undefined;
    let distanceStr: string | undefined;
    
    if (loc && typeof loc === "object" && Array.isArray((loc as any).coordinates)) {
      [eventLng, eventLat] = (loc as any).coordinates as [number, number];
      if (eventLat && eventLng) {
        distanceStr = calculateDistance(eventLat, eventLng);
      }
    }
    
    const dt = [dateStr, timeStr].filter(Boolean).join(" · ");
    return [dt, distanceStr].filter(Boolean).join("  —  ");
  };

  if (isLoading) {
    return (
      <View style={[LAYOUT.screen, LAYOUT.center]}> 
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.muted, marginTop: 8 }}>Loading saved events…</Text>
      </View>
    );
  }

  if (!events?.length) {
    return (
      <View style={[LAYOUT.screen, LAYOUT.center]}> 
        <Text style={TYPO.h2}>No saved events yet</Text>
        <Text style={{ color: COLORS.muted, marginTop: 6 }}>Save events to see them here.</Text>
      </View>
    );
  }

  return (
    <View style={LAYOUT.screen}>
      <SectionList
        sections={sections}
        keyExtractor={(item: any) => (item._id ?? item.id ?? Math.random().toString())}
        refreshControl={
          <RefreshControl refreshing={!!isFetching} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: COLORS.border, marginLeft: 14 }} />
        )}
        renderSectionHeader={({ section }) => (
          <View style={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6 }}>
            <Text style={{ color: COLORS.quaternary, fontWeight: "700" }}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <SavedEventRow
            id={(item as any)._id ?? (item as any).id}
            title={item.title ?? "Untitled"}
            subtitle={formatSubtitle(item)}
            isSaved={true}
            onPress={() => {
              try {
                // Navigate to routes/maps screen with event location
                const loc = item?.location;
                let lat: number | undefined;
                let lng: number | undefined;
                
                if (loc && typeof loc === "object" && Array.isArray((loc as any).coordinates)) {
                  [lng, lat] = (loc as any).coordinates as [number, number];
                }
                
                if (lat && lng) {
                  router.push({ 
                    pathname: "/user/routes", 
                    params: { 
                      eventId: (item as any)._id ?? (item as any).id,
                      eventTitle: item.title ?? "Event",
                      eventLat: lat.toString(),
                      eventLng: lng.toString()
                    } 
                  } as any);
                } else {
                  // No location data, just navigate to routes
                  router.push("/user/routes");
                }
              } catch (_e) {
                // ignore
              }
            }}
            onToggleSave={() => {
              const eventId = (item as any)._id ?? (item as any).id;
              if (eventId) toggle.mutate({ eventId, event: item });
            }}
          />
        )}
        ListFooterComponent={<View style={{ height: 24 }} />}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </View>
  );
}