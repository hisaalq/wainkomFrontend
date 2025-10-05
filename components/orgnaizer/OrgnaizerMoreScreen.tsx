import { getOrgProfile } from "@/api/organizer";
import { COLORS } from "@/assets/style/color";
import { LAYOUT, TYPO } from "@/assets/style/stylesheet";
import { OrganizerInfo } from "@/types/OrganizerInfo";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoutButton from "../LogoutButton";

type ItemProps = {
  left: React.ReactNode;
  title: string;
  value?: string;
  onPress?: () => void;
}

const PressableCard = ({ left, title, value, onPress }: ItemProps) => {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: COLORS.primary, foreground: true }}
      style={({ pressed }) => [
        styles.item,
        pressed && { borderColor: COLORS.primary, backgroundColor: "#121318" },
      ]}
    >
      <View style={styles.leftIcon}>{left}</View>

      <Text style={styles.itemText}>{title}</Text>

      {!!value && <Text style={styles.value}>{value}</Text>}

      <Ionicons name="chevron-forward" size={18} color={COLORS.quaternary} />
    </Pressable>
  );
};

export default function MoreScreen() {
  const queryClient = useQueryClient();
  const [orgInfoState, setOrgInfoState] = React.useState({
    name: "",
    image: "", // local URI from picker
  });

  // Ask for gallery permission once (Android needs this)
  React.useEffect(() => {
    (async () => {
      try {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      } catch (e) {
        console.warn("Permission request failed:", e);
      }
    })();
  }, []);

  const { data, isLoading, isError, error } = useQuery<OrganizerInfo>({
    queryKey: ["organizerProfile"],
    queryFn: getOrgProfile,
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["updateProfile"],
    mutationFn: (image: string) => {
      // Placeholder - updateOrganizerInfo doesn't exist
      return Promise.resolve();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["organizerProfile"] });
      setOrgInfoState(prev => ({ ...prev, image: "" }));
    },
    onError: (err) => {
      console.error("upload error:", err);
    },
  });

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    });

    if (!res.canceled) {
      setOrgInfoState((prev) => ({ ...prev, image: res.assets[0].uri })); // "file://..." URI
    }
  };

  const handleUpdateProfile = () => {
    if (orgInfoState.image) mutate(orgInfoState.image);
  };

  if (isLoading) {
    return (
      <View style={LAYOUT.screen}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading profile...</Text>
      </View>
    );
  }
  if (isError) {
    return (
      <View style={LAYOUT.screen}>
        <Text>
          Error: {(error as Error)?.message ?? "Something went wrong"}
        </Text>
      </View>
    );
  }
  if (!data) {
    return (
      <View style={LAYOUT.screen}>
        <Text>No user profile found.</Text>
      </View>
    );
  }

  const imageUri = orgInfoState.image || data.image;

  return (
    <SafeAreaView style={[LAYOUT.screen]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Pressable onPress={pickImage}>
            <Image source={{ uri: imageUri }} style={styles.avatar} />
          </Pressable>
          <Text style={[TYPO.h2]}>{data?.name}</Text>
        </View>

        {/* Items */}
        {/* My Events */}
        <PressableCard
          left={
            <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
          }
          title="My Events"
          onPress={() => router.push("/organizer/events" as any)}
        />
        {/* Language */}
        <PressableCard
          left={<Ionicons name="language" size={22} color={COLORS.primary} />}
          title="Language"
          value="English"
        />
        
        {/* Version */}
        <PressableCard
          left={
            <MaterialIcons
              name="system-update-alt"
              size={22}
              color={COLORS.quaternary}
            />
          }
          title="Version"
          value="1.0.0"
        />

        {/* Sign out */}
        <LogoutButton />

        {/* Bottom spacing for safe scroll */}
        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceAlt,
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
  role: {
    color: COLORS.secondary,
    fontSize: 13,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  rating: {
    color: COLORS.primary,
    marginLeft: 6,
    fontWeight: "600",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
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
    color: COLORS.primary,
    fontSize: 16,
    flex: 1,
    fontWeight: "600",
  },
  value: {
    color: COLORS.secondary,
    fontSize: 14,
    marginRight: 6,
  },
});