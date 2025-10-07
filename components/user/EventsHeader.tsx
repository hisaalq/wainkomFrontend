import { CategoryItem, fetchCategories } from "@/api/categories";
import { EventItem as BaseEventItem, fetchEvents } from "@/api/events";
import { removeEngagementApi, saveEngagementApi } from "@/api/eventsave";
import ReviewModal from "@/components/ReviewModal";
import AuthContext from "@/context/authcontext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
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

const { width } = Dimensions.get("window");
const cardSize = 100;

type FilterType =
  | "none"
  | "name_asc"
  | "name_desc"
  | "date_week"
  | "date_month"
  | "date_year";

const FILTERS = [
  { key: "name_asc" as FilterType, label: "Name: A to Z" },
  { key: "name_desc" as FilterType, label: "Name: Z to A" },
  { key: "date_week" as FilterType, label: "This Week" },
  { key: "date_month" as FilterType, label: "Next Month" },
  { key: "date_year" as FilterType, label: "Next Year" },
];


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

const isDateInPeriod = (
  eventDate: string,
  period: "date_week" | "date_month" | "date_year"
): boolean => {
  const now = new Date();
  const event = new Date(eventDate);

  if (event < now) return false;

  let start = new Date(now);
  let end = new Date(now);

  if (period === "date_week") {
    end.setDate(now.getDate() + 7);
  } else if (period === "date_month") {
    end.setMonth(now.getMonth() + 2);
    end.setDate(0);
  } else if (period === "date_year") {
    end.setFullYear(now.getFullYear() + 1);
  }

  return event > now && event <= end;
};

export default function EventsScreen({ userId, initialCategoryId }: { userId: string; initialCategoryId?: string }) {
  const auth = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [selectedCat, setSelectedCat] = useState(initialCategoryId ?? "all");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [isEngagedForSelected, setIsEngagedForSelected] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const categoriesScrollRef = useRef<ScrollView | null>(null);
  const catXPositionsRef = useRef<Record<string, number>>({});

  const [activeFilter, setActiveFilter] = useState<FilterType>("none");
  const [showFilterModal, setShowFilterModal] = useState(false);

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

  useEffect(() => {
    if (initialCategoryId) {
      setSelectedCat(initialCategoryId);
    }
  }, [initialCategoryId]);

  // Ensure selected category chip is visible by auto-scrolling the horizontal list
  useEffect(() => {
    if (!categories || selectedCat === "all") {
      // scroll to start for "All"
      categoriesScrollRef.current?.scrollTo({ x: 0, animated: true });
      return;
    }
    const targetMeta = (categories as CategoryItem[] | undefined)?.find(
      (c) => c._id === selectedCat || c.key === selectedCat
    );
    const key = targetMeta?._id || targetMeta?.key;
    if (!key) return;
    const x = catXPositionsRef.current[String(key)];
    if (typeof x === "number") {
      // offset a bit so the chip is comfortably in view
      const offset = Math.max(x - 20, 0);
      // slight delay to ensure layout finished
      requestAnimationFrame(() => {
        categoriesScrollRef.current?.scrollTo({ x: offset, animated: true });
      });
    }
  }, [selectedCat, categories]);
  

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

  // queries already defined above

  const events = (eventsRaw as EventItem[] | undefined) ?? [];

  const filteredEvents = useMemo(() => {
    // Build alias set for selected category: accept either _id or key
    let acceptedIds = new Set<string>();
    if (selectedCat !== "all") {
      acceptedIds.add(String(selectedCat));
      const selectedMeta = (categories as CategoryItem[] | undefined)?.find(
        (c) => c._id === selectedCat || c.key === selectedCat
      );
      if (selectedMeta) {
        if (selectedMeta._id) acceptedIds.add(String(selectedMeta._id));
        if (selectedMeta.key) acceptedIds.add(String(selectedMeta.key));
      }
    }

    return events.filter((ev) => {
      const matchSearch = ev.title?.toLowerCase().includes(searchText.toLowerCase());
      const matchCat =
        selectedCat === "all" || (ev.categoryId ? acceptedIds.has(String(ev.categoryId)) : false);
      return matchSearch && matchCat;
    });
  }, [events, searchText, selectedCat, categories]);

  const eventTimeHasPassed = (ev: EventItem) => {
    try {
      const [hh, mm] = (String((ev as any).time || "00:00")).split(":").map(Number);
      const dt = new Date(ev.date);
      dt.setHours((hh || 0), (mm || 0), 0, 0);
      return Date.now() > dt.getTime();
    } catch {
      return false;
    }
  };

  const openEvent = (ev: EventItem) => {
    setSelectedEvent(ev);
    setModalVisible(true);
    // initialize engagement state from saved bookmarks
    setIsEngagedForSelected(savedEvents.includes(ev._id));
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

  const coordKey = (lng: number, lat: number) =>
    `${lat.toFixed(6)},${lng.toFixed(6)}`;

  const extractCoords = (ev: EventItem): [number, number] | null => {
    if (typeof ev.location === "string") return null;
    const c = ev.location?.coordinates;
    if (
      Array.isArray(c) &&
      c.length === 2 &&
      Number.isFinite(c[0]) &&
      Number.isFinite(c[1])
    ) {
      return [c[0], c[1]]; 
    }
    return null;
  };

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

  const readableLocation = (ev: EventItem) => {
    if ((ev as any).placeName) return String((ev as any).placeName);
    if ((ev as any).address) return String((ev as any).address);
    const coords = extractCoords(ev);
    if (coords) {
      const [lng, lat] = coords;
      const key = coordKey(lng, lat);
      return locationCache[key] ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
    if (typeof ev.location === "string") return ev.location;
    return "Unknown location";
  };

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
      // revert
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
              setShowFilterModal(false);
            }}
          >
            <Text style={styles.filterTextActive}>Clear All Filters</Text>
            {activeFilter === "none" && (
              <Ionicons name="checkmark-circle" size={20} color="#00d4ff" />
            )}
          </TouchableOpacity>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={styles.filterItem}
              onPress={() => {
                setActiveFilter(filter.key);
                setShowFilterModal(false);
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
                <Ionicons name="checkmark-circle" size={20} color="#00d4ff" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
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
        color={activeFilter !== "none" ? "#00d4ff" : "#fff"}
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
          ref={(ref) => {
            categoriesScrollRef.current = ref;
          }}
        >
          <TouchableOpacity
            style={[
              styles.catCard,
              selectedCat === "all" && styles.catCardActive,
            ]}
            onPress={() => setSelectedCat("all")}
            onLayout={(e) => {
              catXPositionsRef.current["all"] = e.nativeEvent.layout.x;
            }}
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
                (selectedCat === c._id || selectedCat === c.key) && styles.catCardActive,
              ]}
              onPress={() => setSelectedCat(c._id || c.key)}
              onLayout={(e) => {
                const id = c._id || c.key;
                if (id) catXPositionsRef.current[String(id)] = e.nativeEvent.layout.x;
              }}
            >
              <MaterialCommunityIcons
                name={((c as any).icon as any) ?? "shape-outline"}
                size={28}
                color={(selectedCat === c._id || selectedCat === c.key) ? "#00d4ff" : "#aaa"}
              />
              <Text
                style={[
                  styles.catText,
                  (selectedCat === c._id || selectedCat === c.key) && { color: "#00d4ff" },
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
        
        {isLoading && <ActivityIndicator color="#00d4ff" size="large" />}
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
                      color={savedEvents.includes(ev._id) ? "#00d4ff" : "#fff"}
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

                {Number(ev.rating) > 0 && eventTimeHasPassed(ev) && (
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={16} color="#ffd700" />
                    <Text style={styles.ratingText}>{ev.rating}</Text>
                  </View>
                )}
              <TouchableOpacity
                onPress={() => {
                  setSelectedEvent(ev);
                  setModalVisible(true);
                }}
                style={{ marginTop: 8, alignSelf: "flex-end" }}
              >
                <Text style={{ color: "#00d4ff" }}>View</Text>
              </TouchableOpacity>
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
              {(() => {
                const [hh, mm] = (String((selectedEvent as any).time || "00:00")).split(":").map(Number);
                const dt = new Date(selectedEvent.date);
                dt.setHours((hh || 0), (mm || 0), 0, 0);
                const eventTimePassed = Date.now() > dt.getTime();
                const canOpenReview = auth.isAuthenticated && isEngagedForSelected && eventTimePassed;

                if (!auth.isAuthenticated) {
                  return (
                    <View style={{ marginTop: 12, opacity: 0.8 }}>
                      <Text style={{ color: "#aaa", textAlign: "center" }}>Sign in to rate this event.</Text>
                    </View>
                  );
                }

                if (!isEngagedForSelected) {
                  return null;
                }

                if (!eventTimePassed) {
                  return (
                    <View style={{ marginTop: 12, opacity: 0.8 }}>
                      <Text style={{ color: "#aaa", textAlign: "center" }}>Rating opens after the event time has passed.</Text>
                    </View>
                  );
                }

                return (
                  <TouchableOpacity
                    style={[styles.closeBtn, { backgroundColor: "#007aff", marginTop: 12 }]}
                    onPress={() => setReviewVisible(true)}
                  >
                    <Text style={styles.btnText}>Rate / Review</Text>
                  </TouchableOpacity>
                );
              })()}
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

        {selectedEvent && (
          <ReviewModal
            visible={reviewVisible}
            onClose={() => setReviewVisible(false)}
            eventId={selectedEvent._id}
            eventDateISO={selectedEvent.date}
            eventTime={(selectedEvent as any).time}
            isAuthenticated={auth.isAuthenticated}
            isEngaged={isEngagedForSelected}
            onEngaged={() => setIsEngagedForSelected(true)}
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
    backgroundColor: "#121212",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "flex-end", 
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
  
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  upcomingTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
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

  // تنسيق زر الفلتر
  filterBtn: {
    padding: 8,
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00d4ff",
    position: "absolute",
    top: 5,
    right: 5,
  },

  // 💡 تنسيقات مودال الفلترة الجديدة (لتغيير موضع الظهور)
  filterModalOverlayNew: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end", // وضعها في الزاوية اليمنى
    paddingTop: 320, // تعديل القيمة لجعله يظهر تحت زر الفلتر الجديد
    paddingRight: 20, // ليتناسب مع زر الفلتر في الزاوية اليمنى
  },
  filterModalContent: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 15,
    width: 250,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  filterModalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1
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
    color: "#ccc",
    fontSize: 15,
  },
  filterTextActive: {
    color: "#00d4ff",
    fontWeight: "600",
  },
});
