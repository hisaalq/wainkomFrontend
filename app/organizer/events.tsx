import { fetchEventsByOrganizer } from "@/api/events";
import { getOrgProfile } from "@/api/organizer";
import { COLORS } from "@/assets/style/color";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrganizerEventsScreen() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["organizer", "events"],
    queryFn: async () => {
      const org = await getOrgProfile();
      const orgId = (org as any)?._id || (org as any)?.id;
      const data = orgId ? await fetchEventsByOrganizer(orgId) : [];
      return data as any[];
    },
    placeholderData: (prev) => prev,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 16, rowGap: 12 }}>
        <Text style={styles.title}>My Events</Text>
        {events.length === 0 ? (
          <Text style={styles.muted}>You haven't created any events yet.</Text>
        ) : (
          events.map((ev) => (
            <View key={ev._id} style={styles.card}>
              <View style={{ flexDirection: "row", columnGap: 12 }}>
                <Image source={{ uri: ev.image }} style={styles.thumb} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{ev.title}</Text>
                  <Text style={styles.cardDesc} numberOfLines={3}>{ev.description || ev.desc}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", columnGap: 8, marginTop: 8 }}>
                    <MaterialIcons name="event" size={14} color={COLORS.quaternary} />
                    <Text style={styles.meta}>{ev.date}</Text>
                    <Ionicons name="time-outline" size={14} color={COLORS.quaternary} />
                    <Text style={styles.meta}>{ev.time}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.backgroundd },
  title: { color: COLORS.primary, fontSize: 18, fontWeight: "800", marginBottom: 6 },
  muted: { color: COLORS.quaternary },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 12 },
  thumb: { width: 76, height: 76, borderRadius: 12, backgroundColor: COLORS.surface },
  cardTitle: { color: COLORS.backgroundn, fontWeight: "800" },
  cardDesc: { color: COLORS.quaternary, fontSize: 12, marginTop: 2 },
  meta: { color: COLORS.quaternary, fontSize: 12 },
});


