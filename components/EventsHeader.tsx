import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents, fetchEventById, EventItem } from "../api/events";
import { fetchCategories, CategoryItem } from "../api/categories";

const { width } = Dimensions.get("window");

export default function EventsScreen() {
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data: categories, isLoading: catLoading, error: catError } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: events, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const { data: eventDetails, isFetching } = useQuery({
    queryKey: ["eventDetails", selectedEvent],
    queryFn: () => fetchEventById(selectedEvent!),
    enabled: !!selectedEvent,
  });

  const openEvent = (id: string) => {
    setSelectedEvent(id);
    setModalVisible(true);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.title}>Events</Text>
          <Text style={styles.subtitle}>Discover amazing events</Text>
        </View>
        <View style={styles.rightIcons}>
          <View style={styles.bellWrapper}>
            <Ionicons name="notifications-outline" size={30} color="#fff" />
            <View style={styles.redDot} />
          </View>
          <Image
            source={{ uri: "https://i.pravatar.cc/60" }}
            style={styles.avatar}
          />
        </View>
      </View>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={22} color="#999" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search events..."
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
        {catLoading && <Text style={{ color: "#fff" }}>Loading...</Text>}
        {catError && <Text style={{ color: "red" }}>Failed to load categories</Text>}
        {categories?.map((c: CategoryItem) => (
          <TouchableOpacity
            key={c._id}
            style={[styles.catCard, selectedCat === c._id && styles.catCardActive]}
            onPress={() => setSelectedCat(c._id)}
          >
            <MaterialCommunityIcons
              name={c.icon as any}
              size={28}
              color={selectedCat === c._id ? "#00d4ff" : "#aaa"}
            />
            <Text
              style={[
                styles.catText,
                selectedCat === c._id && { color: "#00d4ff" },
              ]}
            >
              {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.upcomingTitle}>Upcoming Events</Text>

      {isLoading && <ActivityIndicator color="#00d4ff" size="large" />}
      {error && <Text style={{ color: "red" }}>Failed to load events.</Text>}

      {events?.map((ev: EventItem) => {
        let locationText: string;
        if (typeof ev.location === "string") {
          locationText = ev.location;
        } else if (ev.location?.coordinates) {
          locationText = `${ev.location.coordinates[1]}, ${ev.location.coordinates[0]}`;
        } else {
          locationText = "Unknown location";
        }

        return (
          <TouchableOpacity key={ev._id} style={styles.eventCard} onPress={() => openEvent(ev._id)}>
            <Image source={{ uri: ev.image }} style={styles.eventImage} />
            <View style={styles.eventInfo}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{ev.title}</Text>
                <Ionicons name="bookmark-outline" size={22} color="#fff" />
              </View>
              <Text style={styles.eventDesc} numberOfLines={2}>{ev.desc}</Text>
              <View style={styles.eventDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={14} color="#00d4ff" />
                  <Text style={styles.detailText}>{ev.date}</Text>
                  <Ionicons name="time-outline" size={14} color="#00d4ff" style={{ marginLeft: 12 }} />
                  <Text style={styles.detailText}>{ev.time}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={14} color="#00d4ff" />
                  <Text style={styles.detailText}>{locationText}</Text>
                </View>
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#ffd700" />
                <Text style={styles.ratingText}>{ev.rating}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* المودال */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {isFetching ? (
              <ActivityIndicator color="#00d4ff" size="large" />
            ) : eventDetails ? (
              <>
                <Image source={{ uri: eventDetails.image }} style={styles.modalImage} />
                <Text style={styles.modalTitle}>{eventDetails.title}</Text>
                <Text style={styles.modalDesc}>{eventDetails.desc}</Text>
                <Text style={styles.modalInfo}>📍 {typeof eventDetails.location === "string" ? eventDetails.location : "Location available"}</Text>
                <Text style={styles.modalInfo}>🗓 {eventDetails.date} ⏰ {eventDetails.time}</Text>
              </>
            ) : (
              <Text style={{ color: "red" }}>No event details</Text>
            )}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.btnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const cardSize = width * 0.23;

const styles = StyleSheet.create({
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1e1e1e",
    borderRadius: 15,
    padding: 20,
    width: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  modalImage: { width: "100%", height: 180, borderRadius: 10, marginBottom: 10 },
  modalTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalDesc: { color: "#ddd", fontSize: 15, marginBottom: 10 },
  modalInfo: { color: "#aaa", fontSize: 14, marginBottom: 5 },
  closeBtn: {
    marginTop: 15,
    backgroundColor: "#00d4ff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20, backgroundColor: "#121212" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "700", color: "#fff" },
  subtitle: { fontSize: 16, color: "#aaa", marginTop: 4 },
  rightIcons: { flexDirection: "row", alignItems: "center" },
  bellWrapper: { marginRight: 16 },
  redDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "red", position: "absolute", top: 0, right: 0 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e1e1e", marginTop: 20,
               borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  searchInput: { color: "#fff", flex: 1, fontSize: 16 },
  categoriesRow: { marginTop: 24, paddingBottom: 16 },
  catCard: { width: cardSize, height: cardSize, backgroundColor: "#1e1e1e", borderRadius: 18,
             marginRight: 18, justifyContent: "center", alignItems: "center",
             shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  catCardActive: { borderWidth: 1.5, borderColor: "#00d4ff" },
  catText: { color: "#aaa", marginTop: 6, fontSize: 15, fontWeight: "500" },
  upcomingTitle: { color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 10, marginBottom: 10 },
  eventCard: { flexDirection: "row", backgroundColor: "#1e1e1e", borderRadius: 16,
              marginBottom: 16, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.2,
              shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  eventImage: { width: 100, height: 100, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  eventInfo: { flex: 1, padding: 12 },
  eventTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  eventDesc: { color: "#bbb", marginTop: 4, fontSize: 14 },
  eventDetails: { marginTop: 8 },
  detailText: { color: "#aaa", marginLeft: 4, fontSize: 12 },
  ratingRow: { flexDirection: "row", alignItems: "center", position: "absolute", bottom: 10, right: 12 },
  ratingText: { color: "#ffd700", marginLeft: 4, fontSize: 14, fontWeight: "600" },
});
