
// app/create-event.tsx
import { BOTTOM_BAR, BUTTONS, FORMS, HEADER, UPLOAD } from "@/assets/style/stylesheet";

// app/CreateNewEventScreen.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
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

// <-- API
import { useRouter } from "expo-router";
// If you need token directly, your axios instance already injects it.

import { CategoryItem, fetchCategories } from "@/api/categories";
import { createEventApi } from "@/api/events";


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
function parseLngLat(text: string): [number, number] | null {
  const parts = text.split(",").map((s) => Number(s.trim()));
  if (parts.length !== 2 || !parts.every((n) => Number.isFinite(n)))
    return null;
  const [a, b] = parts;
  // If user typed "lat, lng", flip to [lng, lat]
  return Math.abs(a) <= 90 && Math.abs(b) <= 180
    ? ([b, a] as [number, number])
    : ([a, b] as [number, number]);
}


export default function CreateEventScreen() {
  const router = useRouter();
  

  // ----- FORM STATE -----
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [locationText, setLocationText] = useState(""); // "29.3759, 47.9774" or "47.9774, 29.3759"
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("2h");

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Categories
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [catModal, setCatModal] = useState(false);

  // ----- DATE/TIME MODAL -----
  const [pickerMode, setPickerMode] = useState<PickerMode>("none");
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const isPickerOpen = pickerMode !== "none";

  const openDate = () => {
    setPickerMode("date");
    setTempDate(date ?? new Date());
  };
  const openTime = () => {
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
    if (pickerMode === "date") setDate(tempDate);
    if (pickerMode === "time") setTime(tempDate);
    setPickerMode("none");
  };
  const onTempChange = (_e: DateTimePickerEvent, selected?: Date) => {
    if (selected) setTempDate(selected);
  };

  // ----- IMAGE PICKER -----
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

  // ----- LOAD CATEGORIES -----
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

  // ----- SUBMIT -----
  const onPublish = async () => {
    try {
      if (!title || !description || !date || !time || !duration) {
        Alert.alert(
          "Missing fields",
          "Please fill title, description, date, time and duration."
        );
        return;
      }
      const coords = parseLngLat(locationText);
      if (!coords) {
        Alert.alert(
          "Location format",
          "Enter location as 'lat, lng' or 'lng, lat'."
        );
        return;
      }

      // If your backend requires non-empty image string, enforce it:
      if (!imageUri) {
        Alert.alert("Image required", "Please add an event image.");
        return;
      }

      await createEventApi({
        title,
        description,
        image: imageUri, // backend expects a string
        location: coords, // [lng, lat] — your controller accepts arrays
        date: date.toISOString(),
        time: formatTime(time), // "6:00 PM"
        duration,
        categoryId, // optional
      });

      Alert.alert("Success", "Event created.");
      // Quick reset
      setTitle("");
      setDescription("");
      setImageUri(null);
      setLocationText("");
      setDate(null);
      setTime(null);
      setCategoryId(undefined);
    } catch (err: any) {

      // Handle 403 with missing organizer fields (for legacy organizers)
      if (err?.response?.status === 403) {
        const missing = err?.response?.data?.missing || [];
        Alert.alert(
          "Profile incomplete", 
          `Please complete organizer profile: ${missing.join(", ")}`,
          [{ text: "Go to Profile", onPress: () => router.push("/organizer/profile") }]
        );
        return;
      }
      Alert.alert(
        "Error",
        err?.response?.data?.message ?? "Could not create event"
      );

      console.log("createEvent error:", err?.message, err?.response?.data);
      // Show your backend message if provided (e.g., not organizer)
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
          {/* Header */}
          <View style={[HEADER.topSpace, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
            <View>
              <Text style={HEADER.title}>Create Event</Text>
              <Text style={HEADER.subtitle}>Share your event with community</Text>
            </View>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: colors.muted, fontWeight: "700" }}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Upload / Preview */}
          {imageUri ? (
            <View
              style={[UPLOAD.box, { padding: 0, overflow: "hidden" }]}
            >
              <Image source={{ uri: imageUri }} style={UPLOAD.previewImg} />
              <View style={UPLOAD.previewActions}>
                <TouchableOpacity style={UPLOAD.previewBtn} onPress={pickImage}>
                  <Ionicons name="images" size={16} color={colors.text} />
                  <Text style={UPLOAD.previewBtnText}>Change</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={UPLOAD.previewBtn}
                  onPress={removeImage}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={colors.text}
                  />
                  <Text style={UPLOAD.previewBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={UPLOAD.box}
              activeOpacity={0.85}
              onPress={pickImage}
            >
              <MaterialCommunityIcons
                name="image-outline"
                size={30}
                color={colors.muted}
              />
              <Text style={UPLOAD.text}>Tap to add event photo</Text>
              <Text style={UPLOAD.hint}>No size limit</Text>
            </TouchableOpacity>
          )}

          {/* Form */}
          <View style={{ paddingHorizontal: 16 }}>
            <Label text="Event Title" />
            <View style={FORMS.inputRow}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Enter event title..."
                placeholderTextColor={colors.muted}
                style={FORMS.inputText}
              />
            </View>


            <Label text="Category (optional id)" />
            <View style={FORMS.inputRow}>
              <TextInput
                value={categoryId}
                onChangeText={setCategoryId}
                placeholder="Enter categoryId (optional)"
                placeholderTextColor={colors.muted}
                style={FORMS.inputText}

              />
              <TouchableOpacity style={FORMS.inputRow} onPress={() => setCatModal(true)}>

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
                  style={FORMS.inputRow}
                >
                  <Text
                    style={[FORMS.inputText, { color: date ? colors.text : colors.muted }]}
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
                  style={FORMS.inputRow}
                >
                  <Text
                    style={[FORMS.inputText, { color: time ? colors.text : colors.muted }]}
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

            <Label text="Location (coords)" />
            <View style={FORMS.inputRow}>
              <Ionicons
                name="location-outline"
                size={18}
                color={colors.muted}
              />
              <TextInput
                value={locationText}
                onChangeText={setLocationText}
                placeholder="lat, lng  (or  lng, lat)"
                placeholderTextColor={colors.muted}
                style={FORMS.inputText}
              />
            </View>

            <Label text="Duration" />
            <View style={FORMS.inputRow}>
              <Ionicons name="timer-outline" size={18} color={colors.muted} />
              <TextInput
                value={duration}
                onChangeText={setDuration}
                placeholder="e.g. 2h"
                placeholderTextColor={colors.muted}
                style={FORMS.inputText}
              />
            </View>

            <Label text="Description" />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your event..."
              placeholderTextColor={colors.muted}
              style={[FORMS.input, { height: 110, textAlignVertical: "top" }]}
              multiline
            />
          </View>

          {/* Publish */}
          <TouchableOpacity
            style={BUTTONS.publish}
            activeOpacity={0.9}
            onPress={onPublish}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={BUTTONS.publishText}>Publish Event</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom bar (interactive) */}
      <View style={BOTTOM_BAR.bar}>
        <TouchableOpacity style={BOTTOM_BAR.item} onPress={() => router.replace("/organizer")}> 
          <Ionicons name="home" size={16} color={colors.text} />
          <Text style={BOTTOM_BAR.text}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={BOTTOM_BAR.item} onPress={() => router.replace("/organizer/more")}> 
          <Ionicons name="ellipsis-horizontal" size={16} color={colors.muted} />
          <Text style={[BOTTOM_BAR.text, { color: colors.muted }]}>More</Text>
        </TouchableOpacity>
      </View>

      {/* Category modal */}
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

      {/* Centered Date/Time Modal */}
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

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    backgroundColor: colors.surfaceAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabItem: { alignItems: "center", gap: 4 },
  tabText: { color: colors.text, fontSize: 12 },

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
