import { getProfile } from "@/api/user";
import { COLORS } from "@/assets/style/color";
import { LAYOUT, moreStyles, TYPO } from "@/assets/style/stylesheet";
import LogoutButton from "@/components/LogoutButton";
import { UserInfo } from "@/types/UserInfo";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  View,
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
    <View style={moreStyles.item}>
      <View style={moreStyles.leftIcon}>{left}</View>
      <Text style={moreStyles.itemText}>{title}</Text>
      {!!value && <Text style={moreStyles.value}>{value}</Text>}
      {onPress && (
        <Ionicons name="chevron-forward" size={18} color={COLORS.quaternary} />
      )}
    </View>
  );
};

/* ------------------------------- Screen ------------------------------- */

export default function MoreScreenUser() {
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  
  const { data, isLoading, isError, error } = useQuery<UserInfo>({
    queryKey: ["userProfile"],
    queryFn: getProfile,
  });
  console.log("data", data);

  const handleLanguagePress = () => {
    Alert.alert(
      "Select Language",
      "Choose your preferred language",
      [
        {
          text: "English",
          onPress: () => setSelectedLanguage("English"),
        },
        {
          text: "العربية",
          onPress: () => setSelectedLanguage("العربية"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
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
        <Text style={{ color: COLORS.text }}>
          Error: {(error as Error)?.message ?? "Something went wrong"}
        </Text>
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

  return (
    <SafeAreaView style={[LAYOUT.screen]}>
      <ScrollView contentContainerStyle={moreStyles.content}>
        {/* Profile Card */}
        <View style={moreStyles.profileCard}>
          <Image 
            source={data.image ? { uri: data.image } : require("@/assets/images/placeholer.png")} 
            style={{ width: 42, height: 42, borderRadius: 21, marginRight: 12 }} 
          />
          <Text style={[TYPO.h2]}>{data.username}</Text>
        </View>

        {/* Menu cards */}
        <PressableCard
          left={<Ionicons name="calendar-outline" size={22} color={COLORS.primary} />}
          title="My Events"
          onPress={() => router.push("/myevents" as any)}
        />

        <PressableCard
          left={<Ionicons name="language" size={22} color={COLORS.primary} />}
          title="Language"
          value={selectedLanguage}
          onPress={handleLanguagePress}
        />

        <PressableCard
          left={<MaterialIcons name="description" size={22} color={COLORS.quaternary} />}
          title="Terms and Conditions"
          onPress={() => router.push("/termsAndConditions" as any)}
        />

        <PressableCard
          left={<MaterialIcons name="system-update-alt" size={22} color={COLORS.quaternary} />}
          title="Version"
          value="1.0.0"
        />

        {/* Logout */}
        <LogoutButton />
        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
