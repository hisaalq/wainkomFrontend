import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  bg: "#0f0f10",
  card: "#16171A",
  text: "#FFFFFF",
  sub: "#9CA3AF",
  blue: "#3B82F6", // اللمسة الزرقاء
  border: "#23262B",
  danger: "#c60a0aff",
  green: "#259634ff",
};

type ItemProps = {
  left: React.ReactNode;
  title: string;
  value?: string; // مثل English أو 1.0.0
  onPress?: () => void; // الآن كلها ستاتيكية، لكن خليه جاهز
};

const PressableCard = ({ left, title, value, onPress }: ItemProps) => {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: COLORS.blue, foreground: true }}
      style={({ pressed }) => [
        styles.item,
        pressed && { borderColor: COLORS.blue, backgroundColor: "#121318" },
      ]}
    >
      <View style={styles.leftIcon}>{left}</View>

      <Text style={styles.itemText}>{title}</Text>

      {!!value && <Text style={styles.value}>{value}</Text>}

      <Ionicons name="chevron-forward" size={18} color={COLORS.sub} />
    </Pressable>
  );
};

export default function MoreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <Text style={styles.headerTitle}>More</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: "https://via.placeholder.com/80" }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.company}>Boubyan Company</Text>
            <Text style={styles.role}>Event Organizer</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.rating}>4.8</Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <PressableCard
          left={
            <Ionicons name="calendar-outline" size={22} color={COLORS.blue} />
          }
          title="My Events"
        />

        <PressableCard
          left={
            <Ionicons
              name="notifications-outline"
              size={22}
              color={COLORS.blue}
            />
          }
          title="Notifications"
        />

        <PressableCard
          left={<Ionicons name="language" size={22} color={COLORS.blue} />}
          title="Language"
          value="English"
        />

        <PressableCard
          left={
            <Ionicons name="help-circle-outline" size={22} color={COLORS.sub} />
          }
          title="Help & Support"
        />

        <PressableCard
          left={
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color={COLORS.green}
            />
          }
          title="Privacy Policy"
        />

        <PressableCard
          left={
            <Ionicons
              name="document-text-outline"
              size={22}
              color={COLORS.sub}
            />
          }
          title="Terms of Service"
        />

        <PressableCard
          left={
            <FontAwesome5 name="info-circle" size={20} color={COLORS.sub} />
          }
          title="About EventHub"
        />

        <PressableCard
          left={
            <MaterialIcons
              name="system-update-alt"
              size={22}
              color={COLORS.sub}
            />
          }
          title="Version"
          value="1.0.0"
        />

        {/* Sign out */}
        <Pressable
          android_ripple={{ color: "#ffdddd", foreground: true }}
          style={({ pressed }) => [
            styles.signOut,
            pressed && {
              backgroundColor: "#1a1313",
              borderColor: COLORS.danger,
            },
          ]}
          onPress={() => {}}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        {/* Bottom spacing for safe scroll */}
        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 14,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  company: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  role: {
    color: COLORS.sub,
    fontSize: 13,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  rating: {
    color: COLORS.text,
    marginLeft: 6,
    fontWeight: "600",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  leftIcon: {
    width: 28,
    alignItems: "center",
    marginRight: 10,
  },
  itemText: {
    color: COLORS.text,
    fontSize: 16,
    flex: 1,
    fontWeight: "600",
  },
  value: {
    color: COLORS.sub,
    fontSize: 14,
    marginRight: 6,
  },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  signOutText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
});
