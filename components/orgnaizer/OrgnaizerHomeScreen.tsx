import { deleteEventApi, fetchEventsApi, updateEventApi } from "@/api/events";
import { getOrgProfile } from "@/api/organizer";
import { deleteToken } from "@/api/storage";
import { COLORS } from "@/assets/style/color";
import AuthContext from "@/context/authcontext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
  description?: string;
  desc?: string;
  image: string;
  date: string;
  time: string;
  categoryId?: string;
};

const OrganizerHomeScreen = () => {
  const { setIsAuthenticated, setIsOrganizer } = useContext(AuthContext);

  const [events, setEvents] = useState<EventDoc[]>([]);
  const [orgImage, setOrgImage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<EventDoc | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await deleteToken();
          setIsAuthenticated(false);
          setIsOrganizer(false);
          router.replace("/(auth)");
        },
      },
    ]);
  };

  const loadData = async (opts: { initial?: boolean } = {}) => {
    const isInitial = !!opts.initial;
    try {
      if (isInitial) setLoading(true);
      else setRefreshing(true);

      const [eventsData, org] = await Promise.allSettled([
        fetchEventsApi(),
        getOrgProfile(),
      ]);

      if (!mountedRef.current) return;

      if (eventsData.status === "fulfilled") setEvents(eventsData.value);
      if (org.status === "fulfilled") setOrgImage(org.value?.image);
    } catch (err) {
      console.log("Load error:", err);
    } finally {
      if (!mountedRef.current) return;
      if (isInitial) setLoading(false);
      else setRefreshing(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    loadData({ initial: true });
    const interval = setInterval(() => {
      loadData({ initial: false });
    }, 15000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  const openEdit = (event: EventDoc) => {
    setSelectedEvent(event);
    setNewTitle(event.title);
    setNewDescription(event.description || event.desc || "");
    setNewImage(event.image);
    setEditModalVisible(true);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.9,
      aspect: [16, 9],
    });
    if (!result.canceled && result.assets?.length > 0) {
      setNewImage(result.assets[0].uri);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedEvent) return;
    if (!newTitle.trim()) {
      Alert.alert("Validation", "Title cannot be empty.");
      return;
    }
    try {
      await updateEventApi(selectedEvent._id, {
        title: newTitle,
        description: newDescription,
        image: newImage ?? undefined,
      });
      Alert.alert("Updated", "Event updated successfully!");
      setEditModalVisible(false);
      loadData({ initial: false });
    } catch {
      Alert.alert("Error", "Failed to update event.");
    }
  };

  const handleDelete = (eventId: string) => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEventApi(eventId);
            Alert.alert("Deleted", "Event has been deleted.");
            loadData({ initial: false });
          } catch {
            Alert.alert("Error", "Failed to delete event.");
          }
        },
      },
    ]);
  };

  const formatDateNice = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: colors.bg,
        }}
      >
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.backgroundd}
      />
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topHeader}>
            <Text style={styles.appTitle}>EventHub Kuwait</Text>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              {refreshing && (
                <ActivityIndicator size="small" color={colors.primary} />
              )}

              <TouchableOpacity
                style={styles.circleBtn}
                onPress={() => router.push("/createEvent")}
              >
                <Ionicons name="add" size={18} color={colors.text} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.circleBtn}
                onPress={() =>
                  Alert.alert("Notifications", "No notifications yet.")
                }
              >
                <Ionicons
                  name="notifications-outline"
                  size={18}
                  color={colors.text}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/organizer/profile")}
              >
                {orgImage ? (
                  <Image source={{ uri: orgImage }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={18} color={colors.muted} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Optional logout button beside the plus (uncomment if you want it visible)
              <TouchableOpacity style={styles.circleBtn} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={18} color={colors.text} />
              </TouchableOpacity>
              */}
            </View>
          </View>

          <Text style={styles.sectionTitle}>My Events</Text>

          {events.length === 0 ? (
            <Text style={{ color: colors.muted, paddingHorizontal: 4 }}>
              No events yet.
            </Text>
          ) : (
            events.map((ev) => (
              <View key={ev._id} style={styles.eventCard}>
                <Image source={{ uri: ev.image }} style={styles.thumb} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{ev.title}</Text>
                  <Text style={styles.eventDesc}>
                    {ev.description || ev.desc}
                  </Text>
                  <Text style={styles.dateText}>{formatDateNice(ev.date)}</Text>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => openEdit(ev)}
                    >
                      <Ionicons name="create-outline" size={16} color="#fff" />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(ev._id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#fff" />
                      <Text style={styles.actionText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Event</Text>

            <Text style={styles.label}>Title</Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Enter new title"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />

            <TouchableOpacity
              onPress={handlePickImage}
              style={styles.imagePicker}
            >
              {newImage ? (
                <Image source={{ uri: newImage }} style={styles.previewImg} />
              ) : (
                <Ionicons name="image-outline" size={32} color={colors.muted} />
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Description</Text>
            <TextInput
              value={newDescription}
              onChangeText={setNewDescription}
              placeholder="Update event description..."
              placeholderTextColor={colors.muted}
              multiline
              style={styles.textArea}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: colors.surfaceAlt },
                ]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={{ color: colors.muted }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveChanges}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
  scroll: { padding: 16 },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
  avatar: { width: 32, height: 32, borderRadius: 16 },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.heading,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    gap: 12,
    padding: 10,
    marginBottom: 12,
  },
  thumb: { width: 90, height: 90, borderRadius: 10 },
  eventTitle: { color: colors.text, fontWeight: "700", fontSize: 15 },
  eventDesc: { color: colors.muted, fontSize: 12, marginTop: 2 },
  dateText: { color: colors.primary, fontSize: 12, marginTop: 4 },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  editBtn: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 6,
  },
  deleteBtn: {
    flexDirection: "row",
    backgroundColor: "#D64545",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 6,
  },
  actionText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    width: "100%",
  },
  modalTitle: {
    color: colors.heading,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    color: colors.text,
    padding: 10,
    marginBottom: 10,
  },
  imagePicker: {
    height: 150,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  previewImg: { width: "100%", height: "100%", borderRadius: 12 },
  label: { color: colors.text, fontWeight: "700", marginBottom: 6 },
  textArea: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    color: colors.text,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
});

export default OrganizerHomeScreen;
