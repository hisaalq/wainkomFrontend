import instance from "@/api";
import {
  createOrganizerProfile,
  isOrganizerProfileComplete,
} from "@/api/organizer";
import { COLORS } from "@/assets/style/color";
import {
  BUTTONS,
  FORMS,
  LAYOUT,
  SPACING,
  TYPO,
} from "@/assets/style/stylesheet";
import AuthContext from "@/context/authcontext";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function OrganizerProfile() {
  const router = useRouter();
  const { organizerData, setOrganizerData } = useContext(AuthContext);

  // Use organizer data from context instead of API call
  const existing = organizerData;

  // Debug logging
  console.log("OrganizerProfile - organizerData from context:", organizerData);

  const [name, setName] = useState(existing?.name ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [image, setImage] = useState(existing?.image ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [bio, setBio] = useState(existing?.bio ?? "");
  const [website, setWebsite] = useState(existing?.website ?? "");

  // Update state when organizer data changes
  useEffect(() => {
    if (existing) {
      setName(existing.name ?? "");
      setAddress(existing.address ?? "");
      setImage(existing.image ?? "");
      setPhone(existing.phone ?? "");
      setEmail(existing.email ?? "");
      setBio(existing.bio ?? "");
      setWebsite(existing.website ?? "");
    }
  }, [existing]);

  const missing = useMemo(() => {
    const m: string[] = [];
    if (!name) m.push("name");
    if (!address) m.push("address");
    if (!image) m.push("image");
    if (!phone) m.push("phone");
    if (!email) m.push("email");
    return m;
  }, [name, address, image, phone, email]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createOrganizerProfile,
  });

  const onSubmit = async () => {
    if (missing.length) {
      Alert.alert("Missing fields", `Please complete: ${missing.join(", ")}`);
      return;
    }
    const payload = {
      name,
      address,
      image,
      phone,
      email,
      bio: bio || undefined,
      website: website || undefined,
    };
    if (!isOrganizerProfileComplete(payload)) {
      Alert.alert("Incomplete", "Please complete all required fields.");
      return;
    }
    try {
      const updatedProfile = await mutateAsync(payload);
      // Update the context with the new profile data
      setOrganizerData(updatedProfile);
      Alert.alert(
        "Profile updated",
        "Your organizer profile has been updated.",
        [{ text: "Continue", onPress: () => router.back() }]
      );
    } catch (e: any) {
      if (e?.response?.status === 400) {
        const msg =
          e?.response?.data?.message || "Please correct the missing fields.";
        Alert.alert("Validation error", msg);
      } else {
        Alert.alert("Error", "Failed to save profile. Try again.");
      }
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow photo library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];

    try {
      const fd = new FormData();
      fd.append("image", {
        uri: asset.uri,
        name: (asset as any).fileName || "logo.jpg",
        type: (asset as any).mimeType || "image/jpeg",
      } as any);
      const uploadPath =
        (process.env.EXPO_PUBLIC_UPLOAD_URL as string) || "/upload";
      const { data } = await instance.post(uploadPath, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data?.url) setImage(data.url);
      else setImage(asset.uri);
    } catch {
      setImage(asset.uri);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={LAYOUT.screen}
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: SPACING.lg,
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            alignItems: "center",
            marginTop: SPACING.md,
            marginBottom: SPACING.sm,
          }}
        >
          <TouchableOpacity onPress={pickImage} activeOpacity={0.85}>
            {image ? (
              <Image
                source={{ uri: image }}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  backgroundColor: COLORS.surface,
                }}
              />
            ) : (
              <View
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  backgroundColor: COLORS.surfaceAlt,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="image-plus"
                  size={28}
                  color={COLORS.muted}
                />
              </View>
            )}
          </TouchableOpacity>
          <Text style={[TYPO.muted, { marginTop: SPACING.xs }]}>
            Tap to add company logo
          </Text>
        </View>

        {/* Company Name */}
        <View style={{ marginTop: SPACING.md }}>
          <Text style={FORMS.label}>Company Name</Text>
          <View style={FORMS.inputRow}>
            <MaterialCommunityIcons
              name="office-building"
              size={18}
              color={COLORS.muted}
            />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter company name"
              placeholderTextColor={COLORS.muted}
              style={FORMS.inputText}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Business Address */}
        <View style={{ marginTop: SPACING.md }}>
          <Text style={FORMS.label}>Business Address</Text>
          <View style={FORMS.inputRow}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={18}
              color={COLORS.muted}
            />
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Enter business address"
              placeholderTextColor={COLORS.muted}
              style={FORMS.inputText}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Phone Number */}
        <View style={{ marginTop: SPACING.md }}>
          <Text style={FORMS.label}>Phone Number</Text>
          <View style={FORMS.inputRow}>
            <Ionicons name="call-outline" size={18} color={COLORS.muted} />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              placeholderTextColor={COLORS.muted}
              style={FORMS.inputText}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Business Email */}
        <View style={{ marginTop: SPACING.md }}>
          <Text style={FORMS.label}>Business Email</Text>
          <View style={FORMS.inputRow}>
            <Ionicons name="mail-outline" size={18} color={COLORS.muted} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter business email"
              placeholderTextColor={COLORS.muted}
              style={FORMS.inputText}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Optional fields */}
        <View style={{ marginTop: SPACING.md }}>
          <Text style={FORMS.label}>Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Tell customers about your organization"
            placeholderTextColor={COLORS.muted}
            style={[FORMS.input, { height: 110, textAlignVertical: "top" }]}
            multiline
          />
        </View>

        <View style={{ marginTop: SPACING.md }}>
          <Text style={FORMS.label}>Website</Text>
          <View style={FORMS.inputRow}>
            <MaterialCommunityIcons
              name="link-variant"
              size={18}
              color={COLORS.muted}
            />
            <TextInput
              value={website}
              onChangeText={setWebsite}
              placeholder="https://example.com"
              placeholderTextColor={COLORS.muted}
              style={FORMS.inputText}
              autoCapitalize="none"
            />
          </View>
        </View>

        {missing.length > 0 && (
          <Text style={[TYPO.muted, { marginTop: SPACING.sm }]}>
            Required missing: {missing.join(", ")}
          </Text>
        )}

        <TouchableOpacity
          onPress={onSubmit}
          disabled={isPending}
          style={[BUTTONS.primary, { marginTop: SPACING.lg }]}
        >
          <Text style={BUTTONS.primaryText}>
            {isPending
              ? "Saving..."
              : existing
              ? "Update Profile"
              : "Save Profile"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
