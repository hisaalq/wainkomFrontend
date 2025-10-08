import { apiOrigin } from "@/api";
import { getProfile } from "@/api/user";
import { COLORS } from "@/assets/style/color";
import { LAYOUT, moreStyles, TYPO } from "@/assets/style/stylesheet";
import LogoutButton from "@/components/auth/LogoutButton";
import PrivacyModal from "@/components/common/PrivacyModal";
import TermsModal from "@/components/common/TermsModal";
import { UserInfo } from "@/types/UserInfo";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
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
    <TouchableOpacity
      style={moreStyles.item}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={onPress ? title : undefined}
    >
      <View style={moreStyles.leftIcon}>{left}</View>
      <Text style={moreStyles.itemText}>{title}</Text>
      {!!value && <Text style={moreStyles.value}>{value}</Text>}
      {onPress && (
        <Ionicons name="chevron-forward" size={18} color={COLORS.quaternary} />
      )}
    </TouchableOpacity>
  );
};

/* ------------------------------- Screen ------------------------------- */

export default function MoreScreenUser() {
  
  const { data, isLoading, isError, error } = useQuery<UserInfo>({
    queryKey: ["userProfile"],
    queryFn: getProfile,
  });
  console.log("data", data);

  const resolveImage = (path?: string | null) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return `${apiOrigin}/${path.replace(/^\//, "")}`;
  };

  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  if (isLoading) {
    return (
      <View style={[LAYOUT.screen, LAYOUT.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={TYPO.muted}>Loading profile...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={LAYOUT.screen}>
        <Text style={TYPO.body}>
          Error: {(error as Error)?.message ?? "Something went wrong"}
        </Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={LAYOUT.screen}>
        <Text style={TYPO.body}>No user profile found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={moreStyles.safeArea}>
      <ScrollView contentContainerStyle={moreStyles.content}>
        {/* Profile Card */}
        <TouchableOpacity 
          style={moreStyles.profileCard}
          onPress={() => router.push("/myProfile" as any)}
        >
          <Image 
            source={data.image ? { uri: resolveImage(data.image) || undefined } : require("@/assets/images/placeholer.png")} 
            style={moreStyles.avatar}
          />
          <View>
            <Text style={[TYPO.h2]}>{data.username}</Text>
            {!!data.email && <Text style={[TYPO.muted, { marginTop: 2 }]}>{data.email}</Text>}
          </View>
        </TouchableOpacity>

        {/* Menu cards */}
        <PressableCard
          left={<Ionicons name="calendar-outline" size={22} color={COLORS.primary} />}
          title="My Events"
          onPress={() => router.push("/myEvents" as any)}
        />

        <PressableCard
          left={<Ionicons name="logo-instagram" size={22} color="#E4405F" />}
          title="Follow us on Instagram"
          onPress={() => Linking.openURL("https://www.instagram.com/p/DPSLx7ejMuQ/?ig_mid=290DA808-7282-4862-B6B2-DA64973C876D&utm_source=igweb")}
        />

        {/* Inline edit happens inside profile; no separate route */}

        <PressableCard
          left={<MaterialIcons name="description" size={22} color={COLORS.quaternary} />}
          title="Terms and Conditions"
          onPress={() => setShowTerms(true)}
        />

        <PressableCard
          left={<Ionicons name="shield-checkmark" size={22} color={COLORS.quaternary} />}
          title="Privacy Policy"
          onPress={() => setShowPrivacy(true)}
        />

        {/* Logout */}
        <LogoutButton />
        <View style={{ height: 16 }} />
        {/* Modals */}
        <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />
        <PrivacyModal visible={showPrivacy} onClose={() => setShowPrivacy(false)} />
      </ScrollView>
    </SafeAreaView>
  );
}
