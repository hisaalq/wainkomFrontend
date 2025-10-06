import { getProfile, updateUser } from "@/api/user"; // <- unchanged
import { COLORS } from "@/assets/style/color";
import { LAYOUT, moreStyles, TYPO } from "@/assets/style/stylesheet";
import LogoutButton from "@/components/LogoutButton";
import { UserInfo } from "@/types/UserInfo";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ------------------------------- UI bits ------------------------------- */

type ItemProps = {
  left: React.ReactNode;
  title: string;
  value?: string;
  onPress?: () => void;
};

const PressableCard = ({ left, title, value, onPress }: ItemProps) => {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: COLORS.primary, foreground: true }}
      style={({ pressed }) => [
        moreStyles.item,
        pressed && { borderColor: COLORS.primary, backgroundColor: "#121318" },
      ]}
    >
      <View style={moreStyles.leftIcon}>{left}</View>
      <Text style={moreStyles.itemText}>{title}</Text>
      {!!value && <Text style={moreStyles.value}>{value}</Text>}
      <Ionicons name="chevron-forward" size={18} color={COLORS.quaternary} />
    </Pressable>
  );
};

/* ------------------------------- helpers ------------------------------- */

function guessMime(uri: string) {
  const ext = uri.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "heic" || ext === "heif") return "image/heic";
  return "image/jpeg"; // safe default for iOS/Android camera rolls
}

/* ------------------------------- Screen ------------------------------- */

export default function MoreScreenUser() {
  const queryClient = useQueryClient();
  const [local, setLocal] = React.useState<{ image?: string }>({});

  React.useEffect(() => {
    (async () => {
      try {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      } catch (e) {
        console.warn("Permission request failed:", e);
      }
    })();
  }, []);

  const { data, isLoading, isError, error } = useQuery<UserInfo>({
    queryKey: ["userProfile"],
    queryFn: getProfile,
  });

  // Update avatar using multipart/form-data for multer backend
  const { mutate: updateAvatar, isPending } = useMutation({
    mutationKey: ["updateUser"],
    mutationFn: async (image: string) => {
      return updateUser({ image: image });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setLocal({ image: "" });
    },
    onError: (err) => {
      console.error("upload error:", err);
    },
  });

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!res.canceled) {
      const uri = res.assets[0].uri;
      setLocal({ image: uri });
      updateAvatar(uri);
    }
  };

  if (isLoading) {
    return (
      <View style={LAYOUT.screen}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ color: COLORS.text }}>Loading profile...</Text>
      </View>
    );
  }
  if (isError) {
    return (
      <View style={LAYOUT.screen}>
        <Text style={{ color: COLORS.text }}>Error: {(error as Error)?.message ?? "Something went wrong"}</Text>
      </View>
    );
  }
  if (!data) {
    return (
      <View style={LAYOUT.screen}>
        <Text style={{ color: COLORS.text }}>No user profile found.</Text>
      </View>
    );
  }

  const imageUri = local.image || data.image;

  return (
    <SafeAreaView style={[LAYOUT.screen]}>
      <ScrollView contentContainerStyle={moreStyles.content}>
        {/* Profile Card */}
        <View style={moreStyles.profileCard}>
          <Pressable onPress={pickImage} disabled={isPending}>
            {/* If you sometimes have no avatar, guard the Image to avoid RN warnings */}
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={moreStyles.avatar} />
            ) : (
              <View style={[moreStyles.avatar, { alignItems: "center", justifyContent: "center" }]}>
                <Ionicons name="person" size={42} color={COLORS.quaternary} />
              </View>
            )}
          </Pressable>
          <Text style={[TYPO.h2]}>{data.username}</Text>
        </View>

        {/* Rest of the list */}
        <PressableCard
          left={<Ionicons name="calendar-outline" size={22} color={COLORS.primary} />}
          title="My Events"
          onPress={() => router.push("/myevents" as any)}
        />

        <PressableCard
          left={<Ionicons name="language" size={22} color={COLORS.primary} />}
          title="Language"
          value="English"
        />

        <PressableCard
          left={<MaterialIcons name="system-update-alt" size={22} color={COLORS.quaternary} />}
          title="Version"
          value="1.0.0"
        />

        <LogoutButton />
        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
