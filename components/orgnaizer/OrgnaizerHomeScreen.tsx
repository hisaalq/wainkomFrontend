// app/OrgnaizerHomeScreen.tsx
import { fetchEventsApi } from "@/api/events"; // <-- adjust path if needed
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const colors = {
  bg: "#0F1115",
  surface: "#151922",
  surfaceAlt: "#10151C",
  border: "#1E2430",
  primary: "#2EA6A6",
  primaryDim: "#1D7D7D",
  text: "#E8EAED",
  muted: "#A6AFBD",
  heading: "#F4F7FA",
  rating: "#F5C542",
};

type EventDoc = {
  _id: string;
  title: string;
  desc: string;
  description?: string;
  image: string;
  date: string;
  time: string;
  categoryId?: string;
};

function formatDateNice(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const OrgnaizerHomeScreen = () => {
  const [events, setEvents] = useState<EventDoc[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchEventsApi();
        setEvents(data);
      } catch (err) {
        console.log("Error fetching events:", err);
      }
    })();
  }, []);

  return (
    <SafeAreaView>
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== Top Header ===== */}
        <View style={styles.topHeader}>
          <Text style={styles.appTitle}>EventHub Kuwait</Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity style={styles.circleBtn}>
              <Ionicons name="add" size={18} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.circleBtn}>
              <Ionicons
                name="notifications-outline"
                size={18}
                color={colors.text}
              />
            </TouchableOpacity>

            <Image
              source={{ uri: "https://i.pravatar.cc/100?img=11" }}
              style={styles.avatar}
            />
          </View>
        </View>

        {/* ===== Organization Card ===== */}
        <View style={styles.orgCard}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={styles.orgLogo}>
              <MaterialCommunityIcons
                name="party-popper"
                size={24}
                color={colors.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.orgTitle}>EventHub Kuwait</Text>
              <Text style={styles.orgType}>Event Management Company</Text>

              <View style={styles.ratingRow}>
                <FontAwesome5 name="star" size={10} color={colors.rating} />
                <Text style={styles.ratingNum}>4.9</Text>
                <Text style={styles.ratingSub}>(1.2k reviews)</Text>
              </View>

              <Text style={styles.orgDesc}>
                Kuwait’s premier event management company, creating
                unforgettable experiences across the region. From corporate
                events to cultural celebrations, we bring communities together
                through exceptional events.
              </Text>

              <View style={styles.orgStatsRow}>
                <View style={styles.statPill}>
                  <MaterialIcons name="event" size={14} color={colors.text} />
                  <Text style={styles.statText}>500+{"  "}Events</Text>
                </View>
                <View style={styles.statPill}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={14}
                    color={colors.text}
                  />
                  <Text style={styles.statText}>50k+{"  "}Attendees</Text>
                </View>

                <TouchableOpacity style={styles.followBtn}>
                  <Text style={styles.followTxt}>Follow</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ===== Our Events header ===== */}
        <View style={styles.rowHeader}>
          <Text style={styles.sectionTitle}>Our Events</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* ===== Event Cards ===== */}
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          {events.map((ev) => (
            <View key={ev._id} style={styles.eventCard}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Image
                  source={{
                    uri: ev.image || "https://placehold.co/300x200/png",
                  }}
                  style={styles.thumb}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle} numberOfLines={1}>
                    {ev.title}
                  </Text>
                  <Text style={styles.eventDesc} numberOfLines={3}>
                    {ev.description || ev.desc}
                  </Text>
                  <View style={styles.metaRow}>
                    <MaterialIcons
                      name="event"
                      size={14}
                      color={colors.muted}
                    />
                    <Text style={styles.metaTxt}>
                      {ev.date ? formatDateNice(ev.date) : "—"}
                    </Text>
                    <View style={styles.dot} />
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={colors.muted}
                    />
                    <Text style={styles.metaTxt}>{ev.time || "—"}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.bookmarkBtn}>
                  <MaterialCommunityIcons
                    name="bookmark-outline"
                    size={18}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* ===== CTA ===== */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <View style={styles.ctaCard}>
            <View style={styles.ctaCircle}>
              <TouchableOpacity onPress={() => router.push("/createnewevent")}>
                <Ionicons name="add" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.ctaTitle}>Create New Event</Text>
            <Text style={styles.ctaDesc}>
              Share your amazing events with the Kuwait community
            </Text>

            <TouchableOpacity style={styles.ctaBtn}>
              <Text style={styles.ctaBtnTxt}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
};

// ===== Styles (same as your original) =====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appTitle: { color: colors.heading, fontSize: 22, fontWeight: "800" },
  circleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },

  orgCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 16,
    padding: 14,
  },
  orgLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  orgTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  orgType: {
    color: colors.primary,
    fontWeight: "700",
    marginTop: 2,
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  ratingNum: { color: colors.text, fontWeight: "800", fontSize: 12 },
  ratingSub: { color: colors.muted, fontSize: 12 },
  orgDesc: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 },
  orgStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statText: { color: colors.text, fontSize: 12, fontWeight: "600" },
  followBtn: {
    marginLeft: "auto",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  followTxt: { color: "#0B1416", fontWeight: "800" },

  rowHeader: {
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { color: colors.heading, fontSize: 16, fontWeight: "800" },
  viewAll: { color: colors.primary, fontWeight: "700" },

  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  thumb: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
  },
  eventTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  eventDesc: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  metaTxt: { color: colors.muted, fontSize: 12 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.muted },

  bookmarkBtn: { padding: 6, alignSelf: "flex-start" },

  ctaCard: {
    backgroundColor: colors.primaryDim,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    gap: 10,
  },
  ctaCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 2,
  },
  ctaDesc: { color: colors.text, opacity: 0.9, textAlign: "center" },
  ctaBtn: {
    marginTop: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  ctaBtnTxt: { color: colors.text, fontWeight: "800" },
});

export default OrgnaizerHomeScreen;
