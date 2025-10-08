import { removeEngagementApi, saveEngagementApi } from "@/api/eventsave";
import { COLORS } from "@/assets/style/color";
import { formatDate, formatTime, isDateInPeriod } from "@/utils/dateHelpers";
import { coordKey, extractCoords, getReadableLocation } from "@/utils/eventHelpers";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { CategoryItem, fetchCategories } from "../../api/categories";
import { EventItem as BaseEventItem, fetchEvents } from "../../api/events";
import ReviewModal from "../ReviewModal";

const { width } = Dimensions.get("window");
const cardSize = 100;

type FilterType =
  | "none"
  | "name_asc"
  | "name_desc"
  | "date_week"
  | "date_weekend"
  | "date_next_week"
  | "date_month"
  | "date_year"
  | "date_custom";

const FILTERS = [
  { key: "name_asc" as FilterType, label: "Name: A to Z" },
  { key: "name_desc" as FilterType, label: "Name: Z to A" },
  { key: "date_week" as FilterType, label: "This Week" },
  { key: "date_weekend" as FilterType, label: "This Weekend" },
  { key: "date_next_week" as FilterType, label: "Next Week" },
  { key: "date_month" as FilterType, label: "Next Month" },
  { key: "date_year" as FilterType, label: "Next Year" },
  { key: "date_custom" as FilterType, label: "Custom Date Range" },
];
// ---------------------------------

type EventItem = BaseEventItem & {
  placeName?: string;
  address?: string;
  location:
    | string
    | {
        type?: "Point";
        coordinates?: [number, number];  
      };
};

// Removed - now using utility function from @/utils/dateHelpers

export default function EventsScreen({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const categoriesScrollRef = useRef<ScrollView | null>(null);
  const catXPositionsRef = useRef<Record<string, number>>({});


  const [activeFilter, setActiveFilter] = useState<FilterType>("none");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'start' | 'end'>('start');

  // Using utility functions from @/utils/dateHelpers

  const {
    data: categories,
    isLoading: catLoading,
    error: catError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const {
    data: eventsRaw,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const events = (eventsRaw as EventItem[] | undefined) ?? [];

  const sortedAndFilteredEvents = useMemo(() => {
    let list = events.filter((ev) => {
      const matchSearch = ev.title
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
      const matchCat = selectedCat === "all" || ev.categoryId === selectedCat;
      return matchSearch && matchCat;
    });

    if (activeFilter.startsWith("date_")) {
      if (activeFilter === "date_custom") {
        if (customStartDate && customEndDate) {
          list = list.filter((ev) => {
            const eventDate = new Date(ev.date);
            return eventDate >= customStartDate && eventDate <= customEndDate;
          });
        }
      } else {
        list = list.filter((ev) => isDateInPeriod(ev.date, activeFilter as any));
      }
    }

    list.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (activeFilter === "name_asc" || activeFilter === "name_desc") {
        const titleA = a.title?.toLowerCase() || "";
        const titleB = b.title?.toLowerCase() || "";
        const comparison = titleA.localeCompare(titleB);
        return activeFilter === "name_asc" ? comparison : -comparison;
      }

      return dateA - dateB;
    });

    return list;
  }, [events, searchText, selectedCat, activeFilter]);

  const filteredEvents = sortedAndFilteredEvents;

  const openEvent = (ev: EventItem) => {
    setSelectedEvent(ev);
    setModalVisible(true);
  };

  const saveMutation = useMutation({
    mutationFn: saveEngagementApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engagements"] });
    },
    onError: (err, eventId, context) => {
      console.error("Error saving engagement:", err);
      setSavedEvents((prev) => prev.filter((id) => id !== eventId));
    },
  });

  const [locationCache, setLocationCache] = useState<Record<string, string>>(
    {}
  );
  const pendingKeys = useRef<Set<string>>(new Set());

  // Using utility functions from @/utils/eventHelpers

  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync().catch(() => {});
      for (const ev of filteredEvents) {
        if ((ev as any).placeName || (ev as any).address) continue;
        const coords = extractCoords(ev);
        if (!coords) continue;

        const [lng, lat] = coords;
        const key = coordKey(lng, lat);
        if (locationCache[key] || pendingKeys.current.has(key)) continue;

        pendingKeys.current.add(key);
        try {
          const results = await Location.reverseGeocodeAsync({
            latitude: lat,
            longitude: lng,
          });
          const best = results?.[0];
          const parts = [
            best?.name,
            best?.street,
            best?.city || best?.subregion,
            best?.region,
            best?.country,
          ].filter(Boolean);
          const label =
            parts.join(", ").trim() || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setLocationCache((m) => ({ ...m, [key]: label }));
        } catch {
          setLocationCache((m) => ({
            ...m,
            [key]: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          }));
        } finally {
          pendingKeys.current.delete(key);
        }
      }
    })();
  }, [filteredEvents, locationCache]);

  // Using utility function from @/utils/eventHelpers
  const readableLocation = (ev: EventItem) => getReadableLocation(ev, locationCache);

  const toggleBookmark = async (eventId: string) => {
    const isSaved = savedEvents.includes(eventId);
    setSavedEvents((prev) =>
      isSaved ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
    try {
      if (isSaved) {
        await removeEngagementApi(eventId);
      } else {
        await saveEngagementApi(eventId);
      }
    } catch (err) {
      console.error("Error toggling engagement:", err);
      if (isSaved) setSavedEvents((prev) => [...prev, eventId]);
      else setSavedEvents((prev) => prev.filter((id) => id !== eventId));
    }
  };

  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <TouchableOpacity
        style={styles.filterModalOverlayNew}
        activeOpacity={1}
        onPress={() => setShowFilterModal(false)}
      >
        <View style={styles.filterModalContent}>
          <Text style={styles.filterModalTitle}>Apply Filters</Text>
          <TouchableOpacity
            style={styles.filterItem}
            onPress={() => {
              setActiveFilter("none");
              setCustomStartDate(null);
              setCustomEndDate(null);
              setShowFilterModal(false);
            }}
          >
            <Text style={styles.filterTextActive}>Clear All Filters</Text>
            {activeFilter === "none" && (
              <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
            )}
          </TouchableOpacity>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={styles.filterItem}
              onPress={() => {
                if (filter.key === "date_custom") {
                  // Don't close modal for custom date selection
                  setActiveFilter(filter.key);
                } else {
                  setActiveFilter(filter.key);
                  setShowFilterModal(false);
                }
              }}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
              {activeFilter === filter.key && (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
          
          {/* Custom Date Range Selection */}
          {activeFilter === "date_custom" && (
            <View style={styles.customDateContainer}>
              <Text style={styles.customDateTitle}>Select Date Range</Text>
              
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => {
                  setDatePickerType('start');
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.dateInputText}>
                  Start: {customStartDate ? customStartDate.toDateString() : 'Select start date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => {
                  setDatePickerType('end');
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.dateInputText}>
                  End: {customEndDate ? customEndDate.toDateString() : 'Select end date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              
              {customStartDate && customEndDate && (
                <TouchableOpacity
                  style={styles.applyCustomFilter}
                  onPress={() => setShowFilterModal(false)}
                >
                  <Text style={styles.applyCustomFilterText}>Apply Filter</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={datePickerType === 'start' ? (customStartDate || new Date()) : (customEndDate || new Date())}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              if (datePickerType === 'start') {
                setCustomStartDate(selectedDate);
              } else {
                setCustomEndDate(selectedDate);
              }
            }
          }}
        />
      )}
    </Modal>
  );

  const FilterBtn = () => (
    <TouchableOpacity
      style={styles.filterBtn}
      onPress={() => setShowFilterModal(true)}
    >
      <Ionicons
        name="options-outline"
        size={24}
        color={activeFilter !== "none" ? COLORS.primary : COLORS.backgroundn}
      />
      {activeFilter !== "none" && <View style={styles.filterDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        <View style={styles.topRow}>
          <View style={styles.rightIcons}></View>
        </View>

        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={22}
            color={COLORS.muted}
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Search events..."
            placeholderTextColor={COLORS.muted}
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

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
              color={selectedCat === "all" ? COLORS.primary : COLORS.muted}
            />
            <Text
              style={[
                styles.catText,
                selectedCat === "all" && { color: COLORS.primary },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {catLoading && <Text style={{ color: COLORS.backgroundn }}>Loading...</Text>}
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
                name={((c as any).icon as any) ?? "shape-outline"}
                size={28}
                color={selectedCat === c._id ? COLORS.primary : COLORS.muted}
              />
              <Text
                style={[
                  styles.catText,
                  selectedCat === c._id && { color: COLORS.primary },
                ]}
              >
                {c.name as any}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.filterRow}>
          <Text style={styles.upcomingTitle}>Upcoming Events</Text>
          <FilterBtn />
        </View>

        {isLoading && <ActivityIndicator color={COLORS.primary} size="large" />}
        {error && <Text style={{ color: "red" }}>Failed to load events.</Text>}

        {filteredEvents.map((ev) => {
          const catName = categories?.find(
            (c: CategoryItem) => c._id === ev.categoryId
          )?.name as string | undefined;

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
                  <TouchableOpacity onPress={() => toggleBookmark(ev._id)}>
                    <Ionicons
                      name={savedEvents.includes(ev._id) ? "bookmark" : "bookmark-outline"}
                      size={22}
                      color={savedEvents.includes(ev._id) ? COLORS.primary : COLORS.backgroundn}
                    />
                  </TouchableOpacity>
                </View>

                {!!catName && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{catName}</Text>
                  </View>
                )}

                <Text style={styles.eventDesc} numberOfLines={2}>
                  {(ev as any).description ?? ev.desc}
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
                    <Text style={styles.detailText}>
                      {readableLocation(ev)}
                    </Text>
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
                  <Text style={styles.modalDesc}>
                    {(selectedEvent as any).description ?? selectedEvent.desc}
                  </Text>
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
                    📍 {readableLocation(selectedEvent)}
                  </Text>
                </>
              ) : (
                <Text style={{ color: "red" }}>No event selected</Text>
              )}

              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: "#FFD700" }]}
                onPress={() => {
                  setShowRatingModal(true);
                }}
              >
                <Text style={[styles.btnText, { color: "#000" }]}>⭐ Rate This Event</Text>
              </TouchableOpacity>

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

        {/* Review Modal */}
        {selectedEvent && (
          <ReviewModal
            visible={showRatingModal}
            onClose={() => setShowRatingModal(false)}
            eventId={selectedEvent._id}
            eventDateISO={selectedEvent.date}
            eventTime={selectedEvent.time}
            isAuthenticated={true}
            isEngaged={savedEvents.includes(selectedEvent._id)}
            onEngaged={() => {
              setSavedEvents((prev) => [...prev, selectedEvent._id]);
            }}
          />
        )}
      </ScrollView>
      <FilterModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: COLORS.backgroundd,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "flex-end", 
    alignItems: "center",
  },
  title: { fontSize: 28, fontWeight: "700", color: COLORS.backgroundn },
  subtitle: { fontSize: 16, color: COLORS.muted, marginTop: 4 },
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
    backgroundColor: COLORS.surface,
    marginTop: 20,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { color: COLORS.backgroundn, flex: 1, fontSize: 16 },
  categoriesRow: { marginTop: 24, paddingBottom: 16 },
  catCard: {
    width: cardSize,
    height: cardSize,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    marginRight: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.backgroundd,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  catCardActive: { borderWidth: 1.5, borderColor: COLORS.primary },
  catText: { color: COLORS.muted, marginTop: 6, fontSize: 15, fontWeight: "500" },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  upcomingTitle: {
    color: COLORS.backgroundn,
    fontSize: 22,
    fontWeight: "700",
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: COLORS.backgroundd,
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
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 20,
    width: "85%",
    shadowColor: COLORS.backgroundd,
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
    color: COLORS.backgroundn,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalInfo: { color: "#aaa", fontSize: 14, marginBottom: 5 },
  modalDesc: { color: "#bbb", fontSize: 16, marginBottom: 10, lineHeight: 22 },
  closeBtn: {
    marginTop: 15,
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  eventTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  filterBtn: {
    padding: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    position: "absolute",
    top: 5,
    right: 5,
  },

  filterModalOverlayNew: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end", 
    paddingTop: 320, 
    paddingRight: 20,      
  },
  filterModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 15,
    width: 250,
    shadowColor: COLORS.backgroundd,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  filterModalTitle: {
    color: COLORS.backgroundn,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  filterItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  filterText: {
    color: COLORS.muted,
    fontSize: 15,
  },
  filterTextActive: {
    color: "#00d4ff",
    fontWeight: "600",
  },
  
  customDateContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  customDateTitle: {
    color: COLORS.backgroundn,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surfaceAlt,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateInputText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  applyCustomFilter: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  applyCustomFilterText: {
    color: COLORS.backgroundd,
    fontSize: 16,
    fontWeight: "bold",
  },
});
