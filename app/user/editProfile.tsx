import { apiOrigin } from "@/api";
import { getProfile, updateUser } from "@/api/user";
import { COLORS } from "@/assets/style/color";
import { BUTTONS, FORMS, LAYOUT } from "@/assets/style/stylesheet";
import { UserInfo } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

const toAbsolute = (path?: string | null) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiOrigin}/${String(path).replace(/^\//, "")}`;
};

export default function EditProfile() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<UserInfo>({ queryKey: ["userProfile"], queryFn: getProfile });
  const [username, setUsername] = useState<string>(data?.username || "");
  const [email, setEmail] = useState<string>(data?.email || "");
  const [bio, setBio] = useState<string>(data?.bio || "");
  const [phone, setPhone] = useState<string>(data?.phone || "");
  const [organization, setOrganization] = useState<string>(data?.organization || "");
  const [image, setImage] = useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (data) {
      setUsername(data.username || "");
      setEmail(data.email || "");
      setBio(data.bio || "");
      setPhone(data.phone || "");
      setOrganization(data.organization || "");
    }
  }, [data]);

  const isDirty = useMemo(() => {
    if (!data) return false;
    const changedImage = !!image;
    const changedUsername = (username ?? "") !== (data.username ?? "");
    const changedEmail = (email ?? "") !== (data.email ?? "");
    const changedBio = (bio ?? "") !== (data.bio ?? "");
    const changedPhone = (phone ?? "") !== (data.phone ?? "");
    const changedOrg = (data.isOrganizer ? (organization ?? "") !== (data.organization ?? "") : false);
    return changedImage || changedUsername || changedEmail || changedBio || changedPhone || changedOrg;
  }, [data, image, username, email, bio, phone, organization]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: Partial<UserInfo>) => updateUser(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["userProfile"] });
      router.back();
    },
    onError: (e: any) => Alert.alert("Update failed", String(e?.message || e)),
  });

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled && res.assets?.[0]?.uri) {
      setImage(res.assets[0].uri);
    }
  };

  const onSave = async () => {
    const payload: Partial<UserInfo> = { username, email, bio, phone } as any;
    // Only organizers can edit organization field
    if (data?.isOrganizer && organization) (payload as any).organization = organization;
    if (image) payload.image = image as any;
    await mutateAsync(payload);
  };

  if (isLoading && !data) {
    return (
      <View style={[LAYOUT.screen, LAYOUT.center]}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  const previewUri = image || toAbsolute(data?.image) || undefined;

  return (
    <ScrollView style={LAYOUT.screen} contentContainerStyle={{ padding: 16 }}>
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <TouchableOpacity onPress={pickImage} accessibilityRole="button" accessibilityLabel="Pick profile image">
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={{ width: 96, height: 96, borderRadius: 48 }} />
          ) : (
            <Image source={require("@/assets/images/placeholer.png")} style={{ width: 96, height: 96, borderRadius: 48 }} />
          )}
        </TouchableOpacity>
        <Text style={{ color: COLORS.muted, marginTop: 6 }}>Tap to change</Text>
      </View>

      <Text style={FORMS.label}>Username</Text>
      <TextInput value={username} onChangeText={setUsername} placeholder="Your name" placeholderTextColor={COLORS.muted} style={{ color: COLORS.text, borderColor: COLORS.border, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 }} />

      <Text style={FORMS.label}>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@email.com" placeholderTextColor={COLORS.muted} style={{ color: COLORS.text, borderColor: COLORS.border, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 }} />

      <Text style={FORMS.label}>Bio</Text>
      <TextInput value={bio} onChangeText={setBio} placeholder="About you" placeholderTextColor={COLORS.muted} multiline style={{ color: COLORS.text, borderColor: COLORS.border, borderWidth: 1, borderRadius: 10, padding: 12, minHeight: 80, marginBottom: 12 }} />

      <Text style={FORMS.label}>Phone</Text>
      <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+965 ..." placeholderTextColor={COLORS.muted} style={{ color: COLORS.text, borderColor: COLORS.border, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 }} />

      {data?.isOrganizer ? (
        <>
          <Text style={FORMS.label}>Organization</Text>
          <TextInput value={organization} onChangeText={setOrganization} placeholder="Organization ID or name" placeholderTextColor={COLORS.muted} style={{ color: COLORS.text, borderColor: COLORS.border, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 18 }} />
        </>
      ) : null}

      <TouchableOpacity onPress={onSave} disabled={isPending || !isDirty} style={[BUTTONS.primary, { opacity: isPending || !isDirty ? 0.5 : 1 }]}>
        <Text style={BUTTONS.primaryText}>{isPending ? "Saving..." : "Save Changes"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={[BUTTONS.secondary, { marginTop: 10 }]}> 
        <Text style={BUTTONS.secondaryText}>Discard Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


