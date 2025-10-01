import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CategoryItem, fetchCategories } from "../api/categories";
import { EventItem, fetchEvents } from "../api/events";

const { width } = Dimensions.get("window");
const cardSize = 100;

export default function EventsScreen() {
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(dateString));
    } catch {
      return "Invalid date";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(new Date(dateString));
    } catch {
      return "Invalid time";
    }
  };

  const {
    data: categories,
    isLoading: catLoading,
    error: catError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const openEvent = (ev: EventItem) => {
    setSelectedEvent(ev);
    setModalVisible(true);
  };

  const filteredEvents = events?.filter((ev: EventItem) => {
    const matchSearch = ev.title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchCat = selectedCat === "all" || ev.categoryId === selectedCat;
    return matchSearch && matchCat;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {/* العنوان */}
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

        {/* البحث */}
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={22}
            color="#999"
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Search events..."
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* الكاتيجوري */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          <TouchableOpacity
            style={[
              styles.catCard,
              selectedCat === "all" && styles.catCardActive,
            ]}
            onPress={() => setSelectedCat("all")}
          >
            <MaterialCommunityIcons
              name="shape"
              size={28}
              color={selectedCat === "all" ? "#00d4ff" : "#aaa"}
            />
            <Text
              style={[
                styles.catText,
                selectedCat === "all" && { color: "#00d4ff" },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {catLoading && <Text style={{ color: "#fff" }}>Loading...</Text>}
          {catError && (
            <Text style={{ color: "red" }}>Failed to load categories</Text>
          )}

          {categories?.map((c: CategoryItem) => (
            <TouchableOpacity
              key={c._id}
              style={[
                styles.catCard,
                selectedCat === c._id && styles.catCardActive,
              ]}
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

        {/* عرض الأحداث */}
        {filteredEvents?.map((ev: EventItem) => {
          const locationText =
            typeof ev.location === "string"
              ? ev.location
              : ev.location?.coordinates
              ? `${ev.location.coordinates[1]}, ${ev.location.coordinates[0]}`
              : "Unknown location";

          const categoryName = categories?.find(
            (c: CategoryItem) => c._id === ev.categoryId
          )?.name;

          return (
            <TouchableOpacity
              key={ev._id}
              style={styles.eventCard}
              onPress={() => openEvent(ev)}
            >
              <Image source={{ uri: ev.image }} style={styles.eventImage} />
              <View style={styles.eventInfo}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{ev.title}</Text>
                  <Ionicons name="bookmark-outline" size={22} color="#fff" />
                </View>

                {categoryName && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{categoryName}</Text>
                  </View>
                )}

                <Text style={styles.eventDesc} numberOfLines={2}>
                  {ev.desc}
                </Text>

                <View style={styles.eventDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#00d4ff"
                    />
                    <Text style={styles.detailText}>{formatDate(ev.date)}</Text>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color="#00d4ff"
                      style={{ marginLeft: 12 }}
                    />
                    <Text style={styles.detailText}>{formatTime(ev.date)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#00d4ff"
                    />
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
              {selectedEvent ? (
                <>
                  <Image
                    source={{ uri: selectedEvent.image }}
                    style={styles.modalImage}
                  />
                  <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                  <Text style={styles.modalDesc}>{selectedEvent.desc}</Text>
                  <Text style={styles.modalInfo}>
                    🗓{" "}
                    {selectedEvent.date
                      ? formatDate(selectedEvent.date)
                      : "Unknown date"}{" "}
                    ⏰{" "}
                    {selectedEvent.date
                      ? formatTime(selectedEvent.date)
                      : "Unknown time"}
                  </Text>
                  <Text style={styles.modalInfo}>
                    📍{" "}
                    {typeof selectedEvent.location === "string"
                      ? selectedEvent.location
                      : selectedEvent.location?.coordinates
                      ? `${selectedEvent.location.coordinates[1]}, ${selectedEvent.location.coordinates[0]}`
                      : "Unknown location"}
                  </Text>
                </>
              ) : (
                <Text style={{ color: "red" }}>No event selected</Text>
              )}

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedEvent(null);
                }}
              >
                <Text style={styles.btnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#121212",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 28, fontWeight: "700", color: "#fff" },
  subtitle: { fontSize: 16, color: "#aaa", marginTop: 4 },
  rightIcons: { flexDirection: "row", alignItems: "center" },
  bellWrapper: { marginRight: 16 },
  redDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "red",
    position: "absolute",
    top: 0,
    right: 0,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    marginTop: 20,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { color: "#fff", flex: 1, fontSize: 16 },
  categoriesRow: { marginTop: 24, paddingBottom: 16 },
  catCard: {
    width: cardSize,
    height: cardSize,
    backgroundColor: "#1e1e1e",
    borderRadius: 18,
    marginRight: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  catCardActive: { borderWidth: 1.5, borderColor: "#00d4ff" },
  catText: { color: "#aaa", marginTop: 6, fontSize: 15, fontWeight: "500" },
  upcomingTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 10,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  eventImage: {
    width: 120,
    height: "100%",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  eventInfo: { flex: 1, padding: 12 },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#00d4ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 6,
  },
  categoryBadgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  eventDesc: { color: "#bbb", marginTop: 4, fontSize: 14 },
  eventDetails: { marginTop: 8 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  detailText: { color: "#aaa", marginLeft: 4, fontSize: 12 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  ratingText: {
    color: "#ffd700",
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
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
  modalImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalInfo: { color: "#aaa", fontSize: 14, marginBottom: 5 },
  modalDesc: { color: "#bbb", fontSize: 16, marginBottom: 10, lineHeight: 22 },
  closeBtn: {
    marginTop: 15,
    backgroundColor: "#00d4ff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  eventTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
