import {
  Engagement,
  fetchEngagementByIdApi,
  removeEngagementApi,
  saveEngagementApi,
} from "@/api/eventsave";
import AuthContext from "@/context/authcontext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useContext, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import LogoutButton from "./LogoutButton";

const ProfileScreen = () => {
  // تم استخراج username بنجاح
  const { userId } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Fetch engagements
  const {
    data: engagements,
    isLoading,
    error,
  } = useQuery<Engagement[]>({
    queryKey: ["engagements", userId],
    queryFn: () => fetchEngagementByIdApi(userId!),
    enabled: !!userId,
  });

  // Sort events by date
  const sortedEvents = useMemo(() => {
    if (!engagements) return [];
    return [...engagements].sort((a, b) => {
      const dateA = new Date(a.event.date).getTime();
      const dateB = new Date(b.event.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [engagements, sortOrder]);

  // Handle bookmark (add engagement) - Remains for potential future use
  const handleBookmark = async (eventId: string) => {
    if (!userId) return;
    await saveEngagementApi(eventId);
    queryClient.invalidateQueries({ queryKey: ["engagements", userId] });
  };

  // Handle remove bookmark (remove engagement)
  const handleRemoveBookmark = async (engagementId: string) => {
    if (!userId) return;
    await removeEngagementApi(engagementId);
    queryClient.invalidateQueries({ queryKey: ["engagements", userId] });
  };

  const user = {
    // عرض اسم المستخدم (username) الذي تم جلبه من السياق
    name: userId || "Guest",
    // يمكنك جلب البريد الإلكتروني من السياق أيضًا إذا كان متوفراً، أو استخدام قيمة افتراضية/ثابتة
    email: "user@example.com",
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
    >
      {/* User Info */}
      <View style={styles.cardHeader}>
        <View style={styles.row}>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.name}>{user.name}</Text>
            {/* تم إضافة عرض البريد الإلكتروني مرة أخرى */}
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 12 }} />

      {/* Engagement Section */}
      <View style={styles.engagementWrapper}>
        <View style={styles.engagementHeader}>
          <Text style={styles.sectionTitle}>Engagement</Text>
          <TouchableOpacity
            onPress={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            style={styles.sortBtn}
          >
            <Icon
              name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
              size={16}
              color="#00d4ff"
            />
            <Text style={styles.sortText}>
              {sortOrder === "asc" ? "الأقرب أولاً" : "الأبعد أولاً"}
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading && <Text style={{ color: "#fff" }}>Loading...</Text>}
        {error && (
          <Text style={{ color: "red" }}>Error loading engagements</Text>
        )}

        <View style={styles.eventsBox}>
          <FlatList
            data={sortedEvents}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              const { title, description, image, location, date, time } =
                item.event;

              return (
                <View style={styles.eventCard}>
                  {/* Event image */}
                  <Image source={{ uri: image }} style={styles.eventImage} />

                  {/* أيقونة الحذف */}
                  <TouchableOpacity
                    style={styles.bookmarkIcon}
                    onPress={() => handleRemoveBookmark(item._id)}
                  >
                    <Icon name="bookmark" size={24} color="#00d4ff" />
                  </TouchableOpacity>

                  {/* محتوى الفعالية */}
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{title}</Text>
                    <Text style={styles.eventDesc}>{description}</Text>
                    {location && location.coordinates && (
                      <Text style={styles.eventLocationText}>
                        Location: Lat {location.coordinates[1]}, Lng{" "}
                        {location.coordinates[0]}
                      </Text>
                    )}
                    <Text style={styles.eventDateText}>
                      {new Date(date).toLocaleDateString()} at {time}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => alert("Logout pressed")}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon name="corner-down-left" size={18} color="#ff4d4f" />
          <Text style={styles.logoutText}>
            {" "}
            <LogoutButton />
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

function renderItem(title: string, iconName: string, highlight = false) {
  // هذه الدالة لا تستخدم في الكود، يمكنك حذفها
}

const styles = StyleSheet.create({
  // ... (التنسيقات السابقة كما هي)
  container: { flex: 1, backgroundColor: "#0b0f12" },
  cardHeader: { backgroundColor: "#0f1720", borderRadius: 12, padding: 14 },
  row: { flexDirection: "row", alignItems: "center" },
  name: { color: "#fff", fontWeight: "700", fontSize: 16 },
  // التنسيق الخاص بالبريد الإلكتروني موجود
  email: { color: "#9ca3af", marginTop: 4 },
  engagementWrapper: {
    marginVertical: 16,
    backgroundColor: "#0f1720",
    borderRadius: 12,
    padding: 12,
  },
  engagementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  sortBtn: { flexDirection: "row", alignItems: "center" },
  sortText: { color: "#00d4ff", marginLeft: 6 },
  eventsBox: { maxHeight: 350 },
  eventCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    backgroundColor: "#16232e",
  },
  eventImage: { width: "100%", height: 150 },
  eventTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  eventDesc: {
    color: "#e6eef0",
    marginTop: 4,
  },
  eventLocationText: {
    color: "#9ca3af",
    marginTop: 4,
  },
  eventDateText: {
    color: "#9ca3af",
    marginTop: 4,
    fontSize: 13,
  },

  // === التحسين: التنسيقات الجديدة ===
  eventContent: {
    padding: 12,
  },
  bookmarkIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 20,
    padding: 4,
  },
  eventHeader: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  eventLocation: { flexDirection: "row", alignItems: "center" },
  locationText: { color: "#fff", marginLeft: 4 },
  eventDate: { color: "#9ca3af", fontSize: 13 },
  item: {
    backgroundColor: "#0f1720",
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemActive: { backgroundColor: "#122224" },
  itemLeft: { flexDirection: "row", alignItems: "center" },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#062526",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemText: { color: "#e6eef0", fontSize: 15 },
  logoutBtn: {
    marginTop: 22,
    backgroundColor: "#0f1720",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#241212",
  },
  logoutText: { color: "#ff4d4f", fontWeight: "700", marginLeft: 8 },
});

export default ProfileScreen;
