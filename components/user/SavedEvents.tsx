import { COLORS } from "@/assets/style/color";
import { LAYOUT, TYPO } from "@/assets/style/stylesheet";
import SavedEventRow from "@/components/maps/SavedEventRow";
import { useSavedEvents, useToggleSavedEvent } from "@/hooks/useSavedEvents";
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { ActivityIndicator, RefreshControl, SectionList, Text, View } from "react-native";

export default function SavedEvents() {
  const { engagements, events, isLoading, isFetching, refetch } = useSavedEvents();
  const toggle = useToggleSavedEvent();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

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
    const loc = item?.location;
    let locStr: string | undefined;
    if (typeof loc === "string" && loc.trim()) locStr = loc.trim();
    else if (loc && typeof loc === "object" && Array.isArray((loc as any).coordinates)) {
      const [lng, lat] = (loc as any).coordinates as [number, number];
      locStr = `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
    }
    const dt = [dateStr, timeStr].filter(Boolean).join(" · ");
    return [dt, locStr].filter(Boolean).join("  —  ");
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