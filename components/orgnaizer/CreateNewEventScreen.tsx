import { CategoryItem, fetchCategories } from "@/api/categories";
import { createEventApi } from "@/api/events";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Google Places key from env or app.json
const GOOGLE_PLACES_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY || "";


const colors = {
  bg: "#0F1115",
  surface: "#151922",
  surfaceAlt: "#10151C",
  border: "#1E2430",
  primary: "#2EA6A6",
  text: "#E8EAED",
  muted: "#A6AFBD",
  heading: "#F4F7FA",
};

type PickerMode = "none" | "date" | "time";

function formatDate(d: Date | null) {
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function formatTime(d: Date | null) {
  if (!d) return "";
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
}
function isSameCalendarDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function combineDateAndTime(date: Date, time: Date) {
  const d = new Date(date);
  d.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return d;
}
function parseLngLat(text: string): [number, number] | null {
  const parts = text.split(",").map((s) => Number(s.trim()));
  if (parts.length !== 2 || !parts.every((n) => Number.isFinite(n)))
    return null;
  const [a, b] = parts;
  // If user typed "lat,lng" convert to [lng,lat]
  return Math.abs(a) <= 90 && Math.abs(b) <= 180
    ? ([b, a] as [number, number])
    : ([a, b] as [number, number]);
}

type PickedPlace = {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
  placeId?: string;
};

function useDebouncedValue<T>(value: T, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function PlaceAutocomplete({
  visible,
  onClose,
  onPick,
  initialQuery = "",
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (p: PickedPlace) => void;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const debounced = useDebouncedValue(query, 250);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<
    { description: string; place_id: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setError(null);
      if (!debounced || !visible) {
        if (active) setSuggestions([]);
        return;
      }
      try {
        setLoading(true);
        const url =
          "https://maps.googleapis.com/maps/api/place/autocomplete/json" +
          `?input=${encodeURIComponent(debounced)}` +
          `&key=${GOOGLE_PLACES_KEY}` +
          `&components=country:kw`;
        const res = await fetch(url);
        const json = await res.json();
        if (!active) return;
        if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
          setError(json.error_message || json.status || "Places error");
          setSuggestions([]);
        } else {
          setSuggestions(
            json.predictions?.map((p: any) => ({
              description: p.description,
              place_id: p.place_id,
            })) ?? []
          );
        }
      } catch (e: any) {
        if (active) {
          setError(e?.message || "Network error");
          setSuggestions([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [debounced, visible]);

  const pickByPlaceId = async (place_id: string) => {
    try {
      setLoading(true);
      const url =
        "https://maps.googleapis.com/maps/api/place/details/json" +
        `?place_id=${encodeURIComponent(place_id)}` +
        `&key=${GOOGLE_PLACES_KEY}` +
        `&fields=geometry/location,name,formatted_address,place_id`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status !== "OK") {
        Alert.alert(
          "Error",
          json.error_message || json.status || "Place details error"
        );
        return;
      }
      const r = json.result;
      const lat = r.geometry?.location?.lat;
      const lng = r.geometry?.location?.lng;
      if (typeof lat !== "number" || typeof lng !== "number") {
        Alert.alert("Error", "Could not read coordinates");
        return;
      }
      onPick({
        lat,
        lng,
        name: r.name,
        address: r.formatted_address,
        placeId: r.place_id,
      });
      onClose();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to get place details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={[styles.modalCard, { width: "90%", maxWidth: 420 }]}>
        <Text style={styles.modalTitle}>Search a place (Kuwait)</Text>

        <View style={[styles.inputWrap, { marginTop: 8 }]}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="e.g. The Avenues, Salmiya, Messila Beach…"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={{ paddingVertical: 16 }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <Text style={{ color: "tomato", marginTop: 10 }}>{error}</Text>
        ) : (
          <FlatList
            data={suggestions}
            keyExtractor={(it) => it.place_id}
            style={{ maxHeight: 280, marginTop: 8 }}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => (
              <View style={{ height: 1, backgroundColor: colors.border }} />
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ paddingVertical: 12 }}
                onPress={() => pickByPlaceId(item.place_id)}
              >
                <Text style={{ color: colors.text, fontWeight: "700" }}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              debounced ? (
                <Text style={{ color: colors.muted, marginTop: 10 }}>
                  No results
                </Text>
              ) : null
            }
          />
        )}

        <View style={styles.modalActions}>
          <TouchableOpacity onPress={onClose} style={styles.btnGhost}>
            <Text style={styles.btnGhostText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function CreateNewEventScreen() {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [locationText, setLocationText] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("2h");
  const [placeName, setPlaceName] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [catModal, setCatModal] = useState(false);
  const [locModal, setLocModal] = useState(false);

  const [pickerMode, setPickerMode] = useState<PickerMode>("none");
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const isPickerOpen = pickerMode !== "none";

  const openDate = () => {
    setPickerMode("date");
    setTempDate(date ?? new Date());
  };
  const openTime = () => {
    if (!date) {
      Alert.alert(
        "Select date first",
        "Please choose the event date before picking time."
      );
      return;
    }
    setPickerMode("time");
    const base = new Date();
    if (time) {
      base.setHours(time.getHours());
      base.setMinutes(time.getMinutes());
    }
    setTempDate(base);
  };
  const cancelPicker = () => setPickerMode("none");
  const confirmPicker = () => {
    if (pickerMode === "date") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const picked = new Date(tempDate);
      picked.setHours(0, 0, 0, 0);
      if (picked < today) {
        Alert.alert("Invalid date", "Event date cannot be in the past.");
        return;
      }
      setDate(tempDate);
    }
    if (pickerMode === "time") {
      if (date && isSameCalendarDay(date, new Date())) {
        const now = new Date();
        const candidate = new Date();
        candidate.setHours(tempDate.getHours(), tempDate.getMinutes(), 0, 0);
        if (candidate <= now) {
          Alert.alert("Invalid time", "Event time must be later today.");
          return;
        }
      }
      setTime(tempDate);
    }
    setPickerMode("none");
  };
  const onTempChange = (_e: DateTimePickerEvent, selected?: Date) => {
    if (selected) setTempDate(selected);
  };

  const pickImage = async () => {
    setPickerMode("none");
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow photo library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.9,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };
  const removeImage = () => setImageUri(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchCategories();
        setCategories(list);
      } catch (e: any) {
        console.log("fetchCategories error:", e?.message, e?.response?.data);
        Alert.alert("Error", "Failed to load categories.");
      }
    })();
  }, []);

  const onPublish = async () => {
    try {
      if (!title || !description || !date || !time || !duration) {
        Alert.alert(
          "Missing fields",
          "Please fill title, description, date, time and duration."
        );
        return;
      }
      const scheduledAt = combineDateAndTime(date, time);
      const now = new Date();
      if (scheduledAt <= now) {
        Alert.alert(
          "Invalid schedule",
          "Event date and time must be in the future."
        );
        return;
      }
      const coords = parseLngLat(locationText);
      if (!coords) {
        Alert.alert(
          "Location needed",
          "Please pick a place from the location field."
        );
        return;
      }
      if (!imageUri) {
        Alert.alert("Image required", "Please add an event image.");
        return;
      }
      await createEventApi({
        title,
        description,
        image: imageUri,
        location: coords,
        date: date.toISOString(),
        time: formatTime(time),
        duration,
        categoryId,
        // @ts-ignore optional extras supported server-side
        placeName: placeName || undefined,
        // @ts-ignore
        address: address || undefined,
      });
      Alert.alert("Success", "Event created.");
      setTitle("");
      setDescription("");
      setImageUri(null);
      setLocationText("");
      setDate(null);
      setTime(null);
      setCategoryId(undefined);
      setPlaceName("");
      setAddress("");
    } catch (err: any) {
      console.log("createEvent error:", err?.message, err?.response?.data);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Could not create event";
      Alert.alert("Error", msg);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          contentInsetAdjustmentBehavior="always"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topSpace}>
            <Text style={styles.headerTitle}>Create Event</Text>
            <Text style={styles.headerSub}>
              Share your event with community
            </Text>
          </View>

          {imageUri ? (
            <View
              style={[styles.uploadBox, { padding: 0, overflow: "hidden" }]}
            >
              <Image source={{ uri: imageUri }} style={styles.previewImg} />
              <View style={styles.previewActions}>
                <TouchableOpacity style={styles.previewBtn} onPress={pickImage}>
                  <Ionicons name="images" size={16} color={colors.text} />
                  <Text style={styles.previewBtnText}>Change</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.previewBtn}
                  onPress={removeImage}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={colors.text}
                  />
                  <Text style={styles.previewBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadBox}
              activeOpacity={0.85}
              onPress={pickImage}
            >
              <MaterialCommunityIcons
                name="image-outline"
                size={30}
                color={colors.muted}
              />
              <Text style={styles.uploadText}>Tap to add event photo</Text>
              <Text style={styles.uploadHint}>No size limit</Text>
            </TouchableOpacity>
          )}

          <View style={styles.form}>
            <Label text="Event Title" />
            <View style={styles.inputWrap}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Enter event title..."
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
            </View>


            <Label text="Category (optional id)" />
            <View style={styles.inputWrap}>
              <TextInput
                value={categoryId}
                onChangeText={setCategoryId}
                placeholder="Enter categoryId (optional)"
                placeholderTextColor={colors.muted}
                style={styles.input}

              />
              <TouchableOpacity style={[styles.inputWrap, { height: 50 }]} onPress={() => setCatModal(true)}>

              <Text style={[styles.input, { paddingVertical: 12 }]}> 
                {categories.find((c) => c._id === categoryId)?.name ??
                  "Select a category"}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Label text="Date" />
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={openDate}
                  style={styles.inputWrap}
                >
                  <Text
                    style={[
                      styles.inputText,
                      { color: date ? colors.text : colors.muted },
                    ]}
                  >
                    {date ? formatDate(date) : "dd/mm/yyyy"}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Label text="Time" />
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={openTime}
                  style={styles.inputWrap}
                >
                  <Text
                    style={[
                      styles.inputText,
                      { color: time ? colors.text : colors.muted },
                    ]}
                  >
                    {time ? formatTime(time) : "--:-- --"}
                  </Text>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Label text="Location" />
            <TouchableOpacity
              style={styles.inputWrap}
              onPress={() => setLocModal(true)}
              activeOpacity={0.85}
            >
              <Ionicons
                name="location-outline"
                size={18}
                color={colors.muted}
              />
              <Text style={[styles.input, { paddingVertical: 12 }]}>
                {placeName ||
                  address ||
                  (locationText ? locationText : "Search a place in Kuwait")}
              </Text>
              <Ionicons name="search" size={18} color={colors.muted} />
            </TouchableOpacity>

            <Label text="Place name (optional)" />
            <View style={styles.inputWrap}>
              <Ionicons
                name="business-outline"
                size={18}
                color={colors.muted}
              />
              <TextInput
                value={placeName}
                onChangeText={setPlaceName}
                placeholder="e.g. The Avenues Mall"
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
            </View>

            <Label text="Address (optional)" />
            <View style={styles.inputWrap}>
              <Ionicons name="map-outline" size={18} color={colors.muted} />
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="e.g. Al Rai, Kuwait"
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
            </View>

            <Label text="Duration" />
            <View style={styles.inputWrap}>
              <Ionicons name="timer-outline" size={18} color={colors.muted} />
              <TextInput
                value={duration}
                onChangeText={setDuration}
                placeholder="e.g. 2h"
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
            </View>

            <Label text="Description" />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your event..."
              placeholderTextColor={colors.muted}
              style={[
                styles.inputWrap,
                { height: 110, textAlignVertical: "top" },
              ]}
              multiline
            />
          </View>

          <TouchableOpacity
            style={styles.publishBtn}
            activeOpacity={0.9}
            onPress={onPublish}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.publishText}>Publish Event</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Modal */}
      <Modal
        visible={catModal}
        transparent
        animationType="fade"
        onRequestClose={() => setCatModal(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setCatModal(false)} />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Choose Category</Text>
          <ScrollView style={{ maxHeight: 280 }}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c._id}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
                onPress={() => {
                  setCategoryId(c._id);
                  setCatModal(false);
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontWeight: c._id === categoryId ? "800" : "600",
                  }}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={() => setCatModal(false)}
              style={styles.btnPrimary}
            >
              <Text style={styles.btnPrimaryText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Place Autocomplete */}
      <PlaceAutocomplete
        visible={locModal}
        onClose={() => setLocModal(false)}
        onPick={({ lat, lng, name, address: addr }) => {
          if (name) setPlaceName(name);
          if (addr) setAddress(addr);
          setLocationText(`${lat}, ${lng}`);
        }}
      />

      {/* Date/Time Picker */}
      <Modal
        transparent
        visible={isPickerOpen}
        animationType="fade"
        onRequestClose={cancelPicker}
      >
        <Pressable style={styles.overlay} onPress={cancelPicker} />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            {pickerMode === "date" ? "Select Date" : "Select Time"}
          </Text>
          <DateTimePicker
            value={tempDate}
            mode={pickerMode === "date" ? "date" : "time"}
            display="spinner"
            onChange={onTempChange}
            themeVariant="dark"
            minuteInterval={1}
            is24Hour={false}
            minimumDate={
              pickerMode === "date"
                ? (() => {
                    const d = new Date();
                    d.setHours(0, 0, 0, 0);
                    return d;
                  })()
                : undefined
            }
            style={{ alignSelf: "stretch" }}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity onPress={cancelPicker} style={styles.btnGhost}>
              <Text style={styles.btnGhostText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmPicker} style={styles.btnPrimary}>
              <Text style={styles.btnPrimaryText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const Label = ({ text }: { text: string }) => (
  <Text style={styles.label}>{text}</Text>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topSpace: { paddingTop: 6, paddingHorizontal: 16, paddingBottom: 8 },
  headerTitle: { color: colors.heading, fontSize: 18, fontWeight: "800" },
  headerSub: { color: colors.muted, fontSize: 12, marginTop: 2 },

  uploadBox: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 22,
    paddingHorizontal: 14,
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
  },
  uploadText: { color: colors.muted, marginTop: 8 },
  uploadHint: { color: colors.muted, fontSize: 12, marginTop: 2 },
  previewImg: { width: "100%", height: 180, resizeMode: "cover" },
  previewActions: {
    position: "absolute",
    right: 10,
    bottom: 10,
    flexDirection: "row",
    gap: 8,
  },
  previewBtn: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#000",
  },
  previewBtnText: { color: colors.text, fontWeight: "700", fontSize: 12 },

  form: { paddingHorizontal: 16 },
  label: {
    color: colors.text,
    fontWeight: "800",
    marginBottom: 6,
    marginTop: 12,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    height: 50,
  },
  input: { flex: 1, color: colors.text, fontSize: 14 },
  inputText: { flex: 1, fontSize: 14 },

  row: { flexDirection: "row", marginTop: 2 },

  publishBtn: {
    marginHorizontal: 16,
    marginTop: 22,
    marginBottom: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  publishText: { color: "#fff", fontWeight: "900", fontSize: 15 },

  // Modals
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalCard: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -160 }, { translateY: -180 }],
    width: 320,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
  },
  modalTitle: {
    color: colors.heading,
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 6,
  },
  modalActions: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  btnGhost: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnGhostText: { color: colors.muted, fontWeight: "700" },
  btnPrimary: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  btnPrimaryText: { color: "#0B1416", fontWeight: "900" },
});
